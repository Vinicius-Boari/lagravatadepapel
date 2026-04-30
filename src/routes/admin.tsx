import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSiteContent } from "@/hooks/useSiteContent";
import { DEFAULTS, MEDIA_SPECS, type Content, type ContentKey, type MediaSpec } from "@/lib/site-content-defaults";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel Administrativo" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminPage,
});

const SECTIONS: { key: ContentKey | "users"; label: string; icon: string }[] = [
  { key: "seo", label: "SEO & Meta", icon: "🔍" },
  { key: "logo", label: "Logo & Header", icon: "🎩" },
  { key: "hero", label: "Hero (Topo)", icon: "✨" },
  { key: "tickers", label: "Ticker (Faixa)", icon: "📜" },
  { key: "services", label: "Serviços", icon: "🎬" },
  { key: "videos", label: "Vídeos", icon: "🎥" },
  { key: "dark_cta", label: "CTA Surpreender", icon: "💥" },
  { key: "invasions", label: "Invasões", icon: "🚀" },
  { key: "about", label: "Sobre", icon: "📖" },
  { key: "whatsapp", label: "WhatsApp", icon: "💬" },
  { key: "footer", label: "Rodapé", icon: "📍" },
  { key: "users", label: "Usuários", icon: "👥" },
];

function AdminPage() {
  const navigate = useNavigate();
  const { user, role, loading, isOwner } = useAuth();
  const { data: content } = useSiteContent();
  const queryClient = useQueryClient();
  const [active, setActive] = useState<typeof SECTIONS[number]["key"]>("hero");
  const [draft, setDraft] = useState<Content | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "err" } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [loading, user, navigate]);
  useEffect(() => { if (content && !draft) setDraft(content); }, [content, draft]);

  const showToast = (msg: string, kind: "ok" | "err" = "ok") => {
    setToast({ msg, kind }); setTimeout(() => setToast(null), 3500);
  };

  const dirty = draft && content && JSON.stringify(draft) !== JSON.stringify(content);

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    const rows = (Object.keys(DEFAULTS) as ContentKey[]).map((k) => ({ key: k, value: draft[k] as never }));
    const { error } = await supabase.from("site_content").upsert(rows as never, { onConflict: "key" });
    setSaving(false);
    if (error) { showToast(error.message, "err"); return; }
    queryClient.invalidateQueries({ queryKey: ["site-content"] });
    showToast("Alterações salvas com sucesso");
  };

  const discard = () => { if (content && confirm("Descartar alterações não salvas?")) setDraft(content); };

  const onLogout = async () => { await supabase.auth.signOut(); navigate({ to: "/" }); };

  if (loading || !draft) return <Center>Carregando painel...</Center>;
  if (!user) return null;

  const update = <K extends ContentKey>(key: K, value: Content[K]) => setDraft({ ...draft, [key]: value });

  return (
    <div style={{ minHeight: "100vh", background: "#f6f6f7", fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <header style={hdr}>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700 }}>Painel Administrativo</div>
          <div style={{ fontSize: 11, color: "#888" }}>{user.email} · <b style={{ color: isOwner ? "#dc2626" : "#0066cc" }}>{isOwner ? "Dono" : "Administrador"}</b></div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {dirty && <span style={{ fontSize: 12, color: "#b45309", background: "#fef3c7", padding: "4px 10px", borderRadius: 999 }}>● Alterações não salvas</span>}
          <button onClick={() => setShowPreview(!showPreview)} style={ghost}>{showPreview ? "Fechar Preview" : "👁 Preview"}</button>
          <button onClick={discard} disabled={!dirty} style={{ ...ghost, opacity: dirty ? 1 : 0.4 }}>Descartar</button>
          <button onClick={save} disabled={!dirty || saving} style={{ ...primary, opacity: dirty ? 1 : 0.5 }}>{saving ? "Salvando..." : "Salvar alterações"}</button>
          <Link to="/" style={ghost}>Ver site</Link>
          <button onClick={onLogout} style={ghost}>Sair</button>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <aside style={sidebar}>
          {SECTIONS.map((s) => (
            (s.key === "users" && !isOwner) ? null : (
              <button key={s.key} onClick={() => setActive(s.key)} style={{
                ...sideBtn, background: active === s.key ? "#1f2937" : "transparent",
                color: active === s.key ? "white" : "#cbd5e1",
              }}>
                <span style={{ marginRight: 8 }}>{s.icon}</span>{s.label}
              </button>
            )
          ))}
        </aside>

        <main style={{ flex: 1, overflow: "auto", padding: 24 }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            {active === "users" ? <UsersSection currentUserId={user.id} showToast={showToast} />
              : active === "seo" ? <SeoEditor v={draft.seo} on={(v) => update("seo", v)} />
              : active === "logo" ? <LogoEditor v={draft.logo} on={(v) => update("logo", v)} />
              : active === "hero" ? <HeroEditor v={draft.hero} on={(v) => update("hero", v)} />
              : active === "tickers" ? <TickersEditor v={draft.tickers} on={(v) => update("tickers", v)} />
              : active === "services" ? <ServicesEditor v={draft.services} on={(v) => update("services", v)} />
              : active === "videos" ? <VideosEditor v={draft.videos} on={(v) => update("videos", v)} />
              : active === "dark_cta" ? <DarkCtaEditor v={draft.dark_cta} on={(v) => update("dark_cta", v)} />
              : active === "invasions" ? <InvasionsEditor v={draft.invasions} on={(v) => update("invasions", v)} />
              : active === "about" ? <AboutEditor v={draft.about} on={(v) => update("about", v)} />
              : active === "whatsapp" ? <WhatsappEditor v={draft.whatsapp} on={(v) => update("whatsapp", v)} />
              : active === "footer" ? <FooterEditor v={draft.footer} on={(v) => update("footer", v)} />
              : null}
          </div>
        </main>

        {showPreview && (
          <aside style={{ width: 480, borderLeft: "1px solid #e5e7eb", background: "#000" }}>
            <iframe src="/" title="Preview" style={{ width: "100%", height: "100%", border: 0 }} />
            <div style={{ position: "absolute", bottom: 8, right: 496, fontSize: 11, color: "#666", background: "white", padding: "2px 8px", borderRadius: 4 }}>
              Salve para atualizar o preview
            </div>
          </aside>
        )}
      </div>

      {toast && <div style={{ position: "fixed", bottom: 24, right: 24, background: toast.kind === "ok" ? "#16a34a" : "#dc2626", color: "white", padding: "12px 18px", borderRadius: 8, fontSize: 14, boxShadow: "0 10px 30px rgba(0,0,0,.2)", zIndex: 100 }}>{toast.msg}</div>}
    </div>
  );
}

