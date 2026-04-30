import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteSections } from "@/components/SiteSections";
import type { SiteContent } from "@/hooks/useSiteContent";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel Administrativo" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

type UserRow = { id: string; email: string; role: "owner" | "admin" };
type Tab = "content" | "pages" | "users";

type ContentRow = { key: string; value: any; draft_value: any | null };
type PageRow = {
  id: string;
  slug: string;
  title: string;
  draft: any;
  published: any;
  is_published: boolean;
};

const SECTION_DEFS: { key: string; label: string }[] = [
  { key: "hero", label: "Hero (capa)" },
  { key: "services", label: "Serviços" },
  { key: "videos", label: "Vídeos" },
  { key: "plan", label: "O Plano" },
  { key: "places", label: "Invasões" },
  { key: "about", label: "Sobre" },
  { key: "footer", label: "Rodapé / Contato" },
];

function AdminPage() {
  const navigate = useNavigate();
  const { user, role, loading, isOwner, isAdmin } = useAuth();
  const [tab, setTab] = useState<Tab>("content");
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "err" } | null>(null);

  // Não redireciona enquanto loading=true (evita flash/loop com /login)
  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  const showToast = (msg: string, kind: "ok" | "err" = "ok") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3500);
  };

  const onLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) return <CenterMsg>Carregando...</CenterMsg>;
  if (!user) return <CenterMsg>Redirecionando...</CenterMsg>;
  if (!isAdmin) return <CenterMsg>Acesso negado.</CenterMsg>;

  return (
    <div style={{ minHeight: "100vh", background: "#f6f6f7", color: "#111", fontFamily: "Inter, system-ui, sans-serif" }}>
      <header style={{
        background: "white", borderBottom: "1px solid #e5e7eb", padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
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

      <nav style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "0 24px", display: "flex", gap: 4 }}>
        <TabBtn active={tab === "content"} onClick={() => setTab("content")}>Conteúdo da Home</TabBtn>
        <TabBtn active={tab === "pages"} onClick={() => setTab("pages")}>Páginas extras</TabBtn>
        {isOwner && <TabBtn active={tab === "users"} onClick={() => setTab("users")}>Usuários</TabBtn>}
      </nav>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
        {tab === "content" && <ContentTab onToast={showToast} />}
        {tab === "pages" && <PagesTab onToast={showToast} />}
        {tab === "users" && isOwner && <UsersTab currentUserId={user.id} onToast={showToast} />}
      </main>

      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24,
          background: toast.kind === "ok" ? "#16a34a" : "#dc2626",
          color: "white", padding: "12px 18px", borderRadius: 8, fontSize: 14,
          boxShadow: "0 10px 30px rgba(0,0,0,.2)", zIndex: 1000,
        }}>{toast.msg}</div>
      )}
    </div>
  );
}

/* ============================================================
   TAB: Conteúdo da Home (com preview lado a lado)
============================================================ */

