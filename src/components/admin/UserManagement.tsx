import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Users as UsersIcon, 
  UserPlus, 
  Trash2, 
  Shield, 
  Mail, 
  Lock,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function UserManagement() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    username: "",
    password: "",
    full_name: "",
    role: "admin"
  });

  const fetchAdmins = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("admin_users").select("*");
    if (error) {
      toast.error("Erro ao carregar administradores.");
    } else {
      setAdmins(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async () => {
    if (!newAdmin.username || !newAdmin.password || !newAdmin.full_name) {
      toast.error("Preencha todos os campos.");
      return;
    }

    const { error } = await supabase.from("admin_users").insert({
      username: newAdmin.username,
      password_hash: newAdmin.password, // Simple for now
      full_name: newAdmin.full_name,
      role: newAdmin.role
    });

    if (error) {
      toast.error("Erro ao criar usuário.");
    } else {
      toast.success("Usuário criado com sucesso!");
      setShowAddForm(false);
      setNewAdmin({ username: "", password: "", full_name: "", role: "admin" });
      fetchAdmins();
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este administrador?")) return;

    const { error } = await supabase.from("admin_users").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao remover usuário.");
    } else {
      toast.success("Usuário removido.");
      fetchAdmins();
    }
  };

  if (loading) return <div className="p-8 text-red-500">Carregando...</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-red-500">Gestão de Usuários</h2>
          <p className="text-red-500/70">Gerencie quem tem acesso ao painel administrativo.</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <UserPlus className="mr-2 w-4 h-4" />
          {showAddForm ? "Cancelar" : "Novo Administrador"}
        </Button>
      </div>

      {showAddForm && (
        <Card className="bg-zinc-900 border-red-900/50 shadow-xl animate-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle className="text-lg text-red-500 flex items-center">
              <UserCheck className="mr-2 w-5 h-5" /> Cadastrar Novo Usuário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-red-500">Nome Completo</Label>
                <Input 
                  className="bg-zinc-800 border-red-900 text-red-500" 
                  value={newAdmin.full_name}
                  onChange={(e) => setNewAdmin({...newAdmin, full_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-red-500">Nome de Usuário (Login)</Label>
                <Input 
                  className="bg-zinc-800 border-red-900 text-red-500" 
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-red-500">Senha</Label>
                <Input 
                  type="password"
                  className="bg-zinc-800 border-red-900 text-red-500" 
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-red-500">Nível de Acesso</Label>
                <select 
                  className="w-full bg-zinc-800 border-red-900 text-red-500 h-10 rounded-md px-3"
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value})}
                >
                  <option value="admin">Administrador</option>
                  <option value="owner">Dono (Owner)</option>
                </select>
              </div>
            </div>
            <Button className="w-full md:w-auto" onClick={handleAddAdmin}>Salvar Usuário</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {admins.map((admin) => (
          <Card key={admin.id} className="bg-zinc-900 border-zinc-800 shadow-xl group hover:border-red-900/40 transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-red-900/10 rounded-full">
                  <Shield className={`w-6 h-6 ${admin.role === 'owner' ? 'text-red-500' : 'text-red-500/70'}`} />
                </div>
                <Badge className={admin.role === 'owner' ? 'bg-red-600' : 'bg-zinc-800'}>
                  {admin.role === 'owner' ? 'Dono' : 'Admin'}
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-red-500 mb-1">{admin.full_name}</h3>
              <div className="flex items-center text-sm text-zinc-500 mb-4">
                <Mail className="w-3.5 h-3.5 mr-2" />
                {admin.username}
              </div>
              <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
                <div className="flex items-center text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
                  <Lock className="w-3 h-3 mr-1" /> Acesso Ativo
                </div>
                {admin.role !== 'owner' && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-zinc-600 hover:text-red-500"
                    onClick={() => handleDeleteAdmin(admin.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
