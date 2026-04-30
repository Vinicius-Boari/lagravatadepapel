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
    const { data, error: err } = await supabase.auth.signInWithPassword({ 
      email: email.trim().toLowerCase(), 
      password 
    });

    if (err) {
      setLoading(false);
      const msg = err.message === "Invalid login credentials" 
        ? "E-mail ou senha incorretos." 
        : err.message;
      setError(msg);
      return;
    }

    if (!data.session) {
      setLoading(false);
      setError("Não foi possível iniciar a sessão.");
      return;
    }

    // Navegação imediata para maior rapidez
    navigate({ to: "/admin" });
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background:
        "radial-gradient(60% 50% at 20% 10%, rgba(220,38,38,0.15), transparent 60%), radial-gradient(50% 50% at 90% 100%, rgba(221,42,123,0.12), transparent 60%), #0a0a0a",
      color: "#f5f5f5",
      fontFamily: "Inter, system-ui, sans-serif",
      padding: "24px",
    }}>
      <form onSubmit={onSubmit} className="admin-fade-in" style={{
        width: "100%",
        maxWidth: 400,
        background: "rgba(20,20,20,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: 36,
        boxShadow: "0 30px 80px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,0.03) inset",
      }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, marginBottom: 4, fontWeight: 600, letterSpacing: "-0.01em" }}>
          Painel
        </h1>
        <p style={{ color: "#888", fontSize: 13, marginBottom: 28, letterSpacing: "0.02em" }}>La Gravata de Papel</p>

        <label style={{ display: "block", fontSize: 11, color: "#9ca3af", marginBottom: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
          autoFocus
        />

        <label style={{ display: "block", fontSize: 11, color: "#9ca3af", margin: "18px 0 6px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        {error && (
          <div style={{
            marginTop: 14, padding: "10px 12px", borderRadius: 8,
            background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.25)",
            color: "#fca5a5", fontSize: 13,
          }}>{error}</div>
        )}

        <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.7 : 1 }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
        >
          {loading ? "Entrando..." : "Entrar →"}
        </button>

        <Link to="/" style={{ display: "block", textAlign: "center", marginTop: 18, color: "#888", fontSize: 13, textDecoration: "none", transition: "color .2s" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#888"; }}
        >
          ← Voltar ao site
        </Link>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(0,0,0,0.5)",
  color: "#f5f5f5",
  fontSize: 14,
  outline: "none",
  transition: "border-color .2s, background .2s",
};

const btnStyle: React.CSSProperties = {
  marginTop: 26,
  width: "100%",
  padding: "13px 16px",
  borderRadius: 10,
  border: "none",
  background: "linear-gradient(135deg, #dc2626, #b91c1c)",
  color: "white",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  letterSpacing: "0.02em",
  boxShadow: "0 10px 30px rgba(220,38,38,0.35)",
  transition: "transform .2s, box-shadow .2s",
};
