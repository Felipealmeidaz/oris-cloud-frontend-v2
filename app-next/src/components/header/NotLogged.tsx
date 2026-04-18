'use client';

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NotLoggedComponent() {
    const router = useRouter();

    return (
        <div className="pl-[12.5px]">
            <Button 
                variant="default" 
                className="text-base"
                onClick={() => router.push("/auth")}
            >
                Entrar
            </Button>
        </div>
    );
}
