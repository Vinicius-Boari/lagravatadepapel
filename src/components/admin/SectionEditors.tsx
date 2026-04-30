import { FormField, TextInput, TextArea, Section, ItemCard, AddBtn } from "./FormUI";
import { MediaUploader } from "./MediaUploader";

export type SectionEditorProps = {
  value: any;
  onChange: (v: any) => void;
};

const moveItem = <T,>(arr: T[], from: number, to: number): T[] => {
  const next = [...arr];
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next;
};

/* ---------------- HERO ---------------- */
export function HeroEditor({ value, onChange }: SectionEditorProps) {
  const v = value || {};
  const set = (k: string, val: any) => onChange({ ...v, [k]: val });
  const lines: string[] = v.title_lines ?? [];
  const images: string[] = v.images ?? [];

  return (
    <Section title="Hero (capa)" description="A primeira coisa que o visitante vê. Edite o título, subtítulo, localização e botão.">
      <FormField label="Linhas do título" hint="A última linha aparece em itálico. Adicione/remova quantas quiser.">
        {lines.map((l, i) => (
          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            <TextInput
              value={l}
              onChange={(e) => set("title_lines", lines.map((x, ix) => ix === i ? e.target.value : x))}
            />
            <button type="button" onClick={() => set("title_lines", lines.filter((_, ix) => ix !== i))}
              style={{ padding: "0 14px", border: "1px solid #5a1a1a", background: "#1a0808", color: "#fca5a5", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>✕</button>
          </div>
        ))}
        <AddBtn onClick={() => set("title_lines", [...lines, ""])}>+ Adicionar linha</AddBtn>
      </FormField>

      <FormField label="Subtítulo" hint="Use Enter para quebrar linha.">
        <TextArea value={v.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} />
      </FormField>

      <FormField label="Localização (canto direito)" hint="Use Enter para quebrar linha.">
        <TextArea value={v.location ?? ""} onChange={(e) => set("location", e.target.value)} rows={2} />
      </FormField>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
        <FormField label="Texto do botão"><TextInput value={v.cta_label ?? ""} onChange={(e) => set("cta_label", e.target.value)} /></FormField>
        <FormField label="Link do botão (WhatsApp/URL)"><TextInput value={v.cta_url ?? ""} onChange={(e) => set("cta_url", e.target.value)} /></FormField>
      </div>

      <FormField label="Imagens da capa (3 imagens flutuantes)">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[0, 1, 2].map((i) => (
            <MediaUploader
              key={i}
              folder="hero"
              value={images[i] ?? ""}
              onChange={(url) => {
                const next = [...images];
                next[i] = url;
                set("images", next);
              }}
              aspect="portrait"
            />
          ))}
        </div>
      </FormField>
    </Section>
  );
}

/* ---------------- SERVICES ---------------- */
export function ServicesEditor({ value, onChange }: SectionEditorProps) {
  const v = value || {};
  const items: any[] = v.items ?? [];
  const set = (k: string, val: any) => onChange({ ...v, [k]: val });
  const updateItem = (i: number, patch: any) => set("items", items.map((it, ix) => ix === i ? { ...it, ...patch } : it));

  return (
    <Section title="Serviços" description="Cards mostrando o que vocês oferecem. Use apenas IMAGENS aqui — vídeos vão na seção 'Vídeos'.">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Título (linha 1)"><TextInput value={v.heading ?? ""} onChange={(e) => set("heading", e.target.value)} /></FormField>
        <FormField label="Título (linha 2 — destacada)"><TextInput value={v.heading_em ?? ""} onChange={(e) => set("heading_em", e.target.value)} /></FormField>
      </div>

      <div style={{ marginTop: 8 }}>
        {items.map((it, i) => (
          <ItemCard
            key={i} index={i} title={it.title || `Serviço ${i + 1}`}
            onRemove={() => set("items", items.filter((_, ix) => ix !== i))}
            onMoveUp={() => set("items", moveItem(items, i, i - 1))}
            onMoveDown={() => set("items", moveItem(items, i, i + 1))}
            canMoveUp={i > 0} canMoveDown={i < items.length - 1}
          >
            <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 14 }}>
              <MediaUploader folder="services" value={it.img ?? ""} onChange={(url) => updateItem(i, { img: url })} aspect="square" />
              <div>
                <FormField label="Título"><TextInput value={it.title ?? ""} onChange={(e) => updateItem(i, { title: e.target.value })} /></FormField>
                <FormField label="Descrição curta"><TextInput value={it.desc ?? ""} onChange={(e) => updateItem(i, { desc: e.target.value })} /></FormField>
              </div>
            </div>
          </ItemCard>
        ))}
      </div>
      <AddBtn onClick={() => set("items", [...items, { img: "", title: "", desc: "" }])}>+ Adicionar serviço</AddBtn>
    </Section>
  );
}

