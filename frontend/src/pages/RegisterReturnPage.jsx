import { useEffect, useMemo, useState } from "react";
import { TopBar } from "../components/TopBar";
import { formatExemplarLabel, listarEmprestimosAtivos, registrarDevolucao } from "../services/api";
import { currency, formatDate } from "../utils/formatters";

function estimateFine(dueDate) {
  const due = new Date(dueDate);
  const today = new Date();

  if (today <= due) {
    return 0;
  }

  const lateDays = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
  return lateDays * 2.5;
}

export function RegisterReturnPage() {
  const [query, setQuery] = useState("");
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadLoans(search = "") {
    const response = await listarEmprestimosAtivos(search);
    setLoans(response);
  }

  useEffect(() => {
    loadLoans();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadLoans(query);
    }, 180);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const estimatedFine = useMemo(
    () => (selectedLoan ? estimateFine(selectedLoan.dueDate) : 0),
    [selectedLoan],
  );

  async function handleRegisterReturn() {
    if (!selectedLoan) {
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await registrarDevolucao({
        emprestimoId: selectedLoan.id,
      });

      setFeedback({
        type: "success",
        message: response.fineApplied
          ? `Devolução registrada. Multa aplicada: ${currency(Number(response.fineAmount))}.`
          : "Devolução registrada com sucesso.",
      });
      setSelectedLoan(null);
      await loadLoans(query);
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page page-with-nav">
      <TopBar title="Registrar devolução" subtitle="Finalize empréstimos ativos e confira multas" />

      <section className="panel form-grid">
        <input
          className="input"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar empréstimo ativo"
          type="search"
          value={query}
        />

        <div className="selection-list">
          {loans.map((loan) => (
            <button
              key={loan.id}
              className={`selection-item${selectedLoan?.id === loan.id ? " selection-item--active" : ""}`}
              onClick={() => setSelectedLoan(loan)}
              type="button"
            >
              <strong>{loan.client.name}</strong>
              <small>{loan.book.title}</small>
              <small className="muted-text">Exemplar: {formatExemplarLabel(loan)}</small>
              <small>Previsão: {formatDate(loan.dueDate)}</small>
            </button>
          ))}
        </div>

        {selectedLoan ? (
          <div className="summary-card">
            <strong>{selectedLoan.client.name}</strong>
            <p>{selectedLoan.book.title}</p>
            <small className="muted-text">Exemplar: {formatExemplarLabel(selectedLoan)}</small>
            <small>Data prevista: {formatDate(selectedLoan.dueDate)}</small>
            <small>
              {estimatedFine > 0
                ? `Multa estimada por atraso: ${currency(estimatedFine)}`
                : "Devolução dentro do prazo"}
            </small>
          </div>
        ) : null}

        {feedback ? (
          <div className={`alert alert--${feedback.type === "success" ? "success" : "error"}`}>
            {feedback.message}
          </div>
        ) : null}

        <button
          className="button"
          disabled={!selectedLoan || submitting}
          onClick={handleRegisterReturn}
          type="button"
        >
          {submitting ? "Registrando..." : "Registrar devolução"}
        </button>
      </section>
    </main>
  );
}
