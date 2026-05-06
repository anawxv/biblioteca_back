import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookCarousel } from "../components/BookCarousel";
import { BookCard } from "../components/BookCard";
import { EmptyState } from "../components/EmptyState";
import { HeroIllustration } from "../components/HeroIllustration";
import {
  listarCategorias,
  listarLivros,
  listarLivrosMaisEmprestados,
  listarLivrosRecentes,
} from "../services/api";

function normalize(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function CatalogPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mostBorrowed, setMostBorrowed] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("categoria") || "");

  useEffect(() => {
    async function bootstrap() {
      setLoading(true);
      setFeedback("");

      try {
        const [categoriesResponse, booksResponse, popularResponse, recentResponse] = await Promise.all([
          listarCategorias(),
          listarLivros(),
          listarLivrosMaisEmprestados(),
          listarLivrosRecentes(),
        ]);
        setCategories(categoriesResponse);
        setBooks(booksResponse);
        setMostBorrowed(popularResponse);
        setRecentBooks(recentResponse);
      } catch (error) {
        setFeedback(error.message);
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, []);

  useEffect(() => {
    const category = searchParams.get("categoria") || "";
    setSelectedCategory(category);
  }, [searchParams]);

  const filteredBooks = useMemo(() => {
    const normalizedQuery = normalize(query);
    const normalizedCategory = normalize(selectedCategory);

    return books.filter((book) => {
      const sameCategory = !normalizedCategory || normalize(book.category) === normalizedCategory;
      const matchesQuery =
        !normalizedQuery ||
        [book.title, book.author, book.category].some((field) => normalize(field).includes(normalizedQuery));

      return sameCategory && matchesQuery;
    });
  }, [books, query, selectedCategory]);

  function openDetails(book) {
    navigate(`/cliente/livros/${book.id}`);
  }

  function filterByCategory(category) {
    setSelectedCategory(category.name);
    setSearchParams({ categoria: category.name });
  }

  function clearFilter() {
    setQuery("");
    setSelectedCategory("");
    setSearchParams({});
  }

  const emptyMessage = selectedCategory
    ? `Nenhum livro encontrado nesta categoria.`
    : "Nenhum livro encontrado.";

  return (
    <main className="page page-with-nav">
      <section className="search-box">
        <span className="search-box__icon">⌕</span>
        <input
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Busque por título, autor ou gênero..."
          type="search"
          value={query}
        />
      </section>

      <section className="hero-banner">
        <HeroIllustration compact />
        <div>
          <h1>O que você quer ler hoje?</h1>
          <p>Explore o acervo, descubra novidades e encontre sua próxima leitura favorita.</p>
        </div>
      </section>

      {feedback ? <div className="alert alert--error">{feedback}</div> : null}

      <section className="pill-row">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`tag-pill${selectedCategory === category.name ? " tag-pill--active" : ""}`}
            onClick={() => filterByCategory(category)}
            type="button"
          >
            {category.name}
          </button>
        ))}
        <button className="tag-pill tag-pill--ghost" onClick={clearFilter} type="button">
          Limpar
        </button>
      </section>

      <BookCarousel
        title="Livros mais emprestados"
        books={mostBorrowed}
        onBookClick={openDetails}
        emptyMessage="Os livros mais emprestados aparecerão aqui."
      />

      <BookCarousel
        title="Recém adicionados"
        books={recentBooks}
        onBookClick={openDetails}
        emptyMessage="Os livros adicionados recentemente aparecerão aqui."
      />

      <section className="section-block">
        <div className="section-heading">
          <h2>{selectedCategory ? selectedCategory : "Mais populares"}</h2>
        </div>

        {loading ? (
          <div className="panel panel--soft">Carregando livros...</div>
        ) : filteredBooks.length ? (
          <div className="books-grid">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} onClick={openDetails} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={emptyMessage}
            description="Tente outra categoria ou ajuste o texto da busca."
          />
        )}
      </section>
    </main>
  );
}
