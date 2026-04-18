'use client';

import { signOut } from "@/lib/auth-client";
import { useState, useEffect } from "react";

interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
}

import {
    Settings,
    LogOut,
    ChevronDown,
    User
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export default function LoggedComponent({ user }: { user: User }) {
    const { id, name, email, image } = user || {};
    const { toast } = useToast();

    return (
        <>
            {/* Dropdown Menu */}
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 rounded-xl transition-all duration-200 hover:bg-white/5 active:scale-95 px-3 py-2 group">
                        {image ? (
                            <Avatar className="h-9 w-9 ring-2 ring-white/10 transition-all duration-200 group-hover:ring-white/20">
                                <AvatarImage src={image} alt="Avatar" />
                            </Avatar>
                        ) : (
                            <div className="h-9 w-9 ring-2 ring-white/10 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center transition-all duration-200 group-hover:ring-white/20">
                                <User className="h-4 w-4 text-gray-400" />
                            </div>
                        )}
                        <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent 
                    align="end" 
                    className="w-72 p-2 bg-[#0a0b0f] border border-white/10 shadow-2xl backdrop-blur-xl"
                    sideOffset={8}
                >
                    <DropdownMenuLabel className="font-normal text-xs text-gray-400 px-2 py-1.5">
                        Minha Conta
                    </DropdownMenuLabel>
                    
                    <DropdownMenuSeparator className="bg-white/5 my-2" />
                    
                    {/* User Info Card */}
                    <div className="p-3 mb-2 rounded-lg bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-3">
                            {image ? (
                                <Avatar className="h-12 w-12 ring-2 ring-white/10">
                                    <AvatarImage src={image} alt="Avatar" />
                                </Avatar>
                            ) : (
                                <div className="h-12 w-12 ring-2 ring-white/10 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{name}</p>
                                <p className="text-xs text-gray-400 truncate mt-0.5">{email}</p>
                            </div>
                        </div>
                    </div>
                    
                    <DropdownMenuSeparator className="bg-white/5 my-2" />
                    
                    <DropdownMenuGroup className="space-y-1">
                        {/* Dashboard */}
                        <DropdownMenuItem asChild className="cursor-pointer rounded-lg focus:bg-white/10 transition-colors">
                            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5">
                                <Settings className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-200">Painel de Controle</span>
                            </Link>
                        </DropdownMenuItem>

                        {/* Logout */}
                        <DropdownMenuItem 
                            className="cursor-pointer rounded-lg focus:bg-red-500/10 transition-colors px-3 py-2.5"
                            onClick={async () => {
                                localStorage.removeItem('session');
                                await signOut();
                                window.location.href = '/';
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <LogOut className="h-4 w-4 text-red-400" />
                                <span className="text-sm text-red-400">Fazer Logout</span>
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}