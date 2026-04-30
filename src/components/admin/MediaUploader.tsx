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

  const isVideo = value && /\.(mp4|webm|mov)$/i.test(value);

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
      <div style={{
        position: "relative",
        width: "100%",
        aspectRatio: aspectStyle[aspect],
        background: "#f3f4f6",
        border: "2px dashed #d1d5db",
        borderRadius: 10,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => {
          e.preventDefault();
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
          <div style={{ textAlign: "center", color: "#9ca3af", padding: 16 }}>
            <div style={{ fontSize: 32 }}>📷</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>Clique ou arraste uma imagem</div>
          </div>
        )}
        {busy && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,.5)",
            display: "grid", placeItems: "center", color: "white", fontSize: 13,
          }}>Enviando...</div>
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
            flex: 1, padding: "6px 10px", borderRadius: 6,
            border: "1px solid #d1d5db", fontSize: 12, outline: "none",
          }}
        />
        {value && (
          <button
            type="button"
            onClick={() => { onChange(""); setUrlInput(""); }}
            style={{
              padding: "6px 10px", border: "1px solid #fee2e2", background: "#fef2f2",
              color: "#b91c1c", borderRadius: 6, fontSize: 12, cursor: "pointer",
            }}
          >Remover</button>
        )}
      </div>

      {error && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 12, color: "#374151", fontWeight: 600, marginBottom: 6,
};
