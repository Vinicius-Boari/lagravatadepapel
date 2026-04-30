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
      { title: "Painel — Gerenciar Site" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLayout,
});

type Tab = "sections" | "instagram" | "pages" | "users";

function AdminLayout() {
  const { user, loading, isAdmin, isOwner, error: authError } = useAuth();
  const [tab, setTab] = useState<Tab>("sections");
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "err" } | null>(null);

  useEffect(() => {
    if (!loading && !user) window.location.href = "/login";
  }, [loading, user]);

  const showToast = (msg: string, kind: "ok" | "err" = "ok") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) return <FullScreenMsg>Iniciando painel seguro…</FullScreenMsg>;
  if (!user) return <FullScreenMsg>Redirecionando…</FullScreenMsg>;
  if (!isAdmin) return <FullScreenMsg color="#ef4444">Acesso Negado. Contate o administrador.</FullScreenMsg>;

  return (
    <div style={{ minHeight: "100vh", background: "#050505", display: "flex", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      {/* SIDEBAR */}
      <aside style={{ width: 260, borderRight: "1px solid #111", background: "#080808", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "30px 24px", borderBottom: "1px solid #111" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700 }}>La Gravata</div>
          <div style={{ fontSize: 10, color: "#8b1a1a", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, marginTop: 4 }}>Gerenciador</div>
        </div>

        <nav style={{ flex: 1, padding: "20px 12px" }}>
          <NavItem active={tab === "sections"} onClick={() => setTab("sections")} label="Seções do Site" icon="✦" />
          <NavItem active={tab === "instagram"} onClick={() => setTab("instagram")} label="Instagram" icon="◉" />
          <NavItem active={tab === "pages"} onClick={() => setTab("pages")} label="Páginas Extras" icon="▤" />
          {isOwner && <NavItem active={tab === "users"} onClick={() => setTab("users")} label="Usuários" icon="◆" />}
        </nav>

        <div style={{ padding: 20, borderTop: "1px solid #111" }}>
          <div style={{ fontSize: 11, color: "#444", marginBottom: 12 }}>{user.email}</div>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.href = "/")} style={logoutBtn}>Sair do Painel</button>
        </div>
      </aside>

      {/* CONTENT */}
      <main style={{ flex: 1, overflowY: "auto", padding: "40px 60px" }}>
        {tab === "sections" && <SectionsTab onToast={showToast} />}
        {tab === "instagram" && <InstagramTab onToast={showToast} />}
        {tab === "pages" && <PagesTab onToast={showToast} />}
        {tab === "users" && <UsersTab onToast={showToast} />}
      </main>

      {toast && <div style={{
        position: "fixed", bottom: 30, right: 30, background: toast.kind === "ok" ? "#8b1a1a" : "#331111",
        color: "#fff", padding: "12px 24px", borderRadius: 8, fontSize: 13, fontWeight: 600,
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)", zIndex: 1000
      }}>{toast.msg}</div>}
    </div>
  );
}

