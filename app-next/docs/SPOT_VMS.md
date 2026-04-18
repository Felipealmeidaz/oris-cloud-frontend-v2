# Azure Spot VMs - Documentação

## O que são Spot VMs?

As **Azure Spot VMs** são máquinas virtuais de baixa prioridade que utilizam capacidade não utilizada do Azure a preços significativamente reduzidos (até 90% de desconto).

## Vantagens

### 💰 Economia de Custos
- **Até 90% mais barato** que VMs padrão
- Ideal para workloads que podem tolerar interrupções
- Preço variável baseado em capacidade disponível

### 🚀 Sem Limites de Cota Padrão
- Não contam para a cota de vCPUs padrão
- Usam cota separada de "Low Priority Cores"
- Maior disponibilidade para criação de VMs

### ⚡ Mesma Performance
- Hardware idêntico às VMs padrão
- Mesmas GPUs (Tesla T4, A10)
- Mesma velocidade de processamento

## Como Funcionam

### Criação
Quando você inicia uma máquina, o sistema:
1. Verifica se há capacidade Spot disponível
2. Cria a VM com prioridade "Spot"
3. Configura política de eviction como "Deallocate"

### Eviction (Despejo)
Se o Azure precisar da capacidade:
- A VM é **desalocada** (não deletada)
- Seus dados no disco são **preservados**
- Você pode reiniciar quando houver capacidade
- Recebe aviso 30 segundos antes da eviction

### Política de Preço
```typescript
maxPrice: -1  // Pagar até o preço on-demand
```
Isso significa que sua VM não será despejada por motivos de preço, apenas por falta de capacidade.

## Configuração Atual

### VMs Criadas
```typescript
priority: 'Spot'
evictionPolicy: 'Deallocate'
billingProfile: {
  maxPrice: -1
}
```

### SKUs Disponíveis
- **Standard_NC4as_T4_v3** (4 vCPUs, Tesla T4)
- **Standard_NC8as_T4_v3** (8 vCPUs, Tesla T4)
- **Standard_NC16as_T4_v3** (16 vCPUs, Tesla T4)
- **Standard_NV6ads_A10_v5** (6 vCPUs, A10)
- **Standard_NV12ads_A10_v5** (12 vCPUs, A10)

## Tratamento de Erros

### Erro de Cota
Se você receber erro de cota Spot:
```
Não há recursos Spot disponíveis na Azure para iniciar sua máquina no momento.
```

**Soluções:**
1. Aguarde alguns minutos e tente novamente
2. Tente em horários de menor demanda
3. Entre em contato com o suporte para aumentar cota

### Eviction Inesperada
Se sua VM for despejada:
1. Seus dados estão seguros no disco
2. Tente reiniciar a VM
3. Se não houver capacidade, aguarde alguns minutos

## Boas Práticas

### ✅ Recomendado Para
- Gaming sessions
- Desenvolvimento e testes
- Renderização de vídeos
- Treinamento de ML (com checkpoints)
- Workloads que podem ser pausados

### ❌ Não Recomendado Para
- Servidores de produção críticos
- Bancos de dados sem replicação
- Aplicações que não toleram downtime
- Workloads sem sistema de checkpoint

## Monitoramento

### Logs
O sistema registra:
- Criação de VM Spot
- Configuração de prioridade
- Política de eviction
- Erros de capacidade

### Exemplo de Log
```
[INFO] Criando VM Spot: disk-abc123 com disco disk-abc123 e 4 vCPUs
[INFO] 💰 Spot VM: Economia de até 90% comparado a VMs padrão
[INFO] ✅ VM Spot criada com sucesso: disk-abc123
[INFO] 📊 Configuração: Standard_NC4as_T4_v3 | Prioridade: Spot | Política de Eviction: Deallocate
```

## Referências

- [Azure Spot VMs Documentation](https://docs.microsoft.com/azure/virtual-machines/spot-vms)
- [Spot VM Pricing](https://azure.microsoft.com/pricing/details/virtual-machines/linux/)
- [Eviction Policy](https://docs.microsoft.com/azure/virtual-machines/spot-vms#eviction-policy)

## Suporte

Se você tiver problemas com Spot VMs:
1. Verifique os logs em `azure-service.log`
2. Tente reiniciar a VM após alguns minutos
3. Entre em contato com o suporte técnico
