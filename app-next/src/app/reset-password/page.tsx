'use client';

/**
 * Página de redefinição de senha.
 *
 * Recebe o token no query param `?token=xxx` vindo do link no email
 * enviado por `sendPasswordResetEmail` (better-auth → sendResetPassword callback).
 *
 * Fluxo:
 *  1. Usuário clica no link do email → better-auth valida o token internamente
 *     e redireciona pra cá com `?token=VALID_TOKEN` ou `?error=INVALID_TOKEN`.
 *  2. Se token presente: formulário pede nova senha + confirmação.
 *  3. Submit chama `authClient.resetPassword({ newPassword, token })`.
 *  4. Sucesso → redireciona pra /auth pra login com nova senha.
 */

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";
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
import { useToast } from "@/hooks/use-toast";
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

type Status = "form" | "submitting" | "success" | "invalid-token";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const token = searchParams.get("token");
  const error = searchParams.get("error");

  const [status, setStatus] = useState<Status>(() => {
    if (error === "INVALID_TOKEN" || !token) return "invalid-token";
    return "form";
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Se por acaso chegarmos em form sem token válido, corrige pra invalid
  useEffect(() => {
    if (!token && status === "form") setStatus("invalid-token");
  }, [token, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas diferentes",
        description: "A confirmação deve ser igual à nova senha.",
        color: "danger",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Senha muito curta",
        description: "Use pelo menos 8 caracteres.",
        color: "danger",
      });
      return;
    }

    if (!token) {
      setStatus("invalid-token");
      return;
    }

    setStatus("submitting");
    const { error: resetError } = await authClient.resetPassword({
      newPassword,
      token,
    });

    if (resetError) {
      toast({
        title: "Não foi possível redefinir",
        description: resetError.message || "Link expirado ou inválido. Solicite um novo.",
        color: "danger",
      });
      setStatus("invalid-token");
      return;
    }

    setStatus("success");
    toast({
      title: "Senha redefinida",
      description: "Agora você pode fazer login com a nova senha.",
    });

    // Redireciona para /auth após 2s
    setTimeout(() => router.push("/auth"), 2000);
  };

  if (status === "invalid-token") {
    return (
      <Card className="bg-transparent border-gray-800">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <AlertCircle className="h-6 w-6 text-red-400" />
          </div>
          <CardTitle className="text-center text-2xl font-normal">Link inválido ou expirado</CardTitle>
          <CardDescription className="text-center">
            Este link de redefinição não é mais válido. Solicite um novo email pra redefinir sua senha.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2">
          <Link href="/auth" className="w-full">
            <Button className="w-full">Voltar ao login</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (status === "success") {
    return (
      <Card className="bg-transparent border-gray-800">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          </div>
          <CardTitle className="text-center text-2xl font-normal">Senha redefinida</CardTitle>
          <CardDescription className="text-center">
            Sua senha foi alterada. Redirecionando pro login...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isSubmitting = status === "submitting";

  return (
    <Card className="bg-transparent border-gray-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Link href="/auth" aria-label="Voltar">
            <button type="button" className="text-gray-400 hover:text-gray-300">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <CardTitle className="text-2xl font-normal">Nova senha</CardTitle>
        </div>
        <CardDescription>Escolha uma senha com pelo menos 8 caracteres.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                disabled={isSubmitting}
                className="pl-10 pr-10 bg-[#0d0e15] border-gray-700"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                disabled={isSubmitting}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                disabled={isSubmitting}
                className="pl-10 pr-10 bg-[#0d0e15] border-gray-700"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                disabled={isSubmitting}
                aria-label={showConfirm ? "Ocultar confirmação" : "Mostrar confirmação"}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Redefinindo..." : "Redefinir senha"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[rgb(9,9,11)] text-white p-4">
      <div className="w-full max-w-md">
        <Suspense
          fallback={
            <Card className="bg-transparent border-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-normal">Carregando...</CardTitle>
              </CardHeader>
            </Card>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
