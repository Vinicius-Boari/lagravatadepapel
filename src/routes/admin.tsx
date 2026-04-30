import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SECTION_EDITORS } from "@/components/admin/SectionEditors";
import { FormField, TextInput, TextArea, Section, ItemCard, AddBtn, PrimaryBtn, GhostBtn, DangerBtn } from "@/components/admin/FormUI";
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

type Tab = "content" | "instagram_posts" | "pages" | "users";
type ContentRow = { key: string; value: any; draft_value: any | null };
type PageRow = { id: string; slug: string; title: string; draft: any; published: any; is_published: boolean };
type UserRow = { id: string; email: string; role: "owner" | "admin" };

const NAV_GROUPS: Array<{ label: string; items: Array<{ id: Tab; icon: string; label: string; ownerOnly?: boolean }> }> = [
  {
    label: "Conteúdo do site",
    items: [
      { id: "content", icon: "✎", label: "Seções da home" },
      { id: "instagram_posts", icon: "◉", label: "Posts do Instagram" },
      { id: "pages", icon: "▤", label: "Páginas extras" },
    ],
  },
  {
    label: "Acesso",
    items: [
      { id: "users", icon: "◆", label: "Usuários", ownerOnly: true },
    ],
  },
];

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

  if (loading) return <Center>Carregando…</Center>;
  if (!user) return <Center>Redirecionando…</Center>;
  if (!isAdmin) return <Center>Acesso negado.</Center>;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#000",
      display: "flex",
      fontFamily: "Inter, system-ui, sans-serif",
      color: "#fafafa",
    }}>
      {/* SIDEBAR */}
      <aside style={{
        width: sidebarOpen ? 250 : 64,
        background: "linear-gradient(180deg, #0a0a0a 0%, #050505 100%)",
        borderRight: "1px solid #1a1a1a",
        transition: "width .25s ease",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
        flexShrink: 0,
      }}>
        <div style={{
          padding: "22px 18px", borderBottom: "1px solid #161616",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          {sidebarOpen && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 600, color: "#fafafa", letterSpacing: "-0.01em" }}>La Gravata</div>
              <div style={{ fontSize: 10, color: "#dc2626", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, marginTop: 2 }}>Painel</div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={sidebarToggle} title="Recolher">
            {sidebarOpen ? "‹" : "›"}
          </button>
        </div>

        <nav style={{ flex: 1, padding: "16px 10px", overflowY: "auto" }}>
          {NAV_GROUPS.map((group) => {
            const items = group.items.filter((i) => !i.ownerOnly || isOwner);
            if (items.length === 0) return null;
            return (
              <div key={group.label} style={{ marginBottom: 18 }}>
                {sidebarOpen && (
                  <div style={{ fontSize: 10, color: "#555", padding: "0 10px 8px", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>
                    {group.label}
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {items.map((item) => (
                    <SidebarItem
                      key={item.id}
                      icon={item.icon}
                      label={item.label}
                      active={tab === item.id}
                      collapsed={!sidebarOpen}
                      onClick={() => setTab(item.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div style={{ padding: 12, borderTop: "1px solid #161616" }}>
          {sidebarOpen && (
            <div style={{
              fontSize: 11, color: "#888", marginBottom: 10, padding: "8px 10px",
              background: "#0d0d0d", borderRadius: 8, border: "1px solid #161616",
            }}>
              <div style={{ color: "#ccc", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
              <div style={{ color: isOwner ? "#dc2626" : "#888", fontWeight: 600, marginTop: 2, fontSize: 10, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {isOwner ? "Dono" : "Administrador"}
              </div>
            </div>
          )}
          <Link to="/" target="_blank" style={{ ...sidebarBtn, display: "block", textDecoration: "none", marginBottom: 4 }}>
            {sidebarOpen ? "↗  Ver site" : "↗"}
          </Link>
          <button onClick={onLogout} style={sidebarBtn}>{sidebarOpen ? "←  Sair" : "←"}</button>
        </div>
      </aside>

      {/* MAIN */}
      <main key={tab} style={{ flex: 1, minWidth: 0, animation: "adminFadeUp .3s ease both", overflowX: "hidden" }}>
        {tab === "content" && <ContentTab onToast={showToast} />}
        {tab === "instagram_posts" && <InstagramTab onToast={showToast} />}
        {tab === "pages" && <PagesTab onToast={showToast} />}
        {tab === "users" && isOwner && <UsersTab currentUserId={user.id} onToast={showToast} />}
      </main>

      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24,
          background: toast.kind === "ok" ? "linear-gradient(180deg, #ef4444 0%, #dc2626 100%)" : "#3a0a0a",
          color: "white", padding: "13px 22px", borderRadius: 10, fontSize: 13,
          boxShadow: "0 12px 32px rgba(220,38,38,.4)", zIndex: 1000, fontWeight: 600,
          border: toast.kind === "err" ? "1px solid #5a1a1a" : "none",
          letterSpacing: "0.01em",
        }}>{toast.msg}</div>
      )}
    </div>
  );
}

/* ============================================================
   CONTENT TAB — sem preview, navegação clara entre seções
============================================================ */
function ContentTab({ onToast }: { onToast: (m: string, k?: "ok" | "err") => void }) {
  const [rows, setRows] = useState<Record<string, ContentRow>>({});
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState<string>("hero");
  const [editValue, setEditValue] = useState<any>({});
  const [originalValue, setOriginalValue] = useState<any>({});
  const [busy, setBusy] = useState(false);

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
    onToast("Rascunho salvo");
    setBusy(false);
    await load();
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
    onToast("Publicado no ar");
    setBusy(false);
    await load();
  };

  const discardDraft = async () => {
    if (!confirm("Descartar todas as alterações não publicadas desta seção?")) return;
    await supabase.from("site_content").update({ draft_value: null }).eq("key", activeKey);
    onToast("Rascunho descartado");
    await load();
  };

  if (loading) return <PageWrap><Loading /></PageWrap>;

  const hasDraft = !!rows[activeKey]?.draft_value;
  const Editor = SECTION_EDITORS[activeKey]?.component;
  const activeDef = SECTION_EDITORS[activeKey];

  return (
    <PageWrap>
      <PageHeader
        title="Conteúdo do site"
        description="Cada item abaixo corresponde a uma seção real da home. Selecione, edite e publique."
      />

      {/* Section selector — vertical-ish on top */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
        gap: 8,
        marginBottom: 24,
      }}>
        {Object.entries(SECTION_EDITORS).map(([key, def]) => {
          const isActive = activeKey === key;
          const isDraft = !!rows[key]?.draft_value;
          return (
            <button
              key={key}
              onClick={() => setActiveKey(key)}
              style={{
                padding: "14px 14px",
                borderRadius: 11,
                border: isActive ? "1px solid #dc2626" : "1px solid #1f1f1f",
                background: isActive
                  ? "linear-gradient(180deg, #1a0808 0%, #0d0303 100%)"
                  : "#0a0a0a",
                color: isActive ? "#fff" : "#bbb",
                cursor: "pointer",
                textAlign: "left",
                transition: "all .15s",
                position: "relative",
                boxShadow: isActive ? "0 0 0 3px rgba(220,38,38,.12)" : "none",
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 6, color: isActive ? "#dc2626" : "#666" }}>{def.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.005em" }}>{def.label}</div>
              {isDraft && (
                <span style={{
                  position: "absolute", top: 10, right: 10,
                  width: 8, height: 8, background: "#dc2626", borderRadius: "50%",
                  boxShadow: "0 0 8px rgba(220,38,38,.7)",
                }} title="Rascunho não publicado" />
              )}
            </button>
          );
        })}
      </div>

      {/* Editor */}
      <div>
        {Editor && (
          <div>
            <div style={{
              padding: "14px 18px",
              background: "linear-gradient(180deg, #0d0d0d 0%, #080808 100%)",
              border: "1px solid #1f1f1f",
              borderRadius: 11,
              marginBottom: 16,
              display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
            }}>
              <div style={{ fontSize: 22, color: "#dc2626" }}>{activeDef.icon}</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#fafafa" }}>Editando: {activeDef.label}</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                  {hasDraft ? <span style={{ color: "#fca5a5" }}>● Existe rascunho não publicado</span> : "Sem rascunho pendente"}
                </div>
              </div>
            </div>

            <Editor value={editValue} onChange={setEditValue} />
          </div>
        )}

        {/* Action bar — sticky bottom */}
        <div style={{
          position: "sticky", bottom: 16, marginTop: 16,
          background: "linear-gradient(180deg, #141414 0%, #0a0a0a 100%)",
          border: "1px solid #2a2a2a",
          borderRadius: 12,
          padding: 16,
          boxShadow: "0 -4px 24px rgba(0,0,0,.6)",
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap",
        }}>
          <div style={{ fontSize: 13, color: "#888" }}>
            {dirty ? <span style={{ color: "#fca5a5", fontWeight: 600 }}>● Alterações não salvas</span> :
              hasDraft ? <span style={{ color: "#fbbf24", fontWeight: 600 }}>● Rascunho aguardando publicação</span> :
              <span>Tudo salvo e publicado</span>}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {hasDraft && <DangerBtn onClick={discardDraft} disabled={busy}>Descartar rascunho</DangerBtn>}
            <GhostBtn onClick={saveDraft} disabled={busy || !dirty}>Salvar rascunho</GhostBtn>
            <PrimaryBtn onClick={publish} disabled={busy}>Publicar agora</PrimaryBtn>
          </div>
        </div>
      </div>
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
        description="Páginas adicionais com URL própria, como /p/promocoes ou /p/contato-corporativo."
      />

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <PrimaryBtn onClick={() => setCreating(true)}>+ Nova página</PrimaryBtn>
      </div>

      {pages.length === 0 ? (
        <EmptyState icon="▤" title="Nenhuma página criada" hint="Clique em 'Nova página' para começar." />
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {pages.map((p) => (
            <div key={p.id} style={cardRow}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#fafafa" }}>{p.title || <em style={{ color: "#666" }}>sem título</em>}</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 4, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <a href={`/p/${p.slug}`} target="_blank" rel="noreferrer" style={{ color: "#dc2626", textDecoration: "none" }}>/p/{p.slug} ↗</a>
                  <Badge published={p.is_published} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <GhostBtn onClick={() => togglePublish(p)}>{p.is_published ? "Despublicar" : "Publicar"}</GhostBtn>
                <GhostBtn onClick={() => setEditing(p)}>Editar</GhostBtn>
                <DangerBtn onClick={() => onDelete(p)}>Remover</DangerBtn>
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
    <ModalShell onClose={onClose} title={page ? "Editar página" : "Nova página"} maxWidth={780}>
      <Section title="Configurações da página">
        <FormField label="Título da página"><TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Promoções" /></FormField>
        <FormField label="URL da página" hint="Apenas letras minúsculas, números e hífens.">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#888", fontSize: 13 }}>/p/</span>
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

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <GhostBtn onClick={onClose}>Cancelar</GhostBtn>
        <GhostBtn onClick={() => save(false)} disabled={busy}>Salvar rascunho</GhostBtn>
        <PrimaryBtn onClick={() => save(true)} disabled={busy}>
          {page?.is_published ? "Atualizar publicação" : "Publicar"}
        </PrimaryBtn>
      </div>
    </ModalShell>
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
            <div key={u.id} style={cardRow}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: u.role === "owner" ? "linear-gradient(135deg, #dc2626, #7f1d1d)" : "#1a1a1a",
                  color: "white",
                  display: "grid", placeItems: "center", fontWeight: 700, fontSize: 16,
                  border: u.role === "owner" ? "1px solid #dc2626" : "1px solid #2a2a2a",
                }}>{u.email.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#fafafa" }}>
                    {u.email}
                    {u.id === currentUserId && <span style={{ color: "#666", marginLeft: 8, fontSize: 12 }}>(você)</span>}
                  </div>
                  <div style={{ fontSize: 11, color: u.role === "owner" ? "#dc2626" : "#888", fontWeight: 700, marginTop: 3, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    {u.role === "owner" ? "★ Dono" : "Administrador"}
                  </div>
                </div>
              </div>
              {u.id !== currentUserId && u.role !== "owner" && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <GhostBtn onClick={() => setEditingUser(u)}>Editar</GhostBtn>
                  <GhostBtn onClick={() => onTransfer(u.id, u.email)} style={{ borderColor: "#5a3a1a", color: "#fbbf24", background: "#1a1208" }}>Tornar Dono</GhostBtn>
                  <DangerBtn onClick={() => onDelete(u.id, u.email)}>Remover</DangerBtn>
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
    <ModalShell onClose={onClose} title="Novo Administrador" maxWidth={460}>
      <form onSubmit={submit}>
        <FormField label="E-mail"><TextInput type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></FormField>
        <FormField label="Senha (mín. 6 caracteres)"><TextInput type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></FormField>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <GhostBtn type="button" onClick={onClose}>Cancelar</GhostBtn>
          <PrimaryBtn type="submit" disabled={busy}>{busy ? "Criando…" : "Criar"}</PrimaryBtn>
        </div>
      </form>
    </ModalShell>
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
    <ModalShell onClose={onClose} title={`Editar: ${user.email}`} maxWidth={460}>
      <form onSubmit={submit}>
        <FormField label="E-mail"><TextInput type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></FormField>
        <FormField label="Nova senha" hint="Deixe em branco para manter a senha atual.">
          <TextInput type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </FormField>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <GhostBtn type="button" onClick={onClose}>Cancelar</GhostBtn>
          <PrimaryBtn type="submit" disabled={busy}>{busy ? "Salvando…" : "Salvar"}</PrimaryBtn>
        </div>
      </form>
    </ModalShell>
  );
}

/* ============================================================
   Helpers
============================================================ */
function PageWrap({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: "36px 36px 100px", maxWidth: 1280, margin: "0 auto" }}>{children}</div>;
}
function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid #1a1a1a" }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, margin: 0, color: "#fafafa", letterSpacing: "-0.02em", fontWeight: 600 }}>{title}</h1>
      {description && <p style={{ fontSize: 14, color: "#888", margin: "8px 0 0", maxWidth: 720, lineHeight: 1.5 }}>{description}</p>}
    </div>
  );
}
function ModalShell({ children, onClose, title, maxWidth = 560 }: { children: React.ReactNode; onClose: () => void; title: string; maxWidth?: number }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", backdropFilter: "blur(6px)",
      display: "grid", placeItems: "center", zIndex: 100, padding: 16, overflowY: "auto",
      animation: "adminFade .2s ease",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#0a0a0a", borderRadius: 14, width: "100%", maxWidth, padding: 28,
        border: "1px solid #2a2a2a",
        boxShadow: "0 30px 80px rgba(220,38,38,.15)",
        maxHeight: "92vh", overflowY: "auto",
      }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, margin: "0 0 18px", color: "#fafafa", fontWeight: 600 }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}
function Center({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#000", color: "#888", fontFamily: "Inter, system-ui, sans-serif" }}>{children}</div>;
}
function Loading() {
  return <div style={{ padding: 60, textAlign: "center", color: "#666", fontSize: 13, letterSpacing: "0.05em", textTransform: "uppercase" }}>Carregando…</div>;
}
function Badge({ published }: { published: boolean }) {
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
      background: published ? "rgba(220,38,38,0.15)" : "#1a1a1a",
      color: published ? "#fca5a5" : "#888",
      border: published ? "1px solid #5a1a1a" : "1px solid #2a2a2a",
    }}>{published ? "Publicada" : "Rascunho"}</span>
  );
}
function EmptyState({ icon, title, hint }: { icon: string; title: string; hint: string }) {
  return (
    <div style={{
      background: "#0a0a0a", border: "2px dashed #1f1f1f", borderRadius: 14,
      padding: 70, textAlign: "center", color: "#666",
    }}>
      <div style={{ fontSize: 42, marginBottom: 14, color: "#dc2626", opacity: 0.5 }}>{icon}</div>
      <p style={{ fontSize: 15, margin: 0, color: "#bbb", fontWeight: 500 }}>{title}</p>
      <p style={{ fontSize: 13, marginTop: 6, color: "#666" }}>{hint}</p>
    </div>
  );
}

function SidebarItem({ icon, label, active, collapsed, onClick }: { icon: string; label: string; active: boolean; collapsed: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
      borderRadius: 9, border: "none",
      background: active ? "linear-gradient(180deg, #dc2626 0%, #991b1b 100%)" : "transparent",
      color: active ? "white" : "#999",
      cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 500,
      width: "100%", textAlign: "left", transition: "all .15s",
      boxShadow: active ? "0 4px 12px rgba(220,38,38,.3)" : "none",
    }}>
      <span style={{ fontSize: 14, width: 18, textAlign: "center", color: active ? "white" : "#666" }}>{icon}</span>
      {!collapsed && <span>{label}</span>}
    </button>
  );
}

const cardRow: React.CSSProperties = {
  background: "linear-gradient(180deg, #0d0d0d 0%, #080808 100%)",
  border: "1px solid #1f1f1f",
  borderRadius: 12,
  padding: "16px 20px",
  display: "flex", alignItems: "center", justifyContent: "space-between",
  gap: 14, flexWrap: "wrap",
};

const sidebarBtn: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8, border: "none",
  background: "transparent", color: "#999",
  fontSize: 13, cursor: "pointer", textAlign: "left", fontWeight: 500,
  transition: "background .15s, color .15s",
};
const sidebarToggle: React.CSSProperties = {
  width: 28, height: 28, padding: 0, borderRadius: 7,
  border: "1px solid #1f1f1f", background: "#0d0d0d",
  color: "#999", cursor: "pointer", fontSize: 14, fontWeight: 700,
};
