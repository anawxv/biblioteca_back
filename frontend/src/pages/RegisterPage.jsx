import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TopBar } from "../components/TopBar";
import { useAuth } from "../context/AuthContext";

function onlyPhoneDigits(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 11);
}

function formatPhone(value) {
  const digits = onlyPhoneDigits(value);

  if (digits.length <= 2) {
    return digits ? `(${digits}` : "";
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function validateRequired(form, preferredRole) {
  if (!preferredRole) {
    return "Escolha Sou cliente ou Sou funcionário na tela inicial antes de cadastrar.";
  }

  if (!form.name.trim()) {
    return "Informe o nome.";
  }

  if (!form.email.trim()) {
    return "Informe o e-mail.";
  }

  if (!form.password.trim()) {
    return "Informe a senha.";
  }

  if (!form.confirmPassword.trim()) {
    return "Confirme a senha.";
  }

  if (!form.phone.trim()) {
    return "Informe o telefone.";
  }

  return "";
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { preferredRole, register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const requiredError = validateRequired(form, preferredRole);
    if (requiredError) {
      setFeedback({ type: "error", message: requiredError });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setFeedback({ type: "error", message: "As senhas não coincidem." });
      return;
    }

    const phoneDigits = onlyPhoneDigits(form.phone);
    if (![10, 11].includes(phoneDigits.length)) {
      setFeedback({ type: "error", message: "Informe um telefone válido." });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      await register({
        ...form,
        phone: phoneDigits,
        role: preferredRole,
      });
      setFeedback({ type: "success", message: "Cadastro realizado com sucesso. Redirecionando para o login..." });
      setTimeout(() => navigate("/login", { replace: true }), 900);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Não foi possível concluir o cadastro.",
      });
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

  function updatePhone(value) {
    setForm((current) => ({
      ...current,
      phone: formatPhone(value),
    }));
  }

  return (
    <main className="page">
      <TopBar title="Comece sua jornada com a Biblioteca!" />

      <section className="panel">
        <div className="register-role-note">
          Cadastro como <strong>{preferredRole === "funcionario" ? "funcionário" : "cliente"}</strong>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <input className="input" placeholder="Nome" type="text" value={form.name} onChange={(event) => updateField("name", event.target.value)} />
          <input className="input" placeholder="E-mail" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
          <input className="input" placeholder="Senha" type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} />
          <input
            className="input"
            placeholder="Confirmar senha"
            type="password"
            value={form.confirmPassword}
            onChange={(event) => updateField("confirmPassword", event.target.value)}
          />
          <input
            className="input"
            inputMode="numeric"
            maxLength={15}
            placeholder="Telefone"
            type="tel"
            value={form.phone}
            onChange={(event) => updatePhone(event.target.value)}
          />

          {feedback ? (
            <div className={`alert alert--${feedback.type === "success" ? "success" : "error"}`}>
              {feedback.message}
            </div>
          ) : null}

          <button className="button" disabled={submitting} type="submit">
            {submitting ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <p className="helper-line">
          Já tem conta? <Link to="/login">Entrar agora</Link>
        </p>
      </section>
    </main>
  );
}
