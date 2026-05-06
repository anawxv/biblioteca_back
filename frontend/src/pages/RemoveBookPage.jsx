import { useEffect, useState } from "react";
import { BookCover } from "../components/BookCover";
import { EmptyState } from "../components/EmptyState";
import { TopBar } from "../components/TopBar";
import { excluirLivro, listarLivros } from "../services/api";

export function RemoveBookPage() {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadBooks() {
    setLoading(true);
    try {
      setBooks(await listarLivros());
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  async function handleDelete(bookId) {
    setFeedback(null);

    try {
      const response = await excluirLivro(bookId);
      if (response?.success) {
        setBooks((current) => current.filter((book) => book.id !== bookId));
        setFeedback({ type: "success", message: "Livro removido com sucesso." });
      }
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    }
  }

  const filteredBooks = books.filter((book) =>
    [book.title, book.author, book.category].some((field) =>
      String(field || "").toLowerCase().includes(query.toLowerCase()),
    ),
  );

  return (
    <main className="page page-with-nav">
      <TopBar title="Remover livro" subtitle="Exclua itens do acervo com segurança" />

      <section className="search-box">
        <span className="search-box__icon">⌕</span>
        <input
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Busque pelo livro que deseja excluir..."
          type="search"
          value={query}
        />
      </section>

      {feedback ? (
        <div className={`alert alert--${feedback.type === "success" ? "success" : "error"}`}>
          {feedback.message}
        </div>
      ) : null}

      <section className="list-panel">
        {loading ? (
          <div className="panel">Carregando livros...</div>
        ) : filteredBooks.length ? (
          filteredBooks.map((book) => (
            <article className="list-item" key={book.id}>
              <BookCover book={book} />
              <div className="list-item__content">
                <strong>{book.title}</strong>
                <p>{book.author}</p>
                <small>{book.category}</small>
              </div>
              <button className="button button--small button--danger" onClick={() => handleDelete(book.id)} type="button">
                Excluir
              </button>
            </article>
          ))
        ) : (
          <EmptyState
            title="Nenhum livro ativo"
            description="Quando houver títulos cadastrados, eles aparecerão nesta lista."
          />
        )}
      </section>
    </main>
  );
}
