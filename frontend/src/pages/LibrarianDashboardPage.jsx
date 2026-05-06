import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookCover } from "../components/BookCover";
import { ChartCard } from "../components/ChartCard";
import { EmptyState } from "../components/EmptyState";
import { MetricCard } from "../components/MetricCard";
import { TopBar } from "../components/TopBar";
import {
  buscarLivros,
  excluirLivro,
  listarClientes,
  listarDashboard,
  listarEmprestimosAtrasados,
  listarEmprestimosAtivos,
  listarGenerosMaisConsumidos,
  listarHistoricoLivros,
  listarLivros,
  listarLivrosIndisponiveis,
  listarLivrosMaisEmprestados,
  listarMultasPendentes,
  marcarMultaComoPaga,
} from "../services/api";
import { currency, formatDate } from "../utils/formatters";

const sections = [
  { id: "livros", label: "Gerenciar livros" },
  { id: "emprestimos", label: "Controlar empréstimos" },
  { id: "recentes", label: "Empréstimos recentes" },
  { id: "dashboard", label: "Dashboard" },
];

export function LibrarianDashboardPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("livros");
  const [activeMetric, setActiveMetric] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [genres, setGenres] = useState([]);
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
      ]);

      setDashboard(dashboardResponse);
      setGenres(genresResponse);
      setTopBooks(topBooksResponse);
      setBooks(booksResponse);
      setClients(clientsResponse);
      setActiveLoans(activeLoansResponse);
      setOverdueLoans(overdueLoansResponse);
      setUnavailableBooks(unavailableBooksResponse);
      setPendingFines(pendingFinesResponse);
      setBookHistory(historyResponse);
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPanel();
  }, []);

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

  const maxGenreValue = useMemo(() => Math.max(1, ...genres.map((item) => item.value)), [genres]);
  const maxBookValue = useMemo(() => Math.max(1, ...topBooks.map((item) => item.loanCount)), [topBooks]);
  const maxMonthValue = useMemo(
    () => Math.max(1, ...(dashboard?.loansByMonth || []).map((item) => item.value)),
    [dashboard],
  );

  const filteredBooks = books.filter((book) =>
    [book.title, book.author, book.category].some((field) =>
      String(field || "").toLowerCase().includes(query.toLowerCase()),
    ),
  );

  const filteredLoans = activeLoans.filter((loan) =>
    [loan.client.name, loan.book.title, loan.status].some((field) =>
      String(field || "").toLowerCase().includes(query.toLowerCase()),
    ),
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

      <section className="metrics-grid metrics-grid--clickable">
        <button className="metric-button" onClick={() => openMetric("livros")} type="button">
          <MetricCard icon="▥" label="Livros no acervo" value={metrics.totalBooks} />
        </button>
        <button className="metric-button" onClick={() => openMetric("clientes")} type="button">
          <MetricCard icon="○" label="Clientes cadastrados" value={metrics.totalClients} soft />
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
      </section>

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
                  <button className="button button--small button--secondary" type="button">
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
          <div className="panel panel--soft">
            <strong>Empréstimos atrasados</strong>
            <LoanList compact empty="Sem atrasos no momento." loans={overdueLoans} />
          </div>
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

      {activeSection === "dashboard" ? (
        <DashboardSection
          activeMetric={activeMetric}
          clients={clients}
          dashboard={dashboard}
          genres={genres}
          maxBookValue={maxBookValue}
          maxGenreValue={maxGenreValue}
          maxMonthValue={maxMonthValue}
          overdueLoans={overdueLoans}
          pendingFines={pendingFines}
          topBooks={topBooks}
          unavailableBooks={unavailableBooks}
          onPayFine={handlePayFine}
        />
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
  clients,
  dashboard,
  genres,
  maxBookValue,
  maxGenreValue,
  maxMonthValue,
  overdueLoans,
  pendingFines,
  topBooks,
  unavailableBooks,
  onPayFine,
}) {
  const metrics = dashboard?.metrics || {};

  return (
    <section className="admin-section">
      <div className="section-heading">
        <h2>Dashboard</h2>
      </div>

      <div className="alert-stack">
        {metrics.overdueLoans > 0 ? <div className="alert alert--error">Há empréstimos atrasados que precisam de atenção.</div> : null}
        {metrics.pendingFines > 0 ? <div className="alert alert--error">Existem multas pendentes no sistema.</div> : null}
        {metrics.unavailableBooks > 0 ? <div className="alert alert--success">Alguns livros estão sem disponibilidade no momento.</div> : null}
      </div>

      {activeMetric === "multas" ? (
        <DetailPanel title="Multas pendentes">
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
        <DetailPanel title="Empréstimos atrasados">
          <LoanList empty="Nenhum empréstimo atrasado." loans={overdueLoans} />
        </DetailPanel>
      ) : null}

      {activeMetric === "indisponiveis" ? (
        <DetailPanel title="Livros indisponíveis">
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
        <DetailPanel title="Clientes cadastrados">
          {clients.length ? clients.map((client) => (
            <article className="recent-item" key={client.id}>
              <strong>{client.name}</strong>
              <p>{client.email}</p>
              <small>{client.phone || "Sem telefone"}</small>
            </article>
          )) : <EmptyState title="Clientes indisponíveis" description="Endpoint de listagem de clientes ainda precisa ser exposto pelo back-end." />}
        </DetailPanel>
      ) : null}

      <ChartCard title="Gêneros mais consumidos">
        <div className="chart-bars">
          {genres.map((item) => (
            <div className="chart-row" key={item.label}>
              <span>{item.label}</span>
              <div className="chart-row__track">
                <div className="chart-row__fill" style={{ width: `${(item.value / maxGenreValue) * 100}%` }} />
              </div>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard title="Livros mais emprestados">
        <div className="chart-bars">
          {topBooks.map((book) => (
            <div className="chart-row" key={book.id}>
              <span>{book.title}</span>
              <div className="chart-row__track">
                <div className="chart-row__fill chart-row__fill--dark" style={{ width: `${(book.loanCount / maxBookValue) * 100}%` }} />
              </div>
              <strong>{book.loanCount}</strong>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard title="Empréstimos por mês">
        <div className="vertical-chart">
          {(dashboard?.loansByMonth || []).map((item) => (
            <div className="vertical-chart__item" key={item.label}>
              <div className="vertical-chart__bar" style={{ height: `${(item.value / maxMonthValue) * 100}%` }} />
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard title="Devoluções no prazo x atrasadas">
        {dashboard?.returnsStats?.onTime || dashboard?.returnsStats?.late ? (
          <div className="split-chart">
            <div className="split-chart__segment" style={{ width: `${(dashboard.returnsStats.onTime / (dashboard.returnsStats.onTime + dashboard.returnsStats.late || 1)) * 100}%` }}>
              No prazo: {dashboard.returnsStats.onTime}
            </div>
            <div className="split-chart__segment split-chart__segment--late" style={{ width: `${(dashboard.returnsStats.late / (dashboard.returnsStats.onTime + dashboard.returnsStats.late || 1)) * 100}%` }}>
              Atrasadas: {dashboard.returnsStats.late}
            </div>
          </div>
        ) : (
          <EmptyState title="Sem devoluções registradas" description="Os indicadores aparecerão assim que houver movimentação." />
        )}
      </ChartCard>
    </section>
  );
}

function DetailPanel({ title, children }) {
  return (
    <section className="panel dashboard-detail-panel">
      <div className="section-heading">
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}
