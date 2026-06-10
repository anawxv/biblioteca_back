import { Link, useNavigate } from "react-router-dom";
import { TopBar } from "../components/TopBar";
import { useAuth } from "../context/AuthContext";

export function RegisterChoicePage() {
  const navigate = useNavigate();
  const { definePreferredRole, logout } = useAuth();

  function choose(role) {
    logout();
    definePreferredRole(role);
    navigate(`/cadastro/${role}`);
  }

  return (
    <main className="page">
      <TopBar title="Comece sua jornada com a Biblioteca!" />

      <section className="panel register-choice-panel">
        <p className="hero-copy">Como você deseja se cadastrar?</p>
        <div className="stack-buttons">
          <button className="button button--outline" onClick={() => choose("funcionario")} type="button">
            Sou funcionário
          </button>
          <button className="button" onClick={() => choose("cliente")} type="button">
            Sou cliente
          </button>
        </div>
        <p className="helper-line">
          Já tem conta? <Link to="/login">Entrar agora</Link>
        </p>
      </section>
    </main>
  );
}