function SectionsTab({ onToast }: { onToast: (m: string, k?: "ok" | "err") => void }) {
  const [activeKey, setActiveKey] = useState("hero");
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: rows } = await supabase.from("site_content").select("*");
    const map: any = {};
    rows?.forEach(r => map[r.key] = r.draft_value || r.value);
    setData(map);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (publish: boolean) => {
    setSaving(true);
    const value = data[activeKey];
    const update = publish ? { value, draft_value: null } : { draft_value: value };
    const { error } = await supabase.from("site_content").upsert({ key: activeKey, ...update });
    setSaving(false);
    if (error) onToast(error.message, "err");
    else onToast(publish ? "Publicado no site!" : "Rascunho salvo!");
    load();
  };

  if (loading) return <div>Carregando seções…</div>;

  const Editor = SECTION_EDITORS[activeKey]?.component;

  return (
    <div>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontFamily: "'Playfair Display', serif" }}>Seções da Home</h1>
        <p style={{ color: "#666", marginTop: 8 }}>Edite cada bloco de conteúdo do seu site público.</p>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 30, flexWrap: "wrap" }}>
        {Object.entries(SECTION_EDITORS).map(([key, def]) => (
          <button key={key} onClick={() => setActiveKey(key)} style={{
            padding: "12px 20px", borderRadius: 8, background: activeKey === key ? "#8b1a1a" : "#111",
            color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600
          }}>{def.label}</button>
        ))}
      </div>

      <div style={{ background: "#0d0d0d", padding: 30, borderRadius: 12, border: "1px solid #111" }}>
        {Editor && <Editor value={data[activeKey] || {}} onChange={(v) => setData({ ...data, [activeKey]: v })} />}
        
        <div style={{ marginTop: 40, paddingTop: 30, borderTop: "1px solid #1a1a1a", display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <GhostBtn onClick={() => save(false)} disabled={saving}>Salvar Rascunho</GhostBtn>
          <PrimaryBtn onClick={() => save(true)} disabled={saving}>Publicar no Site</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

function PagesTab({ onToast }: { onToast: (m: string, k?: "ok" | "err") => void }) {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("pages").select("*").order("created_at", { ascending: false });
    if (data) setPages(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onDelete = async (p: any) => {
    if (!confirm(`Remover a página "${p.title || p.slug}"?`)) return;
    const { error } = await supabase.from("pages").delete().eq("id", p.id);
    if (error) onToast(error.message, "err");
    else { onToast("Página removida"); load(); }
  };

  const togglePublish = async (p: any) => {
    const { error } = await supabase.from("pages").update({ is_published: !p.is_published }).eq("id", p.id);
    if (error) onToast(error.message, "err");
    else { onToast(p.is_published ? "Página despublicada" : "Página publicada"); load(); }
  };

  if (loading) return <div>Carregando páginas…</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <div>
          <h1 style={{ fontSize: 32, fontFamily: "'Playfair Display', serif" }}>Páginas Extras</h1>
          <p style={{ color: "#666", marginTop: 8 }}>Gerencie páginas com URLs personalizadas.</p>
        </div>
        <PrimaryBtn onClick={() => setCreating(true)}>+ Nova Página</PrimaryBtn>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {pages.map(p => (
          <div key={p.id} style={cardStyle}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{p.title || "Sem título"}</div>
              <div style={{ fontSize: 12, color: "#444", marginTop: 4 }}>
                <a href={`/p/${p.slug}`} target="_blank" style={{ color: "#8b1a1a", textDecoration: "none" }}>/p/{p.slug} ↗</a>
                <span style={{ marginLeft: 12, color: p.is_published ? "#4ade80" : "#666" }}>
                  {p.is_published ? "● No ar" : "○ Rascunho"}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <GhostBtn onClick={() => togglePublish(p)}>{p.is_published ? "Despublicar" : "Publicar"}</GhostBtn>
              <GhostBtn onClick={() => setEditing(p)}>Editar</GhostBtn>
              <DangerBtn onClick={() => onDelete(p)}>Remover</DangerBtn>
            </div>
          </div>
        ))}
        {pages.length === 0 && <div style={{ textAlign: "center", padding: 60, color: "#333", border: "1px dashed #222", borderRadius: 12 }}>Nenhuma página criada.</div>}
      </div>

      {(creating || editing) && (
        <PageEditor 
          page={editing} 
          onClose={() => { setCreating(false); setEditing(null); }} 
          onSaved={() => { setCreating(false); setEditing(null); load(); onToast("Página salva!"); }} 
          onError={(m: string) => onToast(m, "err")} 
        />
      )}
    </div>
  );
}

function PageEditor({ page, onClose, onSaved, onError }: any) {
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [title, setTitle] = useState(page?.title ?? "");
  const initialSections = (page?.draft?.sections || page?.published?.sections || [{ heading: "", text: "", image: "" }]);
  const [sections, setSections] = useState(initialSections);
  const [busy, setBusy] = useState(false);

  const save = async (publish: boolean) => {
    if (!slug) return onError("URL é obrigatória");
    setBusy(true);
    const payload: any = { slug, title, draft: { sections } };
    if (publish) { payload.published = { sections }; payload.is_published = true; }
    
    const { error } = page 
      ? await supabase.from("pages").update(payload).eq("id", page.id)
      : await supabase.from("pages").insert(payload);
      
    setBusy(false);
    if (error) onError(error.message);
    else onSaved();
  };

  return (
    <div style={modalBg} onClick={onClose}>
      <div style={modalContent} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 24 }}>{page ? "Editar Página" : "Nova Página"}</h2>
        
        <Section title="Geral">
          <FormField label="Título da Página"><TextInput value={title} onChange={(e:any) => setTitle(e.target.value)} /></FormField>
          <FormField label="URL (slug)">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#444" }}>/p/</span>
              <TextInput value={slug} onChange={(e:any) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} />
            </div>
          </FormField>
        </Section>

        <Section title="Conteúdo">
          {sections.map((s: any, i: number) => (
            <ItemCard key={i} index={i} title={s.heading || "Nova Seção"}
              onRemove={() => setSections(sections.filter((_:any, ix:any) => ix !== i))}
            >
              <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 14 }}>
                <MediaUploader folder="pages" value={s.image} onChange={(url: any) => {
                  const n = [...sections]; n[i] = { ...n[i], image: url }; setSections(n);
                }} />
                <div>
                  <FormField label="Título"><TextInput value={s.heading} onChange={(e:any) => {
                    const n = [...sections]; n[i] = { ...n[i], heading: e.target.value }; setSections(n);
                  }} /></FormField>
                  <FormField label="Texto"><TextArea value={s.text} onChange={(e:any) => {
                    const n = [...sections]; n[i] = { ...n[i], text: e.target.value }; setSections(n);
                  }} /></FormField>
                </div>
              </div>
            </ItemCard>
          ))}
          <AddBtn onClick={() => setSections([...sections, { heading: "", text: "", image: "" }])}>+ Adicionar Seção</AddBtn>
        </Section>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 30 }}>
          <GhostBtn onClick={onClose}>Cancelar</GhostBtn>
          <GhostBtn onClick={() => save(false)} disabled={busy}>Salvar Rascunho</GhostBtn>
          <PrimaryBtn onClick={() => save(true)} disabled={busy}>Publicar Agora</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

