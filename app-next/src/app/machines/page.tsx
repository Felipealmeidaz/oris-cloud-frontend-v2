'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

import {
    Cpu,
    MemoryStick,
    HardDrive,
    Microchip,
    Headphones,
    Cloud,
    MonitorCheck,
    RefreshCw,
    Settings,
    ShieldCheck,
    AlertTriangle,
    UserPlus,
    LogIn,
    Check,
    Sparkles,
    Loader2,
    Zap,
    Rocket,
    Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// styles
import "./styles.css";

/**
 * /machines — lista todos os tiers de máquinas virtuais disponíveis.
 *
 * Busca dinamicamente os planos ativos em /api/vcpu-plans (dados do Prisma),
 * agrupa por quantidade de vCPUs, e renderiza um card por tier com os
 * preços das durações (diário, semanal, mensal).
 *
 * Antes estava hardcoded com 1 card cobrindo "4 ou 16 vCPUs", o que escondia
 * o tier Pro (8 vCPUs) e não mostrava preços reais do banco.
 */

interface VCpuPlan {
    id: string;
    name: string;
    vCpus: number;
    ramGB: number;
    duration: string;
    days: number;
    price: number;
    active: boolean;
}

interface GroupedPlan {
    vCpus: number;
    ramGB: number;
    plans: VCpuPlan[];
}

interface TierConfig {
    label: string;
    tagline: string;
    icon: typeof Zap;
    accentClass: string;
    borderClass: string;
    badgeClass: string;
    popular?: boolean;
}

/**
 * Mapeia quantidade de vCPUs pra configuração visual/copy do tier.
 * Se o banco adicionar um tier novo (ex: 24 vCPUs), cai no fallback genérico.
 */
const TIER_CONFIGS: Record<number, TierConfig> = {
    4: {
        label: "Básico",
        tagline: "Ideal pra jogos casuais e acesso remoto básico.",
        icon: Zap,
        accentClass: "text-emerald-400",
        borderClass: "border-gray-800 hover:border-emerald-500/50",
        badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    8: {
        label: "Pro",
        tagline: "Performance balanceada pra jogos AAA em 1080p/1440p.",
        icon: Rocket,
        accentClass: "text-emerald-300",
        borderClass: "border-emerald-500/60 hover:border-emerald-400",
        badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
        popular: true,
    },
    16: {
        label: "Ultra",
        tagline: "Máximo poder pra streaming, edição e 4K.",
        icon: Crown,
        accentClass: "text-amber-400",
        borderClass: "border-gray-800 hover:border-amber-500/50",
        badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
};

function getTierConfig(vCpus: number): TierConfig {
    return (
        TIER_CONFIGS[vCpus] ?? {
            label: `${vCpus} vCPUs`,
            tagline: "Configuração customizada.",
            icon: Cloud,
            accentClass: "text-white",
            borderClass: "border-gray-800 hover:border-white/30",
            badgeClass: "bg-white/10 text-white border-white/20",
        }
    );
}

/**
 * Formata dias pra label curta ("1d", "7d", "30d").
 * Se for 30, mostra "1 mês" pra ficar mais humano.
 */
function formatDuration(days: number): string {
    if (days === 1) return "Diário";
    if (days === 7) return "Semanal";
    if (days === 15) return "Quinzenal";
    if (days === 30) return "Mensal";
    if (days === 90) return "Trimestral";
    return `${days}d`;
}

function formatPrice(price: number): string {
    return price.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: price % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    });
}

function TierCard({ group }: { group: GroupedPlan }) {
    const config = getTierConfig(group.vCpus);
    const Icon = config.icon;
    const cheapest = group.plans.reduce((min, p) =>
        p.price / p.days < min.price / min.days ? p : min
    );
    const pricePerDay = cheapest.price / cheapest.days;

    return (
        <div
            className={`relative flex flex-col rounded-2xl border bg-gradient-to-b from-white/[0.02] to-transparent p-6 transition ${config.borderClass}`}
        >
            {/* Badge "Mais popular" pro Pro */}
            {config.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-black shadow-lg shadow-emerald-500/30">
                        <Sparkles className="h-3 w-3" />
                        Mais popular
                    </div>
                </div>
            )}

            {/* Header do tier */}
            <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Icon className={`h-4 w-4 ${config.accentClass}`} />
                        <h3 className="text-xl font-semibold text-white">
                            {config.label}
                        </h3>
                    </div>
                    <p className="text-sm text-gray-400">{config.tagline}</p>
                </div>
                <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-mono font-medium ${config.badgeClass}`}
                >
                    {group.vCpus} vCPUs
                </span>
            </div>

            {/* Preço a partir de */}
            <div className="mb-5 pb-5 border-b border-white/5">
                <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-gray-500">a partir de</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold text-white">
                        {formatPrice(pricePerDay)}
                    </span>
                    <span className="text-sm text-gray-400">/dia</span>
                </div>
            </div>

            {/* Specs */}
            <ul className="mb-6 space-y-2.5 text-sm">
                <li className="flex items-center gap-2.5 text-gray-300">
                    <Cpu className={`h-4 w-4 shrink-0 ${config.accentClass}`} />
                    <span>
                        <span className="font-medium text-white">
                            {group.vCpus} vCPUs
                        </span>{" "}
                        {group.vCpus <= 4 ? "AMD EPYC" : "Intel Xeon"}
                    </span>
                </li>
                <li className="flex items-center gap-2.5 text-gray-300">
                    <MemoryStick className={`h-4 w-4 shrink-0 ${config.accentClass}`} />
                    <span>
                        <span className="font-medium text-white">{group.ramGB}GB</span>{" "}
                        RAM DDR5
                    </span>
                </li>
                <li className="flex items-center gap-2.5 text-gray-300">
                    <Microchip className={`h-4 w-4 shrink-0 ${config.accentClass}`} />
                    <span>
                        <span className="font-medium text-white">NVIDIA Tesla T4</span>{" "}
                        (16GB)
                    </span>
                </li>
                <li className="flex items-center gap-2.5 text-gray-300">
                    <HardDrive className={`h-4 w-4 shrink-0 ${config.accentClass}`} />
                    <span>
                        <span className="font-medium text-white">256GB SSD</span>{" "}
                        NVMe
                    </span>
                </li>
                <li className="flex items-center gap-2.5 text-gray-300">
                    <MonitorCheck className={`h-4 w-4 shrink-0 ${config.accentClass}`} />
                    <span>Windows 10 Enterprise (BYOL)</span>
                </li>
            </ul>

            {/* Opções de duração */}
            <div className="mb-6 space-y-1.5">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Opções de duração
                </p>
                {group.plans
                    .slice()
                    .sort((a, b) => a.days - b.days)
                    .map((plan) => (
                        <div
                            key={plan.id}
                            className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-sm"
                        >
                            <span className="text-gray-300">
                                {formatDuration(plan.days)}
                            </span>
                            <span className="font-mono font-medium text-white">
                                {formatPrice(plan.price)}
                            </span>
                        </div>
                    ))}
            </div>

            {/* CTA */}
            <Link
                href={`/order?plan=${encodeURIComponent(cheapest.id)}`}
                className="mt-auto"
            >
                <Button
                    className={`w-full h-11 font-semibold ${
                        config.popular
                            ? "bg-emerald-500 hover:bg-emerald-400 text-black"
                            : "bg-white/10 hover:bg-white/15 text-white border border-white/10"
                    }`}
                >
                    Adquirir {config.label}
                </Button>
            </Link>
        </div>
    );
}

export default function Machines() {
    const { data: session, isPending } = useSession();
    const [mounted, setMounted] = useState(false);
    const [groups, setGroups] = useState<GroupedPlan[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/vcpu-plans");
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (cancelled) return;
                const sorted = (data.groupedPlans as GroupedPlan[]).sort(
                    (a, b) => a.vCpus - b.vCpus
                );
                setGroups(sorted);
            } catch (e: unknown) {
                if (cancelled) return;
                const msg = e instanceof Error ? e.message : "erro desconhecido";
                setError(msg);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="min-h-screen w-screen flex flex-col items-center bg-[rgb(9,9,11)] text-white ">

            {/* Hero */}
            <section className="relative w-full px-6 md:px-11 mt-36 md:mt-44 pb-6">
                <div className="absolute inset-0 flex justify-center items-center z-0 pointer-events-none">
                    <div className="w-[200%] h-full bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-emerald-500/10 opacity-40 blur-3xl rounded-full" />
                </div>

                <div className="relative mx-auto max-w-5xl text-center">
                    <div className="inline-flex items-center gap-2 mb-5 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/[0.03] text-xs font-medium text-white/80">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                        3 configurações, mesma GPU Tesla T4
                    </div>
                    <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
                        Escolha a máquina ideal
                    </h1>
                    <p className="mx-auto max-w-2xl text-base text-gray-400 sm:text-lg">
                        Todos os planos rodam em AWS São Paulo com NVIDIA Tesla T4 e
                        SSD NVMe. A diferença está no poder de CPU e RAM conforme seu
                        uso.
                    </p>

                    {/* CTA de criar conta — só pra quem NÃO está logado */}
                    {mounted && !isPending && !session && (
                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-8">
                            <Link href="/auth?tab=register">
                                <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 h-11">
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Criar conta grátis
                                </Button>
                            </Link>
                            <Link href="/auth?tab=login">
                                <Button variant="outline" className="border-gray-700 hover:bg-white/5 px-6 h-11">
                                    <LogIn className="h-4 w-4 mr-2" />
                                    Já tenho conta
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Plans Section — 3 cards dinâmicos */}
            <section className="relative w-full px-4 md:px-8 pt-8 pb-8">
                <div className="mx-auto max-w-6xl">
                    {/* Estados de loading / erro */}
                    {!groups && !error && (
                        <div className="flex items-center justify-center py-20 text-gray-500">
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Carregando planos...
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center gap-3 mx-auto max-w-lg rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300">
                            <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
                            <div>
                                <p className="font-semibold">Não foi possível carregar os planos</p>
                                <p className="text-xs text-red-400/80 mt-1">
                                    {error} · tenta recarregar a página em instantes
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Cards dos tiers */}
                    {groups && groups.length > 0 && (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {groups.map((group) => (
                                <TierCard key={group.vCpus} group={group} />
                            ))}
                        </div>
                    )}

                    {/* Observações gerais */}
                    {groups && groups.length > 0 && (
                        <div className="mx-auto mt-8 max-w-4xl rounded-xl border border-yellow-500/30 bg-yellow-500/[0.04] p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-400 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-yellow-200">
                                        Jogos e aplicações não suportados
                                    </p>
                                    <p className="text-xs text-yellow-200/80 leading-relaxed">
                                        Devido a anti-cheats de kernel, não rodam em nenhum
                                        tier:{" "}
                                        <span className="font-medium">
                                            Valorant, GTA 5 Online, League of Legends,
                                            Emuladores Android e VirtualBox
                                        </span>
                                        . Máquinas podem usar instâncias Spot — em casos
                                        raros de preempção, o plano é estendido
                                        automaticamente.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Presentation Section */}
            <section className="flex-grow relative px-7 pt-12 pb-16">
                <div className="max-w-6xl mx-auto">
                    <div className="text-left mb-16">
                        <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-4">
                            <div className="flex items-center gap-2">
                                <MonitorCheck className="h-5 w-5" />
                                <span>Principais Funcionalidades</span>
                            </div>
                        </h2>
                        <h3 className="text-4xl font-normal mb-4">
                            Conheça as vantagens das nossas máquinas
                        </h3>
                        <p className="text-gray-400 mx-auto">
                            A Oris oferece máquinas virtuais dedicadas em AWS EC2 com GPU NVIDIA Tesla T4 para elevar sua experiência de jogo. Confira abaixo as principais vantagens.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="flex flex-col items-start gap-4">
                            <div className="p-2 rounded-lg bg-gray-900">
                                <Cpu className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-normal">Desempenho Superior</h4>
                            <p className="text-gray-400">
                                Nossas máquinas são equipadas com hardware de última geração para garantir o máximo desempenho em seus jogos.
                            </p>
                        </div>

                        <div className="flex flex-col items-start gap-4">
                            <div className="p-2 rounded-lg bg-gray-900">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-normal">Segurança Avançada</h4>
                            <p className="text-gray-400">
                                Proteja seus dados e jogos com nossas soluções de segurança de ponta.
                            </p>
                        </div>

                        <div className="flex flex-col items-start gap-4">
                            <div className="p-2 rounded-lg bg-gray-900">
                                <Settings className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-normal">Personalização Completa</h4>
                            <p className="text-gray-400">
                                Adapte nossas máquinas às suas necessidades específicas para uma experiência de jogo personalizada.
                            </p>
                        </div>

                        <div className="flex flex-col items-start gap-4">
                            <div className="p-2 rounded-lg bg-gray-900">
                                <Cloud className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-normal">Acesso Remoto</h4>
                            <p className="text-gray-400">
                                Jogue de qualquer lugar com nossas máquinas virtuais acessíveis via cloud.
                            </p>
                        </div>

                        <div className="flex flex-col items-start gap-4">
                            <div className="p-2 rounded-lg bg-gray-900">
                                <RefreshCw className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-normal">Atualizações Constantes</h4>
                            <p className="text-gray-400">
                                Mantenha-se atualizado com as últimas tecnologias e melhorias de desempenho.
                            </p>
                        </div>

                        <div className="flex flex-col items-start gap-4">
                            <div className="p-2 rounded-lg bg-gray-900">
                                <Headphones className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-normal">Suporte 24/7</h4>
                            <p className="text-gray-400">
                                Conte com nossa equipe de suporte especializada disponível 24 horas por dia, 7 dias por semana.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};