function ContentTab({ onToast }: { onToast: (m: string, k?: "ok" | "err") => void }) {
  const [rows, setRows] = useState<Record<string, ContentRow>>({});
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState<string>("hero");
  const [draftJson, setDraftJson] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("site_content").select("key, value, draft_value");
    if (data) {
      const map: Record<string, ContentRow> = {};
      data.forEach((r: any) => { map[r.key] = r; });
      setRows(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Sempre que troca a seção, carrega o draft (ou published) no editor
  useEffect(() => {
    const r = rows[activeKey];
    if (r) {
      const v = r.draft_value ?? r.value;
      setDraftJson(JSON.stringify(v, null, 2));
    } else {
      setDraftJson("{}");
    }
  }, [activeKey, rows]);

  const parsed = useMemo(() => {
    try { return { ok: true as const, value: JSON.parse(draftJson) }; }
    catch (e: any) { return { ok: false as const, error: e.message }; }
  }, [draftJson]);

  const saveDraft = async () => {
    if (!parsed.ok) { onToast("JSON inválido", "err"); return; }
    setBusy(true);
    const existing = rows[activeKey];
    if (existing) {
      const { error } = await supabase.from("site_content")
        .update({ draft_value: parsed.value })
        .eq("key", activeKey);
      if (error) { onToast(error.message, "err"); setBusy(false); return; }
    } else {
      const { error } = await supabase.from("site_content")
        .insert({ key: activeKey, value: {}, draft_value: parsed.value });
      if (error) { onToast(error.message, "err"); setBusy(false); return; }
    }
    onToast("Rascunho salvo");
    setBusy(false);
    await load();
    setPreviewKey((k) => k + 1);
  };

  const publish = async () => {
    if (!parsed.ok) { onToast("JSON inválido", "err"); return; }
    if (!confirm("Publicar esta seção? O conteúdo ficará visível no site público.")) return;
    setBusy(true);
    const { error } = await supabase.from("site_content")
      .update({ value: parsed.value, draft_value: null })
      .eq("key", activeKey);
    if (error) {
      // tenta upsert se a linha não existir
      const { error: e2 } = await supabase.from("site_content")
        .insert({ key: activeKey, value: parsed.value });
      if (e2) { onToast(e2.message, "err"); setBusy(false); return; }
    }
    onToast("Seção publicada!");
    setBusy(false);
    await load();
    setPreviewKey((k) => k + 1);
  };

  const discardDraft = async () => {
    if (!confirm("Descartar alterações não publicadas?")) return;
    await supabase.from("site_content").update({ draft_value: null }).eq("key", activeKey);
    onToast("Rascunho descartado");
    await load();
    setPreviewKey((k) => k + 1);
  };

  const uploadImage = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `${activeKey}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("site-media").upload(path, file, {
      cacheControl: "3600", upsert: false,
    });
    if (error) { onToast(error.message, "err"); return null; }
    const { data } = supabase.storage.from("site-media").getPublicUrl(path);
    return data.publicUrl;
  };

  const onUploadInsert = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const url = await uploadImage(f);
    if (url) {
      // Copia URL pra clipboard e mostra
      try { await navigator.clipboard.writeText(url); } catch {}
      onToast("Imagem enviada — URL copiada");
      // Insere no JSON onde estiver o cursor não é trivial; mostra a URL pro usuário colar
      alert(`URL da imagem (já copiada):\n\n${url}`);
    }
  };

  const hasDraft = !!rows[activeKey]?.draft_value;

  if (loading) return <Card><div style={{ padding: 24, color: "#666" }}>Carregando conteúdo...</div></Card>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 16 }}>
      {/* EDITOR */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Editor de seções</h2>
          {hasDraft && <span style={badgeDraft}>Rascunho não publicado</span>}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {SECTION_DEFS.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveKey(s.key)}
              style={{
                ...sectionTab,
                background: activeKey === s.key ? "#111" : "#f3f4f6",
                color: activeKey === s.key ? "white" : "#333",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 8, display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ ...ghostBtn, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <input type="file" accept="image/*,video/*" onChange={onUploadInsert} style={{ display: "none" }} />
            📤 Upload de imagem/vídeo
          </label>
          <span style={{ fontSize: 11, color: "#888" }}>
            A URL é copiada — cole no campo desejado do JSON.
          </span>
        </div>

        <textarea
          value={draftJson}
          onChange={(e) => setDraftJson(e.target.value)}
          spellCheck={false}
          style={{
            width: "100%", minHeight: 480, fontFamily: "ui-monospace, Menlo, monospace",
            fontSize: 12, padding: 12, borderRadius: 8, border: "1px solid #d1d5db",
            background: "#0a0a0a", color: "#e5e5e5", resize: "vertical", outline: "none",
          }}
        />
        {!parsed.ok && (
          <div style={{ color: "#dc2626", fontSize: 12, marginTop: 6 }}>JSON inválido: {parsed.error}</div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <button onClick={saveDraft} disabled={busy || !parsed.ok} style={ghostBtn}>
            Salvar rascunho
          </button>
          {hasDraft && (
            <button onClick={discardDraft} disabled={busy} style={ghostBtn}>
              Descartar rascunho
            </button>
          )}
          <button onClick={publish} disabled={busy || !parsed.ok} style={primaryBtn}>
            Publicar
          </button>
        </div>
      </Card>

      {/* PREVIEW */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Preview ao vivo (rascunho)</h2>
          <button onClick={() => setPreviewKey((k) => k + 1)} style={ghostBtn}>↻ Atualizar</button>
        </div>
        <div style={{
          height: 600, border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", background: "#000",
        }}>
          <iframe
            key={previewKey}
            src="/admin/preview"
            title="Preview"
            style={{ width: "100%", height: "100%", border: 0 }}
          />
        </div>
        <p style={{ fontSize: 11, color: "#888", marginTop: 8 }}>
          O preview mostra o site com os rascunhos aplicados. Visitantes ainda veem a versão publicada.
        </p>
      </Card>
    </div>
  );
}

/* ============================================================
   TAB: Páginas extras (slug, título, conteúdo, publicar)
============================================================ */

function PagesTab({ onToast }: { onToast: (m: string, k?: "ok" | "err") => void }) {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PageRow | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("pages").select("*").order("created_at", { ascending: false });
    if (data) setPages(data as PageRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onDelete = async (p: PageRow) => {
    if (!confirm(`Remover a página "${p.title || p.slug}"?`)) return;
    const { error } = await supabase.from("pages").delete().eq("id", p.id);
    if (error) onToast(error.message, "err");
    else { onToast("Página removida"); load(); }
  };

  if (loading) return <Card><div style={{ padding: 24, color: "#666" }}>Carregando páginas...</div></Card>;

  return (
    <>
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Páginas extras</h2>
            <p style={{ fontSize: 13, color: "#666" }}>Crie páginas adicionais com URL própria (ex: /p/promocoes).</p>
          </div>
          <button onClick={() => setCreating(true)} style={primaryBtn}>+ Nova Página</button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa", borderBottom: "1px solid #e5e7eb" }}>
                <th style={th}>Título</th>
                <th style={th}>URL</th>
                <th style={th}>Status</th>
                <th style={{ ...th, textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={td}>{p.title || <em style={{ color: "#999" }}>sem título</em>}</td>
                  <td style={td}>
                    <a href={`/p/${p.slug}`} target="_blank" rel="noreferrer" style={{ color: "#0066cc" }}>/p/{p.slug}</a>
                  </td>
                  <td style={td}>
                    <span style={{
                      padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                      background: p.is_published ? "#dcfce7" : "#fef3c7",
                      color: p.is_published ? "#15803d" : "#92400e",
                    }}>
                      {p.is_published ? "Publicada" : "Rascunho"}
                    </span>
                  </td>
                  <td style={{ ...td, textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 6 }}>
                      <button onClick={() => setEditing(p)} style={smallBtn}>Editar</button>
                      <button onClick={() => onDelete(p)} style={{ ...smallBtn, background: "#fee2e2", color: "#b91c1c" }}>Remover</button>
                    </div>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr><td colSpan={4} style={{ padding: 24, textAlign: "center", color: "#999" }}>Nenhuma página criada ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {creating && (
        <PageEditor
          page={null}
          onClose={() => setCreating(false)}
          onSaved={() => { setCreating(false); load(); onToast("Página criada"); }}
          onError={(m) => onToast(m, "err")}
        />
      )}
      {editing && (
        <PageEditor
          page={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); onToast("Página salva"); }}
          onError={(m) => onToast(m, "err")}
        />
      )}
    </>
  );
}

function PageEditor({ page, onClose, onSaved, onError }: {
  page: PageRow | null;
  onClose: () => void;
  onSaved: () => void;
  onError: (m: string) => void;
}) {
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [title, setTitle] = useState(page?.title ?? "");
  const initialDraft = page?.draft && Object.keys(page.draft).length > 0 ? page.draft : (page?.published ?? { sections: [{ heading: "", text: "", image: "" }] });
  const [draftJson, setDraftJson] = useState(JSON.stringify(initialDraft, null, 2));
  const [busy, setBusy] = useState(false);

  const parsed = useMemo(() => {
    try { return { ok: true as const, value: JSON.parse(draftJson) }; }
    catch (e: any) { return { ok: false as const, error: e.message }; }
  }, [draftJson]);

  const save = async (publish: boolean) => {
    if (!slug.match(/^[a-z0-9-]+$/)) { onError("Slug deve conter apenas letras minúsculas, números e hífens"); return; }
    if (!parsed.ok) { onError("JSON inválido"); return; }
    setBusy(true);
    const payload: any = {
      slug, title, draft: parsed.value,
    };
    if (publish) {
      payload.published = parsed.value;
      payload.is_published = true;
    }
    if (page) {
      const { error } = await supabase.from("pages").update(payload).eq("id", page.id);
      if (error) { onError(error.message); setBusy(false); return; }
    } else {
      const { error } = await supabase.from("pages").insert(payload);
      if (error) { onError(error.message); setBusy(false); return; }
    }
    setBusy(false);
    onSaved();
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.55)",
      display: "grid", placeItems: "center", zIndex: 50, padding: 16,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "white", borderRadius: 12, padding: 24, width: "100%", maxWidth: 720, maxHeight: "90vh", overflowY: "auto",
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
          {page ? `Editar página` : "Nova página"}
        </h3>

        <Field label="Título">
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={modalInput} placeholder="Ex: Promoções de Outono" />
        </Field>
        <Field label="Slug (URL)">
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "#666", fontSize: 13 }}>/p/</span>
            <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} style={modalInput} placeholder="promocoes" />
          </div>
        </Field>
        <Field label="Conteúdo (JSON — array de seções)">
          <textarea
            value={draftJson}
            onChange={(e) => setDraftJson(e.target.value)}
            spellCheck={false}
            style={{
              width: "100%", minHeight: 280, fontFamily: "ui-monospace, Menlo, monospace",
              fontSize: 12, padding: 10, borderRadius: 8, border: "1px solid #d1d5db",
              background: "#0a0a0a", color: "#e5e5e5", outline: "none",
            }}
          />
        </Field>
        {!parsed.ok && <div style={{ color: "#dc2626", fontSize: 12 }}>JSON inválido: {parsed.error}</div>}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16, flexWrap: "wrap" }}>
          <button onClick={onClose} style={ghostBtn}>Cancelar</button>
          <button onClick={() => save(false)} disabled={busy} style={ghostBtn}>Salvar rascunho</button>
          <button onClick={() => save(true)} disabled={busy} style={primaryBtn}>
            {page?.is_published ? "Atualizar publicação" : "Publicar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TAB: Usuários (apenas Dono)
============================================================ */

function UsersTab({ currentUserId, onToast }: { currentUserId: string; onToast: (m: string, k?: "ok" | "err") => void }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("id, email").order("email");
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    if (profiles && roles) {
      const merged: UserRow[] = profiles.map((p: any) => {
        const userRoles = roles.filter((r: any) => r.user_id === p.id);
        const owner = userRoles.find((r: any) => r.role === "owner");
        return { id: p.id, email: p.email, role: owner ? "owner" : "admin" };
      });
      setUsers(merged);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onTransfer = async (targetId: string, targetEmail: string) => {
    if (!confirm(`Transferir a posse de Dono para ${targetEmail}?\n\nVocê será rebaixado para Administrador.`)) return;
    const { error } = await supabase.rpc("transfer_ownership", { _new_owner_id: targetId });
    if (error) onToast(error.message, "err");
    else { onToast("Posse transferida"); window.location.reload(); }
  };

  const onDelete = async (targetId: string, targetEmail: string) => {
    if (!confirm(`Remover ${targetEmail} permanentemente?`)) return;
    const { error } = await supabase.rpc("delete_admin_user", { _target_id: targetId });
    if (error) onToast(error.message, "err");
    else { onToast("Usuário removido"); load(); }
  };

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Usuários do Painel</h2>
          <p style={{ fontSize: 13, color: "#666" }}>Gerencie administradores e a posse do painel.</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={primaryBtn}>+ Novo Administrador</button>
      </div>

      {loading ? (
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
                      padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                      background: u.role === "owner" ? "#fee2e2" : "#dbeafe",
                      color: u.role === "owner" ? "#b91c1c" : "#1d4ed8",
                    }}>
                      {u.role === "owner" ? "Dono" : "Administrador"}
                    </span>
                  </td>
                  <td style={{ ...td, textAlign: "right" }}>
                    {u.id === currentUserId ? (
                      <span style={{ color: "#999", fontSize: 12 }}>(você)</span>
                    ) : u.role === "owner" ? (
                      <span style={{ color: "#999", fontSize: 12 }}>—</span>
                    ) : (
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <button onClick={() => setEditingUser(u)} style={smallBtn}>Editar</button>
                        <button onClick={() => onTransfer(u.id, u.email)} style={{ ...smallBtn, background: "#fef3c7", color: "#92400e" }}>Tornar Dono</button>
                        <button onClick={() => onDelete(u.id, u.email)} style={{ ...smallBtn, background: "#fee2e2", color: "#b91c1c" }}>Remover</button>
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

      {showCreate && (
        <CreateAdminModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); load(); onToast("Administrador criado"); }}
          onError={(m) => onToast(m, "err")}
        />
      )}
      {editingUser && (
        <EditAdminModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={() => { setEditingUser(null); load(); onToast("Cadastro atualizado"); }}
          onError={(m) => onToast(m, "err")}
        />
      )}
    </Card>
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
    const { data, error } = await supabase.functions.invoke("create-admin", { body: { email, password } });
    setBusy(false);
    if (error || (data && data.error)) {
      onError((data?.error as string) || error?.message || "Erro ao criar"); return;
    }
    onCreated();
  };
  return (
    <Modal onClose={onClose} title="Novo Administrador">
      <form onSubmit={submit}>
        <Field label="E-mail"><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={modalInput} /></Field>
        <Field label="Senha (mín. 6)"><input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} style={modalInput} /></Field>
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
    if (Object.keys(body).length === 1) { setBusy(false); onError("Nada para atualizar"); return; }
    const { data, error } = await supabase.functions.invoke("update-admin", { body });
    setBusy(false);
    if (error || (data && data.error)) { onError((data?.error as string) || error?.message || "Erro ao salvar"); return; }
    onSaved();
  };
  return (
    <Modal onClose={onClose} title={`Editar: ${user.email}`}>
      <form onSubmit={submit}>
        <Field label="E-mail"><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={modalInput} /></Field>
        <Field label="Nova senha (vazio = manter)"><input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} style={modalInput} placeholder="••••••••" /></Field>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
          <button type="button" onClick={onClose} style={ghostBtn}>Cancelar</button>
          <button type="submit" disabled={busy} style={primaryBtn}>{busy ? "Salvando..." : "Salvar"}</button>
        </div>
      </form>
    </Modal>
  );
}

/* ============================================================
   Helpers de UI
============================================================ */

function Card({ children }: { children: React.ReactNode }) {
  return <section style={card}>{children}</section>;
}
function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "grid", placeItems: "center", zIndex: 60, padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 12, padding: 24, width: "100%", maxWidth: 420 }}>
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
  return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#666" }}>{children}</div>;
}
function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      background: "transparent", border: "none", padding: "14px 18px", fontSize: 14, cursor: "pointer",
      borderBottom: active ? "2px solid #dc2626" : "2px solid transparent",
      color: active ? "#111" : "#666", fontWeight: active ? 600 : 500,
    }}>{children}</button>
  );
}

const card: React.CSSProperties = { background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, marginBottom: 16 };
const th: React.CSSProperties = { textAlign: "left", padding: "10px 12px", fontSize: 12, color: "#666", fontWeight: 600 };
const td: React.CSSProperties = { padding: "12px", fontSize: 14 };
const primaryBtn: React.CSSProperties = { padding: "8px 14px", borderRadius: 8, border: "none", background: "#dc2626", color: "white", fontWeight: 600, fontSize: 13, cursor: "pointer" };
const ghostBtn: React.CSSProperties = { padding: "8px 14px", borderRadius: 8, border: "1px solid #e5e7eb", background: "white", color: "#333", fontSize: 13, cursor: "pointer", textDecoration: "none", display: "inline-block" };
const smallBtn: React.CSSProperties = { padding: "5px 10px", borderRadius: 6, border: "none", background: "#f3f4f6", color: "#333", fontSize: 12, cursor: "pointer", fontWeight: 500 };
const modalInput: React.CSSProperties = { width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 14, outline: "none" };
const sectionTab: React.CSSProperties = { padding: "6px 12px", borderRadius: 999, border: "none", fontSize: 12, fontWeight: 500, cursor: "pointer" };
const badgeDraft: React.CSSProperties = { background: "#fef3c7", color: "#92400e", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600 };