// ============ EDITORS ============

function SectionTitle({ title, desc }: { title: string; desc?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{title}</h1>
      {desc && <p style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{desc}</p>}
    </div>
  );
}

function SeoEditor({ v, on }: { v: Content["seo"]; on: (v: Content["seo"]) => void }) {
  return <Card>
    <SectionTitle title="SEO & Meta tags" desc="Como o site aparece em buscadores e ao compartilhar." />
    <Field label="Título da aba (Title)"><input style={input} value={v.title} onChange={(e) => on({ ...v, title: e.target.value })} maxLength={70} /></Field>
    <Field label="Descrição (meta description, máx. 160)"><textarea style={textarea} value={v.description} onChange={(e) => on({ ...v, description: e.target.value })} maxLength={170} rows={3} /></Field>
    <Field label="OG Title (compartilhamento)"><input style={input} value={v.og_title} onChange={(e) => on({ ...v, og_title: e.target.value })} /></Field>
    <Field label="OG Description"><textarea style={textarea} value={v.og_description} onChange={(e) => on({ ...v, og_description: e.target.value })} rows={2} /></Field>
    <Field label="Imagem de compartilhamento (1200×630)"><MediaInput type="image" spec="og_image" value={v.og_image} onChange={(url) => on({ ...v, og_image: url })} /></Field>
  </Card>;
}

function LogoEditor({ v, on }: { v: Content["logo"]; on: (v: Content["logo"]) => void }) {
  return <Card>
    <SectionTitle title="Logo & Header" />
    <Field label="Linha 1 do logo"><input style={input} value={v.line1} onChange={(e) => on({ ...v, line1: e.target.value })} /></Field>
    <Field label="Linha 2 do logo"><input style={input} value={v.line2} onChange={(e) => on({ ...v, line2: e.target.value })} /></Field>
    <Field label="Tagline (texto ao lado)"><input style={input} value={v.tagline} onChange={(e) => on({ ...v, tagline: e.target.value })} /></Field>
  </Card>;
}

