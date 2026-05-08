import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { TopBar } from "../components/TopBar";
import { listarEmprestimosAtrasados, listarMultasPendentes } from "../services/api";
import { currency, formatDate } from "../utils/formatters";
import { normalizeSearchText } from "../utils/search";

function daysLate(dueDate) {
  if (!dueDate) return 0;
  const diff = Date.now() - new Date(dueDate).getTime();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export function OverduePage() {
  const [loans, setLoans] = useState([]);
  const [fines, setFines] = useState([]);
  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setFeedback("");
      try {
        const [overdueResponse, finesResponse] = await Promise.all([
          listarEmprestimosAtrasados(""),
          listarMultasPendentes(),
        ]);
        setLoans(overdueResponse);
        setFines(finesResponse);
      } catch (error) {
        setFeedback(error.message || "Não foi possível carregar atrasos e multas.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredLoans = useMemo(() => {
    const search = normalizeSearchText(query);
    return loans.filter((loan) =>
      !search ||
      [loan.client.name, loan.client.email, loan.book.title, loan.status].some((field) =>
        normalizeSearchText(field).includes(search),
      ),
    );
  }, [loans, query]);

  const filteredFines = useMemo(() => {
    const search = normalizeSearchText(query);
    return fines.filter((fine) =>
      !search ||
      [fine.client.name, fine.client.email, fine.book.title, fine.status].some((field) =>
        normalizeSearchText(field).includes(search),
      ),
    );
  }, [fines, query]);

  return (
    <main className="page page-with-nav">
      <TopBar title="Atrasos e multas pendentes" subtitle="Consulte somente pendências de devolução" />

      <section className="search-box">
        <span className="search-box__icon">⌕</span>
        <input
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por cliente, livro ou e-mail..."
          type="search"
          value={query}
        />
      </section>

      {feedback ? <div className="alert alert--error">{feedback}</div> : null}
      {loading ? <section className="panel">Carregando pendências...</section> : null}

      <section className="admin-section">
        <div className="section-heading">
          <h2>Empréstimos atrasados</h2>
        </div>
        {filteredLoans.length ? (
          <div className="recent-list">
            {filteredLoans.map((loan) => (
              <article className="recent-item loan-admin-item" key={loan.id}>
                <strong>{loan.client.name || "Cliente"}</strong>
                <p>{loan.client.email || "Sem e-mail"} • {loan.book.title}</p>
                <small>Empréstimo: {formatDate(loan.borrowedAt)} • Prevista: {formatDate(loan.dueDate)}</small>
                <small>{daysLate(loan.dueDate)} dia(s) de atraso</small>
                <span className="status-badge status-badge--atrasado">{loan.status || "Atrasado"}</span>
                {loan.fineAmount ? <strong>Multa: {currency(loan.fineAmount)}</strong> : null}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="Nenhum empréstimo atrasado no momento." description="Quando houver atrasos, eles aparecerão aqui." />
        )}
      </section>

      <section className="admin-section">
        <div className="section-heading">
          <h2>Multas pendentes</h2>
        </div>
        {filteredFines.length ? (
          <div className="recent-list">
            {filteredFines.map((fine) => (
              <article className="recent-item fine-item" key={fine.id}>
                <strong>{fine.client.name || "Cliente"}</strong>
                <p>{fine.book.title}</p>
                <small>{fine.client.email || "Sem e-mail"}</small>
                <small>Motivo: atraso na devolução</small>
                <strong>{currency(fine.value)}</strong>
                <span className={`status-badge status-badge--${fine.paid ? "disponivel" : "atrasado"}`}>
                  {fine.paid ? "Paga" : "Não paga"}
                </span>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="Nenhuma multa pendente no momento." description="As multas retornadas pela API aparecerão nesta lista." />
        )}
      </section>
    </main>
  );
}
