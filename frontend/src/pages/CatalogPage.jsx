import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

export function CatalogPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mostBorrowed, setMostBorrowed] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get("categoria") || "");

  useEffect(() => {
    async function bootstrap() {
      setLoading(true);
      const [categoriesResponse, popularResponse, recentResponse] = await Promise.all([
        listarCategorias(),
        listarLivrosMaisEmprestados(),
        listarLivrosRecentes(),
      ]);
      setCategories(categoriesResponse);
      setMostBorrowed(popularResponse);
      setRecentBooks(recentResponse);
      setLoading(false);
    }

    bootstrap();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      const response = query ? await buscarLivros(query) : await listarLivros();
      setBooks(response);
      setLoading(false);
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [query]);

  function openDetails(book) {
    navigate(`/livro/${book.id}`);
  }

  function filterByCategory(category) {
    setQuery(category);
    setSearchParams({ categoria: category });
  }

  function clearFilter() {
    setQuery("");
    setSearchParams({});
  }

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

      <section className="pill-row">
        {categories.slice(0, 5).map((category) => (
          <button
            key={category}
            className={`tag-pill${query === category ? " tag-pill--active" : ""}`}
            onClick={() => filterByCategory(category)}
            type="button"
          >
            {category}
          </button>
        ))}
        <button className="tag-pill tag-pill--ghost" onClick={clearFilter} type="button">
          Limpar
        </button>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>Mais emprestados</h2>
        </div>
        <div className="carousel-row">
          {mostBorrowed.map((book) => (
            <BookCard key={book.id} book={book} compact onClick={openDetails} />
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>Recém adicionados</h2>
        </div>
        <div className="books-grid">
          {recentBooks.slice(0, 3).map((book) => (
            <BookCard key={book.id} book={book} onClick={openDetails} />
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>Mais populares</h2>
        </div>

        {loading ? (
          <div className="panel panel--soft">Carregando livros...</div>
        ) : books.length ? (
          <div className="books-grid">
            {books.map((book) => (
              <BookCard key={book.id} book={book} onClick={openDetails} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhum livro encontrado"
            description="Ajuste a busca ou explore as categorias para descobrir outras leituras."
          />
        )}
      </section>
    </main>
  );
}
