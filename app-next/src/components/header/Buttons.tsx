'use client';

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu"

import Link from "next/link";
import Image from "next/image";

import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from 'react';

interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
}

interface Session {
    user: User;
}
import { ExternalLink, Cloud, Server } from "lucide-react";

// components
import LoggedComponent from "./Logged";
import NotLoggedComponent from "./NotLogged";
import LoadingComponent from "./Loading";

export default function ButtonsComponent() {
    const { data: session, isPending } = useSession();

    return (
        <div className="flex items-center space-x-4">
            <nav className="hidden md:flex items-center space-x-8">

                {/* Navegação */}
                <NavigationMenu>
                    <NavigationMenuList>

                        {/* Inicio */}
                        <NavigationMenuItem>
                            <Link href="/">
                                {/* @next-codemod-error This Link previously used the now removed `legacyBehavior` prop, and has a child that might not be an anchor. The codemod bailed out of lifting the child props to the Link. Check that the child component does not render an anchor, and potentially move the props manually to Link. */
                                }
                                <NavigationMenuLink className={`${navigationMenuTriggerStyle()} bg-transparent`}>
                                    Inicio
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>

                        {/* Máquinas */}
                        <NavigationMenuItem>
                            <NavigationMenuTrigger className="text-white bg-transparent hover:bg-zinc-800 focus:bg-zinc-800">
                                Máquinas
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <div className="grid grid-cols-2 gap-4 p-2 w-[600px] bg-[rgba(7,8,12,255)]">
                                    <Link href="/machines"
                                        className="group grid gap-1 hover:bg-[#15161cdd] p-2 rounded-lg transition-colors">
                                        <div className="flex items-center gap-2">
                                            <Cloud className="w-5 h-5" />
                                            <h3 className="font-medium">Máquinas Virtuais</h3>
                                        </div>
                                        <p className="text-sm text-zinc-400">
                                            Desempenho escalável e flexível para suas necessidades de computação em nuvem.
                                        </p>
                                    </Link>

                                    <Link href="/discord"
                                        className="group grid gap-1 hover:bg-[#15161cdd] p-2 rounded-lg transition-colors"
                                        target="_blank" rel="noopener noreferrer">
                                        <div className="flex items-center gap-2">
                                            <Server className="w-5 h-5" />
                                            <h3 className="font-medium">Máquinas Físicas</h3>
                                        </div>
                                        <p className="text-sm text-zinc-400">
                                            Desempenho dedicado e consistente com maior controle sobre o hardware.
                                        </p>
                                    </Link>
                                </div>
                            </NavigationMenuContent>
                        </NavigationMenuItem>

                        {/* Downloads */}
                        <NavigationMenuItem>
                            <NavigationMenuTrigger className="text-white bg-transparent hover:bg-zinc-800 focus:bg-zinc-800">
                                Downloads
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <div className="grid grid-cols-2 gap-4 p-2 w-[600px] bg-[rgba(7,8,12,255)]">
                                    <Link href="https://parsec.app/downloads"
                                        className="group grid gap-1 hover:bg-[#15161cdd] p-2 rounded-lg transition-colors"
                                        target="_blank" rel="noopener noreferrer">
                                        <div className="flex items-center gap-2">
                                            <Image
                                                src="/icons/Parsec.png"
                                                alt="Parsec Icon"
                                                className="w-5 h-5"
                                                width={100}
                                                height={100}
                                            />
                                            <h3 className="font-medium">Parsec</h3>
                                        </div>
                                        <p className="text-sm text-zinc-400">
                                            Ideal para jogos com baixa latência e excelente para trabalhos em desktop.
                                        </p>
                                    </Link>

                                    <Link href="https://github.com/moonlight-stream/moonlight-qt/releases/tag/v6.1.0"
                                        className="group grid gap-1 hover:bg-[#15161cdd] p-2 rounded-lg transition-colors"
                                        target="_blank" rel="noopener noreferrer">
                                        <div className="flex items-center gap-2">
                                            <Image
                                                src="/icons/Moonlight.png"
                                                alt="Moonlight Icon"
                                                className="w-5 h-5"
                                                width={100}
                                                height={100}
                                            />
                                            <h3 className="font-medium">Moonlight</h3>
                                        </div>
                                        <p className="text-sm text-zinc-400">
                                            Feito para jogos e trabalhos em desktop, com baixa latência e zero delay nas gameplays.
                                        </p>
                                    </Link>
                                </div>
                            </NavigationMenuContent>
                        </NavigationMenuItem>

                        {/* Discord */}
                        <NavigationMenuItem>
                            <Link href="/discord">
                                {/* @next-codemod-error This Link previously used the now removed `legacyBehavior` prop, and has a child that might not be an anchor. The codemod bailed out of lifting the child props to the Link. Check that the child component does not render an anchor, and potentially move the props manually to Link. */
                                }
                                <NavigationMenuLink className={`${navigationMenuTriggerStyle()} bg-transparent flex items-center gap-2`}
                                    target="_blank" rel="noopener noreferrer">
                                    Discord
                                    <ExternalLink className="h-4 w-4" />
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>

                    </NavigationMenuList>
                </NavigationMenu>

            </nav>
            {!isPending ? session ? <LoggedComponent user={session.user as User} /> : <NotLoggedComponent /> : <LoadingComponent />}
        </div>
    );
};