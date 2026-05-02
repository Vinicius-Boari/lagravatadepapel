import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  component: LoginPage,
});

function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasOwner, setHasOwner] = useState<boolean | null>(null);
  const { login, signup, user, error: authError } = useAuth();
  const navigate = useNavigate();

  // Verifica se já existe um owner. Se não existir, mostra o cadastro inicial.
  useEffect(() => {
    (async () => {
      const { count } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "owner");
      const exists = (count ?? 0) > 0;
      setHasOwner(exists);
      if (!exists) setMode("signup");
    })();
  }, []);

  // Se já está logado, redireciona.
  useEffect(() => {
    if (user) navigate({ to: "/admin/dashboard" });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const ok = await signup(email, password, fullName);
        if (ok) {
          toast.success("Conta criada! Fazendo login...");
          // Tenta fazer login automaticamente após o cadastro
          const loginOk = await login(email, password);
          if (loginOk) navigate({ to: "/admin/dashboard" });
        } else {
          toast.error(authError || "Não foi possível criar a conta. Verifique os dados.");
        }
      } else {
        const ok = await login(email, password);
        if (ok) navigate({ to: "/admin/dashboard" });
        else toast.error("Email ou senha incorretos.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const isInitialSetup = hasOwner === false;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-zinc-100">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-zinc-800 border border-zinc-700">
              <Lock className="w-6 h-6 text-zinc-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {isInitialSetup ? "CRIAR CONTA DE DONO" : mode === "signup" ? "CRIAR CONTA" : "ACESSO ADMINISTRATIVO"}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {isInitialSetup
              ? "Configure a conta principal para gerenciar o site"
              : "Acesso restrito para administradores"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
              disabled={loading}
            >
              {loading
                ? "Carregando..."
                : isInitialSetup
                ? "Criar conta de dono"
                : mode === "signup"
                ? "Cadastrar"
                : "Entrar"}
            </Button>
            {!isInitialSetup && (
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="w-full text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                {mode === "login" ? "Criar nova conta" : "Já tenho conta"}
              </button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
