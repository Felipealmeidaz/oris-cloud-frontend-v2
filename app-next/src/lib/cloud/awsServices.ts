/**
 * AWS EC2 Services
 *
 * Substitui o antigo azureServices.ts. Usa AWS SDK v3 (@aws-sdk/client-ec2).
 *
 * Convenção de naming:
 *   - VM (EC2 Instance) é identificada pela tag `Name` (valor = vmName lógico).
 *   - EBS Volume é identificado pela tag `Name` (valor = diskName lógico).
 *   - A relação Volume <-> Instance é feita via BlockDeviceMapping (anexando o volume na instância).
 *
 * Variáveis de ambiente esperadas:
 *   AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY (opcionais se usar IAM role),
 *   AWS_AMI_ID, AWS_SUBNET_ID, AWS_SECURITY_GROUP_ID, AWS_KEY_PAIR_NAME,
 *   AWS_INSTANCE_TYPE, AWS_AVAILABILITY_ZONE.
 */

import {
  EC2Client,
  DescribeInstancesCommand,
  DescribeVolumesCommand,
  RunInstancesCommand,
  StartInstancesCommand,
  StopInstancesCommand,
  RebootInstancesCommand,
  TerminateInstancesCommand,
  CreateVolumeCommand,
  AttachVolumeCommand,
  CreateTagsCommand,
  Instance,
  Volume,
  InstanceStateName,
  _InstanceType,
} from '@aws-sdk/client-ec2';
import { PrismaClient } from '@prisma/client';
import { logger as appLogger } from '@/lib/logger';

// ============================================================
// Types
// ============================================================

type VMStatus = 'RUNNING' | 'STOPPED' | 'STARTING' | 'STOPPING';

export interface VMInfo {
  name: string;
  awsInstanceId: string;
  status: VMStatus;
  publicIp: string | null;
  privateIp: string | null;
  location: string;
  vmSize: string | undefined;
}

export interface VMWithDiskInfo {
  name: string;
  awsInstanceId: string;
  awsVmName: string;
  status: VMStatus;
  publicIp: string | null;
  privateIp: string | null;
  diskName: string | null;
  location: string;
  vmSize: string | undefined;
}

interface QuotaError extends Error {
  isQuotaError: boolean;
  originalError: any;
}

const prisma = new PrismaClient();

// ============================================================
// AwsService
// ============================================================

export class AwsService {
  private ec2: EC2Client;
  private region: string;
  private amiId: string;
  private subnetId: string;
  private securityGroupId: string;
  private keyPairName: string;
  private instanceType: _InstanceType;
  private availabilityZone: string;

  constructor() {
    this.region = process.env.AWS_REGION || 'sa-east-1';
    this.amiId = process.env.AWS_AMI_ID || '';
    this.subnetId = process.env.AWS_SUBNET_ID || '';
    this.securityGroupId = process.env.AWS_SECURITY_GROUP_ID || '';
    this.keyPairName = process.env.AWS_KEY_PAIR_NAME || 'oris-keypair';
    this.instanceType = (process.env.AWS_INSTANCE_TYPE || 'g4dn.xlarge') as _InstanceType;
    this.availabilityZone = process.env.AWS_AVAILABILITY_ZONE || `${this.region}a`;

    // EC2Client usa a credential chain padrão do SDK:
    // env vars > shared credentials > IAM role (em EC2/ECS/Lambda)
    this.ec2 = new EC2Client({ region: this.region });

    if (!this.amiId || !this.subnetId || !this.securityGroupId) {
      appLogger.warn('AwsService iniciado sem todas variáveis de ambiente EC2 configuradas', {
        hasAmiId: !!this.amiId,
        hasSubnetId: !!this.subnetId,
        hasSecurityGroupId: !!this.securityGroupId,
      });
    }
  }

  // ==========================================================
  // Helpers internos
  // ==========================================================

