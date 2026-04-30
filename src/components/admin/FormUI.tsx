import type { CSSProperties, ReactNode } from "react";

export function FormField({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={labelStyle}>{label}</label>
      {hint && <div style={hintStyle}>{hint}</div>}
      {children}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...inputStyle, ...(props.style ?? {}) }} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} style={{ ...inputStyle, minHeight: 90, fontFamily: "inherit", resize: "vertical", ...(props.style ?? {}) }} />;
}

export function Section({ title, description, children, action }: { title: string; description?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div style={{
      background: "linear-gradient(180deg, #141414 0%, #0e0e0e 100%)",
      border: "1px solid #262626",
      borderRadius: 14,
      padding: 24,
      marginBottom: 18,
      boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset, 0 8px 24px rgba(0,0,0,.35)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 600, color: "#fafafa", margin: 0, letterSpacing: "-0.01em" }}>{title}</h3>
          {description && <p style={{ fontSize: 13, color: "#888", margin: "6px 0 0", maxWidth: 640, lineHeight: 1.5 }}>{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function ItemCard({ index, onRemove, onMoveUp, onMoveDown, canMoveUp, canMoveDown, children, title }: {
  index: number;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  children: ReactNode;
  title?: string;
}) {
  return (
    <div style={{
      border: "1px solid #2a2a2a",
      borderRadius: 12,
      padding: 18,
      marginBottom: 12,
      background: "#0a0a0a",
      transition: "border-color .15s",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid #1f1f1f" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {title || `Item ${index + 1}`}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {onMoveUp && (
            <button type="button" onClick={onMoveUp} disabled={!canMoveUp} style={iconBtn(!!canMoveUp)} title="Mover para cima">↑</button>
          )}
          {onMoveDown && (
            <button type="button" onClick={onMoveDown} disabled={!canMoveDown} style={iconBtn(!!canMoveDown)} title="Mover para baixo">↓</button>
          )}
          <button type="button" onClick={onRemove} style={{ ...iconBtn(true), color: "#fca5a5", borderColor: "#5a1a1a", background: "#1a0808" }} title="Remover">✕</button>
        </div>
      </div>
      {children}
    </div>
  );
}

export function PrimaryBtn(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} style={{ ...primaryBtn, ...(props.style ?? {}) }} />;
}
export function GhostBtn(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} style={{ ...ghostBtn, ...(props.style ?? {}) }} />;
}
export function AddBtn(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} style={{ ...addBtn, ...(props.style ?? {}) }} />;
}
export function DangerBtn(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} style={{ ...dangerBtn, ...(props.style ?? {}) }} />;
}

const labelStyle: CSSProperties = { display: "block", fontSize: 12, color: "#e5e5e5", fontWeight: 600, marginBottom: 6, letterSpacing: "0.02em", textTransform: "uppercase" };
const hintStyle: CSSProperties = { fontSize: 12, color: "#777", marginBottom: 8, lineHeight: 1.4 };
const inputStyle: CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 9,
  border: "1px solid #2c2c2c", fontSize: 14, outline: "none",
  background: "#0a0a0a", color: "#fafafa",
  transition: "border-color .15s, box-shadow .15s",
};
const primaryBtn: CSSProperties = {
  padding: "10px 18px", borderRadius: 9, border: "none",
  background: "linear-gradient(180deg, #ef4444 0%, #dc2626 100%)",
  color: "white", fontWeight: 600, fontSize: 13, cursor: "pointer",
  boxShadow: "0 1px 0 rgba(255,255,255,0.15) inset, 0 4px 14px rgba(220,38,38,.35)",
  letterSpacing: "0.01em",
};
const ghostBtn: CSSProperties = {
  padding: "10px 16px", borderRadius: 9, border: "1px solid #2c2c2c",
  background: "#161616", color: "#e5e5e5", fontSize: 13, cursor: "pointer", fontWeight: 500,
};
const dangerBtn: CSSProperties = {
  padding: "10px 16px", borderRadius: 9, border: "1px solid #5a1a1a",
  background: "#1a0808", color: "#fca5a5", fontSize: 13, cursor: "pointer", fontWeight: 500,
};
const addBtn: CSSProperties = {
  width: "100%", padding: "14px", borderRadius: 10, border: "2px dashed #333",
  background: "transparent", color: "#dc2626", fontSize: 13, cursor: "pointer", fontWeight: 600,
  letterSpacing: "0.02em", transition: "border-color .15s, background .15s",
};
const iconBtn = (enabled: boolean): CSSProperties => ({
  width: 30, height: 30, padding: 0, borderRadius: 7,
  border: "1px solid #2c2c2c", background: enabled ? "#161616" : "#0a0a0a",
  color: enabled ? "#e5e5e5" : "#444", fontSize: 14, cursor: enabled ? "pointer" : "not-allowed",
  display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 600,
});
