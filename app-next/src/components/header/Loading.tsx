'use client';

import {
    Avatar,
    AvatarImage
} from "@/components/ui/avatar";

import {
    ChevronDown
} from "lucide-react";

// css
import "./styles/Loading.css";

export default function NotLoggedComponent() {
    return (
        <div className="flex items-center cursor-pointer rounded-lg transition-colors duration-250 hover:bg-[#131518d8] px-2.5 py-1.5">
            <Avatar className="h-10 w-10 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2f3342] to-transparent animate-loading"></div>
            </Avatar>
            <ChevronDown className="ml-2 text-white/20" />
        </div>
    );
};