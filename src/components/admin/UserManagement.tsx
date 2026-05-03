import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  Shield,
  Mail,
  Lock,
  UserCheck,
  Save,
  Loader2,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useSaveStatus, getSaveButtonStyles } from "@/hooks/useSaveStatus";
import { cn } from "@/lib/utils";

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  role: "owner" | "admin";
}

export function UserManagement() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "admin" as "admin" | "owner",
  });
  const { status, setSaveStatus } = useSaveStatus();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role");

    if (rolesError) {
      toast.error("Erro ao carregar usuários.");
      setLoading(false);
      return;
    }

    const userIds = Array.from(new Set((roles ?? []).map((r) => r.user_id)));
    if (userIds.length === 0) {
      setUsers([]);
      setLoading(false);
      return;
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("id", userIds);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, { email: p.email, full_name: p.full_name }]));

    // Resolve papel mais alto por usuário
    const byUser = new Map<string, "owner" | "admin">();
    (roles ?? []).forEach((r) => {
      const current = byUser.get(r.user_id);
      if (r.role === "owner") byUser.set(r.user_id, "owner");
      else if (r.role === "admin" && current !== "owner") byUser.set(r.user_id, "admin");
    });

    const list: UserRow[] = Array.from(byUser.entries())
      .filter(([, role]) => role === "admin" || role === "owner")
      .map(([id, role]) => {
        const p = profileMap.get(id);
        return {
          id,
          email: p?.email ?? "Email não disponível",
          full_name: p?.full_name ?? "Administrador",
          role,
        };
      });

    setUsers(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddAdmin = async () => {
    if (!newAdmin.email || !newAdmin.password || !newAdmin.full_name) {
      toast.error("Preencha todos os campos: nome, email e senha.");
      return;
    }
    if (newAdmin.password.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setSaveStatus('saving');
    // Cria usuário via Supabase Auth (signup público)
    const { data, error } = await supabase.auth.signUp({
      email: newAdmin.email.trim(),
      password: newAdmin.password,
      options: {
        data: { full_name: newAdmin.full_name || undefined },
      },
    });

    if (error || !data.user) {
      setSaveStatus('error');
      toast.error(error?.message || "Erro ao criar usuário.");
      return;
    }

    // Promove para o papel selecionado (apenas owner consegue, conforme RLS)
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: data.user.id, role: newAdmin.role });

    if (roleError) {
      setSaveStatus('error');
      toast.error(`Usuário criado, mas falhou ao dar permissão: ${roleError.message}`);
      return;
    }

    setSaveStatus('saved');
    toast.success("Administrador cadastrado!");
    setTimeout(() => {
      setShowAddForm(false);
      setNewAdmin({ email: "", password: "", full_name: "", role: "admin" });
      fetchUsers();
    }, 1000);
  };

  if (loading) return <div className="p-8 text-red-500">Carregando...</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-red-500">Gestão de Usuários</h2>
          <p className="text-red-500/70">Gerencie quem tem acesso ao painel administrativo.</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-black hover:bg-zinc-900 text-white border-zinc-800 border">
          <UserPlus className="mr-2 w-4 h-4" />
          {showAddForm ? "Cancelar" : "Novo Administrador"}
        </Button>
      </div>

      <div className="flex items-start gap-3 bg-zinc-900/50 border border-zinc-800 rounded-md p-4 text-sm text-zinc-400">
        <Info className="w-4 h-4 mt-0.5 text-red-500 shrink-0" />
        <p>
          Os usuários agora são gerenciados pelo sistema seguro de autenticação. O cadastro envia o usuário via email e senha, e a permissão de administrador é aplicada automaticamente.
        </p>
      </div>

      {showAddForm && (
        <Card className="bg-zinc-900 border-red-900/50 shadow-xl animate-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle className="text-lg text-red-500 flex items-center">
              <UserCheck className="mr-2 w-5 h-5" /> Cadastrar Novo Administrador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-red-500">Nome Completo</Label>
                <Input
                  className="bg-zinc-800 border-red-900 text-red-500"
                  value={newAdmin.full_name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-red-500">Email</Label>
                <Input
                  type="email"
                  className="bg-zinc-800 border-red-900 text-red-500"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-red-500">Senha (mínimo 6 caracteres)</Label>
                <Input
                  type="password"
                  className="bg-zinc-800 border-red-900 text-red-500"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-red-500">Papel / Nível de Acesso</Label>
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value as "admin" | "owner" })}
                  className="w-full bg-zinc-800 border-red-900 text-red-500 rounded-md p-2 text-sm focus:ring-1 focus:ring-red-500 outline-none"
                >
                  <option value="admin">Administrador (Acesso Geral)</option>
                  <option value="owner">Dono (Acesso Total + Gestão de Usuários)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleAddAdmin}
                className={cn("transition-all duration-300 w-48", getSaveButtonStyles(status))}
              >
                {status === 'saving' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {status === 'saved' ? 'Cadastrado!' : status === 'error' ? 'Erro!' : 'Cadastrar Usuário'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((u) => (
          <Card key={u.id} className="bg-zinc-900 border-zinc-800 shadow-xl group hover:border-red-900/40 transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-red-900/10 rounded-full">
                  <Shield className={`w-6 h-6 ${u.role === 'owner' ? 'text-red-500' : 'text-red-500/70'}`} />
                </div>
                <Badge className={u.role === 'owner' ? 'bg-red-600' : 'bg-zinc-800'}>
                  {u.role === 'owner' ? 'Dono' : 'Admin'}
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-red-500 mb-1 truncate">{u.full_name}</h3>
              <div className="flex items-center text-sm text-zinc-500 mb-4">
                <Mail className="w-3.5 h-3.5 mr-2" />
                {u.email}
              </div>
              <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
                <div className="flex items-center text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
                  <Lock className="w-3 h-3 mr-1" /> Acesso Ativo
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
