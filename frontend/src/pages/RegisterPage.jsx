import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TopBar } from "../components/TopBar";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const navigate = useNavigate();
  const { preferredRole, register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: preferredRole,
  });
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setFeedback("As senhas não coincidem.");
      return;
    }

    setSubmitting(true);
    setFeedback("");

    try {
      await register(form);
      navigate(form.role === "funcionario" ? "/funcionario" : "/catalogo", { replace: true });
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <main className="page">
      <TopBar title="Comece sua jornada com a Biblioteca!" />

      <section className="panel">
        <form className="form-grid" onSubmit={handleSubmit}>
          <input className="input" placeholder="Nome" type="text" value={form.name} onChange={(event) => updateField("name", event.target.value)} />
          <input className="input" placeholder="E-mail" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
          <input className="input" placeholder="Senha" type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} />
          <input
            className="input"
            placeholder="Digite a senha novamente"
            type="password"
            value={form.confirmPassword}
            onChange={(event) => updateField("confirmPassword", event.target.value)}
          />
          <input className="input" placeholder="Telefone" type="tel" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />

          <div className="choice-group">
            <button
              className={`choice-pill${form.role === "cliente" ? " choice-pill--active" : ""}`}
              onClick={() => updateField("role", "cliente")}
              type="button"
            >
              Sou cliente
            </button>
            <button
              className={`choice-pill${form.role === "funcionario" ? " choice-pill--active" : ""}`}
              onClick={() => updateField("role", "funcionario")}
              type="button"
            >
              Sou funcionário
            </button>
          </div>

          {feedback ? <div className="alert alert--error">{feedback}</div> : null}

          <button className="button" disabled={submitting} type="submit">
            {submitting ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <p className="helper-line">
          Já tem conta? <Link to="/login">Entrar agora</Link>
        </p>

        <div className="divider">
          <span>ou</span>
        </div>

        <div className="social-row" aria-hidden="true">
          <span className="social-icon">G</span>
          <span className="social-icon">f</span>
          <span className="social-icon"></span>
        </div>
      </section>
    </main>
  );
}