/* ---------------- VIDEOS ---------------- */
export function VideosEditor({ value, onChange }: SectionEditorProps) {
  const v = value || {};
  const items: any[] = v.items ?? [];
  const set = (k: string, val: any) => onChange({ ...v, [k]: val });
  const updateItem = (i: number, patch: any) => set("items", items.map((it, ix) => ix === i ? { ...it, ...patch } : it));

  return (
    <Section title="Vídeos" description="Galeria de vídeos. Cada item precisa de uma capa (imagem) e um arquivo de vídeo (.mp4). Deixe o vídeo em branco para mostrar só a capa.">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Título (linha 1)"><TextInput value={v.heading ?? ""} onChange={(e) => set("heading", e.target.value)} /></FormField>
        <FormField label="Título (destacado)"><TextInput value={v.heading_em ?? ""} onChange={(e) => set("heading_em", e.target.value)} /></FormField>
      </div>

      {items.map((it, i) => (
        <ItemCard
          key={i} index={i} title={it.title || `Vídeo ${i + 1}`}
          onRemove={() => set("items", items.filter((_, ix) => ix !== i))}
          onMoveUp={() => set("items", moveItem(items, i, i - 1))}
          onMoveDown={() => set("items", moveItem(items, i, i + 1))}
          canMoveUp={i > 0} canMoveDown={i < items.length - 1}
        >
          <div style={{ display: "grid", gridTemplateColumns: "180px 180px 1fr", gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Imagem (capa)</div>
              <MediaUploader folder="videos" value={it.poster ?? ""} onChange={(url) => updateItem(i, { poster: url })} aspect="square" />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Vídeo (.mp4)</div>
              <MediaUploader folder="videos" accept="video/*" value={it.src ?? ""} onChange={(url) => updateItem(i, { src: url })} aspect="square" />
            </div>
            <div>
              <FormField label="Título"><TextInput value={it.title ?? ""} onChange={(e) => updateItem(i, { title: e.target.value })} /></FormField>
              <FormField label="Tag/categoria"><TextInput value={it.tag ?? ""} onChange={(e) => updateItem(i, { tag: e.target.value })} /></FormField>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#ccc", cursor: "pointer" }}>
                <input type="checkbox" checked={!!it.tall} onChange={(e) => updateItem(i, { tall: e.target.checked })} style={{ accentColor: "#dc2626" }} />
                Card alto (ocupa 2 linhas)
              </label>
            </div>
          </div>
        </ItemCard>
      ))}
      <AddBtn onClick={() => set("items", [...items, { title: "", tag: "", poster: "", src: "" }])}>+ Adicionar vídeo</AddBtn>
    </Section>
  );
}

/* ---------------- PLAN ---------------- */
export function PlanEditor({ value, onChange }: SectionEditorProps) {
  const v = value || {};
  const set = (k: string, val: any) => onChange({ ...v, [k]: val });
  return (
    <Section title="O Plano" description="Bloco escuro com texto principal e botão de contato.">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Título (linha 1)"><TextInput value={v.heading ?? ""} onChange={(e) => set("heading", e.target.value)} /></FormField>
        <FormField label="Título (destacado em itálico)"><TextInput value={v.heading_em ?? ""} onChange={(e) => set("heading_em", e.target.value)} /></FormField>
      </div>
      <FormField label="Texto"><TextArea value={v.text ?? ""} onChange={(e) => set("text", e.target.value)} rows={6} /></FormField>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
        <FormField label="Texto do botão"><TextInput value={v.cta_label ?? ""} onChange={(e) => set("cta_label", e.target.value)} /></FormField>
        <FormField label="Link"><TextInput value={v.cta_url ?? ""} onChange={(e) => set("cta_url", e.target.value)} /></FormField>
      </div>
    </Section>
  );
}

/* ---------------- PLACES (Invasões) ---------------- */
export function PlacesEditor({ value, onChange }: SectionEditorProps) {
  const v = value || {};
  const items: any[] = v.items ?? [];
  const set = (k: string, val: any) => onChange({ ...v, [k]: val });
  const updateItem = (i: number, patch: any) => set("items", items.map((it, ix) => ix === i ? { ...it, ...patch } : it));
  return (
    <Section title="Invasões" description="Galeria de eventos/lugares onde vocês atuaram.">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <FormField label="Título (linha 1)"><TextInput value={v.heading ?? ""} onChange={(e) => set("heading", e.target.value)} /></FormField>
        <FormField label="Título (linha 2)"><TextInput value={v.heading2 ?? ""} onChange={(e) => set("heading2", e.target.value)} /></FormField>
        <FormField label="Link do Instagram"><TextInput value={v.instagram_url ?? ""} onChange={(e) => set("instagram_url", e.target.value)} /></FormField>
      </div>
      {items.map((it, i) => (
        <ItemCard
          key={i} index={i} title={it.title || `Invasão ${i + 1}`}
          onRemove={() => set("items", items.filter((_, ix) => ix !== i))}
          onMoveUp={() => set("items", moveItem(items, i, i - 1))}
          onMoveDown={() => set("items", moveItem(items, i, i + 1))}
          canMoveUp={i > 0} canMoveDown={i < items.length - 1}
        >
          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 14 }}>
            <MediaUploader folder="places" value={it.img ?? ""} onChange={(url) => updateItem(i, { img: url })} aspect="portrait" />
            <div>
              <FormField label="Título"><TextInput value={it.title ?? ""} onChange={(e) => updateItem(i, { title: e.target.value })} /></FormField>
              <FormField label="Tag"><TextInput value={it.tag ?? ""} onChange={(e) => updateItem(i, { tag: e.target.value })} /></FormField>
            </div>
          </div>
        </ItemCard>
      ))}
      <AddBtn onClick={() => set("items", [...items, { img: "", title: "", tag: "" }])}>+ Adicionar invasão</AddBtn>
    </Section>
  );
}