  /** Mapeia vCPUs para instance type EC2 G4dn */
  public getVmSizeFromVCpus(vCpus: number): string {
    switch (vCpus) {
      case 4:
        return 'g4dn.xlarge';
      case 8:
        return 'g4dn.2xlarge';
      case 16:
        return 'g4dn.4xlarge';
      default:
        return this.instanceType;
    }
  }

  /**
   * Converte EC2 instance state para VMStatus interno.
   * AWS states: pending, running, shutting-down, terminated, stopping, stopped.
   */
  public mapAwsStatusToVMStatus(awsStatus: string | null): VMStatus {
    if (!awsStatus) return 'STOPPED';
    const s = awsStatus.toLowerCase();
    switch (s) {
      case 'pending':
        return 'STARTING';
      case 'running':
        return 'RUNNING';
      case 'stopping':
      case 'shutting-down':
        return 'STOPPING';
      case 'stopped':
      case 'terminated':
        return 'STOPPED';
      default:
        return 'STOPPED';
    }
  }

  /** Busca uma única instância EC2 não-terminada pelo valor da tag Name. */
  private async findInstanceByName(vmName: string): Promise<Instance | null> {
    const cmd = new DescribeInstancesCommand({
      Filters: [
        { Name: 'tag:Name', Values: [vmName] },
        // Exclui instâncias já terminated
        { Name: 'instance-state-name', Values: ['pending', 'running', 'stopping', 'stopped'] },
      ],
    });
    const resp = await this.ec2.send(cmd);
    const reservations = resp.Reservations || [];
    for (const res of reservations) {
      const instances = res.Instances || [];
      if (instances.length > 0) return instances[0];
    }
    return null;
  }

  /** Busca um volume EBS pelo valor da tag Name. */
  private async findVolumeByName(diskName: string): Promise<Volume | null> {
    const cmd = new DescribeVolumesCommand({
      Filters: [{ Name: 'tag:Name', Values: [diskName] }],
    });
    const resp = await this.ec2.send(cmd);
    const volumes = resp.Volumes || [];
    return volumes.length > 0 ? volumes[0] : null;
  }

  /** Resolve o Name (tag) de uma instância dado o InstanceId. */
  private getInstanceName(instance: Instance): string {
    const tag = (instance.Tags || []).find((t: { Key?: string; Value?: string }) => t.Key === 'Name');
    return tag?.Value || instance.InstanceId || '';
  }

  /** Monta o objeto VMWithDiskInfo a partir de uma instância EC2. */
  private buildVmWithDiskInfo(instance: Instance, diskName: string | null): VMWithDiskInfo {
    const name = this.getInstanceName(instance);
    return {
      name,
      awsInstanceId: instance.InstanceId || '',
      awsVmName: name,
      status: this.mapAwsStatusToVMStatus(instance.State?.Name ?? null),
      publicIp: instance.PublicIpAddress ?? null,
      privateIp: instance.PrivateIpAddress ?? null,
      diskName,
      location: instance.Placement?.AvailabilityZone || this.availabilityZone,
      vmSize: instance.InstanceType,
    };
  }

  // ==========================================================
  // Métodos públicos — interface compatível com azureServices
  // ==========================================================

  /**
   * Garante que um volume EBS existe com a tag Name=diskName.
   * Se não existir, cria a partir do snapshot da AMI configurada.
   */
  public async ensureDiskExists(diskName: string, sizeGB: number = 30): Promise<Volume> {
    const existing = await this.findVolumeByName(diskName);
    if (existing) {
      appLogger.info('Volume EBS já existe', { diskName, volumeId: existing.VolumeId });
      return existing;
    }

    appLogger.info('Criando novo volume EBS', { diskName, sizeGB });
    const createCmd = new CreateVolumeCommand({
      AvailabilityZone: this.availabilityZone,
      Size: sizeGB,
      VolumeType: 'gp3',
      TagSpecifications: [
        {
          ResourceType: 'volume',
          Tags: [
            { Key: 'Name', Value: diskName },
            { Key: 'ManagedBy', Value: 'oris-cloud' },
          ],
        },
      ],
    });
    const resp = await this.ec2.send(createCmd);
    if (!resp.VolumeId) {
      throw new Error(`Falha ao criar volume EBS para ${diskName}`);
    }
    appLogger.info('Volume EBS criado', { diskName, volumeId: resp.VolumeId });
    return resp as unknown as Volume;
  }