function HeroEditor({ v, on }: { v: Content["hero"]; on: (v: Content["hero"]) => void }) {
  return <Card>
    <SectionTitle title="Hero (Seção do topo)" />
    <Row>
      <Field label="Título linha 1"><input style={input} value={v.title_line1} onChange={(e) => on({ ...v, title_line1: e.target.value })} /></Field>
      <Field label="Título linha 2"><input style={input} value={v.title_line2} onChange={(e) => on({ ...v, title_line2: e.target.value })} /></Field>
      <Field label="Título linha 3 (itálico)"><input style={input} value={v.title_line3} onChange={(e) => on({ ...v, title_line3: e.target.value })} /></Field>
    </Row>
    <Field label="Subtítulo (use Enter para nova linha)"><textarea style={textarea} value={v.subtitle} onChange={(e) => on({ ...v, subtitle: e.target.value })} rows={3} /></Field>
    <Field label="Localização (use Enter)"><textarea style={textarea} value={v.location} onChange={(e) => on({ ...v, location: e.target.value })} rows={2} /></Field>
    <Field label="Texto do botão CTA"><input style={input} value={v.cta_label} onChange={(e) => on({ ...v, cta_label: e.target.value })} /></Field>
    <Field label="Imagem 1 (esquerda)"><MediaInput type="image" spec="hero_image" value={v.image1} onChange={(url) => on({ ...v, image1: url })} /></Field>
    <Field label="Imagem 2 (centro)"><MediaInput type="image" spec="hero_image" value={v.image2} onChange={(url) => on({ ...v, image2: url })} /></Field>
    <Field label="Imagem 3 (direita)"><MediaInput type="image" spec="hero_image" value={v.image3} onChange={(url) => on({ ...v, image3: url })} /></Field>
  </Card>;
}

function TickersEditor({ v, on }: { v: Content["tickers"]; on: (v: Content["tickers"]) => void }) {
  return <Card>
    <SectionTitle title="Ticker (Faixa rolante)" desc="Itens em loop entre as seções." />
    <ListEditor items={v.items} onChange={(items) => on({ items })} render={(item, i, upd) => (
      <input style={input} value={item} onChange={(e) => upd(e.target.value)} placeholder={`Item ${i + 1}`} />
    )} newItem={() => "NOVO ITEM"} />
  </Card>;
}

function ServicesEditor({ v, on }: { v: Content["services"]; on: (v: Content["services"]) => void }) {
  return <Card>
    <SectionTitle title="Serviços" />
    <Row>
      <Field label="Título linha 1"><input style={input} value={v.heading_line1} onChange={(e) => on({ ...v, heading_line1: e.target.value })} /></Field>
      <Field label="Título linha 2 (destaque)"><input style={input} value={v.heading_line2} onChange={(e) => on({ ...v, heading_line2: e.target.value })} /></Field>
    </Row>
    <ListEditor items={v.items} onChange={(items) => on({ ...v, items })} render={(item, i, upd) => (
      <div style={subCard}>
        <Field label={`Card ${i + 1} — Título`}><input style={input} value={item.title} onChange={(e) => upd({ ...item, title: e.target.value })} /></Field>
        <Field label="Descrição"><input style={input} value={item.desc} onChange={(e) => upd({ ...item, desc: e.target.value })} /></Field>
        <Field label="Imagem"><MediaInput type="image" spec="service_card" value={item.img} onChange={(url) => upd({ ...item, img: url })} /></Field>
      </div>
    )} newItem={() => ({ img: "", title: "Novo serviço", desc: "Descrição" })} />
  </Card>;
}

