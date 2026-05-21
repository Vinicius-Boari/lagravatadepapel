import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, user, isAdmin, loading: authLoading, error: authError } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in and confirmed as admin
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate({ to: "/admin/dashboard" });
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const ok = await login(email, password);
      if (ok) {
        // useAuth will update and the useEffect above will handle redirection
        toast.success("Login realizado com sucesso!");
      } else {
        toast.error(authError || "Credenciais inválidas ou acesso não autorizado.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado ao realizar login.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 relative">
      <Button 
        variant="ghost" 
        size="sm" 
        className="absolute top-4 left-4 text-zinc-500 hover:text-white"
        onClick={() => navigate({ to: "/" })}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para o site
      </Button>

      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-zinc-100 shadow-2xl shadow-black">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-red-600/10 border border-red-600/20">
              <Lock className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-red-600">
            PAINEL DE CONTROLE
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Acesso restrito para a administração do site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user && !isAdmin && !authLoading ? (
            <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-md text-red-400 text-sm mb-4">
              Você está autenticado, mas não possui permissões administrativas. Entre em contato com o proprietário.
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Administrativo</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoggingIn}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:ring-red-600 focus:border-red-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha de Acesso</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoggingIn}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:ring-red-600 focus:border-red-600"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-red-600 text-white hover:bg-red-700 font-bold transition-all"
              disabled={isLoggingIn || authLoading}
            >
              {isLoggingIn || authLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verificando...
                </div>
              ) : "Acessar Painel"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
