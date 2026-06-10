import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookCard } from "../components/BookCard";
import { EmptyState } from "../components/EmptyState";
import { TopBar } from "../components/TopBar";
import { CATEGORY_NAMES, listarLivros, listarLivrosPorCategoria } from "../services/api";

const categoryDescriptions = {
  Romance: "Histórias sobre vínculos, escolhas e sentimentos em diferentes tempos e cenários.",
  Fantasia: "Obras com mundos imaginários, magia, mitologia e aventuras fantásticas.",
  Aventura: "Narrativas com jornada, ação e descobertas em ritmo envolvente.",
  "Ficção Científica": "Livros sobre ciência, tecnologia, futuro e possibilidades especulativas.",
  Suspense: "Tramas tensas com mistério, risco e revelações graduais.",
};

export function slugifyCategory(name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function resolveCategoryName(slug) {
  return CATEGORY_NAMES.find((name) => slugifyCategory(name) === slug) || slug.replace(/-/g, " ");
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getBookYear(book) {
  return String(book.publishedYear || "").trim();
}

function getBookSubgenres(book) {
  const subgenres = book.subgenres || book.subgeneros || [];
  return Array.isArray(subgenres) ? subgenres.filter(Boolean) : [];
}

function getSubgenreLabel(subgenre) {
  return normalize(subgenre) === "alta fantasia" ? "Fantasia épica" : subgenre;
}

export function CategoryPage() {
  const { categoriaSlug } = useParams();
  const navigate = useNavigate();
  const categoryName = resolveCategoryName(categoriaSlug);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [filters, setFilters] = useState({
    busca: "",
    subgenero: "",
    autor: "",
    ano: "",
    disponibilidade: "todos",
    ordem: "recentes",
    paginas: "todas",
  });

  useEffect(() => {
    async function loadCategoryBooks() {
      setLoading(true);
      setFeedback("");

      try {
        const categoryBooks = await listarLivrosPorCategoria(categoryName);
        if (categoryBooks.length) {
          setBooks(categoryBooks);
        } else {
          const allBooks = await listarLivros();
          setBooks(allBooks.filter((book) => normalize(book.category) === normalize(categoryName)));
        }
      } catch (error) {
        setFeedback(error.message || "Não foi possível carregar os livros desta categoria.");
      } finally {
        setLoading(false);
      }
    }

    loadCategoryBooks();
  }, [categoryName]);

  const years = useMemo(
    () => Array.from(new Set(books.map(getBookYear).filter(Boolean))).sort((a, b) => Number(b) - Number(a)),
    [books],
  );

  const authors = useMemo(
    () => Array.from(new Set(books.map((book) => book.author).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [books],
  );

  const subgenres = useMemo(
    () => Array.from(new Set(books.flatMap(getBookSubgenres))).sort((a, b) => a.localeCompare(b)),
    [books],
  );

  const filteredBooks = useMemo(() => {
    let nextBooks = [...books];
    const search = normalize(filters.busca);

    if (search) {
      nextBooks = nextBooks.filter((book) =>
        [book.title, book.author, book.category, book.description].some((field) => normalize(field).includes(search)),
      );
    }

    if (filters.autor) {
      nextBooks = nextBooks.filter((book) => normalize(book.author) === normalize(filters.autor));
    }

    if (filters.ano) {
      nextBooks = nextBooks.filter((book) => getBookYear(book) === filters.ano);
    }

    if (filters.subgenero) {
      nextBooks = nextBooks.filter((book) =>
        getBookSubgenres(book).some((subgenre) => normalize(subgenre) === normalize(filters.subgenero)),
      );
    }

    if (filters.disponibilidade !== "todos") {
      nextBooks = nextBooks.filter((book) => {
        const available = book.status === "disponivel" && Number(book.availableQuantity) > 0;
        return filters.disponibilidade === "disponivel" ? available : !available;
      });
    }

    if (filters.paginas !== "todas") {
      nextBooks = nextBooks.filter((book) => {
        const pages = Number(book.pages || 0);
        if (filters.paginas === "curtos") return pages > 0 && pages <= 180;
        if (filters.paginas === "medios") return pages > 180 && pages <= 360;
        return pages > 360;
      });
    }

    if (filters.ordem === "az") {
      nextBooks.sort((a, b) => String(a.title).localeCompare(String(b.title)));
    } else if (filters.ordem === "mais-emprestados") {
      nextBooks.sort((a, b) => Number(b.loanCount || 0) - Number(a.loanCount || 0));
    } else {
      nextBooks.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return nextBooks;
  }, [books, filters]);

  return (
    <main className="page page-with-nav category-page">
      <TopBar title={categoryName} subtitle="Categoria" />

      <section className="category-hero">
        <span>Categoria</span>
        <h2>{categoryName}</h2>
        <p>{categoryDescriptions[categoryName] || "Explore as obras cadastradas nesta categoria."}</p>
      </section>

      {feedback ? <div className="alert alert--error">{feedback}</div> : null}

      <section className="panel category-filter-panel">
        <div className="section-heading">
          <h2>Filtros</h2>
          <button className="button button--small button--secondary" onClick={() => setFilters({
            busca: "",
            subgenero: "",
            autor: "",
            ano: "",
            disponibilidade: "todos",
            ordem: "recentes",
            paginas: "todas",
          })} type="button">
            Limpar
          </button>
        </div>

        <div className="category-filter-grid">
          <input
            className="input"
            onChange={(event) => setFilters((current) => ({ ...current, busca: event.target.value }))}
            placeholder="Buscar dentro da categoria"
            type="search"
            value={filters.busca}
          />
          <select className="input" onChange={(event) => setFilters((current) => ({ ...current, subgenero: event.target.value }))} value={filters.subgenero}>
            <option value="">Subgênero</option>
            {subgenres.map((subgenre) => <option key={subgenre} value={subgenre}>{getSubgenreLabel(subgenre)}</option>)}
          </select>
          <select className="input" onChange={(event) => setFilters((current) => ({ ...current, autor: event.target.value }))} value={filters.autor}>
            <option value="">Autor</option>
            {authors.map((author) => <option key={author} value={author}>{author}</option>)}
          </select>
          <select className="input" onChange={(event) => setFilters((current) => ({ ...current, ano: event.target.value }))} value={filters.ano}>
            <option value="">Ano</option>
            {years.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
          <select className="input" onChange={(event) => setFilters((current) => ({ ...current, disponibilidade: event.target.value }))} value={filters.disponibilidade}>
            <option value="todos">Disponibilidade</option>
            <option value="disponivel">Disponíveis</option>
            <option value="indisponivel">Indisponíveis</option>
          </select>
          <select className="input" onChange={(event) => setFilters((current) => ({ ...current, ordem: event.target.value }))} value={filters.ordem}>
            <option value="recentes">Recém adicionados</option>
            <option value="mais-emprestados">Mais emprestados</option>
            <option value="az">Ordem alfabética</option>
          </select>
          <select className="input" onChange={(event) => setFilters((current) => ({ ...current, paginas: event.target.value }))} value={filters.paginas}>
            <option value="todas">Quantidade de páginas</option>
            <option value="curtos">Até 180 páginas</option>
            <option value="medios">181 a 360 páginas</option>
            <option value="longos">Mais de 360 páginas</option>
          </select>
        </div>

      </section>

      <div className="section-heading">
        <h2>Obras de {categoryName}</h2>
        <span className="muted-text">{filteredBooks.length} encontrada(s)</span>
      </div>

      {loading ? (
        <section className="panel">Carregando livros...</section>
      ) : filteredBooks.length ? (
        <section className="books-grid category-books-grid">
          {filteredBooks.map((book) => (
            <BookCard book={book} key={book.id} onClick={() => navigate(`/cliente/livros/${book.id}`)} />
          ))}
        </section>
      ) : (
        <EmptyState title="Nenhum livro encontrado nesta categoria." description="Ajuste os filtros ou volte quando houver novas obras cadastradas." />
      )}
    </main>
  );
}
