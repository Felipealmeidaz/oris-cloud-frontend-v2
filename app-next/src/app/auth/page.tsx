'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, User, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function AuthPage() {
    const router = useRouter();
    const { toast } = useToast();
    
    const [isLoading, setIsLoading] = useState(false);
    
    // Login state
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    
    // Register state
    const [registerUsername, setRegisterUsername] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
    
    // Verification state
    const [showVerification, setShowVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [pendingEmail, setPendingEmail] = useState("");
    const [pendingUsername, setPendingUsername] = useState("");
    const [pendingPassword, setPendingPassword] = useState("");
    
    // Forgot password state
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'code' | 'newPassword'>('email');
    const [forgotEmail, setForgotEmail] = useState("");
    const [resetCode, setResetCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await signIn.email({
                email: loginEmail,
                password: loginPassword,
            });
            
            if (result.error) {
                toast({
                    title: "Erro no login",
                    description: result.error.message || "Email ou senha incorretos.",
                    color: "danger",
                });
                setIsLoading(false);
                return;
            }
            
            toast({
                title: "Login realizado",
                description: "Bem-vindo de volta!",
            });
            
            router.push("/");
        } catch (error: any) {
            toast({
                title: "Erro no login",
                description: error?.message || "Email ou senha incorretos.",
                color: "danger",
            });
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (registerPassword !== registerConfirmPassword) {
            toast({
                title: "Erro no registro",
                description: "As senhas não coincidem.",
                color: "danger",
            });
            return;
        }

        if (registerPassword.length < 6) {
            toast({
                title: "Erro no registro",
                description: "A senha deve ter pelo menos 6 caracteres.",
                color: "danger",
            });
            return;
        }

        setIsLoading(true);

        try {
            // Enviar código de verificação
            const response = await fetch("/api/email/send-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: registerEmail }),
            });

            if (!response.ok) {
                throw new Error("Erro ao enviar código de verificação");
            }

            // Salvar dados temporariamente
            setPendingEmail(registerEmail);
            setPendingUsername(registerUsername);
            setPendingPassword(registerPassword);
            
            // Mostrar tela de verificação
            setShowVerification(true);
            setIsLoading(false);
            
            toast({
                title: "Código enviado",
                description: "Verifique seu email para o código de verificação.",
            });
        } catch (error: any) {
            toast({
                title: "Erro no registro",
                description: error?.message || "Não foi possível enviar o código de verificação.",
                color: "danger",
            });
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Verificar código
            const verifyResponse = await fetch("/api/email/verify-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email: pendingEmail, 
                    code: verificationCode 
                }),
            });

            if (!verifyResponse.ok) {
                const data = await verifyResponse.json();
                throw new Error(data.error || "Código inválido");
            }

            // Criar conta
            const result = await signUp.email({
                email: pendingEmail,
                password: pendingPassword,
                name: pendingUsername,
            });
            
            if (result.error) {
                toast({
                    title: "Erro no registro",
                    description: result.error.message || "Não foi possível criar sua conta.",
                    color: "danger",
                });
                setIsLoading(false);
                return;
            }

            // Marcar email como verificado
            await fetch("/api/email/mark-verified", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: pendingEmail }),
            });
            
            toast({
                title: "Conta criada",
                description: "Sua conta foi criada e verificada com sucesso!",
            });
            
            router.push("/");
        } catch (error: any) {
            toast({
                title: "Erro na verificação",
                description: error?.message || "Código inválido ou expirado.",
                color: "danger",
            });
            setIsLoading(false);
        }
    };

    const handleForgotPasswordEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch("/api/password/send-reset-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: forgotEmail }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Erro ao enviar código");
            }

            setForgotPasswordStep('code');
            setIsLoading(false);
            
            toast({
                title: "Código enviado",
                description: "Verifique seu email para o código de redefinição.",
            });
        } catch (error: any) {
            toast({
                title: "Erro",
                description: error?.message || "Não foi possível enviar o código.",
                color: "danger",
            });
            setIsLoading(false);
        }
    };

    const handleVerifyResetCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch("/api/password/verify-reset-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: forgotEmail, code: resetCode }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Código inválido");
            }

            setForgotPasswordStep('newPassword');
            setIsLoading(false);
            
            toast({
                title: "Código verificado",
                description: "Agora você pode definir uma nova senha.",
            });
        } catch (error: any) {
            toast({
                title: "Erro",
                description: error?.message || "Código inválido ou expirado.",
                color: "danger",
            });
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmNewPassword) {
            toast({
                title: "Erro",
                description: "As senhas não coincidem.",
                color: "danger",
            });
            return;
        }

        if (newPassword.length < 6) {
            toast({
                title: "Erro",
                description: "A senha deve ter pelo menos 6 caracteres.",
                color: "danger",
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/password/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email: forgotEmail, 
                    code: resetCode, 
                    newPassword 
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Erro ao redefinir senha");
            }

            toast({
                title: "Senha redefinida",
                description: "Sua senha foi alterada com sucesso!",
            });

            // Resetar estados
            setShowForgotPassword(false);
            setForgotPasswordStep('email');
            setForgotEmail("");
            setResetCode("");
            setNewPassword("");
            setConfirmNewPassword("");
            setIsLoading(false);
        } catch (error: any) {
            toast({
                title: "Erro",
                description: error?.message || "Não foi possível redefinir a senha.",
                color: "danger",
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-[rgb(9,9,11)] text-white p-4">
            <div className="w-full max-w-md">
                {!showForgotPassword ? (
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-[#11131b]">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="register">Registrar</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="login">
                            <Card className="bg-transparent border-gray-800">
                                <CardHeader>
                                    <CardTitle className="text-2xl font-normal">Bem-vindo de volta</CardTitle>
                                    <CardDescription>
                                        Entre com suas credenciais para acessar sua conta
                                    </CardDescription>
                                </CardHeader>
                                <form onSubmit={handleLogin}>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="login-email">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="login-email"
                                                    type="email"
                                                    placeholder="seu@email.com"
                                                    value={loginEmail}
                                                    onChange={(e) => setLoginEmail(e.target.value)}
                                                    required
                                                    disabled={isLoading}
                                                    className="pl-10 bg-[#0d0e15] border-gray-700"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="login-password">Senha</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="login-password"
                                                    type={showLoginPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    value={loginPassword}
                                                    onChange={(e) => setLoginPassword(e.target.value)}
                                                    required
                                                    disabled={isLoading}
                                                    className="pl-10 pr-10 bg-[#0d0e15] border-gray-700"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                                                    disabled={isLoading}
                                                >
                                                    {showLoginPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <button
                                                type="button"
                                                onClick={() => setShowForgotPassword(true)}
                                                className="text-sm text-gray-400 hover:text-white transition-colors"
                                                disabled={isLoading}
                                            >
                                                Esqueceu a senha?
                                            </button>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button 
                                            type="submit" 
                                            disabled={isLoading} 
                                            className="w-full"
                                        >
                                            {isLoading ? "Entrando..." : "Entrar"}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </TabsContent>
                    
                    <TabsContent value="register">
                        {!showVerification ? (
                            <Card className="bg-transparent border-gray-800">
                                <CardHeader>
                                    <CardTitle className="text-2xl font-normal">Criar conta</CardTitle>
                                    <CardDescription>
                                        Preencha os dados abaixo para criar sua conta
                                    </CardDescription>
                                </CardHeader>
                                <form onSubmit={handleRegister}>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="register-username">Nome de Usuário</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="register-username"
                                                    type="text"
                                                    placeholder="seu_usuario"
                                                    value={registerUsername}
                                                    onChange={(e) => setRegisterUsername(e.target.value)}
                                                    required
                                                    disabled={isLoading}
                                                    className="pl-10 bg-[#0d0e15] border-gray-700"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="register-email">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="register-email"
                                                    type="email"
                                                    placeholder="seu@email.com"
                                                    value={registerEmail}
                                                    onChange={(e) => setRegisterEmail(e.target.value)}
                                                    required
                                                    disabled={isLoading}
                                                    className="pl-10 bg-[#0d0e15] border-gray-700"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="register-password">Senha</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="register-password"
                                                    type={showRegisterPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    value={registerPassword}
                                                    onChange={(e) => setRegisterPassword(e.target.value)}
                                                    required
                                                    disabled={isLoading}
                                                    className="pl-10 pr-10 bg-[#0d0e15] border-gray-700"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                                                    disabled={isLoading}
                                                >
                                                    {showRegisterPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="register-confirm-password">Confirmar Senha</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="register-confirm-password"
                                                    type={showRegisterConfirmPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    value={registerConfirmPassword}
                                                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                                                    required
                                                    disabled={isLoading}
                                                    className="pl-10 pr-10 bg-[#0d0e15] border-gray-700"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                                                    disabled={isLoading}
                                                >
                                                    {showRegisterConfirmPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button 
                                            type="submit" 
                                            disabled={isLoading} 
                                            className="w-full"
                                        >
                                            {isLoading ? "Enviando código..." : "Criar conta"}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        ) : (
                            <Card className="bg-transparent border-gray-800">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setShowVerification(false);
                                                setVerificationCode("");
                                            }}
                                            className="text-gray-400 hover:text-gray-300"
                                            disabled={isLoading}
                                        >
                                            <ArrowLeft className="h-5 w-5" />
                                        </button>
                                        <div>
                                            <CardTitle className="text-2xl font-normal">Verificar Email</CardTitle>
                                        </div>
                                    </div>
                                    <CardDescription>
                                        Digite o código de 6 dígitos enviado para {pendingEmail}
                                    </CardDescription>
                                </CardHeader>
                                <form onSubmit={handleVerifyCode}>
                                    <CardContent className="space-y-6">
                                        <div className="flex justify-center">
                                            <InputOTP
                                                maxLength={6}
                                                value={verificationCode}
                                                onChange={(value) => setVerificationCode(value)}
                                                disabled={isLoading}
                                            >
                                                <InputOTPGroup>
                                                    <InputOTPSlot index={0} className="bg-[#0d0e15] border-gray-700" />
                                                    <InputOTPSlot index={1} className="bg-[#0d0e15] border-gray-700" />
                                                    <InputOTPSlot index={2} className="bg-[#0d0e15] border-gray-700" />
                                                    <InputOTPSlot index={3} className="bg-[#0d0e15] border-gray-700" />
                                                    <InputOTPSlot index={4} className="bg-[#0d0e15] border-gray-700" />
                                                    <InputOTPSlot index={5} className="bg-[#0d0e15] border-gray-700" />
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </div>
                                        <div className="text-center text-sm text-gray-400">
                                            <p>Não recebeu o código?</p>
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    try {
                                                        await fetch("/api/email/send-verification", {
                                                            method: "POST",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify({ email: pendingEmail }),
                                                        });
                                                        toast({
                                                            title: "Código reenviado",
                                                            description: "Um novo código foi enviado para seu email.",
                                                        });
                                                    } catch (error) {
                                                        toast({
                                                            title: "Erro",
                                                            description: "Não foi possível reenviar o código.",
                                                            color: "danger",
                                                        });
                                                    }
                                                }}
                                                className="text-white hover:underline"
                                                disabled={isLoading}
                                            >
                                                Reenviar código
                                            </button>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button 
                                            type="submit" 
                                            disabled={isLoading || verificationCode.length !== 6} 
                                            className="w-full"
                                        >
                                            {isLoading ? "Verificando..." : "Verificar e Criar Conta"}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
                ) : (
                    <Card className="bg-transparent border-gray-800">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setShowForgotPassword(false);
                                        setForgotPasswordStep('email');
                                        setForgotEmail("");
                                        setResetCode("");
                                        setNewPassword("");
                                        setConfirmNewPassword("");
                                    }}
                                    className="text-gray-400 hover:text-gray-300"
                                    disabled={isLoading}
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </button>
                                <div>
                                    <CardTitle className="text-2xl font-normal">
                                        {forgotPasswordStep === 'email' && 'Recuperar Senha'}
                                        {forgotPasswordStep === 'code' && 'Verificar Código'}
                                        {forgotPasswordStep === 'newPassword' && 'Nova Senha'}
                                    </CardTitle>
                                </div>
                            </div>
                            <CardDescription>
                                {forgotPasswordStep === 'email' && 'Digite seu email para receber o código de redefinição'}
                                {forgotPasswordStep === 'code' && `Digite o código enviado para ${forgotEmail}`}
                                {forgotPasswordStep === 'newPassword' && 'Digite sua nova senha'}
                            </CardDescription>
                        </CardHeader>

                        {forgotPasswordStep === 'email' && (
                            <form onSubmit={handleForgotPasswordEmail}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="forgot-email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="forgot-email"
                                                type="email"
                                                placeholder="seu@email.com"
                                                value={forgotEmail}
                                                onChange={(e) => setForgotEmail(e.target.value)}
                                                required
                                                disabled={isLoading}
                                                className="pl-10 bg-[#0d0e15] border-gray-700"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button 
                                        type="submit" 
                                        disabled={isLoading} 
                                        className="w-full"
                                    >
                                        {isLoading ? "Enviando..." : "Enviar Código"}
                                    </Button>
                                </CardFooter>
                            </form>
                        )}

                        {forgotPasswordStep === 'code' && (
                            <form onSubmit={handleVerifyResetCode}>
                                <CardContent className="space-y-6">
                                    <div className="flex justify-center">
                                        <InputOTP
                                            maxLength={6}
                                            value={resetCode}
                                            onChange={(value) => setResetCode(value)}
                                            disabled={isLoading}
                                        >
                                            <InputOTPGroup>
                                                <InputOTPSlot index={0} className="bg-[#0d0e15] border-gray-700" />
                                                <InputOTPSlot index={1} className="bg-[#0d0e15] border-gray-700" />
                                                <InputOTPSlot index={2} className="bg-[#0d0e15] border-gray-700" />
                                                <InputOTPSlot index={3} className="bg-[#0d0e15] border-gray-700" />
                                                <InputOTPSlot index={4} className="bg-[#0d0e15] border-gray-700" />
                                                <InputOTPSlot index={5} className="bg-[#0d0e15] border-gray-700" />
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </div>
                                    <div className="text-center text-sm text-gray-400">
                                        <p>Não recebeu o código?</p>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                try {
                                                    await fetch("/api/password/send-reset-code", {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({ email: forgotEmail }),
                                                    });
                                                    toast({
                                                        title: "Código reenviado",
                                                        description: "Um novo código foi enviado para seu email.",
                                                    });
                                                } catch (error) {
                                                    toast({
                                                        title: "Erro",
                                                        description: "Não foi possível reenviar o código.",
                                                        color: "danger",
                                                    });
                                                }
                                            }}
                                            className="text-white hover:underline"
                                            disabled={isLoading}
                                        >
                                            Reenviar código
                                        </button>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button 
                                        type="submit" 
                                        disabled={isLoading || resetCode.length !== 6} 
                                        className="w-full"
                                    >
                                        {isLoading ? "Verificando..." : "Verificar Código"}
                                    </Button>
                                </CardFooter>
                            </form>
                        )}

                        {forgotPasswordStep === 'newPassword' && (
                            <form onSubmit={handleResetPassword}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">Nova Senha</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="new-password"
                                                type={showNewPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                                disabled={isLoading}
                                                className="pl-10 pr-10 bg-[#0d0e15] border-gray-700"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                                                disabled={isLoading}
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-new-password">Confirmar Nova Senha</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="confirm-new-password"
                                                type={showConfirmNewPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={confirmNewPassword}
                                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                required
                                                disabled={isLoading}
                                                className="pl-10 pr-10 bg-[#0d0e15] border-gray-700"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                                                disabled={isLoading}
                                            >
                                                {showConfirmNewPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button 
                                        type="submit" 
                                        disabled={isLoading} 
                                        className="w-full"
                                    >
                                        {isLoading ? "Redefinindo..." : "Redefinir Senha"}
                                    </Button>
                                </CardFooter>
                            </form>
                        )}
                    </Card>
                )}
            </div>
        </div>
    );
}