function VideosEditor({ v, on }: { v: Content["videos"]; on: (v: Content["videos"]) => void }) {
  return <Card>
    <SectionTitle title="Vídeos" desc="Use uma URL do YouTube/Vimeo/Instagram OU faça upload de um .mp4." />
    <Field label="Título da seção"><input style={input} value={v.heading} onChange={(e) => on({ ...v, heading: e.target.value })} /></Field>
    <ListEditor items={v.items} onChange={(items) => on({ ...v, items })} render={(item, i, upd) => (
      <div style={subCard}>
        <Row>
          <Field label={`Vídeo ${i + 1} — Título`}><input style={input} value={item.title} onChange={(e) => upd({ ...item, title: e.target.value })} /></Field>
          <Field label="Tag"><input style={input} value={item.tag} onChange={(e) => upd({ ...item, tag: e.target.value })} /></Field>
        </Row>
        <Field label="URL (YouTube, Vimeo, Instagram)"><input style={input} value={item.url} onChange={(e) => upd({ ...item, url: e.target.value, src: e.target.value ? "" : item.src })} placeholder="https://youtube.com/watch?v=..." /></Field>
        <div style={{ textAlign: "center", color: "#999", fontSize: 12, margin: "8px 0" }}>— OU —</div>
        <Field label="Upload de vídeo .mp4"><MediaInput type="video" spec="video_file" value={item.src} onChange={(url) => upd({ ...item, src: url, url: url ? "" : item.url })} /></Field>
        <Field label="Thumbnail (poster, opcional)"><MediaInput type="image" spec="video_poster" value={item.poster} onChange={(url) => upd({ ...item, poster: url })} /></Field>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginTop: 8 }}>
          <input type="checkbox" checked={item.tall} onChange={(e) => upd({ ...item, tall: e.target.checked })} />
          Card grande (vertical)
        </label>
      </div>
    )} newItem={() => ({ title: "Novo vídeo", tag: "Tag", poster: "", src: "", url: "", tall: false })} />
  </Card>;
}

function DarkCtaEditor({ v, on }: { v: Content["dark_cta"]; on: (v: Content["dark_cta"]) => void }) {
  return <Card>
    <SectionTitle title="Bloco CTA (fundo escuro)" />
    <Field label="Título"><input style={input} value={v.heading} onChange={(e) => on({ ...v, heading: e.target.value })} /></Field>
    <Field label="Texto"><textarea style={textarea} value={v.text} onChange={(e) => on({ ...v, text: e.target.value })} rows={5} /></Field>
    <Field label="Texto do botão"><input style={input} value={v.button_label} onChange={(e) => on({ ...v, button_label: e.target.value })} /></Field>
  </Card>;
}

function InvasionsEditor({ v, on }: { v: Content["invasions"]; on: (v: Content["invasions"]) => void }) {
  return <Card>
    <SectionTitle title="Invasões" />
    <Row>
      <Field label="Título linha 1"><input style={input} value={v.heading_line1} onChange={(e) => on({ ...v, heading_line1: e.target.value })} /></Field>
      <Field label="Título linha 2"><input style={input} value={v.heading_line2} onChange={(e) => on({ ...v, heading_line2: e.target.value })} /></Field>
    </Row>
    <Field label="Link do Instagram"><input style={input} value={v.instagram_url} onChange={(e) => on({ ...v, instagram_url: e.target.value })} /></Field>
    <Field label="Texto do link"><input style={input} value={v.instagram_label} onChange={(e) => on({ ...v, instagram_label: e.target.value })} /></Field>
    <ListEditor items={v.items} onChange={(items) => on({ ...v, items })} render={(item, i, upd) => (
      <div style={subCard}>
        <Field label={`Card ${i + 1} — Título`}><input style={input} value={item.title} onChange={(e) => upd({ ...item, title: e.target.value })} /></Field>
        <Field label="Tag"><input style={input} value={item.tag} onChange={(e) => upd({ ...item, tag: e.target.value })} /></Field>
        <Field label="Imagem"><MediaInput type="image" spec="invasion_card" value={item.img} onChange={(url) => upd({ ...item, img: url })} /></Field>
      </div>
    )} newItem={() => ({ img: "", title: "Nova invasão", tag: "Tag" })} />
  </Card>;
}

function AboutEditor({ v, on }: { v: Content["about"]; on: (v: Content["about"]) => void }) {
  return <Card>
    <SectionTitle title="Sobre" />
    <Field label="Título"><input style={input} value={v.heading} onChange={(e) => on({ ...v, heading: e.target.value })} /></Field>
    <Field label="Parágrafo 1"><textarea style={textarea} value={v.paragraph1} onChange={(e) => on({ ...v, paragraph1: e.target.value })} rows={4} /></Field>
    <Field label="Parágrafo 2"><textarea style={textarea} value={v.paragraph2} onChange={(e) => on({ ...v, paragraph2: e.target.value })} rows={4} /></Field>
    <Field label="Texto do botão"><input style={input} value={v.button_label} onChange={(e) => on({ ...v, button_label: e.target.value })} /></Field>
    <Field label="Imagem"><MediaInput type="image" spec="about_image" value={v.image} onChange={(url) => on({ ...v, image: url })} /></Field>
  </Card>;
}

