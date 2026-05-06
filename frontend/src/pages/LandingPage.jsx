import { Link, useNavigate } from "react-router-dom";
import { HeroIllustration } from "../components/HeroIllustration";
import { useAuth } from "../context/AuthContext";

export function LandingPage() {
  const navigate = useNavigate();
  const { definePreferredRole, logout } = useAuth();

  function start(role) {
    logout();
    definePreferredRole(role);
    navigate("/login");
  }

  function register() {
    navigate("/cadastro");
  }

  return (
    <main className="page landing-page">
      <section className="hero-panel hero-panel--centered">
        <HeroIllustration />
        <h1 className="brand-title">BIBLIOTECA</h1>
        <p className="hero-copy">
          Organize seus empréstimos de livros de forma simples. Faça login para começar.
        </p>
        <div className="stack-buttons">
          <button className="button button--outline" onClick={() => start("funcionario")} type="button">
            Sou funcionário
          </button>
          <button className="button" onClick={() => start("cliente")} type="button">
            Sou cliente
          </button>
        </div>
        <p className="helper-line">
          Não tem uma conta? <Link onClick={register} to="/cadastro">Cadastre-se agora</Link>
        </p>
      </section>
    </main>
  );
}
