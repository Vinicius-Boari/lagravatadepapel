import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Painel — Login" },
      { name: "description", content: "Acesso ao painel administrativo." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (err) {
      setError("Credenciais inválidas");
      return;
    }
    navigate({ to: "/admin" });
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: "#0a0a0a",
      color: "#f5f5f5",
      fontFamily: "Inter, system-ui, sans-serif",
      padding: "24px",
    }}>
      <form onSubmit={onSubmit} style={{
        width: "100%",
        maxWidth: 380,
        background: "#141414",
        border: "1px solid #262626",
        borderRadius: 12,
        padding: 32,
        boxShadow: "0 20px 60px rgba(0,0,0,.5)",
      }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, marginBottom: 4 }}>
          Painel Administrativo
        </h1>
        <p style={{ color: "#888", fontSize: 13, marginBottom: 24 }}>La Gravata de Papel</p>

        <label style={{ display: "block", fontSize: 12, color: "#aaa", marginBottom: 6 }}>E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <label style={{ display: "block", fontSize: 12, color: "#aaa", margin: "16px 0 6px" }}>Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        {error && (
          <div style={{ color: "#ff6b6b", fontSize: 13, marginTop: 12 }}>{error}</div>
        )}

        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <Link to="/" style={{ display: "block", textAlign: "center", marginTop: 16, color: "#888", fontSize: 13, textDecoration: "none" }}>
          ← Voltar ao site
        </Link>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #2a2a2a",
  background: "#0a0a0a",
  color: "#f5f5f5",
  fontSize: 14,
  outline: "none",
};

const btnStyle: React.CSSProperties = {
  marginTop: 24,
  width: "100%",
  padding: "12px 16px",
  borderRadius: 8,
  border: "none",
  background: "#dc2626",
  color: "white",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};