function WhatsappEditor({ v, on }: { v: Content["whatsapp"]; on: (v: Content["whatsapp"]) => void }) {
  return <Card>
    <SectionTitle title="WhatsApp" desc="Telefone e mensagens automáticas dos botões." />
    <Field label="Telefone (apenas números, com DDI 55)"><input style={input} value={v.phone} onChange={(e) => on({ ...v, phone: e.target.value.replace(/\D/g, "") })} placeholder="5511985111012" /></Field>
    <Field label="Telefone formatado (exibição)"><input style={input} value={v.phone_display} onChange={(e) => on({ ...v, phone_display: e.target.value })} /></Field>
    <Field label="Mensagem padrão"><textarea style={textarea} value={v.default_message} onChange={(e) => on({ ...v, default_message: e.target.value })} rows={3} /></Field>
    <Field label="Mensagem do CTA Surpreender"><textarea style={textarea} value={v.plan_message} onChange={(e) => on({ ...v, plan_message: e.target.value })} rows={3} /></Field>
  </Card>;
}

function FooterEditor({ v, on }: { v: Content["footer"]; on: (v: Content["footer"]) => void }) {
  return <Card>
    <SectionTitle title="Rodapé" />
    <Field label="Endereço linha 1"><input style={input} value={v.address_line1} onChange={(e) => on({ ...v, address_line1: e.target.value })} /></Field>
    <Field label="Endereço linha 2"><input style={input} value={v.address_line2} onChange={(e) => on({ ...v, address_line2: e.target.value })} /></Field>
    <Field label="Link Instagram"><input style={input} value={v.instagram_url} onChange={(e) => on({ ...v, instagram_url: e.target.value })} /></Field>
    <Field label="Copyright"><input style={input} value={v.copyright} onChange={(e) => on({ ...v, copyright: e.target.value })} /></Field>
    <Field label="Hashtag"><input style={input} value={v.hashtag} onChange={(e) => on({ ...v, hashtag: e.target.value })} /></Field>
  </Card>;
}

// ============ MEDIA INPUT ============

