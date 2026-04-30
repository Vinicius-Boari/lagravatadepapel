import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FormField, TextInput, TextArea, Section, ItemCard, AddBtn, PrimaryBtn, GhostBtn } from "@/components/admin/FormUI";
import { MediaUploader } from "@/components/admin/MediaUploader";

type IGPost = {
  id: string;
  image_url: string;
  caption: string;
  permalink: string | null;
  position: number;
  is_published: boolean;
  source: string;
};

type IGConfig = {
  handle?: string;
  profile_url?: string;
  title?: string;
  subtitle?: string;
  mode?: "manual" | "graph_api";
  access_token_set?: boolean;
};

export function InstagramTab({ onToast }: { onToast: (m: string, kind?: "ok" | "err") => void }) {
  const [posts, setPosts] = useState<IGPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<IGConfig>({});
  const [editing, setEditing] = useState<IGPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from("instagram_posts").select("*").order("position", { ascending: true }),
      supabase.from("site_content").select("value").eq("key", "instagram_config").maybeSingle(),
    ]);
    setPosts((p ?? []) as IGPost[]);
    setConfig((c?.value ?? {}) as IGConfig);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const togglePublish = async (post: IGPost) => {
    const { error } = await supabase.from("instagram_posts").update({ is_published: !post.is_published }).eq("id", post.id);
    if (error) onToast(error.message, "err");
    else { onToast(post.is_published ? "Post ocultado" : "Post publicado"); load(); }
  };

  const remove = async (post: IGPost) => {
    if (!confirm("Remover este post?")) return;
    const { error } = await supabase.from("instagram_posts").delete().eq("id", post.id);
    if (error) onToast(error.message, "err");
    else { onToast("Post removido"); load(); }
  };

  const move = async (post: IGPost, dir: -1 | 1) => {
    const sorted = [...posts].sort((a, b) => a.position - b.position);
    const idx = sorted.findIndex((p) => p.id === post.id);
    const swap = sorted[idx + dir];
    if (!swap) return;
    await supabase.from("instagram_posts").update({ position: swap.position }).eq("id", post.id);
    await supabase.from("instagram_posts").update({ position: post.position }).eq("id", swap.id);
    load();
  };

  const saveConfig = async () => {
    setSavingConfig(true);
    const { error } = await supabase
      .from("site_content")
      .upsert({ key: "instagram_config", value: config, draft_value: null }, { onConflict: "key" });
    setSavingConfig(false);
    if (error) onToast(error.message, "err");
    else onToast("Configuração do Instagram salva");
  };

  return (
    <div style={{ padding: "36px 36px 100px", maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid #1a1a1a" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, margin: 0, color: "#fafafa", letterSpacing: "-0.02em", fontWeight: 600 }}>Posts do Instagram</h1>
        <p style={{ fontSize: 14, color: "#888", margin: "8px 0 0", maxWidth: 720, lineHeight: 1.5 }}>
          Gerencie a galeria 3D do Instagram que aparece no site público. Os posts são exibidos imediatamente assim que publicados.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 360px", gap: 20, alignItems: "start" }}>
        {/* POSTS */}
        <div>
          <Section title="Posts" description="Adicione, reordene e oculte posts. A ordem aqui é a ordem no carrossel 3D.">
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <PrimaryBtn onClick={() => setCreating(true)}>+ Adicionar post</PrimaryBtn>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: "#666", letterSpacing: "0.05em", textTransform: "uppercase", fontSize: 12 }}>Carregando…</div>
            ) : posts.length === 0 ? (
              <div style={{
                padding: 60, textAlign: "center", borderRadius: 12,
                background: "#0a0a0a", border: "2px dashed #1f1f1f", color: "#666",
              }}>
                <div style={{ fontSize: 42, marginBottom: 10, color: "#dc2626", opacity: 0.5 }}>◉</div>
                <p style={{ fontSize: 15, marginBottom: 4, color: "#bbb" }}>Nenhum post ainda.</p>
                <p style={{ fontSize: 13, color: "#666" }}>Clique em "Adicionar post" para começar.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {posts.map((p, i) => (
                  <ItemCard
                    key={p.id} index={i}
                    title={p.caption?.slice(0, 60) || `Post #${i + 1}`}
                    onRemove={() => remove(p)}
                    onMoveUp={() => move(p, -1)}
                    onMoveDown={() => move(p, 1)}
                    canMoveUp={i > 0} canMoveDown={i < posts.length - 1}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "100px 1fr auto", gap: 14, alignItems: "center" }}>
                      <div style={{
                        width: 100, height: 100, borderRadius: 10, overflow: "hidden",
                        background: "#0a0a0a", display: "grid", placeItems: "center",
                        border: "1px solid #1f1f1f",
                      }}>
                        {p.image_url
                          ? <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <span style={{ color: "#444", fontSize: 11 }}>sem imagem</span>}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: "#ccc", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {p.caption || <em style={{ color: "#666" }}>sem legenda</em>}
                        </div>
                        <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{
                            fontSize: 10, padding: "3px 10px", borderRadius: 999, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
                            background: p.is_published ? "rgba(220,38,38,0.15)" : "#1a1a1a",
                            color: p.is_published ? "#fca5a5" : "#888",
                            border: p.is_published ? "1px solid #5a1a1a" : "1px solid #2a2a2a",
                          }}>{p.is_published ? "Publicado" : "Oculto"}</span>
                          {p.permalink && (
                            <a href={p.permalink} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#dc2626", textDecoration: "none" }}>
                              ver no instagram ↗
                            </a>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <GhostBtn onClick={() => setEditing(p)}>Editar</GhostBtn>
                        <GhostBtn onClick={() => togglePublish(p)}>
                          {p.is_published ? "Ocultar" : "Publicar"}
                        </GhostBtn>
                      </div>
                    </div>
                  </ItemCard>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* CONFIG SIDEBAR */}
        <div style={{ position: "sticky", top: 16 }}>
          <Section title="Conexão & exibição" description="Como a seção do Instagram aparece no site.">
            <FormField label="Handle (sem @)">
              <TextInput value={config.handle ?? ""} onChange={(e) => setConfig({ ...config, handle: e.target.value.replace(/^@/, "") })} placeholder="lagravatadepapel" />
            </FormField>
            <FormField label="URL do perfil">
              <TextInput value={config.profile_url ?? ""} onChange={(e) => setConfig({ ...config, profile_url: e.target.value })} />
            </FormField>
            <FormField label="Título da seção">
              <TextInput value={config.title ?? ""} onChange={(e) => setConfig({ ...config, title: e.target.value })} />
            </FormField>
            <FormField label="Subtítulo">
              <TextArea value={config.subtitle ?? ""} onChange={(e) => setConfig({ ...config, subtitle: e.target.value })} rows={2} />
            </FormField>
            <FormField label="Modo de integração">
              <select
                value={config.mode ?? "manual"}
                onChange={(e) => setConfig({ ...config, mode: e.target.value as any })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", background: "white", fontSize: 14 }}
              >
                <option value="manual">Manual — eu adiciono os posts</option>
                <option value="graph_api">Instagram Graph API (em breve)</option>
              </select>
            </FormField>

            {config.mode === "graph_api" && (
              <div style={{
                marginTop: 8, padding: 12, borderRadius: 9,
                background: "#1a0808", border: "1px solid #5a1a1a", fontSize: 12, color: "#fca5a5", lineHeight: 1.5,
              }}>
                A integração com a Graph API requer um token de acesso de uma conta Business/Creator do Instagram conectada ao Facebook Page.
                Quando estiver pronto, peça no chat: <strong>"conectar Instagram Graph API"</strong>.
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
              <PrimaryBtn onClick={saveConfig} disabled={savingConfig}>
                {savingConfig ? "Salvando…" : "Salvar configuração"}
              </PrimaryBtn>
            </div>
          </Section>
        </div>
      </div>

      {creating && <PostEditor post={null} onClose={() => setCreating(false)} onSaved={() => { setCreating(false); load(); onToast("Post adicionado"); }} onError={(m) => onToast(m, "err")} nextPosition={posts.length} />}
      {editing && <PostEditor post={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); onToast("Post atualizado"); }} onError={(m) => onToast(m, "err")} />}
    </div>
  );
}

function PostEditor({ post, onClose, onSaved, onError, nextPosition = 0 }: {
  post: IGPost | null; onClose: () => void; onSaved: () => void; onError: (m: string) => void; nextPosition?: number;
}) {
  const [imageUrl, setImageUrl] = useState(post?.image_url ?? "");
  const [caption, setCaption] = useState(post?.caption ?? "");
  const [permalink, setPermalink] = useState(post?.permalink ?? "");
  const [isPublished, setIsPublished] = useState(post?.is_published ?? true);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!imageUrl) { onError("Adicione uma imagem"); return; }
    setBusy(true);
    if (post) {
      const { error } = await supabase.from("instagram_posts")
        .update({ image_url: imageUrl, caption, permalink: permalink || null, is_published: isPublished })
        .eq("id", post.id);
      if (error) { onError(error.message); setBusy(false); return; }
    } else {
      const { error } = await supabase.from("instagram_posts")
        .insert({ image_url: imageUrl, caption, permalink: permalink || null, is_published: isPublished, position: nextPosition, source: "manual" });
      if (error) { onError(error.message); setBusy(false); return; }
    }
    setBusy(false);
    onSaved();
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.6)",
      display: "grid", placeItems: "center", zIndex: 100, padding: 16,
      animation: "adminFade .2s ease",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "white", borderRadius: 14, width: "100%", maxWidth: 560, padding: 24,
      }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, margin: "0 0 16px" }}>
          {post ? "Editar post" : "Novo post do Instagram"}
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 16 }}>
          <MediaUploader folder="instagram" value={imageUrl} onChange={setImageUrl} aspect="square" />
          <div>
            <FormField label="Legenda">
              <TextArea value={caption} onChange={(e) => setCaption(e.target.value)} rows={4} placeholder="Texto que aparece no card." />
            </FormField>
            <FormField label="Link no Instagram (opcional)" hint="Cole a URL do post original.">
              <TextInput value={permalink} onChange={(e) => setPermalink(e.target.value)} placeholder="https://www.instagram.com/p/..." />
            </FormField>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151" }}>
              <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
              Publicar imediatamente no site
            </label>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 18 }}>
          <GhostBtn onClick={onClose}>Cancelar</GhostBtn>
          <PrimaryBtn onClick={save} disabled={busy}>{busy ? "Salvando..." : "Salvar"}</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}
