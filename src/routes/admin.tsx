import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SECTION_EDITORS } from "@/components/admin/SectionEditors";
import { FormField, TextInput, TextArea, Section, ItemCard, AddBtn, PrimaryBtn, GhostBtn } from "@/components/admin/FormUI";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { InstagramTab } from "@/components/admin/InstagramTab";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel Administrativo" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

type Tab = "content" | "pages" | "instagram" | "users";
type ContentRow = { key: string; value: any; draft_value: any | null };
type PageRow = { id: string; slug: string; title: string; draft: any; published: any; is_published: boolean };
type UserRow = { id: string; email: string; role: "owner" | "admin" };

function AdminPage() {
  const navigate = useNavigate();
  const { user, loading, isOwner, isAdmin } = useAuth();
  const [tab, setTab] = useState<Tab>("content");
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "err" } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  if (loading) return <Center>Carregando...</Center>;
  if (!user) return <Center>Redirecionando...</Center>;
  if (!isAdmin) return <Center>Acesso negado.</Center>;

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", display: "flex", fontFamily: "Inter, system-ui, sans-serif", color: "#111" }}>
      {/* SIDEBAR */}
      <aside style={{
        width: sidebarOpen ? 240 : 60,
        background: "#0f0f0f",
        color: "white",
        transition: "width .25s",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
      }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid #1f1f1f", display: "flex", alignItems: "center", gap: 10 }}>
          {sidebarOpen && (
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600 }}>La Gravata</div>
              <div style={{ fontSize: 11, opacity: 0.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>Painel</div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={sidebarToggle} title="Recolher menu">
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>

        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          <SidebarItem icon="✏️" label="Conteúdo do site" active={tab === "content"} collapsed={!sidebarOpen} onClick={() => setTab("content")} />
          <SidebarItem icon="📸" label="Instagram" active={tab === "instagram"} collapsed={!sidebarOpen} onClick={() => setTab("instagram")} />
          <SidebarItem icon="📄" label="Páginas extras" active={tab === "pages"} collapsed={!sidebarOpen} onClick={() => setTab("pages")} />
          {isOwner && <SidebarItem icon="👥" label="Usuários" active={tab === "users"} collapsed={!sidebarOpen} onClick={() => setTab("users")} />}
        </nav>

        <div style={{ padding: 12, borderTop: "1px solid #1f1f1f" }}>
          {sidebarOpen && (
            <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 8, padding: "0 6px" }}>
              {user.email}<br />
              <span style={{ color: isOwner ? "#fca5a5" : "#93c5fd", fontWeight: 600 }}>{isOwner ? "Dono" : "Administrador"}</span>
            </div>
          )}
          <Link to="/" style={{ ...sidebarBtn, display: "block", textDecoration: "none", marginBottom: 4 }}>
            {sidebarOpen ? "👁️  Ver site" : "👁️"}
          </Link>
          <button onClick={onLogout} style={sidebarBtn}>{sidebarOpen ? "🚪  Sair" : "🚪"}</button>
        </div>
      </aside>

      {/* MAIN */}
      <main key={tab} style={{ flex: 1, minWidth: 0, animation: "adminFadeUp .35s ease both" }}>
        {tab === "content" && <ContentTab onToast={showToast} />}
        {tab === "instagram" && <InstagramTab onToast={showToast} />}
        {tab === "pages" && <PagesTab onToast={showToast} />}
        {tab === "users" && isOwner && <UsersTab currentUserId={user.id} onToast={showToast} />}
      </main>

      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24,
          background: toast.kind === "ok" ? "#16a34a" : "#dc2626",
          color: "white", padding: "12px 20px", borderRadius: 10, fontSize: 14,
          boxShadow: "0 10px 30px rgba(0,0,0,.25)", zIndex: 1000, fontWeight: 500,
        }}>{toast.msg}</div>
      )}
    </div>
  );
}

