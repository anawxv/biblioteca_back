import { useEffect, useState } from "react";
import { BookCover } from "../components/BookCover";
import { EmptyState } from "../components/EmptyState";
import { TopBar } from "../components/TopBar";
import { useAuth } from "../context/AuthContext";
import { devolverLivro, listarMeusEmprestimos } from "../services/api";
import { formatDate, slugify } from "../utils/formatters";

export function MyLoansPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("ativos");
  const [loans, setLoans] = useState({ ativos: [], historico: [] });
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadLoans() {
    setLoading(true);

    try {
      const response = await listarMeusEmprestimos(user.id);
      setLoans(response);
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLoans();
  }, [user.id]);

  async function handleReturn(loanId) {
    try {
      const response = await devolverLivro(loanId);
      setFeedback({ type: "success", message: response.message || "Livro devolvido com sucesso." });
      await loadLoans();
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    }
  }

  const currentLoans = tab === "ativos" ? loans.ativos : loans.historico;

  return (
    <main className="page page-with-nav">
      <TopBar title="Meus empréstimos" subtitle="Acompanhe seus livros emprestados" />

      <section className="tabs-row">
        <button
          className={`tab-pill${tab === "ativos" ? " tab-pill--active" : ""}`}
          onClick={() => setTab("ativos")}
          type="button"
        >
          Ativos
        </button>
        <button
          className={`tab-pill${tab === "historico" ? " tab-pill--active" : ""}`}
          onClick={() => setTab("historico")}
          type="button"
        >
          Histórico
        </button>
      </section>

      {feedback ? (
        <div className={`alert alert--${feedback.type === "success" ? "success" : "error"}`}>
          {feedback.message}
        </div>
      ) : null}

      <section className="loans-list">
        {loading ? (
          <div className="panel">Carregando empréstimos...</div>
        ) : currentLoans.length ? (
          currentLoans.map((loan) => (
            <article className="loan-card" key={loan.id}>
              <BookCover book={loan.book} />
              <div className="loan-card__content">
                <strong>{loan.book.title}</strong>
                <span>{loan.book.author}</span>
                <small>Data do empréstimo: {formatDate(loan.borrowedAt)}</small>
                <small>Data prevista: {formatDate(loan.dueDate)}</small>
                {loan.returnedAt ? <small>Devolvido em: {formatDate(loan.returnedAt)}</small> : null}

                <div className="loan-card__footer">
                  <span className={`status-badge status-badge--${slugify(loan.status)}`}>
                    {loan.status}
                  </span>
                  {!loan.returnedAt ? (
                    <button className="button button--small" onClick={() => handleReturn(loan.id)} type="button">
                      Devolver
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          ))
        ) : (
          <EmptyState
            title="Nenhum empréstimo por aqui"
            description="Seus livros ativos e o histórico de devoluções aparecerão nesta área."
          />
        )}
      </section>
    </main>
  );
}