function MediaInput({ value, onChange, type, spec }: { value: string; onChange: (url: string) => void; type: "image" | "video"; spec: MediaSpec }) {
  const [uploading, setUploading] = useState(false);
  const [warn, setWarn] = useState<string | null>(null);
  const [info, setInfo] = useState<{ w?: number; h?: number; kb: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const s = MEDIA_SPECS[spec];

  const inspect = (file: File) => {
    const kb = Math.round(file.size / 1024);
    const warnings: string[] = [];
    if (kb > s.maxKB) warnings.push(`Arquivo grande: ${kb}KB (recomendado <${s.maxKB}KB)`);
    if (type === "image") {
      const img = new Image();
      img.onload = () => {
        setInfo({ w: img.width, h: img.height, kb });
        if (Math.abs(img.width - s.width) / s.width > 0.3) warnings.push(`Largura ${img.width}px (recomendado ~${s.width}px)`);
        if (Math.abs(img.height - s.height) / s.height > 0.3) warnings.push(`Altura ${img.height}px (recomendado ~${s.height}px)`);
        setWarn(warnings.length ? warnings.join(" · ") : null);
      };
      img.src = URL.createObjectURL(file);
    } else {
      setInfo({ kb });
      setWarn(warnings.length ? warnings.join(" · ") : null);
    }
  };

  const upload = async (file: File) => {
    inspect(file);
    setUploading(true);
    const ext = file.name.split(".").pop() ?? (type === "image" ? "jpg" : "mp4");
    const path = `${spec}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("site-media").upload(path, file, { contentType: file.type, upsert: false });
    setUploading(false);
    if (error) { alert("Erro no upload: " + error.message); return; }
    const { data } = supabase.storage.from("site-media").getPublicUrl(path);
    onChange(data.publicUrl);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <input style={{ ...input, flex: 1 }} value={value} onChange={(e) => onChange(e.target.value)} placeholder="URL ou faça upload abaixo" />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ ...ghost, whiteSpace: "nowrap" }}>
          {uploading ? "Enviando..." : "📤 Upload"}
        </button>
        {value && <button type="button" onClick={() => onChange("")} style={{ ...ghost, color: "#dc2626" }}>✕</button>}
      </div>
      <input ref={fileRef} type="file" accept={type === "image" ? "image/*" : "video/*"} style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
        💡 Recomendado: {s.width}×{s.height}px, &lt;{s.maxKB}KB, {s.formats}. {s.note}.
      </div>
      {info && (
        <div style={{ fontSize: 11, color: warn ? "#b45309" : "#16a34a", marginTop: 2 }}>
          {info.w ? `${info.w}×${info.h}px · ` : ""}{info.kb}KB {warn ? `⚠ ${warn}` : "✓ Dentro do recomendado"}
        </div>
      )}
      {value && (
        type === "image" ? <img src={value} alt="" style={{ marginTop: 8, maxWidth: 200, maxHeight: 120, borderRadius: 6, border: "1px solid #e5e7eb" }} />
        : <video src={value} controls style={{ marginTop: 8, maxWidth: 240, maxHeight: 160, borderRadius: 6 }} />
      )}
    </div>
  );
}

// ============ LIST EDITOR ============

function ListEditor<T>({ items, onChange, render, newItem }: { items: T[]; onChange: (items: T[]) => void; render: (item: T, i: number, upd: (v: T) => void) => React.ReactNode; newItem: () => T }) {
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir; if (j < 0 || j >= items.length) return;
    const next = [...items]; [next[i], next[j]] = [next[j], next[i]]; onChange(next);
  };
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ position: "relative", marginBottom: 12 }}>
          <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 4, zIndex: 2 }}>
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} style={tinyBtn}>↑</button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} style={tinyBtn}>↓</button>
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} style={{ ...tinyBtn, color: "#dc2626" }}>✕</button>
          </div>
          {render(item, i, (v) => { const next = [...items]; next[i] = v; onChange(next); })}
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, newItem()])} style={{ ...ghost, width: "100%", marginTop: 8 }}>+ Adicionar</button>
    </div>
  );
}

// ============ USERS ============

function UsersSection({ currentUserId, showToast }: { currentUserId: string; showToast: (msg: string, kind?: "ok" | "err") => void }) {
  type UserRow = { id: string; email: string; role: "owner" | "admin" };
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("id, email").order("email");
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    if (profiles && roles) {
      setUsers(profiles.map((p) => ({ id: p.id, email: p.email, role: roles.find((r) => r.user_id === p.id && r.role === "owner") ? "owner" : "admin" })));
    }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const transfer = async (id: string, email: string) => {
    if (!confirm(`Transferir posse de Dono para ${email}?\nVocê será rebaixado a Administrador.`)) return;
    const { error } = await supabase.rpc("transfer_ownership", { _new_owner_id: id });
    if (error) showToast(error.message, "err");
    else { showToast("Posse transferida"); window.location.reload(); }
  };
  const del = async (id: string, email: string) => {
    if (!confirm(`Remover ${email} permanentemente?`)) return;
    const { error } = await supabase.rpc("delete_admin_user", { _target_id: id });
    if (error) showToast(error.message, "err"); else { showToast("Removido"); load(); }
  };

  return <Card>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <SectionTitle title="Usuários do Painel" desc="Gerencie administradores e a posse." />
      <button onClick={() => setShowCreate(true)} style={primary}>+ Novo Administrador</button>
    </div>
    {loading ? <div style={{ color: "#666" }}>Carregando...</div> : (
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr style={{ background: "#fafafa" }}><th style={th}>E-mail</th><th style={th}>Cargo</th><th style={{ ...th, textAlign: "right" }}>Ações</th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td style={td}>{u.email}</td>
              <td style={td}><span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: u.role === "owner" ? "#fee2e2" : "#dbeafe", color: u.role === "owner" ? "#b91c1c" : "#1d4ed8" }}>{u.role === "owner" ? "Dono" : "Administrador"}</span></td>
              <td style={{ ...td, textAlign: "right" }}>
                {u.id === currentUserId ? <span style={{ color: "#999", fontSize: 12 }}>(você)</span>
                : u.role === "owner" ? <span style={{ color: "#999", fontSize: 12 }}>—</span>
                : <div style={{ display: "inline-flex", gap: 6 }}>
                    <button onClick={() => setEditing(u)} style={smallBtn}>Editar</button>
                    <button onClick={() => transfer(u.id, u.email)} style={{ ...smallBtn, background: "#fef3c7", color: "#92400e" }}>Tornar Dono</button>
                    <button onClick={() => del(u.id, u.email)} style={{ ...smallBtn, background: "#fee2e2", color: "#b91c1c" }}>Remover</button>
                  </div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
    {showCreate && <UserModal title="Novo Administrador" onClose={() => setShowCreate(false)} onDone={() => { setShowCreate(false); load(); showToast("Criado"); }} onError={(m) => showToast(m, "err")} />}
    {editing && <UserModal title={`Editar: ${editing.email}`} editing={editing} onClose={() => setEditing(null)} onDone={() => { setEditing(null); load(); showToast("Atualizado"); }} onError={(m) => showToast(m, "err")} />}
  </Card>;
}

function UserModal({ title, editing, onClose, onDone, onError }: { title: string; editing?: { id: string; email: string }; onClose: () => void; onDone: () => void; onError: (m: string) => void }) {
  const [email, setEmail] = useState(editing?.email ?? "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const fn = editing ? "update-admin" : "create-admin";
    const body: Record<string, string> = editing ? { user_id: editing.id, email, ...(password ? { password } : {}) } : { email, password };
    const { data, error } = await supabase.functions.invoke(fn, { body });
    setBusy(false);
    if (error || (data && data.error)) { onError((data?.error as string) || error?.message || "Erro"); return; }
    onDone();
  };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "grid", placeItems: "center", zIndex: 50, padding: 16 }}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} style={{ background: "white", borderRadius: 12, padding: 24, width: "100%", maxWidth: 420 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>{title}</h3>
        <Field label="E-mail"><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={input} /></Field>
        <Field label={editing ? "Nova senha (opcional)" : "Senha (mín. 6)"}><input type="password" required={!editing} minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} style={input} /></Field>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
          <button type="button" onClick={onClose} style={ghost}>Cancelar</button>
          <button type="submit" disabled={busy} style={primary}>{busy ? "..." : "Salvar"}</button>
        </div>
      </form>
    </div>
  );
}

// ============ PRIMITIVES ============

function Card({ children }: { children: React.ReactNode }) { return <div style={{ background: "white", borderRadius: 12, padding: 24, border: "1px solid #e5e7eb" }}>{children}</div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div style={{ marginBottom: 14 }}><label style={{ display: "block", fontSize: 12, color: "#444", marginBottom: 4, fontWeight: 500 }}>{label}</label>{children}</div>; }
function Row({ children }: { children: React.ReactNode }) { return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>{children}</div>; }
function Center({ children }: { children: React.ReactNode }) { return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#666", fontFamily: "Inter, system-ui, sans-serif" }}>{children}</div>; }

const hdr: React.CSSProperties = { background: "white", borderBottom: "1px solid #e5e7eb", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 };
const sidebar: React.CSSProperties = { width: 230, background: "#0f172a", padding: "16px 8px", overflowY: "auto", flexShrink: 0 };
const sideBtn: React.CSSProperties = { display: "block", width: "100%", padding: "10px 14px", border: "none", borderRadius: 6, fontSize: 13, textAlign: "left", cursor: "pointer", marginBottom: 2, transition: "background .15s" };
const input: React.CSSProperties = { width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
const textarea: React.CSSProperties = { ...input, fontFamily: "inherit", resize: "vertical" };
const primary: React.CSSProperties = { padding: "8px 16px", borderRadius: 6, border: "none", background: "#dc2626", color: "white", fontWeight: 600, fontSize: 13, cursor: "pointer" };
const ghost: React.CSSProperties = { padding: "8px 14px", borderRadius: 6, border: "1px solid #e5e7eb", background: "white", color: "#333", fontSize: 13, cursor: "pointer", textDecoration: "none", display: "inline-block" };
const smallBtn: React.CSSProperties = { padding: "5px 10px", borderRadius: 6, border: "none", background: "#f3f4f6", color: "#333", fontSize: 12, cursor: "pointer", fontWeight: 500 };
const tinyBtn: React.CSSProperties = { padding: "2px 8px", borderRadius: 4, border: "1px solid #e5e7eb", background: "white", fontSize: 11, cursor: "pointer" };
const subCard: React.CSSProperties = { padding: 14, border: "1px solid #e5e7eb", borderRadius: 8, background: "#fafafa", paddingTop: 32 };
const th: React.CSSProperties = { textAlign: "left", padding: "10px 12px", fontSize: 12, color: "#666", fontWeight: 600 };
const td: React.CSSProperties = { padding: "12px", fontSize: 14 };