  /**
   * Busca VM (EC2 Instance) que tem o volume com tag Name=diskName anexado.
   */
  public async getVMInfoByDiskName(diskName: string): Promise<VMWithDiskInfo | null> {
    const volume = await this.findVolumeByName(diskName);
    if (!volume || !volume.Attachments || volume.Attachments.length === 0) {
      // Sem attachment, pode existir instância com tag disk-name pra fallback
      const byTag = new DescribeInstancesCommand({
        Filters: [
          { Name: 'tag:DiskName', Values: [diskName] },
          { Name: 'instance-state-name', Values: ['pending', 'running', 'stopping', 'stopped'] },
        ],
      });
      const resp = await this.ec2.send(byTag);
      for (const res of resp.Reservations || []) {
        const instances = res.Instances || [];
        if (instances.length > 0) {
          return this.buildVmWithDiskInfo(instances[0], diskName);
        }
      }
      return null;
    }

    const instanceId = volume.Attachments[0].InstanceId;
    if (!instanceId) return null;

    const descCmd = new DescribeInstancesCommand({ InstanceIds: [instanceId] });
    const descResp = await this.ec2.send(descCmd);
    const reservations = descResp.Reservations || [];
    for (const res of reservations) {
      const instances = res.Instances || [];
      if (instances.length > 0) {
        return this.buildVmWithDiskInfo(instances[0], diskName);
      }
    }
    return null;
  }

  /**
   * Provisiona uma nova instância EC2.
   * O vmName vira tag Name; o diskName também fica em tag DiskName.
   * Se já existir volume EBS com tag Name=diskName, ele é anexado na criação.
   */
  public async createVirtualMachine(
    vmName: string,
    diskName: string,
    vCpus: number
  ): Promise<Instance> {
    const instanceType = this.getVmSizeFromVCpus(vCpus) as _InstanceType;

    // Se há volume EBS pré-existente, resolvemos o SnapshotId dele; senão usamos AMI direto
    const existingVolume = await this.findVolumeByName(diskName);

    const cmd = new RunInstancesCommand({
      ImageId: this.amiId,
      InstanceType: instanceType,
      MinCount: 1,
      MaxCount: 1,
      KeyName: this.keyPairName,
      Placement: { AvailabilityZone: this.availabilityZone },
      NetworkInterfaces: [
        {
          DeviceIndex: 0,
          SubnetId: this.subnetId,
          Groups: [this.securityGroupId],
          AssociatePublicIpAddress: true,
        },
      ],
      TagSpecifications: [
        {
          ResourceType: 'instance',
          Tags: [
            { Key: 'Name', Value: vmName },
            { Key: 'DiskName', Value: diskName },
            { Key: 'ManagedBy', Value: 'oris-cloud' },
          ],
        },
      ],
    });

    try {
      const resp = await this.ec2.send(cmd);
      const created = (resp.Instances || [])[0];
      if (!created || !created.InstanceId) {
        throw new Error(`RunInstances não retornou instância para ${vmName}`);
      }
      appLogger.info('EC2 Instance criada', {
        vmName,
        diskName,
        instanceId: created.InstanceId,
        instanceType,
      });

      // Anexar volume existente (se houver) assim que a instância estiver pronta
      if (existingVolume && existingVolume.VolumeId) {
        await this.attachVolumeWithRetry(existingVolume.VolumeId, created.InstanceId);
      }

      return created;
    } catch (error: any) {
      // Rate limit / quota
      if (
        error?.name === 'InstanceLimitExceeded' ||
        error?.Code === 'InstanceLimitExceeded' ||
        /limit|quota/i.test(error?.message || '')
      ) {
        const quotaError: QuotaError = Object.assign(
          new Error(
            'Cota de instâncias EC2 atingida. Solicite aumento no AWS Service Quotas ou aguarde.'
          ),
          { isQuotaError: true, originalError: error }
        ) as QuotaError;
        throw quotaError;
      }
      throw error;
    }
  }

