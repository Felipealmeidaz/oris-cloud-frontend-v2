'use client';

import { useState, useEffect } from 'react';
import { useVMControl } from '@/hooks/use-vm-control';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square, RotateCw, Loader2, Server } from 'lucide-react';

interface VMControlCardProps {
  diskName: string;
  diskId: string;
}

export function VMControlCard({ diskName, diskId }: VMControlCardProps) {
  const { startVM, stopVM, restartVM, getVMStatus, isLoading } = useVMControl();
  const [vmStatus, setVmStatus] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStatus = async () => {
    setIsRefreshing(true);
    try {
      const status = await getVMStatus(diskName);
      setVmStatus(status);
    } catch (error) {
      // Erro silencioso - status será atualizado no próximo ciclo
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshStatus();
    // Atualizar status a cada 30 segundos
    const interval = setInterval(refreshStatus, 30000);
    return () => clearInterval(interval);
  }, [diskName]);

  const handleStart = async () => {
    await startVM(diskName);
    setTimeout(refreshStatus, 2000);
  };

  const handleStop = async () => {
    await stopVM(diskName);
    setTimeout(refreshStatus, 2000);
  };

  const handleRestart = async () => {
    await restartVM(diskName);
    setTimeout(refreshStatus, 2000);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      RUNNING: { label: 'Rodando', variant: 'default' as const, color: 'bg-green-500' },
      STOPPED: { label: 'Parado', variant: 'secondary' as const, color: 'bg-gray-500' },
      STARTING: { label: 'Iniciando', variant: 'outline' as const, color: 'bg-blue-500' },
      STOPPING: { label: 'Parando', variant: 'outline' as const, color: 'bg-orange-500' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.STOPPED;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <span className={`w-2 h-2 rounded-full ${config.color} animate-pulse`} />
        {config.label}
      </Badge>
    );
  };

  if (!vmStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Controle da VM
          </CardTitle>
          <CardDescription>Disco: {diskName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!vmStatus.hasVM) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Controle da VM
          </CardTitle>
          <CardDescription>Disco: {diskName}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhuma VM encontrada para este disco.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { vm } = vmStatus;
  const isRunning = vm.status === 'RUNNING';
  const isStopped = vm.status === 'STOPPED';
  const isTransitioning = vm.status === 'STARTING' || vm.status === 'STOPPING';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Controle da VM
            </CardTitle>
            <CardDescription>Disco: {diskName}</CardDescription>
          </div>
          {getStatusBadge(vm.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informações da VM */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nome:</span>
            <span className="font-medium">{vm.name}</span>
          </div>
          {vm.publicIp && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">IP Público:</span>
              <span className="font-mono font-medium">{vm.publicIp}</span>
            </div>
          )}
          {vm.privateIp && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">IP Privado:</span>
              <span className="font-mono font-medium">{vm.privateIp}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Localização:</span>
            <span className="font-medium">{vm.location}</span>
          </div>
          {vm.vmSize && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tamanho:</span>
              <span className="font-medium">{vm.vmSize}</span>
            </div>
          )}
        </div>

        {/* Botões de controle */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleStart}
            disabled={isLoading || isRunning || isTransitioning}
            className="flex-1"
            variant="default"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Iniciar
          </Button>

          <Button
            onClick={handleStop}
            disabled={isLoading || isStopped || isTransitioning}
            className="flex-1"
            variant="destructive"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Square className="w-4 h-4 mr-2" />
            )}
            Parar
          </Button>

          <Button
            onClick={handleRestart}
            disabled={isLoading || isStopped || isTransitioning}
            className="flex-1"
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RotateCw className="w-4 h-4 mr-2" />
            )}
            Reiniciar
          </Button>
        </div>

        {/* Botão de atualizar status */}
        <Button
          onClick={refreshStatus}
          disabled={isRefreshing}
          variant="ghost"
          size="sm"
          className="w-full"
        >
          {isRefreshing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RotateCw className="w-4 h-4 mr-2" />
          )}
          Atualizar Status
        </Button>
      </CardContent>
    </Card>
  );
}
