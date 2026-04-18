'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { OrisLogo } from "@/components/ui/oris-logo";

// Resizable Navbar Components
import {
    Navbar,
    NavBody,
    NavItems,
    MobileNav,
    MobileNavHeader,
    MobileNavMenu,
    MobileNavToggle,
} from "@/components/ui/resizable-navbar";

// Navigation Menu
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";

import { ExternalLink, Cloud, Server } from "lucide-react";

// Header Components
import LoggedComponent from "./Logged";
import NotLoggedComponent from "./NotLogged";
import LoadingComponent from "./Loading";

interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
}

export default function Header() {
    const { data: session, isPending } = useSession();
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Hydration gate: evita React #418 (mismatch SSR/CSR) e /undefined 404
    // SSR nao tem session, entao sempre renderiza Loading ate o client montar
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    const showLoading = !mounted || isPending;

    const navItems = [
        { name: "Inicio", link: "/" },
        { name: "Máquinas", link: "/machines" },
        { name: "Discord", link: "/discord" },
    ];

    return (
        <Navbar className="fixed top-0">
            {/* Desktop Navigation */}
            <NavBody className="hidden lg:flex">
                {/* Logo */}
                <Link
                    href="/"
                    className="relative z-20 flex items-center hover:opacity-80 transition-opacity text-white"
                >
                    <OrisLogo size={32} withWordmark />
                </Link>

                {/* Navigation Items */}
                <div className="flex items-center space-x-4">
                    <NavigationMenu>
                        <NavigationMenuList>
                            {/* Inicio */}
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link href="/" className={`${navigationMenuTriggerStyle()} bg-transparent`}>
                                        Inicio
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                            {/* Máquinas - link direto (não temos mais 'Máquinas Físicas') */}
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link href="/machines" className={`${navigationMenuTriggerStyle()} bg-transparent`}>
                                        Máquinas
                                    </Link>
                                </NavigationMenuLink>
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
                                <NavigationMenuLink asChild>
                                    <Link
                                        href="/discord"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`${navigationMenuTriggerStyle()} bg-transparent flex items-center gap-2`}
                                    >
                                        Discord
                                        <ExternalLink className="h-4 w-4" />
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                {/* User Section */}
                <div className="relative z-20">
                    {showLoading ? <LoadingComponent /> : session ? <LoggedComponent user={session.user as User} /> : <NotLoggedComponent />}
                </div>
            </NavBody>

            {/* Mobile Navigation */}
            <MobileNav className="lg:hidden">
                <MobileNavHeader>
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center hover:opacity-80 transition-opacity text-white"
                    >
                        <OrisLogo size={28} withWordmark />
                    </Link>

                    {/* Right Side: User + Menu Toggle */}
                    <div className="flex items-center gap-2">
                        {showLoading ? <LoadingComponent /> : session ? <LoggedComponent user={session.user as User} /> : <NotLoggedComponent />}
                        <MobileNavToggle
                            isOpen={isMobileMenuOpen}
                            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                        />
                    </div>
                </MobileNavHeader>

                {/* Mobile Menu */}
                <MobileNavMenu
                    isOpen={isMobileMenuOpen}
                    onClose={() => setMobileMenuOpen(false)}
                >
                    <Link
                        href="/"
                        className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Inicio
                    </Link>
                    <Link
                        href="/machines"
                        className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Máquinas Virtuais
                    </Link>
                    <Link
                        href="/discord"
                        className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100"
                        onClick={() => setMobileMenuOpen(false)}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Discord
                    </Link>
                    <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
                        <p className="text-sm text-neutral-500 mb-2">Downloads</p>
                        <Link
                            href="https://parsec.app/downloads"
                            className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 flex items-center gap-2"
                            onClick={() => setMobileMenuOpen(false)}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Image
                                src="/icons/Parsec.png"
                                alt="Parsec Icon"
                                className="w-4 h-4"
                                width={16}
                                height={16}
                            />
                            Parsec
                        </Link>
                        <Link
                            href="https://github.com/moonlight-stream/moonlight-qt/releases/tag/v6.1.0"
                            className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 flex items-center gap-2 mt-2"
                            onClick={() => setMobileMenuOpen(false)}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Image
                                src="/icons/Moonlight.png"
                                alt="Moonlight Icon"
                                className="w-4 h-4"
                                width={16}
                                height={16}
                            />
                            Moonlight
                        </Link>
                    </div>
                </MobileNavMenu>
            </MobileNav>
        </Navbar>
    );
}
