'use client';

/**
 * Página de autenticação da Oris Cloud (login + cadastro + esqueci senha).
 *
 * 100 por cento better-auth, sem endpoints custom:
 *  - Login:          signIn.email({ email, password })
 *  - Cadastro:       signUp.email({ email, password, name })
 *                    → better-auth envia email de verificação automaticamente
 *                      via callback sendVerificationEmail (ver src/lib/auth.ts).
 *  - Esqueci senha:  authClient.forgetPassword({ email, redirectTo })
 *                    → better-auth envia email com link pra /reset-password?token=...
 *                      via callback sendResetPassword.
 */

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { signIn, signUp, authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, User, Eye, EyeOff, ArrowLeft, MailCheck } from "lucide-react";

type ForgotStep = "closed" | "form" | "sent";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Aceita ?tab=register ou ?tab=login. Default: login.
  const initialTab = searchParams.get("tab") === "register" ? "register" : "login";

  const [isLoading, setIsLoading] = useState(false);

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Cadastro
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirm, setRegisterConfirm] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);
  const [registerSent, setRegisterSent] = useState<string | null>(null); // email enviado

  // Esqueci senha
  const [forgotStep, setForgotStep] = useState<ForgotStep>("closed");
  const [forgotEmail, setForgotEmail] = useState("");

  // ============================================
  // Login
  // ============================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await signIn.email({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) {
        toast({
          title: "Erro no login",
          description: error.message || "Email ou senha incorretos.",
          color: "danger",
        });
        return;
      }
      toast({
        title: "Login realizado",
        description: "Bem-vindo de volta!",
      });
      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Email ou senha incorretos.";
      toast({ title: "Erro no login", description: message, color: "danger" });
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // Cadastro
  // ============================================
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerPassword !== registerConfirm) {
      toast({
        title: "Senhas diferentes",
        description: "A confirmação deve ser igual à senha.",
        color: "danger",
      });
      return;
    }
    if (registerPassword.length < 8) {
      toast({
        title: "Senha muito curta",
        description: "Use pelo menos 8 caracteres.",
        color: "danger",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signUp.email({
        email: registerEmail,
        password: registerPassword,
        name: registerUsername,
      });
      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message || "Não foi possível criar sua conta.",
          color: "danger",
        });
        return;
      }
      // better-auth já enviou email de verificação via callback sendVerificationEmail
      setRegisterSent(registerEmail);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Não foi possível criar sua conta.";
      toast({ title: "Erro no cadastro", description: message, color: "danger" });
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // Esqueci senha
  // ============================================
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await authClient.requestPasswordReset({
        email: forgotEmail,
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast({
          title: "Erro ao enviar email",
          description: error.message || "Tente novamente em alguns minutos.",
          color: "danger",
        });
        return;
      }
      setForgotStep("sent");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao enviar email.";
      toast({ title: "Erro", description: message, color: "danger" });
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!registerSent) return;
    try {
      await authClient.sendVerificationEmail({
        email: registerSent,
        callbackURL: "/",
      });
      toast({
        title: "Email reenviado",
        description: "Verifique sua caixa de entrada.",
      });
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível reenviar. Tente novamente em alguns minutos.",
        color: "danger",
      });
    }
  };

  const resetForgotFlow = () => {
    setForgotStep("closed");
    setForgotEmail("");
  };

  // ============================================
  // Render
  // ============================================

  // Estado: email de verificação enviado após cadastro
  if (registerSent) {
    return (
      <AuthShell>
        <Card className="bg-transparent border-gray-800">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <MailCheck className="h-6 w-6 text-emerald-400" />
            </div>
            <CardTitle className="text-center text-2xl font-normal">Verifique seu email</CardTitle>
            <CardDescription className="text-center">
              Enviamos um link de confirmação pra <span className="text-white">{registerSent}</span>.
              Clique no botão do email pra ativar sua conta.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-2">
            <Button type="button" onClick={resendVerification} variant="outline" className="w-full">
              Reenviar email
            </Button>
            <Button
              type="button"
              onClick={() => setRegisterSent(null)}
              variant="ghost"
              className="w-full text-gray-400 hover:text-white"
            >
              Usar outro email
            </Button>
          </CardFooter>
        </Card>
      </AuthShell>
    );
  }

  // Estado: fluxo de esqueci senha (formulário ou confirmação)
  if (forgotStep !== "closed") {
    return (
      <AuthShell>
        {forgotStep === "form" ? (
          <Card className="bg-transparent border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetForgotFlow}
                  className="text-gray-400 hover:text-gray-300"
                  aria-label="Voltar"
                  disabled={isLoading}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <CardTitle className="text-2xl font-normal">Recuperar senha</CardTitle>
              </div>
              <CardDescription>
                Digite seu email. Enviaremos um link pra você definir uma nova senha.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleForgotPassword}>
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
                      autoComplete="email"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Enviando..." : "Enviar link de redefinição"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        ) : (
          <Card className="bg-transparent border-gray-800">
            <CardHeader>
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <MailCheck className="h-6 w-6 text-emerald-400" />
              </div>
              <CardTitle className="text-center text-2xl font-normal">Verifique seu email</CardTitle>
              <CardDescription className="text-center">
                Se houver uma conta associada a <span className="text-white">{forgotEmail}</span>,
                você receberá um link pra redefinir sua senha em instantes.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                type="button"
                onClick={resetForgotFlow}
                variant="outline"
                className="w-full"
              >
                Voltar ao login
              </Button>
            </CardFooter>
          </Card>
        )}
      </AuthShell>
    );
  }

  // Estado default: tabs Login/Registrar
  return (
    <AuthShell>
      <Tabs defaultValue={initialTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-[#11131b]">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Registrar</TabsTrigger>
        </TabsList>

        {/* Login */}
        <TabsContent value="login">
          <Card className="bg-transparent border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-normal">Bem-vindo de volta</CardTitle>
              <CardDescription>Entre com suas credenciais.</CardDescription>
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
                      autoComplete="email"
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
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                      disabled={isLoading}
                      aria-label={showLoginPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setForgotStep("form")}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                    disabled={isLoading}
                  >
                    Esqueceu a senha?
                  </button>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Registrar */}
        <TabsContent value="register">
          <Card className="bg-transparent border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-normal">Criar conta</CardTitle>
              <CardDescription>
                Enviaremos um link de confirmação pro email que você informar.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username">Nome</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="Seu nome"
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      required
                      minLength={2}
                      disabled={isLoading}
                      className="pl-10 bg-[#0d0e15] border-gray-700"
                      autoComplete="name"
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
                      autoComplete="email"
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
                      minLength={8}
                      disabled={isLoading}
                      className="pl-10 pr-10 bg-[#0d0e15] border-gray-700"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                      disabled={isLoading}
                      aria-label={showRegisterPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-confirm">Confirmar senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-confirm"
                      type={showRegisterConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      value={registerConfirm}
                      onChange={(e) => setRegisterConfirm(e.target.value)}
                      required
                      minLength={8}
                      disabled={isLoading}
                      className="pl-10 pr-10 bg-[#0d0e15] border-gray-700"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterConfirm(!showRegisterConfirm)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                      disabled={isLoading}
                      aria-label={showRegisterConfirm ? "Ocultar confirmação" : "Mostrar confirmação"}
                    >
                      {showRegisterConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Criando..." : "Criar conta"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </AuthShell>
  );
}

/**
 * Wrapper visual compartilhado por todos os estados da página.
 */
function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[rgb(9,9,11)] text-white p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
