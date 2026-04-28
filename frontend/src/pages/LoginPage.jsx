import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { TopBar } from "../components/TopBar";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, preferredRole, user } = useAuth();
  const [form, setForm] = useState({
    email: preferredRole === "funcionario" ? "ana@biblioteca.com" : "joaosilva@gmail.com",
    password: "123456",
  });
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === "funcionario" ? "/funcionario" : "/catalogo", {
        replace: true,
      });
    }
  }, [navigate, user]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback("");

    try {
      const response = await login(form);
      const destination =
        location.state?.from || (response.user.role === "funcionario" ? "/funcionario" : "/catalogo");
      navigate(destination, { replace: true });
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page">
      <TopBar title="Bem-vindo de volta à Biblioteca!" />

      <section className="panel">
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
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Senha"
            type="password"
            value={form.password}
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

        <div className="social-row" aria-hidden="true">
          <span className="social-icon">G</span>
          <span className="social-icon">f</span>
          <span className="social-icon"></span>
        </div>

        <div className="demo-card">
          <strong>Acesso rápido</strong>
          <p>Cliente: joaosilva@gmail.com / 123456</p>
          <p>Funcionária: ana@biblioteca.com / 123456</p>
        </div>
      </section>
    </main>
  );
}
