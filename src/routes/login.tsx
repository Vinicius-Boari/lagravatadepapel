import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "La Gravata — Acesso Administrativo" },
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
      if (session) {
        window.location.href = "/admin";
      }
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
      setError(err.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : err.message);
      return;
    }

    if (data.session) {
      // Clear storage cache if any
      localStorage.removeItem("lg_user_role");
      window.location.href = "/admin";
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: "#050505",
      color: "#fff",
      fontFamily: "Inter, sans-serif",
      padding: 20
    }}>
      <form onSubmit={onSubmit} style={{
        width: "100%", maxWidth: 380, padding: 40,
        background: "#0d0d0d", borderRadius: 20, border: "1px solid #1a1a1a",
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, margin: 0 }}>Painel</h1>
          <p style={{ fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>La Gravata de Papel</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 11, color: "#888", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>E-mail</label>
          <input 
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            style={inputStyle} placeholder="seu@email.com"
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 11, color: "#888", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Senha</label>
          <input 
            type="password" required value={password} onChange={e => setPassword(e.target.value)}
            style={inputStyle} placeholder="••••••••"
          />
        </div>

        {error && <div style={{ marginBottom: 20, color: "#ef4444", fontSize: 13, textAlign: "center" }}>{error}</div>}

        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? "Entrando..." : "Acessar Painel"}
        </button>

        <Link to="/" style={{ display: "block", textAlign: "center", marginTop: 24, color: "#444", fontSize: 12, textDecoration: "none" }}>
          ← Voltar para o site
        </Link>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "12px 16px", borderRadius: 8, background: "#050505",
  border: "1px solid #222", color: "#fff", outline: "none", fontSize: 14
};

const btnStyle = {
  width: "100%", padding: "14px", borderRadius: 8, background: "#8b1a1a",
  color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 14
};
