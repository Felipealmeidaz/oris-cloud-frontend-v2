import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface VMStatus {
  hasVM: boolean;
  vm?: {
    name: string;
    status: 'RUNNING' | 'STOPPED' | 'STARTING' | 'STOPPING';
    publicIp: string | null;
    privateIp: string | null;
    location: string;
    vmSize: string | undefined;
  };
}

export function useVMControl() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const startVM = async (diskName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/vm/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ diskName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao iniciar VM');
      }

      toast({
        title: 'Sucesso',
        description: 'VM iniciada com sucesso',
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao iniciar VM',
        color: 'danger',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const stopVM = async (diskName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/vm/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ diskName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao parar VM');
      }

      toast({
        title: 'Sucesso',
        description: 'VM parada com sucesso',
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao parar VM',
        color: 'danger',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const restartVM = async (diskName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/vm/restart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ diskName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao reiniciar VM');
      }

      toast({
        title: 'Sucesso',
        description: 'VM reiniciada com sucesso',
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao reiniciar VM',
        color: 'danger',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getVMStatus = async (diskName: string): Promise<VMStatus> => {
    try {
      const response = await fetch('/api/vm/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ diskName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar status da VM');
      }

      return data;
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao buscar status da VM',
        color: 'danger',
      });
      throw error;
    }
  };

  return {
    startVM,
    stopVM,
    restartVM,
    getVMStatus,
    isLoading,
  };
}
