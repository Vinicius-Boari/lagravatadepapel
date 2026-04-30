import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  accept?: string;
  aspect?: "square" | "video" | "wide" | "portrait";
};

export function MediaUploader({ value, onChange, label, folder = "uploads", accept = "image/*", aspect = "square" }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [urlInput, setUrlInput] = useState(value);
  const [hover, setHover] = useState(false);

  const isVideo = value && /\.(mp4|webm|mov)$/i.test(value);
  const acceptVideo = accept.includes("video");

  const aspectStyle: Record<string, string> = {
    square: "1 / 1",
    video: "16 / 9",
    wide: "21 / 9",
    portrait: "3 / 4",
  };

  const upload = async (file: File) => {
    setBusy(true);
    setError("");
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: err } = await supabase.storage.from("site-media").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (err) {
      setError(err.message);
      setBusy(false);
      return;
    }
    const { data } = supabase.storage.from("site-media").getPublicUrl(path);
    onChange(data.publicUrl);
    setUrlInput(data.publicUrl);
    setBusy(false);
  };

  return (
    <div>
      {label && <div style={labelStyle}>{label}</div>}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: aspectStyle[aspect],
          background: "#0a0a0a",
          border: `2px dashed ${hover ? "#dc2626" : "#2c2c2c"}`,
          borderRadius: 12,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "border-color .15s, background .15s",
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setHover(true); }}
        onDragLeave={() => setHover(false)}
        onDrop={(e) => {
          e.preventDefault();
          setHover(false);
          const f = e.dataTransfer.files?.[0];
          if (f) upload(f);
        }}
      >
        {value ? (
          isVideo ? (
            <video src={value} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )
        ) : (
          <div style={{ textAlign: "center", color: "#666", padding: 16 }}>
            <div style={{ fontSize: 36, marginBottom: 4, color: "#dc2626", opacity: 0.7 }}>{acceptVideo ? "▶" : "+"}</div>
            <div style={{ fontSize: 11, color: "#888", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 600 }}>
              {acceptVideo ? "Adicionar vídeo" : "Adicionar imagem"}
            </div>
            <div style={{ fontSize: 10, marginTop: 4, color: "#555" }}>Clique ou arraste</div>
          </div>
        )}
        {busy && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,.7)",
            display: "grid", placeItems: "center", color: "#dc2626", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em",
          }}>ENVIANDO…</div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) upload(f);
        }}
      />

      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onBlur={() => onChange(urlInput)}
          placeholder="ou cole uma URL"
          style={{
            flex: 1, padding: "7px 10px", borderRadius: 7,
            border: "1px solid #2c2c2c", fontSize: 12, outline: "none",
            background: "#0a0a0a", color: "#ccc",
          }}
        />
        {value && (
          <button
            type="button"
            onClick={() => { onChange(""); setUrlInput(""); }}
            style={{
              padding: "7px 12px", border: "1px solid #5a1a1a", background: "#1a0808",
              color: "#fca5a5", borderRadius: 7, fontSize: 11, cursor: "pointer", fontWeight: 600,
            }}
          >Remover</button>
        )}
      </div>

      {error && <div style={{ color: "#fca5a5", fontSize: 11, marginTop: 6 }}>{error}</div>}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, color: "#e5e5e5", fontWeight: 600, marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase",
};