  /** Anexa um volume a uma instância com retry (instância pode estar em pending). */
  private async attachVolumeWithRetry(
    volumeId: string,
    instanceId: string,
    maxAttempts: number = 10
  ): Promise<void> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        await this.ec2.send(
          new AttachVolumeCommand({
            VolumeId: volumeId,
            InstanceId: instanceId,
            Device: '/dev/sdf',
          })
        );
        appLogger.info('Volume anexado', { volumeId, instanceId });
        return;
      } catch (error: any) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        appLogger.warn('Falha ao anexar volume, retry', {
          volumeId,
          instanceId,
          attempt: attempt + 1,
          error: error?.message,
          delayMs: delay,
        });
        await new Promise(r => setTimeout(r, delay));
      }
    }
    throw new Error(`Não foi possível anexar volume ${volumeId} à instância ${instanceId}`);
  }

  /** Inicia uma EC2 instance pelo tag Name. */
  public async startVirtualMachine(vmName: string): Promise<boolean> {
    const instance = await this.findInstanceByName(vmName);
    if (!instance || !instance.InstanceId) {
      throw new Error(`Instância ${vmName} não encontrada`);
    }
    await this.ec2.send(new StartInstancesCommand({ InstanceIds: [instance.InstanceId] }));
    appLogger.info('EC2 Instance iniciada', { vmName, instanceId: instance.InstanceId });
    return true;
  }

  /** Para (stop) uma EC2 instance pelo tag Name. */
  public async stopVirtualMachine(vmName: string): Promise<boolean> {
    const instance = await this.findInstanceByName(vmName);
    if (!instance || !instance.InstanceId) {
      throw new Error(`Instância ${vmName} não encontrada`);
    }
    await this.ec2.send(new StopInstancesCommand({ InstanceIds: [instance.InstanceId] }));
    appLogger.info('EC2 Instance parada', { vmName, instanceId: instance.InstanceId });
    return true;
  }

  /** Reinicia (reboot) uma EC2 instance pelo tag Name. */
  public async restartVirtualMachine(vmName: string): Promise<boolean> {
    const instance = await this.findInstanceByName(vmName);
    if (!instance || !instance.InstanceId) {
      throw new Error(`Instância ${vmName} não encontrada`);
    }
    await this.ec2.send(new RebootInstancesCommand({ InstanceIds: [instance.InstanceId] }));
    appLogger.info('EC2 Instance reiniciada', { vmName, instanceId: instance.InstanceId });
    return true;
  }

  /**
   * Encerra (terminate) uma EC2 instance pelo tag Name.
   * O volume EBS com DeleteOnTermination=false é preservado.
   */
  public async deleteVirtualMachine(vmName: string): Promise<boolean> {
    const instance = await this.findInstanceByName(vmName);
    if (!instance || !instance.InstanceId) {
      appLogger.warn('Instância não encontrada para delete', { vmName });
      return false;
    }
    await this.ec2.send(new TerminateInstancesCommand({ InstanceIds: [instance.InstanceId] }));
    appLogger.info('EC2 Instance encerrada', { vmName, instanceId: instance.InstanceId });
    return true;
  }

  /** Retorna o state atual ('running', 'stopped', etc) da instância. */
  public async getVMStatus(vmName: string): Promise<string | null> {
    const instance = await this.findInstanceByName(vmName);
    if (!instance) return null;
    return instance.State?.Name || null;
  }

  /** Retorna os IPs público e privado da instância. */
  public async getVMIPs(
    vmName: string
  ): Promise<{ publicIp: string | null; privateIp: string | null }> {
    const instance = await this.findInstanceByName(vmName);
    if (!instance) return { publicIp: null, privateIp: null };
    return {
      publicIp: instance.PublicIpAddress ?? null,
      privateIp: instance.PrivateIpAddress ?? null,
    };
  }
}

// Singleton default export, mantém mesma assinatura que o antigo azureServices
export default new AwsService();
