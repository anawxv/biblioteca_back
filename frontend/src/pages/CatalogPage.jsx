import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookCarousel } from "../components/BookCarousel";
import { BookCard } from "../components/BookCard";
import { EmptyState } from "../components/EmptyState";
import { HeroIllustration } from "../components/HeroIllustration";
import {
  buscarLivros,
  listarCategorias,
  listarLivros,
  listarLivrosMaisEmprestados,
  listarLivrosRecentes,
} from "../services/api";
import { bookMatchesSmartSearch, getBookGenres, normalizeSearchText } from "../utils/search";

const FILTER_PREFERENCE_KEY = "biblioteca-keep-category-filter";
const LAST_CATEGORY_FILTER_KEY = "biblioteca-last-category-filter";

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
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const categoryFromUrl = searchParams.get("categoria") || "";
    if (categoryFromUrl) {
      return categoryFromUrl;
    }

    const shouldKeepFilter = localStorage.getItem(FILTER_PREFERENCE_KEY) === "true";
    return shouldKeepFilter ? localStorage.getItem(LAST_CATEGORY_FILTER_KEY) || "" : "";
  });

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
    if (category) {
      setSelectedCategory(category);
      return;
    }

    const shouldKeepFilter = localStorage.getItem(FILTER_PREFERENCE_KEY) === "true";
    setSelectedCategory(shouldKeepFilter ? localStorage.getItem(LAST_CATEGORY_FILTER_KEY) || "" : "");
  }, [searchParams]);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      setFeedback("");
      try {
        const response = query.trim() ? await buscarLivros(query) : await listarLivros();
        setBooks(response);
      } catch (error) {
        setFeedback(error.message);
      }
    }, 220);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const filteredBooks = useMemo(() => {
    const normalizedCategory = normalizeSearchText(selectedCategory);

    return books.filter((book) => {
      const sameCategory = !normalizedCategory || getBookGenres(book).some((genre) => normalizeSearchText(genre) === normalizedCategory);
      const matchesQuery = bookMatchesSmartSearch(book, query);

      return sameCategory && matchesQuery;
    });
  }, [books, query, selectedCategory]);

  function openDetails(book) {
    navigate(`/cliente/livros/${book.id}`);
  }

  function filterByCategory(category) {
    if (selectedCategory === category.name) {
      clearFilter();
      return;
    }

    setSelectedCategory(category.name);
    localStorage.setItem(LAST_CATEGORY_FILTER_KEY, category.name);
    setSearchParams({ categoria: category.name });
  }

  function clearFilter() {
    setQuery("");
    setSelectedCategory("");
    localStorage.removeItem(LAST_CATEGORY_FILTER_KEY);
    setSearchParams({});
  }

  const emptyMessage = selectedCategory
    ? `Nenhum livro encontrado nesta categoria.`
    : "Nenhum livro encontrado.";
  const hasCategoryFilter = Boolean(selectedCategory);

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

      <section className="filter-panel">
        <div className="pill-row">
        {categories.map((category) => (
          <button
            key={`${category.id}-${category.name}`}
            className={`tag-pill${selectedCategory === category.name ? " tag-pill--active" : ""}`}
            onClick={() => filterByCategory(category)}
            type="button"
          >
            {category.name}
          </button>
        ))}
        </div>
        {hasCategoryFilter ? (
          <div className="active-filter-bar">
            <span>
              Categoria ativa: <strong>{selectedCategory}</strong>
            </span>
            <button className="tag-pill tag-pill--ghost" onClick={clearFilter} type="button">
              Limpar filtro
            </button>
          </div>
        ) : null}
      </section>

      {!hasCategoryFilter ? (
        <>
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
        </>
      ) : null}

      <section className="section-block">
        <div className="section-heading">
          <h2>{selectedCategory ? `Livros de ${selectedCategory}` : "Mais populares"}</h2>
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
            title={query ? "Nenhum livro encontrado. Tente buscar por outro termo." : emptyMessage}
            description="A busca ignora acentos e tenta encontrar resultados mesmo com pequenos erros de digitação."
          />
        )}
      </section>
    </main>
  );
}
