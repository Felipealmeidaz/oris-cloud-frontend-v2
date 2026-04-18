'use client';

import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from "react";

import {
    ExternalLink,
    Lock,
    Cloudy,
    Check,
    Copy
} from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";

// Definição do tipo para as informações de pagamento
interface PaymentInfo {
    id: number;
    status: string;
    price: number;
    plan: string;
    date: string;
    QRImage: string;
    QRCode: string;
    customId: string;
}

// Definição do tipo para os planos
interface Plan {
    name: string;
    price: number;
    duration: string;
}

// Definição do tipo para adicionais de disco
interface DiskAddon {
    id: string;
    name: string;
    sizeGB: number;
    price: number;
}

// Definição do tipo para planos de vCPU
interface VCpuPlan {
    id: string;
    name: string;
    vCpus: number;
    ramGB: number;
    duration: string;
    days: number;
    price: number;
}

interface GroupedVCpuPlan {
    vCpus: number;
    ramGB: number;
    plans: VCpuPlan[];
}

export default function OrderAndPayment() {
    const router = useRouter();
    const { data: session, isPending } = useSession();

    // --- Estados de Diálogo/Erro ---
    const [isDialogPayError, setIsDialogPayError] = useState(false);
    const [isDialogAccountError, setIsDialogAccountError] = useState(false);
    const [isDialogError, setIsDialogError] = useState(false);

    // --- Estados de Order/Seleção de Plano ---
    const [isLoading, setLoading] = useState(true);
    const [isStockQuantity, setStockQuantity] = useState(0);
    const [isSelectedPlan, setSelectedPlan] = useState("");
    const [plans, setPlans] = useState<Plan[]>([]);
    const [stock, setStock] = useState({ total: 0, available: 0, reserved: 0 });
    const [diskAddons, setDiskAddons] = useState<DiskAddon[]>([]);
    const [selectedDiskAddon, setSelectedDiskAddon] = useState<string | null>(null);
    const [vcpuPlans, setVcpuPlans] = useState<GroupedVCpuPlan[]>([]);
    const [selectedVCpuPlan, setSelectedVCpuPlan] = useState<string | null>(null);
    const [selectedVCpus, setSelectedVCpus] = useState<number>(4);
    
    // --- Estados de Discord ID ---
    const [discordId, setDiscordId] = useState("");
    const [noDiscord, setNoDiscord] = useState(false);

    // --- Estados de Pagamento ---
    const [showPayment, setShowPayment] = useState(false);
    const [isStock, setIsStock] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
    const [isCancelled, setIsCancelled] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
        id: 0,
        status: '',
        price: 0,
        plan: '',
        date: new Date().toISOString(),
        QRImage: '',
        QRCode: '',
        customId: ''
    });

    // --- Funções de Pagamento ---

    // Função para carregar os dados do pagamento (usada após a criação e no polling)
    const loadPaymentData = useCallback(async (customId: string) => {
        try {
            const responseStock = await fetch(`/api/plans`);
            const dataStock = await responseStock.json();
            const availableStock = Number(dataStock.stock?.available || 0);
            setIsStock(availableStock >= 1);

            const response = await fetch(`/api/payment/get?id=${customId}`);
            const data = await response.json();
            
            if (data.message) {
                // Se o pagamento não for encontrado, redireciona para a página inicial
                return router.push("/");
            };

            const newPaymentInfo: PaymentInfo = {
                id: data.id,
                status: data.status,
                price: data.transaction_amount,
                plan: data._doc.plan,
                date: new Date(data.date_created).toISOString(),
                QRImage: `data:image/png;base64,${data.point_of_interaction.transaction_data.qr_code_base64}`,
                QRCode: data.point_of_interaction.transaction_data.qr_code,
                customId: customId
            };

            setPaymentInfo(newPaymentInfo);
            
            // Lógica de verificação de conta (apenas se a sessão estiver carregada)
            if (!isPending && session) {
                localStorage.setItem('session', JSON.stringify(session));
                if (session.user?.email !== data._doc.email) {
                    setIsDialogAccountError(true);
                } else {
                    setLoading(false);
                };
            } else if (!isPending && !session) {
                // Se não houver sessão, redireciona para o login
                router.push("/auth");
            } else {
                // Se a sessão ainda estiver pendente, apenas carrega os dados e espera
                setLoading(false);
            }

            return newPaymentInfo;

        } catch (err) {
            setIsDialogError(true);
            return null;
        }
    }, [router, session, isPending]);

    // --- Efeitos de Inicialização ---

    // 1. Buscar planos, estoque, adicionais de disco e planos de vCPU da API
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const [plansRes, diskAddonsRes, vcpuPlansRes] = await Promise.all([
                    fetch('/api/plans'),
                    fetch('/api/disk-addons'),
                    fetch('/api/vcpu-plans')
                ]);
                
                const plansData = await plansRes.json();
                const diskAddonsData = await diskAddonsRes.json();
                const vcpuPlansData = await vcpuPlansRes.json();
                
                const loadedPlans = plansData.plans || [];
                const loadedDiskAddons = diskAddonsData.diskAddons || [];
                const loadedVCpuPlans = vcpuPlansData.groupedPlans || [];
                
                setPlans(loadedPlans);
                setStock(plansData.stock || { total: 0, available: 0, reserved: 0 });
                setStockQuantity(plansData.stock?.available || 0);
                setDiskAddons(loadedDiskAddons);
                setVcpuPlans(loadedVCpuPlans);
                
                // Definir o primeiro plano como padrão se existir
                if (loadedPlans.length > 0 && !isSelectedPlan) {
                    setSelectedPlan(loadedPlans[0].name);
                }
                
                // Definir o primeiro adicional (256GB padrão) como selecionado
                if (loadedDiskAddons.length > 0) {
                    setSelectedDiskAddon(loadedDiskAddons[0].id);
                }
                
                // Definir o primeiro plano de vCPU (4 vCPUs, 1 dia) como padrão
                if (loadedVCpuPlans.length > 0 && loadedVCpuPlans[0].plans.length > 0) {
                    setSelectedVCpuPlan(loadedVCpuPlans[0].plans[0].id);
                    setSelectedVCpus(loadedVCpuPlans[0].vCpus);
                }
                
                setLoading(false);
            } catch (error) {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    // 2. Verificar se há um ID de pagamento na URL para exibir a tela de pagamento
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const customId = urlParams.get('id');

        if (customId) {
            setShowPayment(true);
            setLoading(true); // Mantém o loading até que loadPaymentData termine
            loadPaymentData(customId);
        }
    }, [loadPaymentData]);


    // --- Funções de Order ---

    const handleSubmit = async () => {
        if (!isLoading) {
            setLoading(true);

            const selectedPlanData = plans.find(p => p.name === isSelectedPlan);
            if (!selectedPlanData) {
                setLoading(false);
                return setIsDialogPayError(true);
            }
            const planName = selectedPlanData.name;

            try {
                const generateId = async () => {
                    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                    let result = '';
                    for (let i = 0; i < 24; i++) {
                        result += characters.charAt(Math.floor(Math.random() * characters.length));
                    };

                    return result;
                };

                const cachedSession = JSON.parse(localStorage.getItem('session') || '{}');
                const userEmail = cachedSession.user?.email || session?.user?.email;

                if (!userEmail) {
                    setLoading(false);
                    return setIsDialogPayError(true);
                }

                const customId = await generateId();
                const response = await fetch('/api/payment/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        customId, 
                        planName, 
                        email: userEmail,
                        discordId: noDiscord ? null : discordId,
                        diskAddonId: selectedDiskAddon,
                        vCpuPlanId: selectedVCpuPlan
                    }),
                });

                const data = await response.json();
                if (data.message) {
                    setLoading(false);
                    return setIsDialogPayError(true);
                };

                // Carrega os dados do pagamento e mostra a tela
                await loadPaymentData(customId);
                setShowPayment(true);
                setLoading(false);
                
                // Atualiza a URL para que o usuário possa recarregar a página de pagamento
                router.push(`/order?id=${customId}`);

            } catch (err) {
                setLoading(false);
                setIsDialogPayError(true);
            };
        };
    };

    // --- Polling para verificar status do pagamento ---
    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;

        const checkPaymentStatus = async () => {
            if (!paymentInfo.customId) return;

            try {
                const cachedSession = JSON.parse(localStorage.getItem('session') || '{}');
                const responseStock = await fetch(`/api/plans`);
                const dataStock = await responseStock.json();
                const availableStock = Number(dataStock.stock?.available || 0);
                setIsStock(availableStock >= 1);

                const response = await fetch(`/api/payment/get?id=${paymentInfo.customId}`);
                const data = await response.json();
                
                if (data.message) {
                    if (intervalId) clearInterval(intervalId);
                    return router.push("/");
                };

                setPaymentInfo(prev => ({
                    ...prev,
                    status: data.status
                }));

                if (data.status === "approved") {
                    setLoading(true);

                    if (!data._doc.webhook_sended) {
                        if (availableStock < 1) {
                            // Reembolso processado automaticamente pelo servidor
                        } else {
                            // Lógica de sucesso (Webhook, Role, Estoque)
                            // Estoque será atualizado automaticamente pelo servidor
                            const dataSuccess = {
                                "embeds": [
                                    {
                                        "author": { "name": `#${data.id}` },
                                        "title": `Pagamento Aprovado`,
                                        "fields": [
                                            { "name": "<:xsCart:1235401137767714878> Plano Adquirido:", "value": `${data._doc.plan}` },
                                            { "name": "<:wPrice:1261136034654191698> Valor pago:", "value": `R$${data.transaction_amount}` },
                                            { "name": "<:xsSend:1241241326394277918> E-mail do usuário:", "value": `${cachedSession.user.email}` }
                                        ],
                                        "color": 65280,
                                        "thumbnail": { "url": `${cachedSession.user.image}` },
                                        "footer": { "text": "Oris Cloud" },
                                        "timestamp": new Date().toISOString()
                                    },
                                    {
                                        "description": "Para prosseguir com a entrega da máquina, entre em contato via DM ou aguarde a abertura de um ticket.",
                                        "color": 2895667,
                                    }
                                ],
                                "content": `**${cachedSession.user.id ? `<@${cachedSession.user.id}> | @${cachedSession.user.name} | ${cachedSession.user.id}` : `@${cachedSession.user.name}`}**`
                            };
                            
                            // Fluxo interno server-side tratará webhook, role e geração de token via /api/payment/[customId]
                            // Nenhuma chamada necessária do cliente aqui - evita duplicação
                        };

                        // Webhook sended será atualizado automaticamente pelo servidor
                    }

                    if (intervalId) clearInterval(intervalId);
                    setIsApproved(true);
                    setLoading(false);
                    return clearTimeout(data.timeout_id);

                } else if (data.status === "refunded") {
                    setLoading(true);

                    if (!data._doc.webhook_sended) {
                        // Lógica de reembolso (Webhook)
                        const dataRefunded = {
                            "embeds": [
                                {
                                    "author": { "name": `#${data.id}` },
                                    "title": `Compra Cancelada`,
                                    "description": "O usuário teve sua compra cancelada pois o estoque de máquinas acabou. Alguém adquiriu a última máquina do estoque antes dele.",
                                    "fields": [
                                        { "name": "<:xsCart:1235401137767714878> Plano Adquirido:", "value": `${data._doc.plan}` },
                                        { "name": "<:wPrice:1261136034654191698> Valor pago:", "value": `R$${data.transaction_amount}` },
                                        { "name": "<:xsSend:1241241326394277918> E-mail do usuário:", "value": `${cachedSession.user.email}` }
                                    ],
                                    "color": 16711680,
                                    "thumbnail": { "url": `${cachedSession.user.image}` },
                                    "footer": { "text": "Oris Cloud" },
                                    "timestamp": new Date().toISOString()
                                },
                                {
                                    "description": "O pagamento do usuário foi reembolsado com sucesso.",
                                    "color": 2895667,
                                }
                            ],
                            "content": `**${cachedSession.user.id ? `<@${cachedSession.user.id}> | @${cachedSession.user.name} | ${cachedSession.user.id}` : `@${cachedSession.user.name}`}**`
                        };

                        // Webhook de reembolso será tratado no servidor quando aplicável

                        // Webhook sended será atualizado automaticamente pelo servidor
                    };

                    if (intervalId) clearInterval(intervalId);
                    clearTimeout(data.timeout_id);
                    setIsCancelled(true);
                    setLoading(false);
                } else if (data.status === "rejected") {
                    if (intervalId) clearInterval(intervalId);
                    clearTimeout(data.timeout_id);
                    setIsCancelled(true);
                    setLoading(false);
                }

            } catch (err) {
                // Não para o polling em caso de erro de rede, apenas loga
            }
        };

        if (showPayment && paymentInfo.customId && !isApproved && !isCancelled) {
            // Inicia o polling a cada 5 segundos
            intervalId = setInterval(checkPaymentStatus, 5000);
        }

        // Limpa o intervalo quando o componente desmonta ou as condições mudam
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [showPayment, paymentInfo.customId, isApproved, isCancelled, router]);

    // --- Funções de Utilidade ---

    const handleCopy = () => {
        navigator.clipboard.writeText(paymentInfo.QRCode);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleBackToOrder = () => {
        setShowPayment(false);
        setPaymentInfo({
            id: 0,
            status: '',
            price: 0,
            plan: '',
            date: new Date().toISOString(),
            QRImage: '',
            QRCode: '',
            customId: ''
        });
        setIsApproved(false);
        setIsCancelled(false);
        router.push('/order'); // Limpa o ID da URL
    };

    // --- Renderização de Diálogos de Erro ---

    const renderErrorDialogs = () => (
        <>
            {/* Diálogo de Erro de Pagamento */}
            <AlertDialog open={isDialogPayError} onOpenChange={setIsDialogPayError}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Lock className="w-5 h-5 text-red-500" />
                            Erro ao processar pagamento
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Ocorreu um erro ao tentar processar seu pagamento. Por favor, tente novamente mais tarde ou entre em contato com o suporte.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Fechar</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Diálogo de Erro de Conta */}
            <AlertDialog open={isDialogAccountError} onOpenChange={setIsDialogAccountError}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Lock className="w-5 h-5 text-red-500" />
                            Conta Incorreta
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            O pagamento foi gerado para outra conta. Por favor, faça login com a conta correta para visualizar o status do pagamento.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => router.push('/auth')}>Fazer Login</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Diálogo de Erro Genérico */}
            <AlertDialog open={isDialogError} onOpenChange={setIsDialogError}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Lock className="w-5 h-5 text-red-500" />
                            Erro
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Fechar</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );

    // --- Renderização da Tela de Pagamento ---

    const renderPaymentScreen = () => {
        if (isLoading) {
            return (
                <div className="min-h-screen w-screen bg-[rgb(9,9,11)] text-white pt-32">
                    <div className="max-w-7xl mx-auto px-6 py-16">
                        <div className="grid lg:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <Skeleton className="h-12 w-3/4 bg-gray-800" />
                                <Skeleton className="h-6 w-full bg-gray-800" />
                                <Skeleton className="h-6 w-5/6 bg-gray-800" />
                            </div>
                            <Card className="border border-gray-800/80 bg-transparent p-8">
                                <Skeleton className="h-64 w-full bg-gray-800" />
                            </Card>
                        </div>
                    </div>
                </div>
            );
        }

        const isPendingStatus = paymentInfo.status === "pending";
        const isApprovedStatus = isApproved || paymentInfo.status === "approved";
        const isCancelledStatus = isCancelled || paymentInfo.status === "rejected" || paymentInfo.status === "refunded";

        const statusText = isApprovedStatus ? "Pagamento Aprovado" : isCancelledStatus ? "Pagamento Cancelado" : "Aguardando Pagamento";
        const statusColor = isApprovedStatus ? "text-green-400" : isCancelledStatus ? "text-red-400" : "text-white";
        const statusIcon = isApprovedStatus ? <Check className="w-6 h-6" /> : isCancelledStatus ? <Lock className="w-6 h-6" /> : null;

        return (
            <div className="min-h-screen w-screen bg-[rgb(9,9,11)] text-white pt-32">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        
                        {/* Left Side - Status & Instructions */}
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    {statusIcon}
                                    <h1 className={`text-5xl font-normal ${statusColor}`}>{statusText}</h1>
                                </div>
                                
                                {isPendingStatus && (
                                    <div className="space-y-4">
                                        <p className="text-xl text-gray-400">
                                            Escaneie o QR Code ao lado ou copie o código Pix para finalizar sua compra.
                                        </p>
                                        <Alert className="border-yellow-500/30 bg-yellow-500/10">
                                            <Cloudy className="w-4 h-4 text-yellow-400" />
                                            <AlertTitle className="text-yellow-400">Aguardando pagamento</AlertTitle>
                                            <AlertDescription className="text-yellow-200">
                                                O pagamento será confirmado automaticamente após a aprovação.
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                )}

                                {isApprovedStatus && (
                                    <div className="space-y-4">
                                        <p className="text-xl text-gray-400">
                                            Seu pagamento foi confirmado com sucesso! A entrega será realizada em breve.
                                        </p>
                                        <Alert className="border-green-500/30 bg-green-500/10">
                                            <Check className="w-4 h-4 text-green-400" />
                                            <AlertTitle className="text-green-400">Pagamento confirmado</AlertTitle>
                                            <AlertDescription className="text-green-200">
                                                Você receberá as instruções de acesso em breve.
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                )}

                                {isCancelledStatus && (
                                    <div className="space-y-4">
                                        <p className="text-xl text-gray-400">
                                            Seu pagamento foi cancelado ou expirou. Por favor, tente novamente.
                                        </p>
                                        <Alert className="border-red-500/30 bg-red-500/10">
                                            <Lock className="w-4 h-4 text-red-400" />
                                            <AlertTitle className="text-red-400">Pagamento não processado</AlertTitle>
                                            <AlertDescription className="text-red-200">
                                                Você pode tentar realizar um novo pagamento.
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                )}
                            </div>

                            {/* Payment Details */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Check className="h-4 w-4" />
                                    <span>Detalhes do pedido</span>
                                </div>
                                <div className="space-y-3 bg-transparent rounded-lg p-6 border border-gray-800">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Plano</span>
                                        <span className="text-white font-medium">{paymentInfo.plan}</span>
                                    </div>
                                    <Separator className="bg-gray-800" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Valor</span>
                                        <span className="text-white font-medium text-lg">R$ {paymentInfo.price.toFixed(2)}</span>
                                    </div>
                                    <Separator className="bg-gray-800" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">ID da Transação</span>
                                        <span className="text-white font-mono text-xs">{paymentInfo.customId.slice(0, 12)}...</span>
                                    </div>
                                </div>
                            </div>

                            {/* Back Button */}
                            <Button
                                onClick={handleBackToOrder}
                                variant="outline"
                                className="w-full h-12 text-base border-gray-700 hover:bg-gray-800"
                            >
                                {isApprovedStatus ? "Voltar para o Início" : "Voltar para Seleção de Plano"}
                            </Button>
                        </div>

                        {/* Right Side - QR Code Card */}
                        <div className="lg:sticky lg:top-24">
                            <Card className="border border-gray-800/80 bg-transparent backdrop-blur-sm p-8">
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-normal mb-2">Pagamento via Pix</h2>
                                        <p className="text-sm text-gray-400">
                                            {isPendingStatus ? "Escaneie o QR Code ou copie o código" : "QR Code do pagamento"}
                                        </p>
                                    </div>

                                    <Separator className="bg-gray-800" />

                                    {/* QR Code */}
                                    <div className="flex justify-center py-6">
                                        {paymentInfo.QRImage ? (
                                            <div className="relative">
                                                <Image
                                                    src={paymentInfo.QRImage}
                                                    alt="QR Code Pix"
                                                    width={280}
                                                    height={280}
                                                    className="rounded-lg border border-gray-700 p-4 bg-white"
                                                />
                                                {/* Glow Effect */}
                                                <div className="absolute inset-0 flex justify-center items-center -z-10">
                                                    <div className="w-[90%] h-[90%] bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-50 blur-2xl rounded-full" />
                                                </div>
                                            </div>
                                        ) : (
                                            <Skeleton className="h-64 w-64 rounded-lg bg-gray-800" />
                                        )}
                                    </div>

                                    {/* Copy Button */}
                                    {isPendingStatus && (
                                        <>
                                            <Separator className="bg-gray-800" />
                                            <Button
                                                onClick={handleCopy}
                                                className="w-full h-12 text-base"
                                                disabled={isCopied || !paymentInfo.QRCode}
                                            >
                                                {isCopied ? (
                                                    <span className="flex items-center gap-2">
                                                        <Check className="w-5 h-5" />
                                                        Código Copiado!
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        <Copy className="w-5 h-5" />
                                                        Copiar Código Pix
                                                    </span>
                                                )}
                                            </Button>
                                        </>
                                    )}

                                    {/* Security Badge */}
                                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
                                        <Lock className="w-3 h-3" />
                                        <span>Pagamento seguro via Pix</span>
                                    </div>
                                </div>
                            </Card>
                        </div>

                    </div>
                </div>
            </div>
        );
    };

    // --- Renderização da Tela de Order ---

    const renderOrderScreen = () => {
        const selectedPlanData = plans.find(p => p.name === isSelectedPlan);
        const selectedDiskAddonData = diskAddons.find(d => d.id === selectedDiskAddon);
        const selectedVCpuPlanData = vcpuPlans
            .flatMap(g => g.plans)
            .find(p => p.id === selectedVCpuPlan);
        
        const planPrice = selectedVCpuPlanData ? selectedVCpuPlanData.price : 0;
        const diskPrice = selectedDiskAddonData ? selectedDiskAddonData.price : 0;
        const selectedPrice = planPrice + diskPrice;

        return (
            <div className="min-h-screen w-screen bg-[rgb(9,9,11)] text-white pt-32">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        
                        {/* Left Side - Information */}
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h1 className="text-5xl font-normal tracking-wide">
                                    Finalize sua<br />compra
                                </h1>
                                <p className="text-xl text-gray-400">
                                    Você está a um passo de ter acesso à melhor experiência em cloud gaming.
                                </p>
                            </div>

                            {/* Stock Info */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Cloudy className="h-4 w-4" />
                                    <span>Disponibilidade</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Máquinas disponíveis</span>
                                        <span className="text-2xl font-medium">{isStockQuantity}</span>
                                    </div>
                                    <Progress 
                                        value={(isStockQuantity / stock.total) * 100} 
                                        className="h-2 bg-gray-800"
                                    />
                                    <p className="text-sm text-gray-500">
                                        {isStockQuantity > 0 
                                            ? `${isStockQuantity} de ${stock.total} máquinas disponíveis` 
                                            : 'Estoque esgotado'}
                                    </p>
                                </div>
                            </div>

                            {/* vCPU Selection - Cards */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Check className="h-4 w-4" />
                                    <span>Escolha a configuração</span>
                                </div>
                                
                                {/* vCPU Tabs */}
                                <div className="flex gap-2 mb-4">
                                    {vcpuPlans.map((group) => (
                                        <Button
                                            key={group.vCpus}
                                            variant={selectedVCpus === group.vCpus ? "default" : "outline"}
                                            onClick={() => {
                                                setSelectedVCpus(group.vCpus);
                                                if (group.plans.length > 0) {
                                                    setSelectedVCpuPlan(group.plans[0].id);
                                                }
                                            }}
                                            className="flex-1"
                                        >
                                            {group.vCpus} vCPUs
                                            <span className="ml-1 text-xs opacity-70">({group.ramGB}GB)</span>
                                        </Button>
                                    ))}
                                </div>
                                
                                {/* Duration Cards */}
                                <div className="grid grid-cols-2 gap-3">
                                    {vcpuPlans
                                        .find(g => g.vCpus === selectedVCpus)
                                        ?.plans.map((plan) => (
                                            <Card
                                                key={plan.id}
                                                onClick={() => setSelectedVCpuPlan(plan.id)}
                                                className={`cursor-pointer p-4 border-2 transition-all hover:border-gray-600 ${
                                                    selectedVCpuPlan === plan.id
                                                        ? 'border-white bg-white/5'
                                                        : 'border-gray-800 bg-transparent'
                                                }`}
                                            >
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium">{plan.duration}</span>
                                                        {selectedVCpuPlan === plan.id && (
                                                            <Check className="w-5 h-5 text-white" />
                                                        )}
                                                    </div>
                                                    <span className="text-sm text-gray-400">{plan.days} {plan.days === 1 ? 'dia' : 'dias'}</span>
                                                    <span className="text-lg font-semibold">R$ {plan.price.toFixed(2)}</span>
                                                </div>
                                            </Card>
                                        ))}
                                </div>
                            </div>

                            {/* Disk Addon Selection - Cards */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Cloudy className="h-4 w-4" />
                                    <span>Tamanho do disco</span>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {diskAddons.map((addon) => (
                                        <Card
                                            key={addon.id}
                                            onClick={() => setSelectedDiskAddon(addon.id)}
                                            className={`cursor-pointer p-4 border-2 transition-all hover:border-gray-600 ${
                                                selectedDiskAddon === addon.id
                                                    ? 'border-white bg-white/5'
                                                    : 'border-gray-800 bg-transparent'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-medium">{addon.name}</span>
                                                    <span className="text-sm text-gray-400">{addon.sizeGB}GB de armazenamento</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-semibold">
                                                        {addon.price === 0 ? 'Incluído' : `+R$ ${addon.price.toFixed(2)}`}
                                                    </span>
                                                    {selectedDiskAddon === addon.id && (
                                                        <Check className="w-5 h-5 text-white" />
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="pt-4">
                                <p className="text-sm text-gray-500">
                                    Ao continuar, você concorda com nossos{' '}
                                    <Link href="/terms" className="text-gray-400 underline hover:text-gray-300 transition-colors">
                                        Termos de Serviço
                                    </Link>
                                    {' '}e{' '}
                                    <Link href="/privacy" className="text-gray-400 underline hover:text-gray-300 transition-colors">
                                        Política de Privacidade
                                    </Link>
                                    .
                                </p>
                            </div>
                        </div>

                        {/* Right Side - Summary Card */}
                        <div className="lg:sticky lg:top-24">
                            <Card className="border border-gray-800/80 bg-transparent backdrop-blur-sm p-8">
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-normal mb-2">Resumo do pedido</h2>
                                        <p className="text-sm text-gray-400">Confira os detalhes da sua compra</p>
                                    </div>

                                    <Separator className="bg-gray-800" />

                                    {/* Plan Details */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm text-gray-400">Configuração</p>
                                                <p className="text-lg font-medium mt-1">
                                                    {selectedVCpuPlanData ? `${selectedVCpuPlanData.vCpus} vCPUs - ${selectedVCpuPlanData.ramGB}GB RAM` : 'Nenhum'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-400">Duração</p>
                                                <p className="text-lg font-medium mt-1">{selectedVCpuPlanData?.duration || '-'}</p>
                                            </div>
                                        </div>

                                        <div className="bg-transparent rounded-lg p-4 space-y-2 border border-gray-800">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Plano ({selectedVCpuPlanData?.vCpus || 4} vCPUs)</span>
                                                <span className="text-white">R$ {planPrice.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Disco ({selectedDiskAddonData?.sizeGB || 256}GB)</span>
                                                <span className="text-white">
                                                    {diskPrice === 0 ? 'Incluído' : `+R$ ${diskPrice.toFixed(2)}`}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Taxas</span>
                                                <span className="text-white">R$ 0,00</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator className="bg-gray-800" />

                                    {/* Discord ID Section */}
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="discord-id" className="text-sm text-gray-300">
                                                ID do Discord
                                            </Label>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Necessário para receber o cargo de cliente após a assinatura
                                            </p>
                                        </div>
                                        
                                        <Input
                                            id="discord-id"
                                            type="text"
                                            placeholder="Ex: 123456789012345678"
                                            value={discordId}
                                            onChange={(e) => setDiscordId(e.target.value)}
                                            disabled={noDiscord}
                                            className="h-12 border-gray-700 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                        
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="no-discord"
                                                checked={noDiscord}
                                                onCheckedChange={(checked) => {
                                                    setNoDiscord(checked as boolean);
                                                    if (checked) setDiscordId("");
                                                }}
                                                className="border-gray-700"
                                            />
                                            <Label
                                                htmlFor="no-discord"
                                                className="text-sm text-gray-400 cursor-pointer"
                                            >
                                                Não tenho ID do Discord
                                            </Label>
                                        </div>
                                    </div>

                                    <Separator className="bg-gray-800" />

                                    {/* Total */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl text-gray-300">Total</span>
                                        <span className="text-3xl font-medium">R$ {selectedPrice.toFixed(2)}</span>
                                    </div>

                                    {/* Action Button */}
                                    <Button
                                        onClick={handleSubmit}
                                        className="w-full h-14 text-base"
                                        disabled={isLoading || isStockQuantity === 0 || !selectedPlanData || (!noDiscord && !discordId.trim())}
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center gap-2">
                                                <Cloudy className="w-5 h-5 animate-pulse" />
                                                Processando...
                                            </span>
                                        ) : isStockQuantity === 0 ? (
                                            "Esgotado"
                                        ) : (!noDiscord && !discordId.trim()) ? (
                                            "Preencha o ID do Discord"
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Check className="w-5 h-5" />
                                                Pagar com Pix
                                            </span>
                                        )}
                                    </Button>

                                    {/* Security Badge */}
                                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
                                        <Lock className="w-3 h-3" />
                                        <span>Pagamento seguro e criptografado</span>
                                    </div>
                                </div>
                            </Card>
                        </div>

                    </div>
                </div>
            </div>
        );
    };

    // --- Renderização Principal ---

    // Se a sessão estiver pendente, mostra um Skeleton
    if (isPending) {
        return (
            <div className="min-h-screen w-screen bg-[rgb(9,9,11)] text-white pt-32">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="grid lg:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <Skeleton className="h-12 w-3/4 bg-gray-800" />
                            <Skeleton className="h-6 w-full bg-gray-800" />
                            <Skeleton className="h-6 w-5/6 bg-gray-800" />
                            <Skeleton className="h-32 w-full bg-gray-800" />
                        </div>
                        <Card className="border border-gray-800/80 bg-transparent p-8">
                            <div className="space-y-6">
                                <Skeleton className="h-8 w-1/2 bg-gray-800" />
                                <Skeleton className="h-48 w-full bg-gray-800" />
                                <Skeleton className="h-12 w-full bg-gray-800" />
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    // Se não houver sessão, redireciona para o login (tratado no useEffect, mas como fallback)
    if (!session) {
        router.push("/auth");
        return null;
    }

    return (
        <>
            {renderErrorDialogs()}
            {showPayment ? renderPaymentScreen() : renderOrderScreen()}
        </>
    );
}
