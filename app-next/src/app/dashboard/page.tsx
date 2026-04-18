'use client';

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Server,
    Search,
    Plus,
    LayoutGrid,
    List,
    ChevronRight,
    Check,
    X,
    HardDrive,
    ChevronDown,
    ChevronUp,
    Power,
    RotateCw,
    Copy,
    Eye,
    EyeOff,
    Plug,
    Lightbulb,
    Gamepad2,
    Lock,
    Zap,
    BarChart3,
    Wifi,
    Save,
    Target
} from "lucide-react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";

interface Machine {
    id: string;
    name: string;
    status: 'active' | 'inactive' | 'pending';
    plan: string;
    expiresAt: string;
    createdAt: string;
}

interface Invoice {
    id: string;
    customId: string;
    plan: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected' | 'refunded';
    createdAt: string;
    txid: string;
}

interface Disk {
    id: string;
    name: string;
    vCpus: number;
    sizeGB: number;
    isActive: boolean;
    validUntil: string;
    createdAt: string;
}

interface Subscription {
    id: string;
    planName: string;
    status: string;
    expiresAt: string;
}

export default function Dashboard() {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const { toast } = useToast();
    const [machines, setMachines] = useState<Machine[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [disks, setDisks] = useState<Disk[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isRecoverDialogOpen, setIsRecoverDialogOpen] = useState(false);
    const [token, setToken] = useState("");
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [activeTab, setActiveTab] = useState("machines");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [isCreatingDisk, setIsCreatingDisk] = useState(false);
    const [expandedDiskId, setExpandedDiskId] = useState<string | null>(null);
    const [startingDiskId, setStartingDiskId] = useState<string | null>(null);
    const [runningDisks, setRunningDisks] = useState<Map<string, {
        ip: string;
        username: string;
        password: string;
    }>>(new Map());
    const [showPassword, setShowPassword] = useState<Map<string, boolean>>(new Map());
    const [stoppingDiskId, setStoppingDiskId] = useState<string | null>(null);
    const [restartingDiskId, setRestartingDiskId] = useState<string | null>(null);
    const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
    const [connectingDiskId, setConnectingDiskId] = useState<string | null>(null);
    const [moonlightPin, setMoonlightPin] = useState("");
    const [isConnecting, setIsConnecting] = useState(false);

    // Dicas sobre o serviço
    const tips = [
        { icon: Lightbulb, text: "Use Ctrl+Alt+End para abrir o gerenciador de tarefas na máquina remota." },
        { icon: Gamepad2, text: "Configure a resolução da tela nas configurações do Windows para melhor desempenho." },
        { icon: Lock, text: "Sempre desligue a máquina quando não estiver usando para economizar recursos." },
        { icon: Zap, text: "Para melhor performance, feche aplicativos desnecessários na máquina virtual." },
        { icon: BarChart3, text: "Monitore o uso de recursos no gerenciador de tarefas para otimizar o desempenho." },
        { icon: Wifi, text: "Use uma conexão de internet estável para melhor experiência de uso." },
        { icon: Save, text: "Salve seus arquivos importantes regularmente para evitar perda de dados." },
        { icon: Target, text: "Ajuste as configurações gráficas dos jogos para obter o melhor FPS." },
    ];

    const [currentTip, setCurrentTip] = useState(tips[Math.floor(Math.random() * tips.length)]);

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/auth");
        }
    }, [session, isPending, router]);

    useEffect(() => {
        const fetchData = async () => {
            if (!session?.user) return;
            
            setIsLoading(true);
            
            try {
                // Buscar faturas
                const invoicesRes = await fetch('/api/invoices');
                if (invoicesRes.ok) {
                    const data = await invoicesRes.json();
                    setInvoices(data.invoices || []);
                } else if (invoicesRes.status === 401) {
                    router.push('/auth');
                    return;
                }

                // Buscar discos
                const disksRes = await fetch('/api/disk');
                if (disksRes.ok) {
                    const data = await disksRes.json();
                    setDisks(data.disks || []);
                    
                    // Verificar status das VMs para cada disco ativo
                    const activeDisks = data.disks.filter((d: Disk) => d.isActive);
                    for (const disk of activeDisks) {
                        try {
                            const statusRes = await fetch('/api/vm/status', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ diskName: disk.name }),
                            });
                            
                            if (statusRes.ok) {
                                const statusData = await statusRes.json();
                                if (statusData.hasVM && statusData.vm && statusData.vm.status === 'RUNNING') {
                                    const accessData = {
                                        ip: statusData.vm.publicIp || 'Aguardando IP...',
                                        username: 'Oris.io',
                                        password: 'KyvenCloud2025@**'
                                    };
                                    setRunningDisks(prev => new Map(prev).set(disk.id, accessData));
                                }
                            }
                        } catch (error) {
                            console.error(`Erro ao verificar status do disco ${disk.name}:`, error);
                        }
                    }
                }

                // Buscar assinaturas
                const subsRes = await fetch('/api/subscriptions');
                if (subsRes.ok) {
                    const data = await subsRes.json();
                    setSubscriptions(data.subscriptions || []);
                }
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (session) {
            fetchData();
        }
    }, [session, router]);

    if (isPending || !session) {
        return (
            <div className="min-h-screen w-screen bg-[rgb(9,9,11)] text-white pt-32">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <Skeleton className="h-12 w-64 bg-gray-800 mb-8" />
                    <Skeleton className="h-64 w-full bg-gray-800" />
                </div>
            </div>
        );
    }

    const filteredMachines = machines.filter(machine =>
        machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredDisks = disks.filter(disk =>
        disk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        disk.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredInvoices = invoices.filter(invoice =>
        invoice.plan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.customId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.txid.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRedeemToken = async () => {
        if (token.length !== 8) {
            toast({
                title: "Token inválido",
                description: "O token deve ter exatamente 8 caracteres.",
                color: "danger",
            });
            return;
        }

        if (!session?.user?.id || !session?.user?.email) {
            toast({
                title: "Erro",
                description: "Você precisa estar logado para resgatar um token.",
                color: "danger",
            });
            return;
        }

        setIsRedeeming(true);

        try {
            const response = await fetch('/api/token/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    token: token.toUpperCase(),
                    userId: session.user.id,
                    userEmail: session.user.email
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast({
                    title: "Erro ao resgatar token",
                    description: data.error || "Token inválido ou já resgatado.",
                    color: "danger",
                });
                setIsRedeeming(false);
                return;
            }

            toast({
                title: "Token resgatado com sucesso!",
                description: `Assinatura ${data.subscription.plan} de ${data.subscription.days} dias com ${data.subscription.diskSizeGB}GB de disco ativada até ${new Date(data.subscription.expiresAt).toLocaleDateString('pt-BR')}.`,
            });

            setIsRecoverDialogOpen(false);
            setToken("");
            
            // Recarregar dados
            const fetchData = async () => {
                try {
                    const response = await fetch('/api/invoices');
                    if (response.ok) {
                        const data = await response.json();
                        setInvoices(data.invoices || []);
                    }
                } catch (error) {
                    console.error('Erro ao buscar faturas:', error);
                }
            };
            
            await fetchData();
            
        } catch (error) {
            toast({
                title: "Erro",
                description: "Ocorreu um erro ao resgatar o token.",
                color: "danger",
            });
        } finally {
            setIsRedeeming(false);
        }
    };

    const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (value.length <= 8) {
            setToken(value);
        }
    };

    const handleCreateDisk = async () => {
        setIsCreatingDisk(true);

        try {
            const response = await fetch('/api/disk/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (!response.ok) {
                toast({
                    title: "Erro ao criar disco",
                    description: data.error || "Não foi possível criar o disco.",
                    color: "danger",
                });
                setIsCreatingDisk(false);
                return;
            }

            toast({
                title: "Disco criado com sucesso!",
                description: `Seu disco ${data.disk.name} de ${data.disk.sizeGB}GB foi criado e está ativo.`,
            });

            // Recarregar discos
            const disksRes = await fetch('/api/disk');
            if (disksRes.ok) {
                const disksData = await disksRes.json();
                setDisks(disksData.disks || []);
            }

        } catch (error) {
            toast({
                title: "Erro",
                description: "Ocorreu um erro ao criar o disco.",
                color: "danger",
            });
        } finally {
            setIsCreatingDisk(false);
        }
    };

    // Verificar se tem assinatura ativa
    const hasActiveSubscription = subscriptions.some(
        sub => sub.status === 'active' && new Date(sub.expiresAt) > new Date()
    );

    // Verificar se tem disco ativo
    const hasActiveDisk = disks.some(disk => disk.isActive);

    const togglePasswordVisibility = (diskId: string) => {
        setShowPassword(prev => {
            const newMap = new Map(prev);
            newMap.set(diskId, !newMap.get(diskId));
            return newMap;
        });
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copiado!",
            description: `${label} copiado para a área de transferência.`,
        });
    };

    const handleStartMachine = async (diskId: string) => {
        const disk = disks.find(d => d.id === diskId);
        if (!disk) return;

        setStartingDiskId(diskId);

        try {
            const response = await fetch('/api/vm/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ diskName: disk.name }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao iniciar VM');
            }

            // Aguardar alguns segundos e buscar status
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Buscar informações da VM
            const statusResponse = await fetch('/api/vm/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ diskName: disk.name }),
            });

            const statusData = await statusResponse.json();

            if (statusData.hasVM && statusData.vm) {
                const accessData = {
                    ip: statusData.vm.publicIp || 'Aguardando IP...',
                    username: 'Oris.io',
                    password: 'KyvenCloud2025@**'
                };

                setRunningDisks(prev => new Map(prev).set(diskId, accessData));
            }

            toast({
                title: "Máquina iniciada!",
                description: "Sua máquina está pronta para uso.",
            });
        } catch (error: any) {
            toast({
                title: "Erro ao iniciar máquina",
                description: error.message || "Ocorreu um erro ao iniciar a máquina.",
                color: "danger",
            });
        } finally {
            setStartingDiskId(null);
        }
    };

    const handleStopMachine = async (diskId: string) => {
        const disk = disks.find(d => d.id === diskId);
        if (!disk) return;

        setStoppingDiskId(diskId);

        try {
            const response = await fetch('/api/vm/stop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ diskName: disk.name }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao desligar VM');
            }

            setRunningDisks(prev => {
                const newMap = new Map(prev);
                newMap.delete(diskId);
                return newMap;
            });

            toast({
                title: "Máquina desligada e recursos liberados",
                description: "VM deletada com sucesso. Seu disco foi preservado e você economizou recursos.",
            });
        } catch (error: any) {
            toast({
                title: "Erro ao desligar máquina",
                description: error.message || "Ocorreu um erro ao desligar a máquina.",
                color: "danger",
            });
        } finally {
            setStoppingDiskId(null);
        }
    };

    const handleRestartMachine = async (diskId: string) => {
        const disk = disks.find(d => d.id === diskId);
        if (!disk) return;

        setRestartingDiskId(diskId);

        try {
            const response = await fetch('/api/vm/restart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ diskName: disk.name }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao reiniciar VM');
            }

            toast({
                title: "Máquina reiniciada",
                description: "Sua máquina foi reiniciada com sucesso.",
            });
        } catch (error: any) {
            toast({
                title: "Erro ao reiniciar máquina",
                description: error.message || "Ocorreu um erro ao reiniciar a máquina.",
                color: "danger",
            });
        } finally {
            setRestartingDiskId(null);
        }
    };

    const handleOpenConnectDialog = (diskId: string) => {
        setConnectingDiskId(diskId);
        setMoonlightPin("");
        setIsConnectDialogOpen(true);
    };

    const handleConnectMoonlight = async () => {
        if (!connectingDiskId) return;

        const disk = disks.find(d => d.id === connectingDiskId);
        if (!disk) return;

        if (moonlightPin.length !== 4) {
            toast({
                title: "PIN inválido",
                description: "O PIN deve ter exatamente 4 dígitos.",
                color: "danger",
            });
            return;
        }

        setIsConnecting(true);

        try {
            const response = await fetch('/api/vm/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    diskName: disk.name,
                    pin: moonlightPin
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao conectar com Moonlight');
            }

            toast({
                title: "Conectado!",
                description: "Conexão com Moonlight estabelecida com sucesso.",
            });

            setIsConnectDialogOpen(false);
            setMoonlightPin("");
        } catch (error: any) {
            toast({
                title: "Erro ao conectar",
                description: error.message || "Ocorreu um erro ao conectar com Moonlight.",
                color: "danger",
            });
        } finally {
            setIsConnecting(false);
        }
    };

    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length <= 4) {
            setMoonlightPin(value);
        }
    };

    return (
        <div className="min-h-screen w-screen bg-[rgb(9,9,11)] text-white pt-20 md:pt-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
                
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">
                    <Link href="/" className="hover:text-gray-300 transition-colors">
                        Minha conta
                    </Link>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-white">{activeTab === "machines" ? "Máquinas" : "Faturas"}</span>
                </div>

                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-6 sm:mb-8"
                >
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-normal mb-2 sm:mb-3">Minhas Máquinas</h1>
                    <p className="text-gray-400 text-sm sm:text-base md:text-lg">
                        Gerencie suas máquinas, bots de verificação e automações
                    </p>
                </motion.div>

                {/* Tabs and Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                    {/* Custom Toggle */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="relative inline-flex items-center bg-transparent border border-gray-800 rounded-lg p-1"
                    >
                        {/* Animated Background */}
                        <motion.div
                            className="absolute h-[calc(100%-8px)] bg-gradient-to-r from-white to-gray-100 rounded-md shadow-md"
                            initial={false}
                            animate={{
                                x: activeTab === "machines" ? 4 : "calc(100% + 4px)",
                                width: activeTab === "machines" ? "calc(50% - 8px)" : "calc(50% - 8px)"
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 350,
                                damping: 35
                            }}
                        />
                        
                        {/* Máquinas Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab("machines")}
                            className={`relative z-10 px-6 py-2.5 text-sm font-medium transition-all duration-200 rounded-md ${
                                activeTab === "machines" 
                                    ? "text-black" 
                                    : "text-gray-400 hover:text-gray-200"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <motion.div
                                    animate={{ 
                                        rotate: activeTab === "machines" ? [0, -10, 10, 0] : 0 
                                    }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Server className="w-4 h-4" />
                                </motion.div>
                                <span>Máquinas</span>
                            </div>
                        </motion.button>
                        
                        {/* Faturas Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab("invoices")}
                            className={`relative z-10 px-6 py-2.5 text-sm font-medium transition-all duration-200 rounded-md ${
                                activeTab === "invoices" 
                                    ? "text-black" 
                                    : "text-gray-400 hover:text-gray-200"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <motion.div
                                    animate={{ 
                                        rotate: activeTab === "invoices" ? [0, -10, 10, 0] : 0 
                                    }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <List className="w-4 h-4" />
                                </motion.div>
                                <span>Faturas</span>
                            </div>
                        </motion.button>
                    </motion.div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full sm:w-auto"
                        >
                            <Button
                                variant="outline"
                                className="border-gray-700 hover:bg-gray-800 w-full sm:w-auto"
                                onClick={() => setIsRecoverDialogOpen(true)}
                            >
                                <Search className="w-4 h-4 mr-2" />
                                Recuperar
                            </Button>
                        </motion.div>
                        <Link href="/order" className="w-full sm:w-auto">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button className="bg-white text-black hover:bg-gray-200 w-full">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Adquirir Máquina
                                </Button>
                            </motion.div>
                        </Link>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="relative flex-1 w-full sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Busque por nome ou ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-transparent border-gray-800 focus:border-gray-600 w-full"
                        />
                    </div>
                    
                    {/* Status Filter - Only show in invoices tab */}
                    {activeTab === "invoices" && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-wrap items-center gap-2 w-full sm:w-auto bg-transparent border border-gray-800 rounded-lg p-1"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setStatusFilter("all")}
                                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${
                                    statusFilter === "all" 
                                        ? "text-white bg-gray-800 shadow-sm" 
                                        : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                                }`}
                            >
                                Todas
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setStatusFilter("pending")}
                                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${
                                    statusFilter === "pending" 
                                        ? "text-yellow-400 bg-yellow-400/20 shadow-sm" 
                                        : "text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10"
                                }`}
                            >
                                Pendente
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setStatusFilter("approved")}
                                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${
                                    statusFilter === "approved" 
                                        ? "text-green-400 bg-green-400/20 shadow-sm" 
                                        : "text-gray-400 hover:text-green-400 hover:bg-green-400/10"
                                }`}
                            >
                                Aprovado
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setStatusFilter("rejected")}
                                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${
                                    statusFilter === "rejected" 
                                        ? "text-red-400 bg-red-400/20 shadow-sm" 
                                        : "text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                                }`}
                            >
                                Rejeitado
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setStatusFilter("refunded")}
                                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${
                                    statusFilter === "refunded" 
                                        ? "text-orange-400 bg-orange-400/20 shadow-sm" 
                                        : "text-gray-400 hover:text-orange-400 hover:bg-orange-400/10"
                                }`}
                            >
                                Reembolsado
                            </motion.button>
                        </motion.div>
                    )}
                </div>

                {/* Content */}
                {activeTab === "machines" && (
                    <>
                        {/* Alert - Active Subscription without Disk */}
                        {!isLoading && hasActiveSubscription && !hasActiveDisk && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <Alert className="mb-8 border-blue-500/30 bg-blue-500/10">
                                    <Server className="h-4 w-4 text-blue-400" />
                                    <AlertTitle className="text-blue-400">Você tem assinatura ativa, porém não tem disco</AlertTitle>
                                    <AlertDescription className="text-blue-200 flex items-center justify-between">
                                        <span>Crie seu disco para começar a usar sua máquina virtual.</span>
                                        <Button
                                            onClick={handleCreateDisk}
                                            disabled={isCreatingDisk}
                                            className="ml-4 bg-blue-500 hover:bg-blue-600 text-white"
                                        >
                                            {isCreatingDisk ? "Criando..." : "Criar Disco"}
                                        </Button>
                                    </AlertDescription>
                                </Alert>
                            </motion.div>
                        )}

                        {isLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-32 w-full bg-gray-800" />
                                <Skeleton className="h-32 w-full bg-gray-800" />
                            </div>
                        ) : filteredDisks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="mb-6 p-6 rounded-full bg-gray-900/50 border border-gray-800">
                            <Search className="w-12 h-12 text-gray-600" />
                        </div>
                        <h2 className="text-2xl font-normal mb-3">
                            {searchQuery ? "Nenhum resultado encontrado" : "Nenhuma máquina encontrada"}
                        </h2>
                        <p className="text-gray-400 text-center max-w-md mb-8">
                            {searchQuery ? (
                                <>
                                    Não encontramos nenhuma máquina com "{searchQuery}".<br />
                                    Tente buscar por outro termo.
                                </>
                            ) : (
                                <>
                                    Escolha um plano e ative sua primeira máquina<br />
                                    para começar a usar nossos serviços de cloud gaming.
                                </>
                            )}
                        </p>
                        {!searchQuery && (
                            <Link href="/order">
                                <Button className="bg-white text-black hover:bg-gray-200">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Adquirir Máquina
                                </Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredDisks.map((disk, index) => {
                            const isExpired = new Date(disk.validUntil) < new Date();
                            const statusColor = disk.isActive && !isExpired ? 'text-green-400' : 'text-red-400';
                            const statusText = disk.isActive && !isExpired ? 'Ativo' : 'Expirado';
                            const isExpanded = expandedDiskId === disk.id;
                            
                            return (
                                <motion.div
                                    key={disk.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className="border border-gray-800 rounded-lg p-4 sm:p-6 hover:border-gray-700 transition-all duration-300"
                                >
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                                            <div className="p-2 sm:p-3 rounded-lg bg-gray-900 border border-gray-800">
                                                <HardDrive className="w-5 h-5 sm:w-6 sm:h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base sm:text-lg font-medium truncate">{disk.name}</h3>
                                                <p className="text-xs sm:text-sm text-gray-400">
                                                    Criado em {new Date(disk.createdAt).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 sm:gap-6 w-full sm:w-auto">
                                            <div className="text-left sm:text-right flex-1 sm:flex-none">
                                                <p className="text-xs sm:text-sm text-gray-400">vCPUs</p>
                                                <p className="text-xs sm:text-sm font-medium">{disk.vCpus} cores</p>
                                            </div>
                                            <div className="text-left sm:text-right flex-1 sm:flex-none">
                                                <p className="text-xs sm:text-sm text-gray-400">Armazenamento</p>
                                                <p className="text-xs sm:text-sm font-medium">{disk.sizeGB} GB</p>
                                            </div>
                                            <div className="text-left sm:text-right flex-1 sm:flex-none">
                                                <p className="text-xs sm:text-sm text-gray-400">Status</p>
                                                <p className={`text-xs sm:text-sm font-medium ${statusColor}`}>{statusText}</p>
                                            </div>
                                            <div className="text-left sm:text-right flex-1 sm:flex-none">
                                                <p className="text-xs sm:text-sm text-gray-400">Válido até</p>
                                                <p className="text-xs sm:text-sm font-medium">
                                                    {new Date(disk.validUntil).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                            {disk.isActive && !isExpired && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setExpandedDiskId(isExpanded ? null : disk.id)}
                                                    className="hover:bg-gray-800"
                                                >
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-5 h-5" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5" />
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {isExpanded && disk.isActive && !isExpired && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="mt-6 pt-6 border-t border-gray-800"
                                        >
                                            {startingDiskId === disk.id ? (
                                                // Starting State
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="flex flex-col items-center justify-center py-8 space-y-4"
                                                >
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    >
                                                        <AiOutlineLoading3Quarters className="h-12 w-12 text-green-500" />
                                                    </motion.div>
                                                    <p className="text-gray-400 font-medium">Iniciando máquina...</p>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500 text-center max-w-md">
                                                        <currentTip.icon className="w-4 h-4 flex-shrink-0" />
                                                        <span>{currentTip.text}</span>
                                                    </div>
                                                </motion.div>
                                            ) : stoppingDiskId === disk.id ? (
                                                // Stopping State
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="flex flex-col items-center justify-center py-8 space-y-4"
                                                >
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    >
                                                        <AiOutlineLoading3Quarters className="h-12 w-12 text-red-400" />
                                                    </motion.div>
                                                    <p className="text-gray-400 font-medium">Desligando e liberando recursos...</p>
                                                    <p className="text-sm text-gray-500 text-center max-w-md">Deletando VM, IP e NIC. Seu disco será preservado.</p>
                                                </motion.div>
                                            ) : restartingDiskId === disk.id ? (
                                                // Restarting State
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="flex flex-col items-center justify-center py-8 space-y-4"
                                                >
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    >
                                                        <AiOutlineLoading3Quarters className="h-12 w-12 text-blue-400" />
                                                    </motion.div>
                                                    <p className="text-gray-400 font-medium">Reiniciando máquina...</p>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500 text-center max-w-md">
                                                        <currentTip.icon className="w-4 h-4 flex-shrink-0" />
                                                        <span>{currentTip.text}</span>
                                                    </div>
                                                </motion.div>
                                            ) : runningDisks.has(disk.id) ? (
                                                // Machine Running - Show Access Data
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.4 }}
                                                    className="space-y-4"
                                                >
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.3, delay: 0.1 }}
                                                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                                                    >
                                                        {/* IP Address */}
                                                        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                                                            <p className="text-xs text-gray-400 mb-2">IP Público</p>
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-sm text-white">{runningDisks.get(disk.id)?.ip}</p>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => copyToClipboard(runningDisks.get(disk.id)?.ip || '', 'IP')}
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <Copy className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {/* Username */}
                                                        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                                                            <p className="text-xs text-gray-400 mb-2">Usuário</p>
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-sm text-white">{runningDisks.get(disk.id)?.username}</p>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => copyToClipboard(runningDisks.get(disk.id)?.username || '', 'Usuário')}
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <Copy className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {/* Password */}
                                                        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                                                            <p className="text-xs text-gray-400 mb-2">Senha</p>
                                                            <div className="flex items-center justify-between gap-2">
                                                                <p className="text-sm text-white">
                                                                    {showPassword.get(disk.id) 
                                                                        ? runningDisks.get(disk.id)?.password 
                                                                        : '••••••••••••'}
                                                                </p>
                                                                <div className="flex gap-1">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => togglePasswordVisibility(disk.id)}
                                                                        className="h-8 w-8 p-0"
                                                                    >
                                                                        {showPassword.get(disk.id) ? (
                                                                            <EyeOff className="w-4 h-4" />
                                                                        ) : (
                                                                            <Eye className="w-4 h-4" />
                                                                        )}
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => copyToClipboard(runningDisks.get(disk.id)?.password || '', 'Senha')}
                                                                        className="h-8 w-8 p-0"
                                                                    >
                                                                        <Copy className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>

                                                    {/* Action Buttons */}
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.3, delay: 0.2 }}
                                                        className="flex flex-col sm:flex-row gap-3 mb-3"
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10 h-10 sm:h-12 text-sm sm:text-base"
                                                            onClick={() => handleOpenConnectDialog(disk.id)}
                                                        >
                                                            <Plug className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                                            Conectar
                                                        </Button>
                                                    </motion.div>
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.3, delay: 0.3 }}
                                                        className="flex flex-col sm:flex-row gap-3"
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 h-10 sm:h-12 text-sm sm:text-base"
                                                            onClick={() => handleStopMachine(disk.id)}
                                                        >
                                                            <Power className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                                            <span className="hidden sm:inline">Desligar</span>
                                                            <span className="sm:hidden">Desligar</span>
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            className="flex-1 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 h-10 sm:h-12 text-sm sm:text-base"
                                                            onClick={() => handleRestartMachine(disk.id)}
                                                        >
                                                            <RotateCw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                                            Reiniciar
                                                        </Button>
                                                    </motion.div>
                                                </motion.div>
                                            ) : (
                                                // Start Button
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <Button
                                                        className="w-full bg-green-700 hover:bg-green-800 text-white h-12"
                                                        onClick={() => handleStartMachine(disk.id)}
                                                    >
                                                        <Server className="w-5 h-5 mr-2" />
                                                        Iniciar Máquina
                                                    </Button>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
                    </>
                )}

                {/* Invoices Tab */}
                {activeTab === "invoices" && (
                    <>
                        {isLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-32 w-full bg-gray-800" />
                                <Skeleton className="h-32 w-full bg-gray-800" />
                            </div>
                        ) : filteredInvoices.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24">
                                <div className="mb-6 p-6 rounded-full bg-gray-900/50 border border-gray-800">
                                    {searchQuery ? (
                                        <Search className="w-12 h-12 text-gray-600" />
                                    ) : (
                                        <List className="w-12 h-12 text-gray-600" />
                                    )}
                                </div>
                                <h2 className="text-2xl font-normal mb-3">
                                    {searchQuery ? "Nenhum resultado encontrado" : "Nenhuma fatura encontrada"}
                                </h2>
                                <p className="text-gray-400 text-center max-w-md mb-8">
                                    {searchQuery ? (
                                        <>
                                            Não encontramos nenhuma fatura com "{searchQuery}".<br />
                                            Tente buscar por outro termo.
                                        </>
                                    ) : (
                                        <>
                                            Você ainda não possui faturas.<br />
                                            Adquira uma máquina para começar.
                                        </>
                                    )}
                                </p>
                                {!searchQuery && (
                                    <Link href="/order">
                                        <Button className="bg-white text-black hover:bg-gray-200">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Adquirir Máquina
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredInvoices
                                    .filter(invoice => statusFilter === "all" || invoice.status === statusFilter)
                                    .map((invoice, index) => {
                                    const statusColors = {
                                        pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
                                        approved: 'text-green-400 bg-green-400/10 border-green-400/30',
                                        rejected: 'text-red-400 bg-red-400/10 border-red-400/30',
                                        refunded: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
                                    };

                                    const statusLabels = {
                                        pending: 'Pendente',
                                        approved: 'Aprovado',
                                        rejected: 'Rejeitado',
                                        refunded: 'Reembolsado',
                                    };

                                    return (
                                        <motion.div
                                            key={invoice.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                            className="border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
                                                        <List className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-medium">{invoice.plan}</h3>
                                                        <p className="text-sm text-gray-400">
                                                            {new Date(invoice.createdAt).toLocaleDateString('pt-BR', {
                                                                day: '2-digit',
                                                                month: 'long',
                                                                year: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-400">Valor</p>
                                                        <p className="text-lg font-medium">R$ {invoice.amount.toFixed(2)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-400 mb-1">Status</p>
                                                        <span className={`text-xs px-3 py-1 rounded-full border ${statusColors[invoice.status]}`}>
                                                            {statusLabels[invoice.status]}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-400">ID</p>
                                                        <p className="text-xs font-mono text-gray-500">{invoice.customId.slice(0, 8)}...</p>
                                                    </div>
                                                    {invoice.status === 'pending' && (
                                                        <Link href={`/order?id=${invoice.customId}`}>
                                                            <Button variant="outline" size="sm" className="border-gray-700">
                                                                Ver Pagamento
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

            </div>

            {/* Recover Token Dialog */}
            <Dialog open={isRecoverDialogOpen} onOpenChange={setIsRecoverDialogOpen}>
                <DialogContent className="bg-[rgb(9,9,11)] border-gray-800 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-normal">Recuperar Máquina</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Insira o token de 8 dígitos que você recebeu após a compra.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label htmlFor="token" className="text-sm text-gray-300">
                                Token de Recuperação
                            </label>
                            <Input
                                id="token"
                                type="text"
                                placeholder="XXXXXXXX"
                                value={token}
                                onChange={handleTokenChange}
                                maxLength={8}
                                className="bg-transparent border-gray-700 text-center text-2xl tracking-widest font-mono uppercase"
                                disabled={isRedeeming}
                            />
                            <p className="text-xs text-gray-500">
                                Digite os 8 caracteres do seu token
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsRecoverDialogOpen(false);
                                setToken("");
                            }}
                            disabled={isRedeeming}
                            className="border-gray-700 hover:bg-gray-800"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleRedeemToken}
                            disabled={token.length !== 8 || isRedeeming}
                            className="bg-white text-black hover:bg-gray-200"
                        >
                            {isRedeeming ? (
                                <>Resgatando...</>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Resgatar Token
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Moonlight Connect Dialog */}
            <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
                <DialogContent className="bg-[rgb(9,9,11)] border-gray-800 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-normal">Conectar ao Moonlight</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Insira o PIN de 4 dígitos exibido no Moonlight da sua máquina.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label htmlFor="moonlight-pin" className="text-sm text-gray-300">
                                PIN do Moonlight
                            </label>
                            <Input
                                id="moonlight-pin"
                                type="text"
                                placeholder="0000"
                                value={moonlightPin}
                                onChange={handlePinChange}
                                maxLength={4}
                                className="bg-transparent border-gray-700 text-center text-2xl tracking-widest font-mono"
                                disabled={isConnecting}
                            />
                            <p className="text-xs text-gray-500">
                                Digite os 4 dígitos do PIN exibido no Moonlight
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsConnectDialogOpen(false);
                                setMoonlightPin("");
                            }}
                            disabled={isConnecting}
                            className="border-gray-700 hover:bg-gray-800"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleConnectMoonlight}
                            disabled={moonlightPin.length !== 4 || isConnecting}
                            className="bg-white text-black hover:bg-gray-200"
                        >
                            {isConnecting ? (
                                <>Conectando...</>
                            ) : (
                                <>
                                    <Plug className="w-4 h-4 mr-2" />
                                    Conectar
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
