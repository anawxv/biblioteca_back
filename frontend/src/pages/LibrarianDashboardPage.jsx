import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChartCard } from "../components/ChartCard";
import { EmptyState } from "../components/EmptyState";
import { MetricCard } from "../components/MetricCard";
import { TopBar } from "../components/TopBar";
import {
  buscarLivros,
  listarClientes,
  listarDashboard,
  listarEmprestimosAtivos,
  listarGenerosMaisConsumidos,
  listarLivrosMaisEmprestados,
} from "../services/api";
import { currency, formatDate } from "../utils/formatters";

export function LibrarianDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [genres, setGenres] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    books: [],
    clients: [],
    loans: [],
  });

  useEffect(() => {
    async function loadDashboard() {
      const [dashboardResponse, genresResponse, topBooksResponse] = await Promise.all([
        listarDashboard(),
        listarGenerosMaisConsumidos(),
        listarLivrosMaisEmprestados(),
      ]);

      setDashboard(dashboardResponse);
      setGenres(genresResponse);
      setTopBooks(topBooksResponse);
    }

    loadDashboard();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (!query.trim()) {
        setSearchResults({ books: [], clients: [], loans: [] });
        return;
      }

      const [books, clients, loans] = await Promise.all([
        buscarLivros(query),
        listarClientes(query),
        listarEmprestimosAtivos(query),
      ]);

      setSearchResults({
        books: books.slice(0, 3),
        clients: clients.slice(0, 3),
        loans: loans.slice(0, 3),
      });
    }, 180);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const maxGenreValue = useMemo(
    () => Math.max(1, ...genres.map((item) => item.value)),
    [genres],
  );
  const maxBookValue = useMemo(
    () => Math.max(1, ...topBooks.map((item) => item.loanCount)),
    [topBooks],
  );
  const maxMonthValue = useMemo(
    () => Math.max(1, ...(dashboard?.loansByMonth || []).map((item) => item.value)),
    [dashboard],
  );

  if (!dashboard) {
    return (
      <main className="page page-with-nav">
        <TopBar title="Painel do bibliotecário" subtitle="Gerencie livros e empréstimos" />
        <section className="panel">Carregando visão geral...</section>
      </main>
    );
  }

  return (
    <main className="page page-with-nav">
      <TopBar title="Painel do bibliotecário" subtitle="Gerencie livros e empréstimos" />

      <section className="search-box">
        <span className="search-box__icon">⌕</span>
        <input
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Busque por livro, cliente ou empréstimo..."
          type="search"
          value={query}
        />
      </section>

      {query.trim() ? (
        <section className="panel search-panel">
          <div className="section-heading">
            <h2>Resultados da busca</h2>
          </div>
          <div className="search-results">
            {searchResults.books.length ? (
              <div>
                <strong>Livros</strong>
                {searchResults.books.map((book) => (
                  <p key={book.id}>{book.title}</p>
                ))}
              </div>
            ) : null}
            {searchResults.clients.length ? (
              <div>
                <strong>Clientes</strong>
                {searchResults.clients.map((client) => (
                  <p key={client.id}>{client.name}</p>
                ))}
              </div>
            ) : null}
            {searchResults.loans.length ? (
              <div>
                <strong>Empréstimos</strong>
                {searchResults.loans.map((loan) => (
                  <p key={loan.id}>
                    {loan.client.name} • {loan.book.title}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="metrics-grid">
        <MetricCard icon="▥" label="Livros no acervo" value={dashboard.metrics.totalBooks} />
        <MetricCard icon="◌" label="Clientes cadastrados" value={dashboard.metrics.totalClients} soft />
        <MetricCard icon="↗" label="Empréstimos ativos" value={dashboard.metrics.activeLoans} />
        <MetricCard icon="!" label="Empréstimos atrasados" value={dashboard.metrics.overdueLoans} soft />
        <MetricCard
          icon="$"
          label="Multas pendentes"
          value={currency(dashboard.metrics.pendingFines)}
        />
      </section>

      <section className="action-panels">
        <article className="action-card">
          <div>
            <strong>Gerenciar livros</strong>
            <p>Adicione novos títulos ou remova itens do acervo.</p>
          </div>
          <div className="action-card__buttons">
            <Link className="button button--small" to="/funcionario/adicionar-livro">
              Adicionar livro
            </Link>
            <Link className="button button--small button--secondary" to="/funcionario/remover-livro">
              Remover livro
            </Link>
          </div>
        </article>

        <article className="action-card">
          <div>
            <strong>Controlar empréstimos</strong>
            <p>Registre retiradas e devoluções rapidamente.</p>
          </div>
          <div className="action-card__buttons">
            <Link className="button button--small" to="/funcionario/registrar-emprestimo">
              Registrar empréstimo
            </Link>
            <Link className="button button--small button--secondary" to="/funcionario/registrar-devolucao">
              Registrar devolução
            </Link>
          </div>
        </article>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>Empréstimos recentes</h2>
        </div>
        <div className="recent-list">
          {dashboard.recentLoans.map((loan) => (
            <article className="recent-item" key={loan.id}>
              <strong>{loan.client.name}</strong>
              <p>{loan.book.title}</p>
              <small>{formatDate(loan.borrowedAt)}</small>
            </article>
          ))}
        </div>
      </section>

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
                <div
                  className="chart-row__fill chart-row__fill--dark"
                  style={{ width: `${(book.loanCount / maxBookValue) * 100}%` }}
                />
              </div>
              <strong>{book.loanCount}</strong>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard title="Empréstimos por mês">
        <div className="vertical-chart">
          {dashboard.loansByMonth.map((item) => (
            <div className="vertical-chart__item" key={item.label}>
              <div
                className="vertical-chart__bar"
                style={{ height: `${(item.value / maxMonthValue) * 100}%` }}
              />
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard title="Devoluções no prazo x atrasadas">
        {dashboard.returnsStats.onTime || dashboard.returnsStats.late ? (
          <div className="split-chart">
            <div
              className="split-chart__segment"
              style={{
                width: `${
                  (dashboard.returnsStats.onTime /
                    (dashboard.returnsStats.onTime + dashboard.returnsStats.late || 1)) *
                  100
                }%`,
              }}
            >
              No prazo: {dashboard.returnsStats.onTime}
            </div>
            <div
              className="split-chart__segment split-chart__segment--late"
              style={{
                width: `${
                  (dashboard.returnsStats.late /
                    (dashboard.returnsStats.onTime + dashboard.returnsStats.late || 1)) *
                  100
                }%`,
              }}
            >
              Atrasadas: {dashboard.returnsStats.late}
            </div>
          </div>
        ) : (
          <EmptyState
            title="Sem devoluções registradas"
            description="Os indicadores de prazo aparecerão assim que houver movimentação."
          />
        )}
      </ChartCard>
    </main>
  );
}
