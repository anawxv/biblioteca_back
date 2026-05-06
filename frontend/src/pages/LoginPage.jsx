import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { TopBar } from "../components/TopBar";
import { useAuth } from "../context/AuthContext";

function SocialButton({ label, icon, onClick }) {
  return (
    <button className={`social-icon social-icon--${label.toLowerCase().split(" ").pop()}`} onClick={onClick} type="button" aria-label={label}>
      {icon}
    </button>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, preferredRole, user } = useAuth();
  const [form, setForm] = useState({ email: "", senha: "" });
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === "funcionario" ? "/funcionario/painel" : "/cliente/catalogo", {
        replace: true,
      });
    }
  }, [navigate, user]);

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback("");

    if (!form.email.trim() || !form.senha.trim()) {
      setFeedback("Informe e-mail e senha para entrar.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await login(form);
      const roleDestination = response.user.role === "funcionario" ? "/funcionario/painel" : "/cliente/catalogo";
      const destination = location.state?.from || roleDestination;
      navigate(destination, { replace: true });
    } catch (error) {
      const message = error.message || "";
      setFeedback(message.startsWith("Este usuário") || message.startsWith("Tipo de acesso") ? message : "E-mail ou senha incorretos.");
    } finally {
      setSubmitting(false);
    }
  }

  function loginComGoogle() {
    setFeedback("Login social ainda não configurado.");
  }

  function loginComFacebook() {
    setFeedback("Login social ainda não configurado.");
  }

  function loginComApple() {
    setFeedback("Login social ainda não configurado.");
  }

  return (
    <main className="page">
      <TopBar title="Bem-vindo de volta à Biblioteca!" />

      <section className="panel">
        <div className="register-role-note">
          {preferredRole ? (
            <>
              Entrando como <strong>{preferredRole === "funcionario" ? "funcionário" : "cliente"}</strong>
            </>
          ) : (
            "Escolha cliente ou funcionário na tela inicial antes de entrar."
          )}
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <input
            className="input"
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="E-mail"
            type="email"
            value={form.email}
          />
          <input
            className="input"
            onChange={(event) => setForm((current) => ({ ...current, senha: event.target.value }))}
            placeholder="Senha"
            type="password"
            value={form.senha}
          />

          {feedback ? <div className="alert alert--error">{feedback}</div> : null}

          <button className="button" disabled={submitting} type="submit">
            {submitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="helper-line">
          Não tem uma conta? <Link to="/cadastro">Cadastre-se agora</Link>
        </p>

        <div className="divider">
          <span>ou</span>
        </div>

        <div className="social-row">
          <SocialButton label="Entrar com Google" icon="G" onClick={loginComGoogle} />
          <SocialButton label="Entrar com Facebook" icon="f" onClick={loginComFacebook} />
          <SocialButton label="Entrar com Apple" icon="" onClick={loginComApple} />
        </div>
      </section>
    </main>
  );
}
