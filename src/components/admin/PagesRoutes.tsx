import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ExternalLink, Link as LinkIcon, Plus, Trash2, Globe, Shield } from "lucide-react";
import { toast } from "sonner";

export function PagesRoutes() {
  const [routes, setRoutes] = useState([
    { path: "/", label: "Página Inicial (Home)", status: "Ativo", type: "Página" },
    { path: "/admin", label: "Painel Administrativo", status: "Restrito", type: "Admin" },
  ]);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-red-500">Páginas e Rotas</h2>
          <p className="text-red-500/70">Visualize as rotas ativas do site e gerencie redirecionamentos.</p>
        </div>
        <Button onClick={() => toast.info("Funcionalidade de criação de novas páginas em breve.")}>
          <Plus className="mr-2 w-4 h-4" />
          Nova Rota
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center">
              <Globe className="mr-2 w-5 h-5" /> Rotas do Aplicativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {routes.map((route, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-red-900/20">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-red-900/20 rounded">
                      <LinkIcon className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-red-500">{route.label}</p>
                      <code className="text-xs text-zinc-500">{route.path}</code>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      route.status === 'Ativo' ? 'bg-green-900/20 text-green-500' : 'bg-red-900/20 text-red-500'
                    }`}>
                      {route.status}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => window.open(route.path, '_blank')}>
                      <ExternalLink className="w-4 h-4 text-zinc-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center">
              <Shield className="mr-2 w-5 h-5" /> Redirecionamentos (301/302)
            </CardTitle>
            <CardDescription className="text-red-500/60">Crie regras de encaminhamento para URLs antigas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-red-500">De (Origem)</Label>
                <Input className="bg-zinc-800 border-red-900 text-red-500" placeholder="/url-antiga" />
              </div>
              <div className="space-y-2">
                <Label className="text-red-500">Para (Destino)</Label>
                <Input className="bg-zinc-800 border-red-900 text-red-500" placeholder="/nova-url" />
              </div>
              <div className="flex items-end">
                <Button className="w-full" onClick={() => toast.info("Salvo com sucesso!")}>Adicionar Regra</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