/* ---------------- ABOUT ---------------- */
export function AboutEditor({ value, onChange }: SectionEditorProps) {
  const v = value || {};
  const set = (k: string, val: any) => onChange({ ...v, [k]: val });
  const paragraphs: string[] = v.paragraphs ?? [];
  return (
    <Section title="Sobre" description="Bloco com imagem grande e texto institucional.">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Título (linha 1)"><TextInput value={v.heading ?? ""} onChange={(e) => set("heading", e.target.value)} /></FormField>
        <FormField label="Título (destacado)"><TextInput value={v.heading_em ?? ""} onChange={(e) => set("heading_em", e.target.value)} /></FormField>
      </div>
      <FormField label="Imagem principal">
        <div style={{ maxWidth: 320 }}>
          <MediaUploader folder="about" value={v.image ?? ""} onChange={(url) => set("image", url)} aspect="square" />
        </div>
      </FormField>
      <FormField label="Parágrafos">
        {paragraphs.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <TextArea value={p} onChange={(e) => set("paragraphs", paragraphs.map((x, ix) => ix === i ? e.target.value : x))} rows={3} />
            <button type="button" onClick={() => set("paragraphs", paragraphs.filter((_, ix) => ix !== i))}
              style={{ padding: "0 14px", alignSelf: "stretch", border: "1px solid #5a1a1a", background: "#1a0808", color: "#fca5a5", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>✕</button>
          </div>
        ))}
        <AddBtn onClick={() => set("paragraphs", [...paragraphs, ""])}>+ Adicionar parágrafo</AddBtn>
      </FormField>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
        <FormField label="Texto do botão"><TextInput value={v.cta_label ?? ""} onChange={(e) => set("cta_label", e.target.value)} /></FormField>
        <FormField label="Link"><TextInput value={v.cta_url ?? ""} onChange={(e) => set("cta_url", e.target.value)} /></FormField>
      </div>
    </Section>
  );
}

