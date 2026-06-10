import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookCover } from "../components/BookCover";
import { DashboardCharts } from "../components/DashboardCharts";
import { EmptyState } from "../components/EmptyState";
import { MetricCard } from "../components/MetricCard";
import { TopBar } from "../components/TopBar";
import {
  atualizarLivro,
  buscarLivros,
  formatExemplarLabel,
  excluirLivro,
  listarCategorias,
  listarClientes,
  listarDashboard,
  listarEmprestimosAtrasados,
  listarEmprestimosAtivos,
  listarEmprestimosRecentes,
  listarGenerosMaisConsumidos,
  listarHistoricoLivros,
  listarLivros,
  listarLivrosIndisponiveis,
  listarLivrosMaisEmprestados,
  listarGeneros,
  listarMultasPendentes,
  marcarMultaComoPaga,
} from "../services/api";
import { currency, formatDate } from "../utils/formatters";
import { buildEmployeeStats, mergeLoansUnique } from "../utils/employeeStats";
import { bookMatchesSmartSearch, getBookGenres } from "../utils/search";

const sections = [
  { id: "livros", label: "Gerenciar livros" },
  { id: "emprestimos", label: "Controlar empréstimos" },
  { id: "recentes", label: "Empréstimos recentes" },
  { id: "dashboard", label: "Dashboard" },
];

