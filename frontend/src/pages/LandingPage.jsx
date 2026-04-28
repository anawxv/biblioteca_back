import { Link, useNavigate } from "react-router-dom";
import { HeroIllustration } from "../components/HeroIllustration";
import { useAuth } from "../context/AuthContext";

export function LandingPage() {
  const navigate = useNavigate();
  const { definePreferredRole } = useAuth();

  function start(role) {
    definePreferredRole(role);
    navigate("/login");
  }

  return (
    <main className="page landing-page">
      <section className="hero-panel hero-panel--centered">
        <HeroIllustration />
        <h1 className="brand-title">BIBLIOTECA</h1>
        <p className="hero-copy">
          Organize seus empréstimos de livros de forma simples. Faça login para
          começar.
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
          Não tem uma conta? <Link to="/cadastro">Cadastre-se agora</Link>
        </p>
      </section>
    </main>
  );
}