/* ============================================================
   CONTENT TAB
============================================================ */
function ContentTab({ onToast }: { onToast: (m: string, k?: "ok" | "err") => void }) {
  const [rows, setRows] = useState<Record<string, ContentRow>>({});
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState<string>("hero");
  const [editValue, setEditValue] = useState<any>({});
  const [originalValue, setOriginalValue] = useState<any>({});
  const [busy, setBusy] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [showPreview, setShowPreview] = useState(true);

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

  useEffect(() => {
    const r = rows[activeKey];
    const v = r ? (r.draft_value ?? r.value) : {};
    setEditValue(v);
    setOriginalValue(v);
  }, [activeKey, rows]);

  const dirty = JSON.stringify(editValue) !== JSON.stringify(originalValue);

  const saveDraft = async () => {
    setBusy(true);
    const existing = rows[activeKey];
    if (existing) {
      const { error } = await supabase.from("site_content").update({ draft_value: editValue }).eq("key", activeKey);
      if (error) { onToast(error.message, "err"); setBusy(false); return; }
    } else {
      const { error } = await supabase.from("site_content").insert({ key: activeKey, value: {}, draft_value: editValue });
      if (error) { onToast(error.message, "err"); setBusy(false); return; }
    }
    onToast("Rascunho salvo — veja no preview");
    setBusy(false);
    await load();
    setPreviewKey((k) => k + 1);
  };

  const publish = async () => {
    if (!confirm("Publicar esta seção? O conteúdo ficará visível no site público.")) return;
    setBusy(true);
    const existing = rows[activeKey];
    if (existing) {
      const { error } = await supabase.from("site_content").update({ value: editValue, draft_value: null }).eq("key", activeKey);
      if (error) { onToast(error.message, "err"); setBusy(false); return; }
    } else {
      const { error } = await supabase.from("site_content").insert({ key: activeKey, value: editValue });
      if (error) { onToast(error.message, "err"); setBusy(false); return; }
    }
    onToast("Publicado! Já está no ar 🎉");
    setBusy(false);
    await load();
    setPreviewKey((k) => k + 1);
  };

  const discardDraft = async () => {
    if (!confirm("Descartar todas as alterações não publicadas desta seção?")) return;
    await supabase.from("site_content").update({ draft_value: null }).eq("key", activeKey);
    onToast("Rascunho descartado");
    await load();
    setPreviewKey((k) => k + 1);
  };

  if (loading) return <PageWrap><Loading /></PageWrap>;

  const hasDraft = !!rows[activeKey]?.draft_value;
  const Editor = SECTION_EDITORS[activeKey]?.component;

  return (
    <PageWrap>
      <PageHeader
        title="Conteúdo do site"
        description="Edite os textos e imagens de cada seção da home. Clique em PUBLICAR quando estiver pronto."
      />

      {/* Section pills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {Object.entries(SECTION_EDITORS).map(([key, def]) => {
          const isActive = activeKey === key;
          const isDraft = !!rows[key]?.draft_value;
          return (
            <button
              key={key}
              onClick={() => setActiveKey(key)}
              style={{
                padding: "10px 16px", borderRadius: 999, border: isActive ? "2px solid #111" : "2px solid transparent",
                background: isActive ? "#111" : "white",
                color: isActive ? "white" : "#374151",
                cursor: "pointer", fontSize: 13, fontWeight: 500,
                display: "inline-flex", alignItems: "center", gap: 8, position: "relative",
              }}
            >
              <span>{def.icon}</span>
              <span>{def.label}</span>
              {isDraft && (
                <span style={{ width: 8, height: 8, background: "#f59e0b", borderRadius: "50%", display: "inline-block" }} title="Tem rascunho não publicado" />
              )}
            </button>
          );
        })}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: showPreview ? "minmax(0, 1.1fr) minmax(0, 1fr)" : "minmax(0, 1fr)",
        gap: 16,
      }}>
        {/* EDITOR PANEL */}
        <div>
          {Editor ? (
            <Editor value={editValue} onChange={setEditValue} />
          ) : (
            <Section title="Sem editor"><p>Editor não disponível para esta seção.</p></Section>
          )}

          {/* Action bar */}
          <div style={{
            position: "sticky", bottom: 16, marginTop: 12,
            background: "white", border: "1px solid #e5e7eb", borderRadius: 12,
            padding: 14, boxShadow: "0 8px 24px rgba(0,0,0,.06)",
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap",
          }}>
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              {hasDraft && <span style={{ color: "#92400e", fontWeight: 600 }}>● Rascunho não publicado</span>}
              {!hasDraft && !dirty && <span>Sem alterações pendentes</span>}
              {dirty && !hasDraft && <span style={{ color: "#92400e", fontWeight: 600 }}>● Alterações não salvas</span>}
              {dirty && hasDraft && <span style={{ color: "#92400e", fontWeight: 600 }}>● Alterações não salvas</span>}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {hasDraft && <GhostBtn onClick={discardDraft} disabled={busy}>Descartar rascunho</GhostBtn>}
              <GhostBtn onClick={saveDraft} disabled={busy || !dirty}>💾 Salvar rascunho</GhostBtn>
              <PrimaryBtn onClick={publish} disabled={busy}>🚀 Publicar agora</PrimaryBtn>
            </div>
          </div>
        </div>

        {/* PREVIEW PANEL */}
        {showPreview && (
          <div style={{ position: "sticky", top: 16, alignSelf: "flex-start", height: "calc(100vh - 32px)" }}>
            <div style={{
              background: "white", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden",
              height: "100%", display: "flex", flexDirection: "column",
            }}>
              <div style={{
                padding: "10px 14px", borderBottom: "1px solid #e5e7eb",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "#fafafa",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Preview (rascunhos)</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setPreviewKey((k) => k + 1)} style={iconBtn} title="Atualizar">↻</button>
                  <button onClick={() => setShowPreview(false)} style={iconBtn} title="Esconder">✕</button>
                </div>
              </div>
              <iframe
                key={previewKey}
                src="/admin/preview"
                title="Preview"
                style={{ flex: 1, width: "100%", border: 0, background: "#000" }}
              />
            </div>
          </div>
        )}
      </div>

      {!showPreview && (
        <button onClick={() => setShowPreview(true)} style={{
          position: "fixed", right: 24, bottom: 90, background: "#111", color: "white",
          padding: "10px 16px", borderRadius: 999, border: "none", cursor: "pointer",
          fontSize: 13, fontWeight: 600, boxShadow: "0 8px 20px rgba(0,0,0,.2)", zIndex: 100,
        }}>👁 Mostrar preview</button>
      )}
    </PageWrap>
  );
}

/* ============================================================
   PAGES TAB
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

  const togglePublish = async (p: PageRow) => {
    const { error } = await supabase.from("pages").update({ is_published: !p.is_published }).eq("id", p.id);
    if (error) onToast(error.message, "err");
    else { onToast(p.is_published ? "Página despublicada" : "Página publicada"); load(); }
  };

  if (loading) return <PageWrap><Loading /></PageWrap>;

  return (
    <PageWrap>
      <PageHeader
        title="Páginas extras"
        description="Crie páginas adicionais com URL própria, como /p/promocoes ou /p/contato-corporativo."
      />

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <PrimaryBtn onClick={() => setCreating(true)}>+ Nova página</PrimaryBtn>
      </div>

      {pages.length === 0 ? (
        <div style={{
          background: "white", border: "2px dashed #e5e7eb", borderRadius: 12,
          padding: 60, textAlign: "center", color: "#9ca3af",
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
          <p style={{ fontSize: 15, marginBottom: 4 }}>Nenhuma página criada ainda.</p>
          <p style={{ fontSize: 13 }}>Clique em "Nova página" para começar.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {pages.map((p) => (
            <div key={p.id} style={{
              background: "white", border: "1px solid #e5e7eb", borderRadius: 10,
              padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
            }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{p.title || <em style={{ color: "#999" }}>sem título</em>}</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                  <a href={`/p/${p.slug}`} target="_blank" rel="noreferrer" style={{ color: "#0066cc" }}>/p/{p.slug}</a>
                  {" · "}
                  <span style={{
                    padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                    background: p.is_published ? "#dcfce7" : "#fef3c7",
                    color: p.is_published ? "#15803d" : "#92400e",
                  }}>{p.is_published ? "Publicada" : "Rascunho"}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <GhostBtn onClick={() => togglePublish(p)}>{p.is_published ? "Despublicar" : "Publicar"}</GhostBtn>
                <GhostBtn onClick={() => setEditing(p)}>✏️ Editar</GhostBtn>
                <button onClick={() => onDelete(p)} style={{
                  padding: "9px 14px", borderRadius: 8, border: "1px solid #fecaca",
                  background: "#fef2f2", color: "#b91c1c", fontSize: 14, cursor: "pointer", fontWeight: 500,
                }}>Remover</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {creating && <PageEditor page={null} onClose={() => setCreating(false)} onSaved={() => { setCreating(false); load(); onToast("Página criada"); }} onError={(m) => onToast(m, "err")} />}
      {editing && <PageEditor page={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); onToast("Página salva"); }} onError={(m) => onToast(m, "err")} />}
    </PageWrap>
  );
}

function PageEditor({ page, onClose, onSaved, onError }: {
  page: PageRow | null; onClose: () => void; onSaved: () => void; onError: (m: string) => void;
}) {
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [title, setTitle] = useState(page?.title ?? "");
  const initialSections = (page?.draft?.sections && page.draft.sections.length > 0
    ? page.draft.sections
    : page?.published?.sections && page.published.sections.length > 0
      ? page.published.sections
      : [{ heading: "", text: "", image: "" }]) as Array<{ heading?: string; text?: string; image?: string }>;
  const [sections, setSections] = useState(initialSections);
  const [busy, setBusy] = useState(false);

  const updateSection = (i: number, patch: any) => setSections(sections.map((s, ix) => ix === i ? { ...s, ...patch } : s));

  const save = async (publish: boolean) => {
    if (!slug.match(/^[a-z0-9-]+$/)) { onError("Slug deve conter apenas letras minúsculas, números e hífens"); return; }
    setBusy(true);
    const payload: any = { slug, title, draft: { sections } };
    if (publish) { payload.published = { sections }; payload.is_published = true; }
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
      position: "fixed", inset: 0, background: "rgba(0,0,0,.6)",
      display: "grid", placeItems: "center", zIndex: 100, padding: 16, overflowY: "auto",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#f9fafb", borderRadius: 14, width: "100%", maxWidth: 760,
        maxHeight: "92vh", display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", background: "white", borderRadius: "14px 14px 0 0" }}>
          <h3 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{page ? "Editar página" : "Nova página"}</h3>
        </div>

        <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>
          <Section title="Configurações da página">
            <FormField label="Título da página"><TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Promoções de Outono" /></FormField>
            <FormField label="URL da página" hint="Apenas letras minúsculas, números e hífens.">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#6b7280", fontSize: 14 }}>seusite.com/p/</span>
                <TextInput value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="promocoes" />
              </div>
            </FormField>
          </Section>

          <Section title="Seções da página" description="Cada seção tem uma imagem opcional, um título e um texto.">
            {sections.map((s, i) => (
              <ItemCard
                key={i} index={i} title={s.heading || `Seção ${i + 1}`}
                onRemove={() => setSections(sections.filter((_, ix) => ix !== i))}
                onMoveUp={() => { const next = [...sections]; [next[i - 1], next[i]] = [next[i], next[i - 1]]; setSections(next); }}
                onMoveDown={() => { const next = [...sections]; [next[i + 1], next[i]] = [next[i], next[i + 1]]; setSections(next); }}
                canMoveUp={i > 0} canMoveDown={i < sections.length - 1}
              >
                <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 14 }}>
                  <MediaUploader folder="pages" value={s.image ?? ""} onChange={(url) => updateSection(i, { image: url })} aspect="square" />
                  <div>
                    <FormField label="Título da seção"><TextInput value={s.heading ?? ""} onChange={(e) => updateSection(i, { heading: e.target.value })} /></FormField>
                    <FormField label="Texto"><TextArea value={s.text ?? ""} onChange={(e) => updateSection(i, { text: e.target.value })} rows={4} /></FormField>
                  </div>
                </div>
              </ItemCard>
            ))}
            <AddBtn onClick={() => setSections([...sections, { heading: "", text: "", image: "" }])}>+ Adicionar seção</AddBtn>
          </Section>
        </div>

        <div style={{
          padding: 16, borderTop: "1px solid #e5e7eb", background: "white", borderRadius: "0 0 14px 14px",
          display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap",
        }}>
          <GhostBtn onClick={onClose}>Cancelar</GhostBtn>
          <GhostBtn onClick={() => save(false)} disabled={busy}>Salvar rascunho</GhostBtn>
          <PrimaryBtn onClick={() => save(true)} disabled={busy}>
            🚀 {page?.is_published ? "Atualizar publicação" : "Publicar"}
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   USERS TAB
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
      setUsers(profiles.map((p: any) => {
        const userRoles = roles.filter((r: any) => r.user_id === p.id);
        const owner = userRoles.find((r: any) => r.role === "owner");
        return { id: p.id, email: p.email, role: owner ? "owner" : "admin" };
      }));
    }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const onTransfer = async (id: string, email: string) => {
    if (!confirm(`Transferir a posse de Dono para ${email}?\n\nVocê será rebaixado para Administrador.`)) return;
    const { error } = await supabase.rpc("transfer_ownership", { _new_owner_id: id });
    if (error) onToast(error.message, "err");
    else { onToast("Posse transferida"); window.location.reload(); }
  };

  const onDelete = async (id: string, email: string) => {
    if (!confirm(`Remover ${email} permanentemente?`)) return;
    const { error } = await supabase.rpc("delete_admin_user", { _target_id: id });
    if (error) onToast(error.message, "err");
    else { onToast("Usuário removido"); load(); }
  };

  return (
    <PageWrap>
      <PageHeader title="Usuários do painel" description="Crie administradores e gerencie quem tem acesso ao painel." />

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <PrimaryBtn onClick={() => setShowCreate(true)}>+ Novo administrador</PrimaryBtn>
      </div>

      {loading ? <Loading /> : (
        <div style={{ display: "grid", gap: 10 }}>
          {users.map((u) => (
            <div key={u.id} style={{
              background: "white", border: "1px solid #e5e7eb", borderRadius: 10,
              padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: u.role === "owner" ? "#fee2e2" : "#dbeafe",
                  color: u.role === "owner" ? "#b91c1c" : "#1d4ed8",
                  display: "grid", placeItems: "center", fontWeight: 600, fontSize: 16,
                }}>{u.email.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{u.email}{u.id === currentUserId && <span style={{ color: "#9ca3af", marginLeft: 6 }}>(você)</span>}</div>
                  <div style={{ fontSize: 12, color: u.role === "owner" ? "#b91c1c" : "#1d4ed8", fontWeight: 600 }}>
                    {u.role === "owner" ? "👑 Dono" : "Administrador"}
                  </div>
                </div>
              </div>
              {u.id !== currentUserId && u.role !== "owner" && (
                <div style={{ display: "flex", gap: 6 }}>
                  <GhostBtn onClick={() => setEditingUser(u)}>✏️ Editar</GhostBtn>
                  <button onClick={() => onTransfer(u.id, u.email)} style={{
                    padding: "9px 14px", borderRadius: 8, border: "1px solid #fde68a", background: "#fef3c7", color: "#92400e", fontSize: 14, cursor: "pointer", fontWeight: 500,
                  }}>👑 Tornar Dono</button>
                  <button onClick={() => onDelete(u.id, u.email)} style={{
                    padding: "9px 14px", borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c", fontSize: 14, cursor: "pointer", fontWeight: 500,
                  }}>Remover</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreateAdminModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); onToast("Administrador criado"); }} onError={(m) => onToast(m, "err")} />}
      {editingUser && <EditAdminModal user={editingUser} onClose={() => setEditingUser(null)} onSaved={() => { setEditingUser(null); load(); onToast("Cadastro atualizado"); }} onError={(m) => onToast(m, "err")} />}
    </PageWrap>
  );
}

function CreateAdminModal({ onClose, onCreated, onError }: { onClose: () => void; onCreated: () => void; onError: (m: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("create-admin", { body: { email, password } });
    setBusy(false);
    if (error || (data && data.error)) { onError((data?.error as string) || error?.message || "Erro ao criar"); return; }
    onCreated();
  };
  return (
    <SimpleModal onClose={onClose} title="Novo Administrador">
      <form onSubmit={submit}>
        <FormField label="E-mail"><TextInput type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></FormField>
        <FormField label="Senha (mín. 6 caracteres)"><TextInput type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></FormField>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <GhostBtn type="button" onClick={onClose}>Cancelar</GhostBtn>
          <PrimaryBtn type="submit" disabled={busy}>{busy ? "Criando..." : "Criar"}</PrimaryBtn>
        </div>
      </form>
    </SimpleModal>
  );
}

function EditAdminModal({ user, onClose, onSaved, onError }: { user: UserRow; onClose: () => void; onSaved: () => void; onError: (m: string) => void }) {
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
    <SimpleModal onClose={onClose} title={`Editar: ${user.email}`}>
      <form onSubmit={submit}>
        <FormField label="E-mail"><TextInput type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></FormField>
        <FormField label="Nova senha" hint="Deixe em branco para manter a senha atual.">
          <TextInput type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </FormField>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <GhostBtn type="button" onClick={onClose}>Cancelar</GhostBtn>
          <PrimaryBtn type="submit" disabled={busy}>{busy ? "Salvando..." : "Salvar"}</PrimaryBtn>
        </div>
      </form>
    </SimpleModal>
  );
}

/* ============================================================
   Helpers
============================================================ */
function PageWrap({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: "32px 32px 80px", maxWidth: 1400, margin: "0 auto" }}>{children}</div>;
}
function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, margin: 0, color: "#111" }}>{title}</h1>
      {description && <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0 0", maxWidth: 720 }}>{description}</p>}
    </div>
  );
}
function SimpleModal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "grid", placeItems: "center", zIndex: 100, padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 14, padding: 24, width: "100%", maxWidth: 460 }}>
        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 18, fontFamily: "'Playfair Display', serif" }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}
