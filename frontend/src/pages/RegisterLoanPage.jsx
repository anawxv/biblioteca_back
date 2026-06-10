import { useEffect, useState } from "react";
import { BookCover } from "../components/BookCover";
import { TopBar } from "../components/TopBar";
import { buscarLivros, listarClientes, obterProximoExemplarDisponivel, registrarEmprestimo } from "../services/api";
import { currency } from "../utils/formatters";

export function RegisterLoanPage() {
  const [clientQuery, setClientQuery] = useState("");
  const [bookQuery, setBookQuery] = useState("");
  const [clients, setClients] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [nextExemplar, setNextExemplar] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listarClientes("").then((response) => setClients(response.slice(0, 5)));
    buscarLivros("").then((response) => setBooks(response.slice(0, 5)));
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const response = await listarClientes(clientQuery);
      setClients(response);
    }, 180);

    return () => clearTimeout(timeoutId);
  }, [clientQuery]);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const response = await buscarLivros(bookQuery);
      setBooks(response);
    }, 180);

    return () => clearTimeout(timeoutId);
  }, [bookQuery]);

  useEffect(() => {
    if (!selectedBook?.id) {
      setNextExemplar(null);
      return;
    }

    obterProximoExemplarDisponivel(selectedBook.id)
      .then(setNextExemplar)
      .catch(() => setNextExemplar(null));
  }, [selectedBook]);

  async function handleRegister() {
    if (!selectedClient || !selectedBook) {
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      await registrarEmprestimo({
        clienteId: selectedClient.id,
        livroId: selectedBook.id,
      });
      setFeedback({ type: "success", message: "Empréstimo registrado com sucesso." });
      setSelectedBook(null);
      setNextExemplar(null);
      setBookQuery("");
      const response = await buscarLivros("");
      setBooks(response.slice(0, 5));
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  const clientBlocked =
    selectedClient?.pendingFine > 0 ||
    selectedClient?.blocked ||
    selectedClient?.active === false;

  const canRegister =
    selectedClient &&
    selectedBook &&
    selectedBook.status === "disponivel" &&
    !clientBlocked &&
    !submitting;

  return (
    <main className="page page-with-nav register-loan-page register-loan-page--sticky">
      <TopBar title="Registrar empréstimo" subtitle="Associe um cliente a um livro disponível" />

      <div className="register-loan-layout">
        <section className="panel form-grid register-loan-page__main">
          <input
            className="input"
            onChange={(event) => setClientQuery(event.target.value)}
            placeholder="Buscar cliente"
            type="search"
            value={clientQuery}
          />
          <div className="selection-list">
            {clients.map((client) => (
              <button
                key={client.id}
                className={`selection-item${selectedClient?.id === client.id ? " selection-item--active" : ""}`}
                onClick={() => setSelectedClient(client)}
                type="button"
              >
                <strong>{client.name}</strong>
                <small>{client.email}</small>
              </button>
            ))}
          </div>

          <input
            className="input"
            onChange={(event) => setBookQuery(event.target.value)}
            placeholder="Buscar livro"
            type="search"
            value={bookQuery}
          />
          <div className="selection-list selection-list--books">
            {books.map((book) => (
              <button
                key={book.id}
                className={`selection-item selection-item--book${selectedBook?.id === book.id ? " selection-item--active" : ""}`}
                onClick={() => setSelectedBook(book)}
                type="button"
              >
                <BookCover book={book} compact />
                <div className="selection-item__content">
                  <strong>{book.title}</strong>
                  <small>{book.author}</small>
                  <small>{book.category}</small>
                  <span className={`status-badge status-badge--${book.status === "disponivel" ? "disponivel" : "bloqueado"}`}>
                    {book.status === "disponivel" ? "Disponível" : "Indisponível"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <aside className="register-loan-confirm" aria-label="Confirmação do empréstimo">
          {selectedBook ? (
            <div className="register-loan-confirm__card summary-card">
              <strong>Livro selecionado</strong>
              <p>{selectedBook.title}</p>
              <span className={`status-badge status-badge--${selectedBook.status === "disponivel" ? "disponivel" : "bloqueado"}`}>
                {selectedBook.status === "disponivel" ? "Disponível" : "Indisponível"}
              </span>
              {nextExemplar ? (
                <small className="muted-text">Próximo exemplar disponível: {nextExemplar.codigoTombo}</small>
              ) : null}
            </div>
          ) : null}

          {selectedClient ? (
            <div className="register-loan-confirm__card summary-card">
              <strong>Cliente selecionado</strong>
              <p>{selectedClient.name}</p>
              <span className={`status-badge status-badge--${clientBlocked ? "bloqueado" : "disponivel"}`}>
                {selectedClient.pendingFine > 0
                  ? `Bloqueado por multa pendente de ${currency(selectedClient.pendingFine)}`
                  : clientBlocked
                    ? "Bloqueado"
                    : "Liberado"}
              </span>
            </div>
          ) : null}

          {feedback ? (
            <div className={`alert alert--${feedback.type === "success" ? "success" : "error"} register-loan-confirm__alert`}>
              {feedback.message}
            </div>
          ) : null}

          <button
            className="button register-loan-confirm__button"
            disabled={!canRegister}
            onClick={handleRegister}
            type="button"
          >
            {submitting ? "Registrando..." : "Registrar empréstimo"}
          </button>
        </aside>
      </div>
    </main>
  );
}
