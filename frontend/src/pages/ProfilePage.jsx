import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeroIllustration } from "../components/HeroIllustration";
import { TopBar } from "../components/TopBar";
import { useAuth } from "../context/AuthContext";
import { getInitials, maskPassword } from "../utils/formatters";

export function ProfilePage() {
  const navigate = useNavigate();
  const { logout, updateProfile, user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
  });

  useEffect(() => {
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
    });
  }, [user]);

  function handleSave(event) {
    event.preventDefault();
    updateProfile(form);
    setEditing(false);
  }

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <main className="page page-with-nav">
      <TopBar title="Meu perfil" />

      <section className="profile-card">
        <div className="profile-card__avatar">{getInitials(user.name)}</div>
        <div>
          <h2>{user.name}</h2>
          <span className="tag-pill tag-pill--active">{user.role === "cliente" ? "Cliente" : "Funcionário"}</span>
        </div>
      </section>

      {editing ? (
        <form className="form-grid panel" onSubmit={handleSave}>
          <input className="input" placeholder="Nome" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          <input className="input" placeholder="E-mail" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
          <input className="input" placeholder="Telefone" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
          <button className="button" type="submit">
            Salvar alterações
          </button>
          <button className="button button--outline" onClick={() => setEditing(false)} type="button">
            Cancelar
          </button>
        </form>
      ) : (
        <section className="info-list">
          <article className="info-tile">
            <span>E-mail</span>
            <strong>{user.email}</strong>
          </article>
          <article className="info-tile">
            <span>Telefone</span>
            <strong>{user.phone}</strong>
          </article>
          <article className="info-tile">
            <span>Senha</span>
            <strong>{maskPassword(user.password)}</strong>
          </article>
        </section>
      )}

      <section className="actions-list">
        <button className="menu-action" onClick={() => navigate("/emprestimos")} type="button">
          Meus empréstimos
        </button>
        <button className="menu-action" onClick={() => setEditing((current) => !current)} type="button">
          Editar perfil
        </button>
        <button className="menu-action menu-action--danger" onClick={handleLogout} type="button">
          Sair
        </button>
      </section>

      <section className="panel panel--soft panel--centered">
        <HeroIllustration compact />
      </section>
    </main>
  );
}
