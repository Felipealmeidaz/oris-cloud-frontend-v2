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

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { signIn, signUp, authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { OrisLogo } from "@/components/ui/oris-logo";
import { cn } from "@/lib/utils";
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  MailCheck,
  Zap,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Gamepad2,
} from "lucide-react";

type ForgotStep = "closed" | "form" | "sent";

/**
 * Detecta o provedor de email a partir do endereço e retorna URL de inbox direta.
 * Cobre os provedores mais comuns; fallback é null (só mostra "Abrir email" genérico).
 */
function detectEmailProvider(email: string): { name: string; url: string } | null {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  const providers: Record<string, { name: string; url: string }> = {
    "gmail.com": { name: "Gmail", url: "https://mail.google.com" },
    "googlemail.com": { name: "Gmail", url: "https://mail.google.com" },
    "outlook.com": { name: "Outlook", url: "https://outlook.live.com/mail" },
    "hotmail.com": { name: "Outlook", url: "https://outlook.live.com/mail" },
    "live.com": { name: "Outlook", url: "https://outlook.live.com/mail" },
    "msn.com": { name: "Outlook", url: "https://outlook.live.com/mail" },
    "yahoo.com": { name: "Yahoo", url: "https://mail.yahoo.com" },
    "yahoo.com.br": { name: "Yahoo", url: "https://mail.yahoo.com" },
    "icloud.com": { name: "iCloud", url: "https://www.icloud.com/mail" },
    "me.com": { name: "iCloud", url: "https://www.icloud.com/mail" },
    "mac.com": { name: "iCloud", url: "https://www.icloud.com/mail" },
    "proton.me": { name: "Proton", url: "https://mail.proton.me" },
    "protonmail.com": { name: "Proton", url: "https://mail.proton.me" },
  };
  return providers[domain] ?? null;
}

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Aceita ?tab=register ou ?tab=login. Lido em useEffect pra evitar SSR
  // bailout do useSearchParams que exigiria Suspense boundary no Next 16.
  const [currentTab, setCurrentTab] = useState<"login" | "register">("login");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "register") setCurrentTab("register");
  }, []);

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
      <AuthShell showHero={false}>
        <VerificationSuccess
          email={registerSent}
          onResend={resendVerification}
          onChangeEmail={() => setRegisterSent(null)}
        />
      </AuthShell>
    );
  }

  // Estado: fluxo de esqueci senha (formulário ou confirmação)
  if (forgotStep !== "closed") {
    return (
      <AuthShell showHero={forgotStep === "form"}>
        {forgotStep === "form" ? (
          <div className="space-y-6">
            <button
              type="button"
              onClick={resetForgotFlow}
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao login
            </button>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-white">Recuperar senha</h1>
              <p className="text-gray-400 text-[15px]">
                Digite seu email e enviaremos um link pra você definir uma nova senha com segurança.
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-sm font-medium text-gray-200">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-11 h-11 bg-[#0a0a0c] border-gray-800 focus-visible:border-emerald-500/60 focus-visible:ring-2 focus-visible:ring-emerald-500/20 transition"
                    autoComplete="email"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg shadow-emerald-500/20 transition"
              >
                {isLoading ? "Enviando..." : "Enviar link de redefinição"}
              </Button>
            </form>
          </div>
        ) : (
          <VerificationSuccess
            email={forgotEmail}
            variant="reset"
            onResend={async () => {
              try {
                await authClient.requestPasswordReset({
                  email: forgotEmail,
                  redirectTo: `${window.location.origin}/reset-password`,
                });
                toast({ title: "Email reenviado", description: "Verifique sua caixa de entrada." });
              } catch {
                toast({
                  title: "Erro",
                  description: "Não foi possível reenviar. Tente novamente em alguns minutos.",
                  color: "danger",
                });
              }
            }}
            onChangeEmail={resetForgotFlow}
          />
        )}
      </AuthShell>
    );
  }

  // Estado default: tabs Login/Registrar
  const passwordsMatch =
    registerPassword.length === 0 || registerPassword === registerConfirm;
  const passwordStrong = registerPassword.length >= 8;

  return (
    <AuthShell>
      <div className="space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-white leading-tight">
            {currentTab === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
          </h1>
          <p className="text-gray-400 text-[15px]">
            {currentTab === "login"
              ? "Entre pra acessar suas máquinas e continuar jogando."
              : "Grátis pra criar. Você só paga quando liga a máquina."}
          </p>
        </div>

        <Tabs
          value={currentTab}
          onValueChange={(v) => setCurrentTab(v as "login" | "register")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 bg-[#0a0a0c] border border-gray-800 p-1 h-11 rounded-xl">
            <TabsTrigger
              value="login"
              className="rounded-lg h-full data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-300 data-[state=active]:border data-[state=active]:border-emerald-500/30 data-[state=active]:shadow-none text-gray-400 transition"
            >
              Entrar
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="rounded-lg h-full data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-300 data-[state=active]:border data-[state=active]:border-emerald-500/30 data-[state=active]:shadow-none text-gray-400 transition"
            >
              Criar conta
            </TabsTrigger>
          </TabsList>

          {/* Login */}
          <TabsContent value="login" className="mt-6 space-y-5 data-[state=active]:animate-in data-[state=active]:fade-in">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-sm font-medium text-gray-200">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-11 h-11 bg-[#0a0a0c] border-gray-800 focus-visible:border-emerald-500/60 focus-visible:ring-2 focus-visible:ring-emerald-500/20 transition"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password" className="text-sm font-medium text-gray-200">
                    Senha
                  </Label>
                  <button
                    type="button"
                    onClick={() => setForgotStep("form")}
                    className="text-xs font-medium text-emerald-400/80 hover:text-emerald-300 transition"
                    disabled={isLoading}
                  >
                    Esqueci a senha
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  <Input
                    id="login-password"
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-11 pr-11 h-11 bg-[#0a0a0c] border-gray-800 focus-visible:border-emerald-500/60 focus-visible:ring-2 focus-visible:ring-emerald-500/20 transition"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                    disabled={isLoading}
                    aria-label={showLoginPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg shadow-emerald-500/20 transition"
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>

              <p className="text-center text-xs text-gray-500">
                Novo por aqui?{" "}
                <button
                  type="button"
                  onClick={() => setCurrentTab("register")}
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition"
                >
                  Crie sua conta grátis
                </button>
              </p>
            </form>
          </TabsContent>

          {/* Registrar */}
          <TabsContent value="register" className="mt-6 space-y-5 data-[state=active]:animate-in data-[state=active]:fade-in">
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="register-username" className="text-sm font-medium text-gray-200">
                  Nome
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  <Input
                    id="register-username"
                    type="text"
                    placeholder="Como devemos te chamar"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    required
                    minLength={2}
                    disabled={isLoading}
                    className="pl-11 h-11 bg-[#0a0a0c] border-gray-800 focus-visible:border-emerald-500/60 focus-visible:ring-2 focus-visible:ring-emerald-500/20 transition"
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-sm font-medium text-gray-200">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-11 h-11 bg-[#0a0a0c] border-gray-800 focus-visible:border-emerald-500/60 focus-visible:ring-2 focus-visible:ring-emerald-500/20 transition"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-sm font-medium text-gray-200">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  <Input
                    id="register-password"
                    type={showRegisterPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={isLoading}
                    className={cn(
                      "pl-11 pr-11 h-11 bg-[#0a0a0c] border-gray-800 focus-visible:ring-2 transition",
                      registerPassword.length === 0 &&
                        "focus-visible:border-emerald-500/60 focus-visible:ring-emerald-500/20",
                      registerPassword.length > 0 && passwordStrong &&
                        "border-emerald-500/40 focus-visible:border-emerald-500/60 focus-visible:ring-emerald-500/20",
                      registerPassword.length > 0 && !passwordStrong &&
                        "border-amber-500/40 focus-visible:border-amber-500/60 focus-visible:ring-amber-500/20",
                    )}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                    disabled={isLoading}
                    aria-label={showRegisterPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {registerPassword.length > 0 && !passwordStrong && (
                  <p className="text-xs text-amber-400/80 flex items-center gap-1.5">
                    <span className="inline-block w-1 h-1 rounded-full bg-amber-400" />
                    Use pelo menos 8 caracteres
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm" className="text-sm font-medium text-gray-200">
                  Confirmar senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  <Input
                    id="register-confirm"
                    type={showRegisterConfirm ? "text" : "password"}
                    placeholder="Digite a senha novamente"
                    value={registerConfirm}
                    onChange={(e) => setRegisterConfirm(e.target.value)}
                    required
                    minLength={8}
                    disabled={isLoading}
                    className={cn(
                      "pl-11 pr-11 h-11 bg-[#0a0a0c] border-gray-800 focus-visible:ring-2 transition",
                      passwordsMatch &&
                        "focus-visible:border-emerald-500/60 focus-visible:ring-emerald-500/20",
                      !passwordsMatch &&
                        "border-red-500/40 focus-visible:border-red-500/60 focus-visible:ring-red-500/20",
                    )}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterConfirm(!showRegisterConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                    disabled={isLoading}
                    aria-label={showRegisterConfirm ? "Ocultar confirmação" : "Mostrar confirmação"}
                  >
                    {showRegisterConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {!passwordsMatch && (
                  <p className="text-xs text-red-400 flex items-center gap-1.5">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                    As senhas não conferem
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
              >
                {isLoading ? "Criando sua conta..." : "Criar conta grátis"}
              </Button>

              <p className="text-center text-xs text-gray-500">
                Ao criar conta você concorda com os{" "}
                <Link href="/terms" className="text-gray-400 hover:text-white underline underline-offset-2">
                  Termos
                </Link>{" "}
                e{" "}
                <Link href="/privacy" className="text-gray-400 hover:text-white underline underline-offset-2">
                  Privacidade
                </Link>
                .
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </AuthShell>
  );
}

/**
 * Wrapper visual compartilhado por todos os estados da página.
 * Desktop: 2 colunas (hero esquerda + form direita).
 * Mobile: 1 coluna (só o form, o hero ocupa espaço demais).
 */
function AuthShell({
  children,
  showHero = true,
}: {
  children: React.ReactNode;
  showHero?: boolean;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#09090B] text-white">
      {showHero && <AuthHero />}
      <main
        className={cn(
          "flex-1 flex items-center justify-center p-6 sm:p-10",
          !showHero && "md:p-16"
        )}
      >
        <div className="w-full max-w-md">
          {/* Logo topo (visível sempre no mobile, só quando hero oculto no desktop) */}
          <div
            className={cn(
              "mb-10 flex justify-center",
              showHero && "md:hidden"
            )}
          >
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <OrisLogo size={28} className="text-emerald-400" />
              <span className="font-semibold text-lg tracking-tight inline-flex items-baseline gap-[0.28em]">
                <span className="text-white">Oris</span>
                <span className="text-white/60">Cloud</span>
              </span>
            </Link>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

/**
 * Hero lateral: visível só em desktop (md+). Reforça o valor do produto
 * enquanto o user autentica. Mantém atenção e reduz friction.
 */
function AuthHero() {
  return (
    <aside className="hidden md:flex relative overflow-hidden w-full md:w-[44%] lg:w-1/2 flex-col justify-between p-12 lg:p-16 border-r border-gray-800/60">
      {/* Glow verde sutil no topo esquerdo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 w-[300px] h-[300px] bg-emerald-600/5 rounded-full blur-[100px]"
      />
      {/* Grid pattern sutil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <OrisLogo size={32} className="text-emerald-400 transition group-hover:text-emerald-300" />
          <span className="font-semibold text-xl tracking-tight inline-flex items-baseline gap-[0.28em]">
            <span className="text-white">Oris</span>
            <span className="text-white/60">Cloud</span>
          </span>
        </Link>
      </div>

      <div className="relative z-10 space-y-8 max-w-[460px]">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            Powered by AWS · NVIDIA Tesla T4
          </span>
          <h2 className="text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.1]">
            Cloud gaming com{" "}
            <span className="text-emerald-400">hardware dedicado</span>.
          </h2>
          <p className="mt-4 text-[15px] lg:text-base text-gray-400 leading-relaxed">
            VMs com GPU NVIDIA Tesla T4 rodando em São Paulo. Jogue do notebook,
            celular ou TV via Parsec ou Moonlight — sem configuração complicada.
          </p>
        </div>

        <ul className="space-y-4">
          <HeroFeature
            icon={<Gamepad2 className="h-4 w-4 text-emerald-400" />}
            title="GPU NVIDIA Tesla T4 (16GB)"
            description="Performance dedicada pros seus jogos favoritos"
          />
          <HeroFeature
            icon={<Zap className="h-4 w-4 text-emerald-400" />}
            title="Até 28GB RAM DDR5 · AMD EPYC"
            description="Latência mínima pra Brasil via AWS São Paulo"
          />
          <HeroFeature
            icon={<ShieldCheck className="h-4 w-4 text-emerald-400" />}
            title="Autenticação segura"
            description="Proteção com DKIM, SPF, DMARC e Better Auth"
          />
        </ul>
      </div>

      <div className="relative z-10 flex items-center justify-between text-xs text-gray-500">
        <span>© {new Date().getFullYear()} Oris Cloud</span>
        <Link
          href="/discord"
          className="hover:text-gray-300 transition inline-flex items-center gap-1.5"
        >
          Precisa de ajuda?
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </aside>
  );
}

function HeroFeature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <div className="shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
        {icon}
      </div>
      <div className="pt-0.5">
        <p className="font-medium text-white text-sm leading-snug">{title}</p>
        <p className="text-[13px] text-gray-500 mt-0.5">{description}</p>
      </div>
    </li>
  );
}

/**
 * Tela pós-envio de email (verificação de signup ou reset de senha).
 * Rica em feedback: ícone animado, breadcrumb do processo, botão pra abrir
 * o provedor de email direto, reenvio com cooldown de 60s, troubleshooting.
 */
function VerificationSuccess({
  email,
  variant = "verify",
  onResend,
  onChangeEmail,
}: {
  email: string;
  variant?: "verify" | "reset";
  onResend: () => Promise<void> | void;
  onChangeEmail: () => void;
}) {
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const provider = useMemo(() => detectEmailProvider(email), [email]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      await onResend();
      setCooldown(60);
    } finally {
      setResending(false);
    }
  };

  const isVerify = variant === "verify";
  const title = isVerify ? "Só falta confirmar!" : "Verifique seu email";
  const subtitle = isVerify
    ? "Enviamos um link de confirmação. Clique nele pra ativar sua conta e começar a jogar."
    : "Enviamos um link pra redefinir sua senha. Ele é válido por 1 hora.";

  return (
    <div className="w-full text-center space-y-8">
      {/* Ícone animado */}
      <div className="relative mx-auto w-20 h-20">
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"
        />
        <span
          aria-hidden
          className="absolute inset-2 rounded-full bg-emerald-500/10"
        />
        <div className="relative w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
          <MailCheck className="w-9 h-9 text-emerald-400" />
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
        <p className="text-[15px] text-gray-400 leading-relaxed max-w-sm mx-auto">
          {subtitle}
          <br />
          <span className="font-medium text-white mt-1 inline-block break-all">
            {email}
          </span>
        </p>
      </div>

      {/* Breadcrumb visual (só no verify) */}
      {isVerify && (
        <div className="flex items-center justify-center gap-2 text-xs">
          <BreadcrumbStep state="done">
            <CheckCircle2 className="w-3 h-3" />
            Conta criada
          </BreadcrumbStep>
          <span className="w-6 h-[1px] bg-emerald-500/60" aria-hidden />
          <BreadcrumbStep state="active">Confirmar email</BreadcrumbStep>
          <span className="w-6 h-[1px] bg-gray-700" aria-hidden />
          <BreadcrumbStep state="pending">Começar</BreadcrumbStep>
        </div>
      )}

      {/* CTAs */}
      <div className="space-y-3 pt-2">
        {provider && (
          <Button
            asChild
            className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg shadow-emerald-500/20 transition"
          >
            <a href={provider.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir {provider.name}
            </a>
          </Button>
        )}
        <Button
          type="button"
          onClick={handleResend}
          variant="outline"
          className="w-full h-11 bg-[#0a0a0c] border-gray-800 text-gray-200 hover:bg-gray-900 hover:text-white transition disabled:opacity-60"
          disabled={cooldown > 0 || resending}
        >
          {resending
            ? "Reenviando..."
            : cooldown > 0
              ? `Reenviar em ${cooldown}s`
              : "Reenviar email"}
        </Button>
        <button
          type="button"
          onClick={onChangeEmail}
          className="text-sm text-gray-500 hover:text-gray-300 transition"
        >
          Usar outro email
        </button>
      </div>

      {/* Troubleshooting */}
      <div className="pt-6 border-t border-gray-800/70 text-left">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400/80" />
          <p className="text-xs font-medium text-gray-300 uppercase tracking-wider">
            Não recebeu?
          </p>
        </div>
        <ul className="text-[13px] text-gray-500 space-y-1.5">
          <li className="flex gap-2">
            <span className="text-gray-700">→</span>
            Verifique a pasta de spam ou lixo eletrônico
          </li>
          <li className="flex gap-2">
            <span className="text-gray-700">→</span>
            Confirme se <span className="text-gray-400 break-all">{email}</span>{" "}
            está correto
          </li>
          <li className="flex gap-2">
            <span className="text-gray-700">→</span>
            Aguarde até 2 minutos — às vezes o provedor demora
          </li>
        </ul>
      </div>
    </div>
  );
}

function BreadcrumbStep({
  state,
  children,
}: {
  state: "done" | "active" | "pending";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition",
        state === "done" &&
          "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
        state === "active" &&
          "bg-emerald-500/20 border-emerald-500/50 text-emerald-200 font-medium",
        state === "pending" && "bg-gray-900 border-gray-800 text-gray-500"
      )}
    >
      {children}
    </span>
  );
}
