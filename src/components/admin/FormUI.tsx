import type { CSSProperties, ReactNode } from "react";

export function FormField({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
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
  return <textarea {...props} style={{ ...inputStyle, minHeight: 80, fontFamily: "inherit", resize: "vertical", ...(props.style ?? {}) }} />;
}

export function Section({ title, description, children, action }: { title: string; description?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111", margin: 0 }}>{title}</h3>
          {description && <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>{description}</p>}
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
      border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, marginBottom: 12, background: "#fafafa",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {title || `Item ${index + 1}`}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {onMoveUp && (
            <button type="button" onClick={onMoveUp} disabled={!canMoveUp} style={iconBtn(!!canMoveUp)} title="Mover para cima">↑</button>
          )}
          {onMoveDown && (
            <button type="button" onClick={onMoveDown} disabled={!canMoveDown} style={iconBtn(!!canMoveDown)} title="Mover para baixo">↓</button>
          )}
          <button type="button" onClick={onRemove} style={{ ...iconBtn(true), color: "#b91c1c", borderColor: "#fecaca" }} title="Remover">✕</button>
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

const labelStyle: CSSProperties = { display: "block", fontSize: 13, color: "#374151", fontWeight: 600, marginBottom: 4 };
const hintStyle: CSSProperties = { fontSize: 11, color: "#9ca3af", marginBottom: 6 };
const inputStyle: CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1px solid #d1d5db", fontSize: 14, outline: "none", background: "white", color: "#111",
};
const primaryBtn: CSSProperties = {
  padding: "9px 16px", borderRadius: 8, border: "none", background: "#dc2626",
  color: "white", fontWeight: 600, fontSize: 14, cursor: "pointer",
};
const ghostBtn: CSSProperties = {
  padding: "9px 16px", borderRadius: 8, border: "1px solid #e5e7eb",
  background: "white", color: "#374151", fontSize: 14, cursor: "pointer", fontWeight: 500,
};
const addBtn: CSSProperties = {
  width: "100%", padding: "12px", borderRadius: 8, border: "2px dashed #d1d5db",
  background: "white", color: "#6b7280", fontSize: 13, cursor: "pointer", fontWeight: 500,
};
const iconBtn = (enabled: boolean): CSSProperties => ({
  width: 28, height: 28, padding: 0, borderRadius: 6,
  border: "1px solid #e5e7eb", background: enabled ? "white" : "#f9fafb",
  color: enabled ? "#374151" : "#d1d5db", fontSize: 14, cursor: enabled ? "pointer" : "not-allowed",
  display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 600,
});
