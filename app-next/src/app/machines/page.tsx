'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader
} from "@/components/ui/card";
import {
    Check,
    ExternalLink,
    Cpu,
    MemoryStick,
    HardDrive,
    Microchip,
    Headphones,
    Cloud,
    Cloudy,
    Server,
    MonitorCheck,
    RefreshCw,
    Settings,
    ShieldCheck,
    AlertTriangle,
    Info,
    UserPlus,
    LogIn
} from "lucide-react";
import { Button } from "@/components/ui/button";

// styles
import "./styles.css";

export default function Machines() {
    const { data: session, isPending } = useSession();
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    return (
        <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[rgb(9,9,11)] text-white ">

            {/* Main Section */}
            <section className="relative px-11 mt-36 md:mt-48">

                {/* Centered Blue Glow Effect */}
                <div className="absolute inset-0 flex justify-center items-center z-0">
                    <div className="w-[200%] h-full bg-gradient-to-r bg-white/30 opacity-10 blur-3xl rounded-full" />
                </div>

                <div className="relative mx-auto max-w-5xl text-center">
                    <h1 className="mb-3 text-xl font-normal tracking-wide text-white sm:text-2xl md:text-3xl lg:text-4xl">
                        Encontre o plano ideal sem complicações!
                    </h1>
                    <p className="mx-auto mb-6 text-sm text-gray-400 sm:text-base">
                        Selecione o plano que melhor atende às suas necessidades e comece a desfrutar dos benefícios de imediato.
                    </p>

                    {/* CTA de criar conta / entrar — so aparece pra quem NAO esta logado */}
                    {mounted && !isPending && !session && (
                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
                            <Link href="/auth?tab=register">
                                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 h-11">
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

            {/* Plans Section */}
            <section className="relative px-4 pt-2">
                <div className="flex flex-col gap-6 max-w-6xl mx-auto p-2">

                    {/* Virtuais */}
                    <Card className="card-hover-effect relative border-emerald-500 bg-transparent text-white transition-all duration-300 hover:border-emerald-400 hover:brightness-110">
                        <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/3 p-6">
                                <CardHeader className="p-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Cloudy className="h-5 w-5" />
                                        <h2 className="text-lg">Máquinas Virtuais</h2>
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        Uma configuração excelente para rodar jogos que exigem performance.
                                    </p>
                                </CardHeader>
                            </div>
                            <div className="md:w-1/2 p-6 flex items-center">
                                <CardContent className="p-0 w-full">
                                    <ul className="grid gap-3">
                                        <li className="flex items-center gap-3">
                                            <Cpu className="flex-shrink-0 h-5 w-5 text-emerald-500" />
                                            <span className="text-sm">CPU: AMD EPYC (4 vCPUs) ou Intel Xeon (16 vCPUs)</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <MemoryStick className="flex-shrink-0 h-5 w-5 text-emerald-500" />
                                            <span className="text-sm">RAM: 28GB ou 22GB (DDR5)</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <HardDrive className="flex-shrink-0 h-5 w-5 text-emerald-500" />
                                            <span className="text-sm">Disco: 1x 256GB (SSD)</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <Microchip className="flex-shrink-0 h-5 w-5 text-emerald-500" />
                                            <span className="text-sm">GPU: NVIDIA Tesla T4 (16GB)</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <MonitorCheck className="flex-shrink-0 h-5 w-5 text-emerald-500" />
                                            <span className="text-sm">SO: Windows 10 Enterprise (BYOL)</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </div>
                            <div className="md:w-1/6 p-6 flex items-center justify-center">
                                <CardFooter className="p-0 w-full">
                                    <Link className="w-full" href="/order">
                                        <Button className="relative z-10 w-full h-11 bg-emerald-500 hover:bg-emerald-600">
                                            <span>Adquirir</span>
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </div>
                        </div>
                        {/* Observações - Virtuais */}
                        <div className="px-6 pb-6">
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="flex-shrink-0 h-4 w-4 text-yellow-400 mt-0.5" />
                                    <p className="text-xs text-yellow-200">
                                        <span className="font-semibold">Observações:</span> Não suporta os seguintes jogos e aplicações: Emuladores Android, Valorant, GTA 5 Online, Jogos com Encrypt, LoL, VirtualBox. Contém Spot.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

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