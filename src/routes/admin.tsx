import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel Administrativo" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

type UserRow = {
  id: string;
  email: string;
  role: "owner" | "admin";
};

function AdminPage() {
  const navigate = useNavigate();
  const { user, role, loading, isOwner } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "err" } | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  const showToast = (msg: string, kind: "ok" | "err" = "ok") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3500);
  };

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    const { data: profiles } = await supabase.from("profiles").select("id, email").order("email");
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    if (profiles && roles) {
      const merged: UserRow[] = profiles.map((p) => {
        const userRoles = roles.filter((r) => r.user_id === p.id);
        const owner = userRoles.find((r) => r.role === "owner");
        return {
          id: p.id,
          email: p.email,
          role: owner ? "owner" : "admin",
        };
      });
      setUsers(merged);
    }
    setLoadingUsers(false);
  }, []);

  useEffect(() => {
    if (isOwner) loadUsers();
  }, [isOwner, loadUsers]);

  const onLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const onTransferOwnership = async (targetId: string, targetEmail: string) => {
    if (!confirm(`Transferir a posse de Dono para ${targetEmail}?\n\nVocê será rebaixado para Administrador.`)) return;
    const { error } = await supabase.rpc("transfer_ownership", { _new_owner_id: targetId });
    if (error) {
      showToast(error.message, "err");
    } else {
      showToast("Posse transferida com sucesso");
      await loadUsers();
      // Refresh the page since the current user is no longer owner
      window.location.reload();
    }
  };

  const onDelete = async (targetId: string, targetEmail: string) => {
    if (!confirm(`Remover ${targetEmail} permanentemente?`)) return;
    const { error } = await supabase.rpc("delete_admin_user", { _target_id: targetId });
    if (error) {
      showToast(error.message, "err");
    } else {
      showToast("Usuário removido");
      await loadUsers();
    }
  };

  if (loading) {
    return <CenterMsg>Carregando...</CenterMsg>;
  }
  if (!user) return null;
  if (!isOwner && role !== "admin") {
    return <CenterMsg>Acesso negado.</CenterMsg>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f6f6f7", color: "#111", fontFamily: "Inter, system-ui, sans-serif" }}>
      <header style={{
        background: "white",
        borderBottom: "1px solid #e5e7eb",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600 }}>
            Painel Administrativo
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>
            {user.email} · <span style={{ color: isOwner ? "#dc2626" : "#0066cc", fontWeight: 600 }}>{isOwner ? "Dono" : "Administrador"}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/" style={ghostBtn}>Ver site</Link>
          <button onClick={onLogout} style={ghostBtn}>Sair</button>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
        {!isOwner && (
          <div style={card}>
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>Bem-vindo</h2>
            <p style={{ color: "#666", fontSize: 14 }}>
              Você está logado como Administrador. A gestão de usuários é restrita ao Dono.
            </p>
          </div>
        )}

        {isOwner && (
          <section style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 600 }}>Usuários do Painel</h2>
                <p style={{ fontSize: 13, color: "#666" }}>Gerencie administradores e a posse do painel.</p>
              </div>
              <button onClick={() => setShowCreate(true)} style={primaryBtn}>+ Novo Administrador</button>
            </div>

            {loadingUsers ? (
              <div style={{ padding: 24, color: "#666" }}>Carregando usuários...</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#fafafa", borderBottom: "1px solid #e5e7eb" }}>
                      <th style={th}>E-mail</th>
                      <th style={th}>Cargo</th>
                      <th style={{ ...th, textAlign: "right" }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={td}>{u.email}</td>
                        <td style={td}>
                          <span style={{
                            padding: "3px 10px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 600,
                            background: u.role === "owner" ? "#fee2e2" : "#dbeafe",
                            color: u.role === "owner" ? "#b91c1c" : "#1d4ed8",
                          }}>
                            {u.role === "owner" ? "Dono" : "Administrador"}
                          </span>
                        </td>
                        <td style={{ ...td, textAlign: "right" }}>
                          {u.id === user.id ? (
                            <span style={{ color: "#999", fontSize: 12 }}>(você)</span>
                          ) : u.role === "owner" ? (
                            <span style={{ color: "#999", fontSize: 12 }}>—</span>
                          ) : (
                            <div style={{ display: "inline-flex", gap: 6 }}>
                              <button onClick={() => setEditingUser(u)} style={smallBtn}>Editar</button>
                              <button onClick={() => onTransferOwnership(u.id, u.email)} style={{ ...smallBtn, background: "#fef3c7", color: "#92400e" }}>
                                Tornar Dono
                              </button>
                              <button onClick={() => onDelete(u.id, u.email)} style={{ ...smallBtn, background: "#fee2e2", color: "#b91c1c" }}>
                                Remover
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan={3} style={{ padding: 24, textAlign: "center", color: "#999" }}>Nenhum usuário ainda.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>

      {showCreate && (
        <CreateAdminModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadUsers(); showToast("Administrador criado"); }}
          onError={(m) => showToast(m, "err")}
        />
      )}

      {editingUser && (
        <EditAdminModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={() => { setEditingUser(null); loadUsers(); showToast("Cadastro atualizado"); }}
          onError={(m) => showToast(m, "err")}
        />
      )}

      {toast && (
        <div style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          background: toast.kind === "ok" ? "#16a34a" : "#dc2626",
          color: "white",
          padding: "12px 18px",
          borderRadius: 8,
          fontSize: 14,
          boxShadow: "0 10px 30px rgba(0,0,0,.2)",
          zIndex: 100,
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function CreateAdminModal({ onClose, onCreated, onError }: {
  onClose: () => void; onCreated: () => void; onError: (m: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("create-admin", {
      body: { email, password },
    });
    setBusy(false);
    if (error || (data && data.error)) {
      onError((data?.error as string) || error?.message || "Erro ao criar");
      return;
    }
    onCreated();
  };

  return (
    <Modal onClose={onClose} title="Novo Administrador">
      <form onSubmit={submit}>
        <Field label="E-mail">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={modalInput} />
        </Field>
        <Field label="Senha (mín. 6 caracteres)">
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} style={modalInput} />
        </Field>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
          <button type="button" onClick={onClose} style={ghostBtn}>Cancelar</button>
          <button type="submit" disabled={busy} style={primaryBtn}>{busy ? "Criando..." : "Criar"}</button>
        </div>
      </form>
    </Modal>
  );
}

function EditAdminModal({ user, onClose, onSaved, onError }: {
  user: UserRow; onClose: () => void; onSaved: () => void; onError: (m: string) => void;
}) {
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const body: Record<string, string> = { user_id: user.id };
    if (email && email !== user.email) body.email = email;
    if (password) body.password = password;
    if (Object.keys(body).length === 1) {
      setBusy(false);
      onError("Nada para atualizar");
      return;
    }
    const { data, error } = await supabase.functions.invoke("update-admin", { body });
    setBusy(false);
    if (error || (data && data.error)) {
      onError((data?.error as string) || error?.message || "Erro ao salvar");
      return;
    }
    onSaved();
  };

  return (
    <Modal onClose={onClose} title={`Editar: ${user.email}`}>
      <form onSubmit={submit}>
        <Field label="E-mail">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={modalInput} />
        </Field>
        <Field label="Nova senha (deixe em branco para manter)">
          <input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} style={modalInput} placeholder="••••••••" />
        </Field>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
          <button type="button" onClick={onClose} style={ghostBtn}>Cancelar</button>
          <button type="submit" disabled={busy} style={primaryBtn}>{busy ? "Salvando..." : "Salvar"}</button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.5)",
      display: "grid", placeItems: "center", zIndex: 50, padding: 16,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "white", borderRadius: 12, padding: 24, width: "100%", maxWidth: 420,
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

function CenterMsg({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#666" }}>
      {children}
    </div>
  );
}

const card: React.CSSProperties = {
  background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24, marginBottom: 16,
};
const th: React.CSSProperties = { textAlign: "left", padding: "10px 12px", fontSize: 12, color: "#666", fontWeight: 600 };
const td: React.CSSProperties = { padding: "12px", fontSize: 14 };
const primaryBtn: React.CSSProperties = {
  padding: "8px 14px", borderRadius: 8, border: "none", background: "#dc2626", color: "white", fontWeight: 600, fontSize: 13, cursor: "pointer",
};
const ghostBtn: React.CSSProperties = {
  padding: "8px 14px", borderRadius: 8, border: "1px solid #e5e7eb", background: "white", color: "#333", fontSize: 13, cursor: "pointer", textDecoration: "none", display: "inline-block",
};
const smallBtn: React.CSSProperties = {
  padding: "5px 10px", borderRadius: 6, border: "none", background: "#f3f4f6", color: "#333", fontSize: 12, cursor: "pointer", fontWeight: 500,
};
const modalInput: React.CSSProperties = {
  width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 14, outline: "none",
};
