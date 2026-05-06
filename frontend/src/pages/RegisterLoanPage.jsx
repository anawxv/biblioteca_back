import { useEffect, useState } from "react";
import { BookCover } from "../components/BookCover";
import { TopBar } from "../components/TopBar";
import { buscarLivros, listarClientes, registrarEmprestimo } from "../services/api";
import { currency } from "../utils/formatters";

export function RegisterLoanPage() {
  const [clientQuery, setClientQuery] = useState("");
  const [bookQuery, setBookQuery] = useState("");
  const [clients, setClients] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
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
      setBookQuery("");
      const response = await buscarLivros("");
      setBooks(response.slice(0, 5));
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page page-with-nav">
      <TopBar title="Registrar empréstimo" subtitle="Associe um cliente a um livro disponível" />

      <section className="panel form-grid">
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
        <div className="selection-list">
          {books.map((book) => (
            <button
              key={book.id}
              className={`selection-item selection-item--book${selectedBook?.id === book.id ? " selection-item--active" : ""}`}
              onClick={() => setSelectedBook(book)}
              type="button"
            >
              <BookCover book={book} />
              <div>
                <strong>{book.title}</strong>
                <small>{book.status === "disponivel" ? "Disponível" : "Bloqueado"}</small>
              </div>
            </button>
          ))}
        </div>

        {selectedClient ? (
          <div className="summary-card">
            <strong>Cliente selecionado</strong>
            <p>{selectedClient.name}</p>
            <small>
              {selectedClient.pendingFine > 0
                ? `Bloqueado por multa pendente de ${currency(selectedClient.pendingFine)}`
                : selectedClient.blocked
                  ? "Cliente bloqueado"
                  : selectedClient.active === false
                    ? "Cliente inativo"
                : "Cliente apto para empréstimo"}
            </small>
          </div>
        ) : null}

        {selectedBook ? (
          <div className="summary-card">
            <strong>Livro selecionado</strong>
            <p>{selectedBook.title}</p>
            <small>
              {selectedBook.status === "disponivel"
                ? "Disponível para empréstimo"
                : "Livro bloqueado / indisponível"}
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
          disabled={
            !selectedClient ||
            !selectedBook ||
            selectedBook.status !== "disponivel" ||
            selectedClient.pendingFine > 0 ||
            selectedClient.blocked ||
            selectedClient.active === false ||
            submitting
          }
          onClick={handleRegister}
          type="button"
        >
          {submitting ? "Registrando..." : "Registrar empréstimo"}
        </button>
      </section>
    </main>
  );
}
