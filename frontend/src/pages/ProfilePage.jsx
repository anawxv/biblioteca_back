import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeroIllustration } from "../components/HeroIllustration";
import { TopBar } from "../components/TopBar";
import { useAuth } from "../context/AuthContext";
import { getInitials, maskPassword } from "../utils/formatters";

const MAX_PROFILE_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_PROFILE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const FILTER_PREFERENCE_KEY = "biblioteca-keep-category-filter";
const LAST_CATEGORY_FILTER_KEY = "biblioteca-last-category-filter";

export function validarImagemPerfil(file) {
  if (!file || !ALLOWED_PROFILE_IMAGE_TYPES.includes(file.type)) {
    return false;
  }

  if (file.size > MAX_PROFILE_IMAGE_SIZE) {
    return false;
  }

  const suspiciousName = /(\.exe|\.bat|\.cmd|\.js|\.html|\.svg)$/i.test(file.name);
  if (suspiciousName) {
    return false;
  }

  // Futuro: chamar moderação real no back-end/API para nudez, conteúdo sexual ou ofensivo.
  return true;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { logout, updateProfile, updateProfilePhoto, user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(user.photoUrl || "");
  const [feedback, setFeedback] = useState("");
  const [keepFilterActive, setKeepFilterActive] = useState(
    () => localStorage.getItem(FILTER_PREFERENCE_KEY) === "true",
  );
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
    setPhotoPreview(user.photoUrl || "");
  }, [user]);

  function handleSave(event) {
    event.preventDefault();
    updateProfile(form);
    if (photoPreview) {
      updateProfilePhoto(photoPreview);
    }
    setEditing(false);
    setFeedback("Perfil atualizado com sucesso.");
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    setFeedback("");

    if (!validarImagemPerfil(file)) {
      setFeedback("Esta imagem não pode ser usada como foto de perfil.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  }

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  function toggleKeepFilterActive() {
    setKeepFilterActive((current) => {
      const next = !current;
      localStorage.setItem(FILTER_PREFERENCE_KEY, String(next));
      if (!next) {
        localStorage.removeItem(LAST_CATEGORY_FILTER_KEY);
      }
      return next;
    });
  }

  return (
    <main className="page page-with-nav">
      <TopBar title="Meu perfil" />

      <section className="profile-card">
        <div className="profile-card__avatar profile-card__avatar--photo">
          {photoPreview ? <img src={photoPreview} alt={`Foto de ${user.name}`} /> : getInitials(user.name)}
        </div>
        <div>
          <h2>{user.name}</h2>
        </div>
      </section>

      {feedback ? <div className="alert alert--success">{feedback}</div> : null}

      {editing ? (
        <form className="form-grid panel" onSubmit={handleSave}>
          <label className="profile-upload">
            <span>Foto de perfil</span>
            <input accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={handlePhotoChange} type="file" />
          </label>
          {photoPreview ? (
            <div className="profile-preview">
              <img src={photoPreview} alt="Prévia da foto de perfil" />
              <small>Prévia da imagem selecionada</small>
            </div>
          ) : null}
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
            <strong>{user.phone || "-"}</strong>
          </article>
          <article className="info-tile">
            <span>Senha</span>
            <strong>{maskPassword(user.password)}</strong>
          </article>
          <article className="info-tile info-tile--switch">
            <span>Preferência do catálogo</span>
            <div className="info-tile__switch-row">
              <strong>Manter filtro ativo</strong>
              <button
                aria-pressed={keepFilterActive}
                className={`switch-control${keepFilterActive ? " switch-control--active" : ""}`}
                onClick={toggleKeepFilterActive}
                type="button"
              >
                <span />
              </button>
            </div>
          </article>
        </section>
      )}

      <section className="actions-list">
        <button className="menu-action" onClick={() => navigate("/cliente/emprestimos")} type="button">
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