function UsersTab({ onToast }: { onToast: (m: string, k?: "ok" | "err") => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("id, email");
    const { data: roles } = await supabase.from("user_roles").select("*");
    if (profiles) {
      setUsers(profiles.map(p => ({
        ...p,
        role: roles?.find(r => r.user_id === p.id)?.role || "user"
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div>Carregando usuários…</div>;

  return (
    <div>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 32, fontFamily: "'Playfair Display', serif" }}>Equipe e Acesso</h1>
        <p style={{ color: "#666", marginTop: 8 }}>Gerencie quem pode editar o site.</p>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {users.map(u => (
          <div key={u.id} style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#111", display: "grid", placeItems: "center", fontWeight: 700 }}>
                {u.email[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{u.email}</div>
                <div style={{ fontSize: 11, color: "#8b1a1a", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{u.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const cardStyle = {
  background: "#0d0d0d", padding: "16px 24px", borderRadius: 12, border: "1px solid #111",
  display: "flex", justifyContent: "space-between", alignItems: "center"
};

const modalBg: any = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)", display: "grid", placeItems: "center", zIndex: 2000, padding: 20 };
const modalContent: any = { background: "#080808", padding: 40, borderRadius: 20, width: "100%", maxWidth: 800, maxHeight: "90vh", overflowY: "auto", border: "1px solid #111" };

function NavItem({ active, onClick, label, icon }: any) {
  return (
    <button onClick={onClick} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
      borderRadius: 8, border: "none", background: active ? "rgba(139, 26, 26, 0.1)" : "transparent",
      color: active ? "#8b1a1a" : "#888", cursor: "pointer", textAlign: "left", marginBottom: 4,
      fontWeight: active ? 700 : 500, transition: "0.2s"
    }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 13 }}>{label}</span>
    </button>
  );
}

function FullScreenMsg({ children, color = "#888" }: any) {
  return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#050505", color, fontFamily: "Inter, sans-serif" }}>{children}</div>;
}

const logoutBtn = {
  width: "100%", padding: "10px", borderRadius: 6, background: "transparent",
  border: "1px solid #222", color: "#666", fontSize: 12, cursor: "pointer"
};
