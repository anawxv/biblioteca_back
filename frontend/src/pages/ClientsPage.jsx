import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { TopBar } from "../components/TopBar";
import { listarClientes } from "../services/api";
import { currency } from "../utils/formatters";
import { normalizeSearchText } from "../utils/search";

export function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClients() {
      setLoading(true);
      setFeedback("");
      try {
        setClients(await listarClientes(""));
      } catch (error) {
        setFeedback(error.message || "Não foi possível carregar clientes.");
      } finally {
        setLoading(false);
      }
    }

    loadClients();
  }, []);

  const filteredClients = useMemo(() => {
    const search = normalizeSearchText(query);
    return clients.filter((client) =>
      !search ||
      [client.name, client.email, client.phone].some((field) => normalizeSearchText(field).includes(search)),
    );
  }, [clients, query]);

  return (
    <main className="page page-with-nav">
      <TopBar title="Consultar clientes" subtitle="Lista de clientes cadastrados" />

      <section className="search-box">
        <span className="search-box__icon">⌕</span>
        <input
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nome, e-mail ou telefone..."
          type="search"
          value={query}
        />
      </section>

      {feedback ? <div className="alert alert--error">{feedback}</div> : null}
      {loading ? <section className="panel">Carregando clientes...</section> : null}

      {filteredClients.length ? (
        <section className="recent-list">
          {filteredClients.map((client) => (
            <article className="recent-item client-info-card" key={client.id}>
              <strong className="client-info-card__name">{client.name}</strong>
              <p className="client-info-card__line">{client.email}</p>
              <p className="client-info-card__line">{client.phone || "Sem telefone"}</p>
              <div className="client-info-card__line client-info-card__status">
                <span>Status:</span>
                <span className={`status-badge status-badge--${client.blocked || client.active === false ? "atrasado" : "disponivel"}`}>
                  {client.blocked || client.active === false ? "Bloqueado" : "Ativo"}
                </span>
              </div>
              <p className="client-info-card__line">
                Empréstimos ativos: {client.activeLoans ?? "não informado"}
              </p>
              <p className="client-info-card__line client-info-card__fine">
                Multas pendentes: {client.pendingFine ? currency(client.pendingFine) : "R$ 0,00"}
              </p>
            </article>
          ))}
        </section>
      ) : (
        <EmptyState title="Nenhum cliente cadastrado." description="Os clientes retornados pela API aparecerão aqui." />
      )}
    </main>
  );
}