function Center({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#6b7280" }}>{children}</div>;
}
function Loading() {
  return <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Carregando...</div>;
}
function SidebarItem({ icon, label, active, collapsed, onClick }: { icon: string; label: string; active: boolean; collapsed: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
      borderRadius: 8, border: "none",
      background: active ? "#dc2626" : "transparent",
      color: active ? "white" : "rgba(255,255,255,0.75)",
      cursor: "pointer", fontSize: 14, fontWeight: active ? 600 : 500,
      width: "100%", textAlign: "left", transition: "background .15s",
    }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      {!collapsed && <span>{label}</span>}
    </button>
  );
}

const sidebarBtn: React.CSSProperties = {
  width: "100%", padding: "8px 12px", borderRadius: 8, border: "none",
  background: "transparent", color: "rgba(255,255,255,0.75)",
  fontSize: 13, cursor: "pointer", textAlign: "left", fontWeight: 500,
};
const sidebarToggle: React.CSSProperties = {
  width: 28, height: 28, padding: 0, borderRadius: 6,
  border: "1px solid rgba(255,255,255,0.15)", background: "transparent",
  color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 12,
};
const iconBtn: React.CSSProperties = {
  width: 28, height: 28, padding: 0, borderRadius: 6,
  border: "1px solid #e5e7eb", background: "white",
  color: "#374151", fontSize: 13, cursor: "pointer",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
};
