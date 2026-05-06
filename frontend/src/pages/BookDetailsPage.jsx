import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BookCover } from "../components/BookCover";
import { TopBar } from "../components/TopBar";
import { useAuth } from "../context/AuthContext";
import { detalharLivro, solicitarEmprestimo } from "../services/api";

export function BookDetailsPage() {
  const { id } = useParams();
  const { user, toggleFavorite, isFavorite } = useAuth();
  const [book, setBook] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadBook() {
    const response = await detalharLivro(id);
    setBook(response);
  }

  useEffect(() => {
    loadBook();
  }, [id]);

  async function handleRequestLoan() {
    setSubmitting(true);
    setFeedback(null);

    try {
      await solicitarEmprestimo({
        clienteId: user.id,
        livroId: id,
      });
      setFeedback({ type: "success", message: "Empréstimo solicitado com sucesso." });
      await loadBook();
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  if (!book) {
    return (
      <main className="page">
        <TopBar title="Detalhes do livro" />
        <section className="panel">Carregando detalhes...</section>
      </main>
    );
  }

  const available = book.status === "disponivel";

  return (
    <main className="page">
      <TopBar title={book.title} />

      <section className="details-panel">
        <BookCover book={book} large />
        <div className="details-panel__body">
          <div className="inline-badges">
            <span className="tag-pill tag-pill--active">{book.category}</span>
            <span className={`status-badge status-badge--${book.status}`}>
              {available ? "Disponível" : "Indisponível"}
            </span>
          </div>

          <div className="detail-list">
            <div>
              <span>ISBN</span>
              <strong>{book.isbn || "-"}</strong>
            </div>
            <div>
              <span>Páginas</span>
              <strong>{book.pages || "-"}</strong>
            </div>
            <div>
              <span>Autor</span>
              <strong>{book.author}</strong>
            </div>
          </div>

          <p className="details-panel__description">{book.description || "Sem descrição cadastrada."}</p>

          {feedback ? (
            <div className={`alert alert--${feedback.type === "success" ? "success" : "error"}`}>
              {feedback.message}
            </div>
          ) : null}

          <div className="stack-actions">
            <button
              className="button button--secondary"
              onClick={() => toggleFavorite(book.id)}
              type="button"
            >
              {isFavorite(book.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            </button>
            <button
              className="button"
              disabled={!available || submitting}
              onClick={handleRequestLoan}
              type="button"
            >
              {!available ? "Indisponível no momento" : submitting ? "Solicitando..." : "Solicitar empréstimo"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