/* ---------------- INSTAGRAM CONFIG ---------------- */
export function InstagramConfigEditor({ value, onChange }: SectionEditorProps) {
  const v = value || {};
  const set = (k: string, val: any) => onChange({ ...v, [k]: val });
  return (
    <Section
      title="Instagram — Configuração"
      description="Define o título da seção, o @ exibido e o link do perfil. Os posts são gerenciados na aba Instagram."
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Handle (@) sem o arroba"><TextInput value={v.handle ?? ""} onChange={(e) => set("handle", e.target.value.replace(/^@/, ""))} placeholder="lagravatadepapel" /></FormField>
        <FormField label="URL do perfil"><TextInput value={v.profile_url ?? ""} onChange={(e) => set("profile_url", e.target.value)} placeholder="https://www.instagram.com/lagravatadepapel" /></FormField>
      </div>
      <FormField label="Título da seção"><TextInput value={v.title ?? ""} onChange={(e) => set("title", e.target.value)} placeholder="Siga no Instagram" /></FormField>
      <FormField label="Subtítulo"><TextArea value={v.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} rows={2} /></FormField>
      <FormField label="Modo de integração">
        <select
          value={v.mode ?? "manual"}
          onChange={(e) => set("mode", e.target.value)}
          style={{ width: "100%", padding: "11px 14px", borderRadius: 9, border: "1px solid #2c2c2c", background: "#0a0a0a", color: "#fafafa", fontSize: 14, outline: "none" }}
        >
          <option value="manual">Manual (eu adiciono os posts pelo painel)</option>
          <option value="graph_api">Instagram Graph API (em breve)</option>
        </select>
      </FormField>
    </Section>
  );
}

/* ---------------- FOOTER ---------------- */
export function FooterEditor({ value, onChange }: SectionEditorProps) {
  const v = value || {};
  const set = (k: string, val: any) => onChange({ ...v, [k]: val });
  return (
    <Section title="Rodapé / Contato" description="Telefone, endereço e links das redes sociais.">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Telefone (visível)"><TextInput value={v.phone ?? ""} onChange={(e) => set("phone", e.target.value)} /></FormField>
        <FormField label="Link do telefone"><TextInput value={v.phone_url ?? ""} onChange={(e) => set("phone_url", e.target.value)} /></FormField>
        <FormField label="Endereço (linha 1)"><TextInput value={v.address_line1 ?? ""} onChange={(e) => set("address_line1", e.target.value)} /></FormField>
        <FormField label="Endereço (linha 2)"><TextInput value={v.address_line2 ?? ""} onChange={(e) => set("address_line2", e.target.value)} /></FormField>
        <FormField label="Instagram"><TextInput value={v.instagram_url ?? ""} onChange={(e) => set("instagram_url", e.target.value)} /></FormField>
        <FormField label="WhatsApp"><TextInput value={v.whatsapp_url ?? ""} onChange={(e) => set("whatsapp_url", e.target.value)} /></FormField>
        <FormField label="Texto de copyright"><TextInput value={v.copyright ?? ""} onChange={(e) => set("copyright", e.target.value)} /></FormField>
        <FormField label="Hashtag"><TextInput value={v.hashtag ?? ""} onChange={(e) => set("hashtag", e.target.value)} /></FormField>
      </div>
    </Section>
  );
}

export const SECTION_EDITORS: Record<string, { label: string; icon: string; component: (props: SectionEditorProps) => React.ReactElement }> = {
  hero: { label: "Capa (Hero)", icon: "🎬", component: HeroEditor },
  services: { label: "Serviços", icon: "✨", component: ServicesEditor },
  videos: { label: "Vídeos", icon: "🎥", component: VideosEditor },
  plan: { label: "O Plano", icon: "📋", component: PlanEditor },
  places: { label: "Invasões", icon: "🎉", component: PlacesEditor },
  about: { label: "Sobre", icon: "ℹ️", component: AboutEditor },
  instagram_config: { label: "Instagram (config)", icon: "📸", component: InstagramConfigEditor },
  footer: { label: "Rodapé", icon: "📞", component: FooterEditor },
};