export function LibrarianDashboardPage({ initialSection = "dashboard" }) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(initialSection);
  const [activeMetric, setActiveMetric] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [genres, setGenres] = useState([]);
  const [genreOptions, setGenreOptions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [books, setBooks] = useState([]);
  const [clients, setClients] = useState([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [unavailableBooks, setUnavailableBooks] = useState([]);
  const [pendingFines, setPendingFines] = useState([]);
  const [bookHistory, setBookHistory] = useState([]);
  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState("");
  const [editingBook, setEditingBook] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadPanel() {
    setLoading(true);
    setFeedback("");

    try {
      const [
        dashboardResponse,
        genresResponse,
        topBooksResponse,
        booksResponse,
        clientsResponse,
        activeLoansResponse,
        overdueLoansResponse,
        unavailableBooksResponse,
        pendingFinesResponse,
        historyResponse,
        recentLoansResponse,
        categoriesResponse,
        genreOptionsResponse,
      ] = await Promise.all([
        listarDashboard(),
        listarGenerosMaisConsumidos(),
        listarLivrosMaisEmprestados(),
        listarLivros(),
        listarClientes(""),
        listarEmprestimosAtivos(""),
        listarEmprestimosAtrasados(""),
        listarLivrosIndisponiveis(""),
        listarMultasPendentes(),
        listarHistoricoLivros(),
        listarEmprestimosRecentes(),
        listarCategorias(),
        listarGeneros(),
      ]);

      setGenres(genresResponse);
      setTopBooks(topBooksResponse);
      setBooks(booksResponse);
      setClients(clientsResponse);
      setActiveLoans(activeLoansResponse);
      setOverdueLoans(overdueLoansResponse);
      setUnavailableBooks(unavailableBooksResponse);
      setPendingFines(pendingFinesResponse);
      setBookHistory(historyResponse);
      setDashboard({
        ...dashboardResponse,
        recentLoans: recentLoansResponse.length ? recentLoansResponse : dashboardResponse.recentLoans,
      });
      setCategories(categoriesResponse);
      setGenreOptions(genreOptionsResponse);
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPanel();
  }, []);

  useEffect(() => {
    setActiveSection(initialSection);
    setActiveMetric("");
    setQuery("");
  }, [initialSection]);

  async function handleBookSearch(value) {
    setQuery(value);
    if (activeSection !== "livros") {
      return;
    }

    try {
      setBooks(value.trim() ? await buscarLivros(value) : await listarLivros());
    } catch (error) {
      setFeedback(error.message);
    }
  }

  async function handleDeleteBook(bookId) {
    setFeedback("");

    try {
      const response = await excluirLivro(bookId);
      if (response?.success) {
        setFeedback("Livro removido com sucesso.");
        await loadPanel();
      }
    } catch (error) {
      setFeedback(error.message);
    }
  }

  function openEditBook(book) {
    setEditingBook(book);
    setEditForm({
      title: book.title || "",
      author: book.author || "",
      isbn: book.isbn || "",
      description: book.description || "",
      category: book.category || "",
      categoryId: categories.find((category) => category.name === book.category)?.id || "",
      extraGenres: (book.extraGenres || []).join(", "),
      genreIds: [],
      subgenreIds: [],
      subgenreIdsText: "",
      pages: book.pages || "",
      publishedYear: book.publishedYear || "",
      publisher: book.publisher || "",
      quantityTotal: book.quantityTotal || 0,
      availableQuantity: book.availableQuantity || 0,
      coverImage: book.coverImage || "",
    });
  }

  async function handleSaveEdit(event) {
    event.preventDefault();
    if (!editingBook || !editForm) return;

    try {
      await atualizarLivro(editingBook.id, {
        ...editForm,
        extraGenres: editForm.extraGenres.split(",").map((item) => item.trim()).filter(Boolean),
        genreIds: editForm.genreIds,
        subgenreIds: editForm.subgenreIdsText
          .split(",")
          .map((item) => Number(item.trim()))
          .filter(Boolean),
      });
      setFeedback("Livro atualizado com sucesso.");
      setEditingBook(null);
      setEditForm(null);
      await loadPanel();
    } catch (error) {
      setFeedback(error.message || "Edição de livro precisa do endpoint PUT /api/livros/{id} no back-end.");
    }
  }

  function toggleEditArray(field, value) {
    setEditForm((current) => {
      const values = current[field] || [];
      return {
        ...current,
        [field]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value],
      };
    });
  }

  async function handlePayFine(fineId) {
    try {
      await marcarMultaComoPaga(fineId);
      await loadPanel();
    } catch (error) {
      setFeedback(error.message);
    }
  }

  function openMetric(metric) {
    setActiveMetric(metric);
    setActiveSection("dashboard");
  }

  const maxBookValue = useMemo(() => Math.max(1, ...topBooks.map((item) => item.loanCount)), [topBooks]);
  const filteredBooks = books.filter((book) => bookMatchesSmartSearch(book, query));

  const filteredLoans = activeLoans.filter((loan) =>
    [loan.client.name, loan.book.title, loan.status].some((field) =>
      String(field || "").toLowerCase().includes(query.toLowerCase()),
    ),
  );

  const allLoansForStats = useMemo(
    () => mergeLoansUnique(activeLoans, overdueLoans, dashboard?.recentLoans || []),
    [activeLoans, overdueLoans, dashboard?.recentLoans],
  );

  if (loading && !dashboard) {
    return (
      <main className="page page-with-nav">
        <TopBar title="Painel do bibliotecário" subtitle="Gerencie livros e empréstimos" />
        <section className="panel">Carregando painel...</section>
      </main>
    );
  }

  const metrics = dashboard?.metrics || {
    totalBooks: 0,
    totalClients: 0,
    totalEmployees: 0,
    activeLoans: 0,
    overdueLoans: 0,
    pendingFines: 0,
    unavailableBooks: 0,
  };

  return (
    <main className="page page-with-nav">
      <TopBar title="Painel do bibliotecário" subtitle="Gerencie livros e empréstimos" />

      <section className="admin-tabs">
        {sections.map((section) => (
          <button
            className={`tag-pill${activeSection === section.id ? " tag-pill--active" : ""}`}
            key={section.id}
            onClick={() => {
              setActiveSection(section.id);
              setActiveMetric("");
              setQuery("");
            }}
            type="button"
          >
            {section.label}
          </button>
        ))}
      </section>

      {feedback ? <div className="alert alert--error">{feedback}</div> : null}

      {activeSection === "dashboard" ? (
        <>
      <div className="section-heading admin-section-title">
        <h2>Resumo geral</h2>
      </div>

      <section className="metrics-grid metrics-grid--clickable">
        <button className="metric-button" onClick={() => openMetric("livros")} type="button">
          <MetricCard icon="▥" label="Livros no acervo" value={metrics.totalBooks} />
        </button>
        <button className="metric-button" onClick={() => openMetric("clientes")} type="button">
          <MetricCard icon="○" label="Clientes cadastrados" value={metrics.totalClients} soft />
        </button>
        <button className="metric-button" onClick={() => openMetric("funcionarios")} type="button">
          <MetricCard icon="◇" label="Funcionarios cadastrados" value={metrics.totalEmployees} />
        </button>
        <button className="metric-button" onClick={() => openMetric("ativos")} type="button">
          <MetricCard icon="↗" label="Empréstimos ativos" value={metrics.activeLoans} />
        </button>
        <button className="metric-button" onClick={() => openMetric("atrasados")} type="button">
          <MetricCard icon="!" label="Empréstimos atrasados" value={metrics.overdueLoans} soft />
        </button>
        <button className="metric-button" onClick={() => openMetric("multas")} type="button">
          <MetricCard icon="$" label="Multas pendentes" value={currency(metrics.pendingFines)} />
        </button>
        <button className="metric-button" onClick={() => openMetric("indisponiveis")} type="button">
          <MetricCard icon="−" label="Livros indisponíveis" value={metrics.unavailableBooks} soft />
        </button>
        <button className="metric-button" onClick={() => openMetric("historico")} type="button">
          <MetricCard icon="◷" label="Ver histórico" value={dashboard?.recentLoans?.length || 0} soft />
        </button>
      </section>

      <section className="admin-block">
        <div className="section-heading">
          <h2>Ações rápidas</h2>
        </div>
        <div className="quick-actions-grid">
          <Link className="quick-action-card" to="/funcionario/adicionar-livro">Adicionar livro</Link>
          <Link className="quick-action-card" to="/funcionario/remover-livro">Remover livro</Link>
          <Link className="quick-action-card" to="/funcionario/registrar-emprestimo">Registrar empréstimo</Link>
          <Link className="quick-action-card" to="/funcionario/registrar-devolucao">Registrar devolução</Link>
          <Link className="quick-action-card" to="/funcionario/atrasos">Consultar atrasos</Link>
          <Link className="quick-action-card" to="/funcionario/clientes">Consultar clientes</Link>
        </div>
      </section>

      <DashboardSection
        activeMetric={activeMetric}
        activeLoans={activeLoans}
        allLoans={allLoansForStats}
        books={books}
        clients={clients}
        dashboard={dashboard}
        genres={genres}
        maxBookValue={maxBookValue}
        overdueLoans={overdueLoans}
        pendingFines={pendingFines}
        topBooks={topBooks}
        unavailableBooks={unavailableBooks}
        onClearMetric={() => setActiveMetric("")}
        onPayFine={handlePayFine}
      />
        </>
      ) : null}

      {activeSection === "livros" ? (
        <section className="admin-section">
          <div className="section-heading">
            <h2>Gerenciar livros</h2>
            <Link className="button button--small" to="/funcionario/adicionar-livro">Adicionar livro</Link>
          </div>
          <section className="search-box">
            <span className="search-box__icon">⌕</span>
            <input
              onChange={(event) => handleBookSearch(event.target.value)}
              placeholder="Buscar livro por título, autor ou categoria..."
              type="search"
              value={query}
            />
          </section>
          <div className="list-panel">
            {filteredBooks.length ? filteredBooks.map((book) => (
              <article className="list-item" key={book.id}>
                <BookCover book={book} />
                <div className="list-item__content">
                  <strong>{book.title}</strong>
                  <p>{book.author}</p>
                  <small>{book.category} • {book.availableQuantity} disponíveis</small>
                </div>
                <div className="list-actions">
                  <button className="button button--small button--secondary" onClick={() => openEditBook(book)} type="button">
                    Editar
                  </button>
                  <button className="button button--small button--danger" onClick={() => handleDeleteBook(book.id)} type="button">
                    Excluir
                  </button>
                </div>
              </article>
            )) : (
              <EmptyState title="Nenhum livro encontrado" description="Use a busca ou adicione um novo título ao acervo." />
            )}
          </div>
          <div className="panel panel--soft">
            <strong>Histórico de ações de livros</strong>
            {bookHistory.length ? (
              bookHistory.map((item) => <p key={item.id}>{item.description}</p>)
            ) : (
              <p className="muted-text">Histórico preparado para futura API: GET /api/livros/historico.</p>
            )}
          </div>
        </section>
      ) : null}

      {activeSection === "emprestimos" ? (
        <section className="admin-section">
          <div className="section-heading">
            <h2>Controlar empréstimos</h2>
          </div>
          <div className="action-card__buttons">
            <Link className="button button--small" to="/funcionario/registrar-emprestimo">Registrar empréstimo</Link>
            <Link className="button button--small button--secondary" to="/funcionario/registrar-devolucao">Registrar devolução</Link>
            <Link className="button button--small button--secondary" to="/funcionario/atrasos">Ver empréstimos atrasados</Link>
          </div>
          <section className="search-box">
            <span className="search-box__icon">⌕</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por cliente, livro ou status..."
              type="search"
              value={query}
            />
          </section>
          <LoanList
            empty="Nenhum empréstimo ativo encontrado."
            loans={filteredLoans}
            onReturn={(loan) => navigate("/funcionario/registrar-devolucao", { state: { emprestimoId: loan.id } })}
          />
        </section>
      ) : null}

      {activeSection === "recentes" ? (
        <section className="admin-section">
          <div className="section-heading">
            <h2>Empréstimos recentes</h2>
          </div>
          <LoanList
            empty="As movimentações recentes aparecerão aqui."
            loans={dashboard?.recentLoans || []}
            onReturn={(loan) => navigate("/funcionario/registrar-devolucao", { state: { emprestimoId: loan.id } })}
          />
        </section>
      ) : null}

      {editingBook && editForm ? (
        <section className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="panel edit-book-modal form-grid" onSubmit={handleSaveEdit}>
            <div className="section-heading">
              <h2>Editar livro</h2>
              <button className="icon-button icon-button--ghost" onClick={() => setEditingBook(null)} type="button">×</button>
            </div>
            <input className="input" placeholder="Título" value={editForm.title} onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))} />
            <input className="input" placeholder="Autor" value={editForm.author} onChange={(event) => setEditForm((current) => ({ ...current, author: event.target.value }))} />
            <input className="input" placeholder="ISBN" value={editForm.isbn} onChange={(event) => setEditForm((current) => ({ ...current, isbn: event.target.value }))} />
            <textarea className="input" placeholder="Descrição" value={editForm.description} onChange={(event) => setEditForm((current) => ({ ...current, description: event.target.value }))} />
            <select className="input" value={editForm.categoryId || ""} onChange={(event) => {
              const category = categories.find((item) => String(item.id) === event.target.value);
              setEditForm((current) => ({ ...current, categoryId: Number(event.target.value), category: category?.name || current.category }));
            }}>
              <option value="">Selecione a categoria</option>
              {categories.map((category) => (
                <option key={`${category.id}-${category.name}`} value={category.id}>{category.name}</option>
              ))}
            </select>
            <input className="input" placeholder="Gêneros extras separados por vírgula" value={editForm.extraGenres} onChange={(event) => setEditForm((current) => ({ ...current, extraGenres: event.target.value }))} />
            {genreOptions.length ? (
              <div className="checkbox-chip-panel">
                <strong>Gêneros extras</strong>
                <div className="genre-chip-row">
                  {genreOptions.map((genre) => (
                    <button
                      className={`tag-pill${editForm.genreIds.includes(genre.id) ? " tag-pill--active" : ""}`}
                      key={genre.id}
                      onClick={() => toggleEditArray("genreIds", genre.id)}
                      type="button"
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <input className="input" placeholder="IDs de subgêneros separados por vírgula" value={editForm.subgenreIdsText} onChange={(event) => setEditForm((current) => ({ ...current, subgenreIdsText: event.target.value }))} />
            <input className="input" placeholder="Páginas" type="number" value={editForm.pages} onChange={(event) => setEditForm((current) => ({ ...current, pages: event.target.value }))} />
            <input className="input" placeholder="Ano" type="number" value={editForm.publishedYear} onChange={(event) => setEditForm((current) => ({ ...current, publishedYear: event.target.value }))} />
            <input className="input" placeholder="Editora" value={editForm.publisher} onChange={(event) => setEditForm((current) => ({ ...current, publisher: event.target.value }))} />
            <input className="input" placeholder="Quantidade total" type="number" value={editForm.quantityTotal} onChange={(event) => setEditForm((current) => ({ ...current, quantityTotal: event.target.value }))} />
            <input className="input" placeholder="Quantidade disponível" type="number" value={editForm.availableQuantity} onChange={(event) => setEditForm((current) => ({ ...current, availableQuantity: event.target.value }))} />
            <input className="input" placeholder="Imagem da capa" value={editForm.coverImage} onChange={(event) => setEditForm((current) => ({ ...current, coverImage: event.target.value }))} />
            <div className="action-card__buttons">
              <button className="button button--secondary" onClick={() => setEditingBook(null)} type="button">Cancelar</button>
              <button className="button" type="submit">Salvar</button>
            </div>
          </form>
        </section>
      ) : null}

    </main>
  );
}

function LoanList({ loans, empty, onReturn, compact = false }) {
  if (!loans.length) {
    return <EmptyState title={empty} description="Quando houver dados disponíveis, eles aparecerão nesta área." />;
  }

  return (
    <div className={`recent-list${compact ? " recent-list--compact" : ""}`}>
      {loans.map((loan) => (
        <article className="recent-item loan-admin-item" key={loan.id}>
          <strong>{loan.client.name || "Cliente"}</strong>
          <p>{loan.book.title}</p>
          <small className="muted-text">Exemplar: {formatExemplarLabel(loan)}</small>
          <small>Empréstimo: {formatDate(loan.borrowedAt)} • Prevista: {formatDate(loan.dueDate)}</small>
          <span className={`status-badge status-badge--${loan.status === "Atrasado" ? "atrasado" : "dentro-do-prazo"}`}>
            {loan.status}
          </span>
          {onReturn && !loan.returnedAt ? (
            <button className="button button--small button--secondary" onClick={() => onReturn(loan)} type="button">
              Registrar devolução
            </button>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function DashboardSection({
  activeMetric,
  activeLoans,
  allLoans,
  books,
  clients,
  dashboard,
  genres,
  maxBookValue,
  overdueLoans,
  pendingFines,
  topBooks,
  unavailableBooks,
  onClearMetric,
  onPayFine,
}) {
  const metrics = dashboard?.metrics || {};
  const employeeStats = useMemo(
    () => buildEmployeeStats(allLoans, metrics.totalEmployees),
    [allLoans, metrics.totalEmployees],
  );
  const finesByClient = pendingFines.reduce((accumulator, fine) => {
    const key = fine.client?.id || fine.client?.email || fine.client?.name || fine.id;
    const current = accumulator.get(key) || {
      id: key,
      label: fine.client?.name || "Cliente",
      value: 0,
    };
    current.value += Number(fine.value || 0);
    accumulator.set(key, current);
    return accumulator;
  }, new Map());
  const finesByClientList = Array.from(finesByClient.values()).sort((a, b) => b.value - a.value);
  const maxFineValue = Math.max(1, ...finesByClientList.map((item) => item.value));
  const showingMetricDetail = Boolean(activeMetric);

  return (
    <section className="admin-section">
      <div className="section-heading">
        <h2>Dashboard</h2>
      </div>

      <div className="section-heading admin-section-title">
        <h2>Alertas</h2>
      </div>
      <div className="alert-stack">
        {metrics.overdueLoans > 0 ? <div className="alert alert--error">Há empréstimos atrasados que precisam de atenção.</div> : null}
        {metrics.pendingFines > 0 ? <div className="alert alert--error">Existem multas pendentes no sistema.</div> : null}
        {metrics.unavailableBooks > 0 ? <div className="alert alert--success">Alguns livros estão sem disponibilidade no momento.</div> : null}
        {!metrics.overdueLoans && !metrics.pendingFines && !metrics.unavailableBooks ? (
          <div className="alert alert--success">Nenhum alerta crítico no momento.</div>
        ) : null}
      </div>

      {activeMetric === "multas" ? (
        <DetailPanel onClose={onClearMetric} title="Multas pendentes">
          {pendingFines.length ? pendingFines.map((fine) => (
            <article className="fine-item" key={fine.id}>
              <strong>{fine.client.name}</strong>
              <p>{fine.book.title}</p>
              <small>Valor: {currency(fine.value)} • Criada em: {formatDate(fine.createdAt)}</small>
              <small>Status: {fine.paid ? "Paga" : "Pendente"}</small>
              <button className="button button--small button--secondary" onClick={() => onPayFine(fine.id)} type="button">
                Marcar como paga
              </button>
            </article>
          )) : (
            <EmptyState title="Sem multas pendentes" description="Quando a API de multas estiver disponível, os detalhes aparecerão aqui." />
          )}
          <strong>Total geral: {currency(pendingFines.reduce((sum, fine) => sum + fine.value, 0))}</strong>
        </DetailPanel>
      ) : null}

      {activeMetric === "atrasados" ? (
        <DetailPanel onClose={onClearMetric} title="Empréstimos atrasados">
          <LoanList empty="Nenhum empréstimo atrasado." loans={overdueLoans} />
        </DetailPanel>
      ) : null}

      {activeMetric === "indisponiveis" ? (
        <DetailPanel onClose={onClearMetric} title="Livros indisponíveis">
          {unavailableBooks.length ? unavailableBooks.map((book) => (
            <article className="recent-item" key={book.id}>
              <strong>{book.title}</strong>
              <p>{book.author}</p>
              <small>{book.category} • {book.availableQuantity} disponíveis</small>
            </article>
          )) : <EmptyState title="Nenhum livro indisponível" description="Todos os livros ativos possuem disponibilidade." />}
        </DetailPanel>
      ) : null}

      {activeMetric === "clientes" ? (
        <DetailPanel onClose={onClearMetric} title="Clientes cadastrados">
          {clients.length ? clients.map((client) => (
            <article className="recent-item" key={client.id}>
              <strong>{client.name}</strong>
              <p>{client.email}</p>
              <small>{client.phone || "Sem telefone"}</small>
            </article>
          )) : <EmptyState title="Clientes indisponíveis" description="Endpoint de listagem de clientes ainda precisa ser exposto pelo back-end." />}
        </DetailPanel>
      ) : null}

      {activeMetric === "funcionarios" ? (
        <DetailPanel onClose={onClearMetric} title="Funcionários cadastrados">
          <div className="employee-summary">
            <article className="info-tile">
              <strong>{employeeStats.totalActive}</strong>
              <span>Funcionários ativos no sistema</span>
            </article>
            <article className="info-tile">
              <strong>{employeeStats.employees.length}</strong>
              <span>Com movimentação registrada</span>
            </article>
          </div>
          {employeeStats.employees.length ? (
            <>
              <div className="employee-table employee-table--desktop">
                <div className="employee-table__head">
                  <span>Funcionário</span>
                  <span>Empréstimos</span>
                  <span>Devoluções</span>
                </div>
                {employeeStats.employees.map((employee) => (
                  <div className="employee-table__row" key={employee.id}>
                    <strong>{employee.name}</strong>
                    <span>{employee.loansRegistered}</span>
                    <span>{employee.returnsRegistered}</span>
                  </div>
                ))}
              </div>
              <div className="employee-cards employee-cards--mobile">
                {employeeStats.employees.map((employee) => (
                  <article className="employee-card" key={`card-${employee.id}`}>
                    <p className="employee-card__line">
                      <span className="employee-card__label">Funcionário:</span>
                      <span className="employee-card__value">{employee.name}</span>
                    </p>
                    <p className="employee-card__line">
                      <span className="employee-card__label">Empréstimos:</span>
                      <span className="employee-card__value">{employee.loansRegistered}</span>
                    </p>
                    <p className="employee-card__line">
                      <span className="employee-card__label">Devoluções:</span>
                      <span className="employee-card__value">{employee.returnsRegistered}</span>
                    </p>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              title="Sem movimentação por funcionário"
              description="Os empréstimos registrados aparecerão aqui com o total por bibliotecário."
            />
          )}
          {employeeStats.withoutMovements > 0 ? (
            <p className="muted-text">
              {employeeStats.withoutMovements} funcionário(s) cadastrado(s) ainda sem empréstimos vinculados nos registros recentes.
            </p>
          ) : null}
        </DetailPanel>
      ) : null}

      {activeMetric === "ativos" ? (
        <DetailPanel onClose={onClearMetric} title="Empréstimos ativos">
          <LoanList empty="Nenhum empréstimo ativo." loans={activeLoans} compact />
        </DetailPanel>
      ) : null}

      {activeMetric === "livros" ? (
        <DetailPanel onClose={onClearMetric} title="Livros no acervo">
          {books.length ? books.slice(0, 12).map((book) => (
            <article className="recent-item" key={book.id}>
              <strong>{book.title}</strong>
              <p>{book.author}</p>
              <small>{getBookGenres(book).join(" + ")} • {book.availableQuantity} disponíveis</small>
            </article>
          )) : <EmptyState title="Nenhum livro encontrado" description="Os livros ativos aparecerão aqui." />}
        </DetailPanel>
      ) : null}

      {activeMetric === "historico" ? (
        <DetailPanel onClose={onClearMetric} title="Histórico de empréstimos">
          <LoanList empty="Empréstimos recentes aparecerão aqui." loans={dashboard?.recentLoans || []} compact />
        </DetailPanel>
      ) : null}

      {!showingMetricDetail ? (
        <>
          <div className="section-heading admin-section-title">
            <h2>Indicadores e gráficos</h2>
          </div>

          <DashboardCharts
            currency={currency}
            finesByClientList={finesByClientList}
            genres={genres}
            loansByMonth={dashboard?.loansByMonth || []}
            maxBookValue={maxBookValue}
            maxFineValue={maxFineValue}
            returnsStats={dashboard?.returnsStats}
            topBooks={topBooks}
          />
        </>
      ) : null}
    </section>
  );
}

function DetailPanel({ title, children, onClose }) {
  return (
    <section className="panel dashboard-detail-panel">
      <div className="section-heading">
        <h2>{title}</h2>
        {onClose ? (
          <button className="button button--small button--secondary" onClick={onClose} type="button">
            Voltar aos gráficos
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}
