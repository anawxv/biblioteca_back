import { mockServer } from "../mocks/mockServer";

export const API_URL = import.meta.env.VITE_API_URL || "/api";

function buildRequestHeaders(extraHeaders = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  if (/ngrok/i.test(API_URL)) {
    headers["ngrok-skip-browser-warning"] = "true";
  }

  return headers;
}

export const CATEGORY_NAMES = [
  "Romance",
  "Fantasia",
  "Aventura",
  "Ficção Científica",
  "Suspense",
  "Mistério",
  "Horror",
  "Biografia",
  "História",
  "Filosofia",
  "Psicologia",
  "Autoajuda",
  "Educação",
  "Infantil",
  "Poesia",
  "Drama",
  "Humor",
  "Nacionais",
];

async function parseResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : null;
}

function friendlyError(error) {
  if (error instanceof TypeError || error?.message === "Failed to fetch") {
    return "Não foi possível conectar ao servidor. Verifique se o back-end está rodando.";
  }

  return error?.message || "Não foi possível concluir a operação. Tente novamente.";
}

async function request(path, options = {}, fallback, fallbackOnStatuses = [404, 500, 502, 503]) {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      headers: buildRequestHeaders(options.headers || {}),
      ...options,
    });

    if (!response.ok) {
      const errorPayload = await parseResponse(response);
      const message = errorPayload?.message || "Não foi possível concluir a operação.";

      if (fallback && fallbackOnStatuses.includes(response.status)) {
        console.warn(`API indisponível em ${path}. Usando fallback temporário.`);
        return fallback();
      }

      throw Object.assign(new Error(message), { fromResponse: true });
    }

    return parseResponse(response);
  } catch (error) {
    if (fallback && !error.fromResponse) {
      console.warn(`Falha de rede em ${path}. Usando fallback temporário.`, error);
      return fallback();
    }

    throw new Error(friendlyError(error));
  }
}

function normalizeRole(role) {
  const normalized = String(role || "").toLowerCase();
  return normalized === "funcionario" ? "funcionario" : "cliente";
}

function pickCategoryName(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value.name ?? value.nome ?? value.category ?? value.categoria ?? "";
}

function normalizeUser(payload = {}) {
  const user = payload.user || payload;
  return {
    id: user.id ?? user.idUsuario,
    name: user.name ?? user.nome,
    email: user.email,
    phone: user.phone ?? user.telefone ?? "",
    role: normalizeRole(user.role ?? user.tipoUsuario),
    active: user.active ?? user.ativo ?? true,
    blocked: user.blocked ?? user.bloqueado ?? false,
    pendingFine: Number(user.pendingFine ?? user.multaPendente ?? 0),
    activeLoans: user.activeLoans ?? user.emprestimosAtivos ?? null,
  };
}

function normalizeAuth(payload = {}) {
  return {
    token: payload.token || `session-${payload.idUsuario || payload.user?.id || Date.now()}`,
    user: normalizeUser(payload),
  };
}

export function normalizeBook(book = {}) {
  const quantityTotal = book.quantityTotal ?? book.quantidadeTotal ?? book.quantity ?? 1;
  const availableQuantity = book.availableQuantity ?? book.quantidadeDisponivel ?? quantityTotal;
  const status =
    book.status ||
    (book.active === false || book.ativo === false || Number(availableQuantity) <= 0
      ? "indisponivel"
      : "disponivel");

  return {
    id: book.id ?? book.idLivro,
    title: book.title ?? book.titulo,
    author: book.author ?? book.autor,
    category: pickCategoryName(book.category ?? book.categoria ?? book.categoriaLivro),
    extraGenres: book.extraGenres ?? book.generosExtras ?? book.generos_extras ?? [],
    subgenres: book.subgenres ?? book.subgeneros ?? [],
    isbn: book.isbn ?? "",
    pages: book.pages ?? book.paginas ?? "",
    description: book.description ?? book.descricao ?? "",
    publishedYear: book.publishedYear ?? book.anoPublicacao ?? "",
    publisher: book.publisher ?? book.editora ?? "",
    quantityTotal: Number(quantityTotal || 0),
    availableQuantity: Number(availableQuantity || 0),
    coverImage: book.coverImage ?? book.imagemCapa ?? "",
    active: book.active ?? book.ativo ?? true,
    createdAt: book.createdAt ?? book.criadoEm ?? null,
    loanCount: Number(book.loanCount ?? book.totalEmprestimos ?? book.quantidadeEmprestimos ?? 0),
    status,
    coverColors: book.coverColors || ["#FF66B3", "#FF4DA6"],
  };
}

function normalizeLoan(loan = {}) {
  const technicalStatus = loan.status ?? loan.statusTecnico;
  const visualStatus =
    loan.statusVisual ||
    (technicalStatus === "PENDENTE"
      ? "Pendente"
      : technicalStatus === "RECUSADA"
        ? "Recusada"
        : technicalStatus === "DEVOLVIDO"
      ? "Devolvido"
      : technicalStatus === "ATRASADO"
        ? "Atrasado"
        : "Dentro do prazo");

  return {
    id: loan.idEmprestimo ?? loan.id,
    client: normalizeUser(loan.client ?? loan.cliente ?? {}),
    book: normalizeBook(loan.book ?? loan.livro ?? {
      idLivro: loan.idLivro,
      titulo: loan.tituloLivro,
      autor: loan.autorLivro,
      imagemCapa: loan.imagemCapa,
    }),
    funcionarioId: loan.funcionarioId ?? loan.idFuncionario ?? null,
    borrowedAt: loan.borrowedAt ?? loan.dataEmprestimo,
    dueDate: loan.dueDate ?? loan.dataPrevistaDevolucao,
    returnedAt: loan.returnedAt ?? loan.dataDevolucao ?? null,
    status: visualStatus,
    technicalStatus,
    observacao: loan.observacao ?? "",
    fineApplied: loan.fineApplied ?? false,
    fineAmount: loan.fineAmount ?? 0,
    message: loan.message,
    idExemplar: loan.idExemplar ?? loan.exemplarId ?? null,
    codigoTombo: loan.codigoTombo ?? loan.codigo_tombo ?? null,
  };
}

export function formatExemplarLabel(loan = {}) {
  return loan.codigoTombo || "Sem tombo";
}

function normalizeFine(fine = {}) {
  const loan = normalizeLoan(fine.loan ?? fine.emprestimo ?? fine);
  return {
    id: fine.id ?? fine.idMulta ?? `multa-${loan.id}`,
    client: normalizeUser(fine.client ?? fine.cliente ?? loan.client),
    book: normalizeBook(fine.book ?? fine.livro ?? loan.book),
    value: Number(fine.value ?? fine.valor ?? fine.fineAmount ?? loan.fineAmount ?? 0),
    createdAt: fine.createdAt ?? fine.criadaEm ?? loan.returnedAt ?? loan.dueDate,
    paid: Boolean(fine.paid ?? fine.paga ?? false),
    status: fine.status ?? (fine.paga ? "Paga" : "Pendente"),
  };
}

function normalizeChartPoint(item = {}) {
  return {
    label: item.label,
    value: Number(item.value ?? item.total ?? 0),
  };
}

function asArray(payload, keys = []) {
  if (Array.isArray(payload)) {
    return payload;
  }

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) {
      return payload[key];
    }
  }

  return [];
}

function normalizeDashboard(payload = {}) {
  const metrics = payload.metrics || payload;
  return {
    metrics: {
      totalBooks: Number(metrics.totalBooks ?? metrics.livrosNoAcervo ?? 0),
      totalClients: Number(metrics.totalClients ?? metrics.clientesCadastrados ?? 0),
      totalEmployees: Number(metrics.totalEmployees ?? metrics.funcionariosCadastrados ?? 0),
      activeLoans: Number(metrics.activeLoans ?? metrics.emprestimosAtivos ?? 0),
      overdueLoans: Number(metrics.overdueLoans ?? metrics.emprestimosAtrasados ?? 0),
      returnedLoans: Number(metrics.returnedLoans ?? metrics.emprestimosDevolvidos ?? 0),
      pendingFines: Number(metrics.pendingFines ?? metrics.multasPendentes ?? 0),
      unavailableBooks: Number(metrics.unavailableBooks ?? metrics.livrosIndisponiveis ?? 0),
    },
    recentLoans: (payload.recentLoans || payload.emprestimosRecentes || []).map(normalizeLoan),
    loansByMonth: (payload.loansByMonth || payload.emprestimosPorMes || []).map(normalizeChartPoint),
    returnsStats: {
      onTime: Number(payload.returnsStats?.onTime ?? payload.devolucoesNoPrazo ?? 0),
      late: Number(payload.returnsStats?.late ?? payload.devolucoesAtrasadas ?? 0),
    },
    alerts: payload.alerts ?? payload.alertas ?? [],
  };
}

function normalizeCategory(category, index) {
  if (typeof category === "string") {
    const officialIndex = CATEGORY_NAMES.findIndex((item) => item.toLowerCase() === category.toLowerCase());
    return {
      id: officialIndex >= 0 ? officialIndex + 1 : index + 1,
      name: category,
    };
  }

  return {
    id: category.id ?? category.idCategoria ?? index + 1,
    name: category.name ?? category.nome,
  };
}

function resolveCategoryId(input) {
  if (input.categoryId || input.idCategoria) {
    return Number(input.categoryId || input.idCategoria);
  }

  const categoryName = input.category || input.categoria || CATEGORY_NAMES[0];
  const index = CATEGORY_NAMES.findIndex((item) => item.toLowerCase() === String(categoryName).toLowerCase());
  return index >= 0 ? index + 1 : 1;
}

function toBookPayload(data) {
  const quantityTotal = Number(data.quantityTotal ?? data.quantity ?? data.quantidadeTotal ?? 1);
  return {
    title: data.title ?? data.titulo,
    author: data.author ?? data.autor,
    isbn: data.isbn,
    description: data.description ?? data.descricao,
    publishedYear: data.publishedYear ? Number(data.publishedYear) : null,
    pages: data.pages ? Number(data.pages) : null,
    publisher: data.publisher ?? data.editora,
    quantityTotal,
    availableQuantity: Number(data.availableQuantity ?? data.quantidadeDisponivel ?? quantityTotal),
    categoryId: resolveCategoryId(data),
    coverImage: data.coverImage ?? data.imagemCapa,
    generosExtras: data.extraGenres ?? data.generosExtras ?? [],
    idsGenerosExtras: data.genreIds ?? data.idsGenerosExtras ?? [],
    idsSubgeneros: data.subgenreIds ?? data.idsSubgeneros ?? [],
  };
}

export async function login(emailOrPayload, senha) {
  const payload =
    typeof emailOrPayload === "object"
      ? {
          email: emailOrPayload.email,
          senha: emailOrPayload.senha ?? emailOrPayload.password,
        }
      : { email: emailOrPayload, senha };

  const response = await request(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    null,
    [],
  );

  return normalizeAuth(response);
}

export async function loginComGoogle({ credential, tipoUsuario }) {
  const role = String(tipoUsuario || "").toUpperCase();
  const response = await request(
    "/auth/google",
    {
      method: "POST",
      body: JSON.stringify({ credential, tipoUsuario: role }),
    },
    null,
    [],
  );

  return normalizeAuth(response);
}

export async function cadastrarUsuario(dados) {
  const role = String(dados.tipoUsuario ?? dados.role ?? "").toUpperCase();
  const payload = {
    nome: dados.name ?? dados.nome,
    email: dados.email,
    senha: dados.password ?? dados.senha,
    telefone: dados.phone ?? dados.telefone,
    tipoUsuario: role,
    codigoAutorizacao: dados.authorizationCode ?? dados.codigoAutorizacao,
  };

  const response = await request(
    "/usuarios",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    null,
    [],
  );

  return {
    message: response?.message || "Cadastro realizado com sucesso.",
    user: normalizeUser(response?.user || response),
  };
}

export async function listarLivros() {
  const response = await request("/livros", {}, () => mockServer.listarLivros());
  return asArray(response, ["livros", "items", "content"]).map(normalizeBook);
}

export async function buscarLivros(busca) {
  const response = await request(
    `/livros?busca=${encodeURIComponent(busca || "")}`,
    {},
    () => mockServer.buscarLivros(busca),
  );
  return asArray(response, ["livros", "items", "content"]).map(normalizeBook);
}

export async function listarLivrosPorCategoria(categoria) {
  const books = await buscarLivros(categoria);
  const normalizedCategory = String(categoria || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return books.filter((book) => {
    const bookCategory = String(book.category || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    return bookCategory === normalizedCategory;
  });
}


export async function detalharLivro(id) {
  const response = await request(`/livros/${id}`, {}, () => mockServer.detalharLivro(id));
  return normalizeBook(response);
}

export async function listarExemplaresLivro(idLivro) {
  const response = await request(`/livros/${idLivro}/exemplares`, {}, () => []);
  return asArray(response, ["exemplares", "items", "content"]).map((item) => ({
    id: item.idExemplar ?? item.id,
    codigoTombo: item.codigoTombo ?? item.codigo_tombo,
    status: item.status,
    ativo: item.ativo ?? true,
  }));
}

export async function obterProximoExemplarDisponivel(idLivro) {
  const exemplares = await listarExemplaresLivro(idLivro);
  return exemplares.find((item) => item.ativo && item.status === "DISPONIVEL") || null;
}

export async function listarCategorias() {
  const response = await request("/categorias", {}, () => mockServer.listarCategorias());
  const categories = (asArray(response, ["categorias", "items", "content"]).length
    ? asArray(response, ["categorias", "items", "content"])
    : CATEGORY_NAMES
  ).map(normalizeCategory);
  const existing = new Set(categories.map((category) => String(category.name || "").toLowerCase()));
  const missing = CATEGORY_NAMES
    .filter((name) => !existing.has(name.toLowerCase()))
    .map((name) => ({ id: CATEGORY_NAMES.indexOf(name) + 1, name }));

  return [...categories, ...missing];
}

export async function listarGeneros() {
  const response = await request("/generos", {}, () => []);
  return asArray(response, ["generos", "items", "content"]).map((genero, index) => ({
    id: genero.id ?? genero.idGenero ?? index + 1,
    name: genero.name ?? genero.nome,
  }));
}

export async function listarSubgenerosPorCategoria(idCategoria) {
  const response = await request(`/categorias/${idCategoria}/subgeneros`, {}, () => []);
  return asArray(response, ["subgeneros", "items", "content"]).map((subgenero, index) => ({
    id: subgenero.id ?? subgenero.idSubgenero ?? index + 1,
    name: subgenero.name ?? subgenero.nome,
  }));
}

export async function solicitarEmprestimo(dados) {
  const response = await request(
    "/emprestimos",
    {
      method: "POST",
      body: JSON.stringify({
        clienteId: dados.clienteId ?? dados.idCliente,
        livroId: dados.livroId ?? dados.idLivro,
        funcionarioId: dados.funcionarioId ?? dados.idFuncionario,
        observacao: dados.observacao,
      }),
    },
    null,
    [],
  );
  return normalizeLoan(response);
}

export async function listarMeusEmprestimos(idCliente) {
  const response = await request(
    `/emprestimos/cliente/${idCliente}`,
    {},
    () => mockServer.listarMeusEmprestimos(idCliente),
  );

  const allLoans = [
    ...asArray(response?.ativos ?? response, ["ativos"]),
    ...asArray(response?.historico, ["historico"]),
  ].map(normalizeLoan);

  return {
    ativos: allLoans.filter((loan) => !loan.returnedAt),
    historico: allLoans.filter((loan) => loan.returnedAt),
  };
}

export async function devolverLivro(idEmprestimo) {
  const response = await request(
    `/emprestimos/${idEmprestimo}/devolver`,
    { method: "POST" },
    null,
    [],
  );
  return normalizeLoan(response);
}

export async function listarDashboard() {
  const response = await request("/dashboard", {}, () => mockServer.listarDashboard());
  return normalizeDashboard(response);
}

export async function adicionarLivro(dados) {
  const response = await request(
    "/livros",
    {
      method: "POST",
      body: JSON.stringify(toBookPayload(dados)),
    },
    null,
    [],
  );
  return normalizeBook(response);
}

export async function atualizarLivro(idLivro, dados) {
  const response = await request(
    `/livros/${idLivro}`,
    {
      method: "PUT",
      body: JSON.stringify(toBookPayload(dados)),
    },
    null,
    [],
  );
  return normalizeBook(response);
}

export async function listarHistoricoLivro(idLivro) {
  return request(`/livros/${idLivro}/historico`, {}, () => [], [400, 404, 500, 502, 503]);
}

export async function excluirLivro(idLivro) {
  await request(
    `/livros/${idLivro}`,
    {
      method: "DELETE",
    },
    null,
    [],
  );
  return { success: true };
}

export function registrarEmprestimo(dados) {
  return request(
    "/emprestimos/registrar",
    {
      method: "POST",
      body: JSON.stringify({
        clienteId: dados.clienteId ?? dados.idCliente,
        livroId: dados.livroId ?? dados.idLivro,
        funcionarioId: dados.funcionarioId ?? dados.idFuncionario,
        observacao: dados.observacao,
      }),
    },
    null,
    [],
  ).then(normalizeLoan);
}

export function registrarDevolucao(idEmprestimo) {
  const id = typeof idEmprestimo === "object" ? idEmprestimo.emprestimoId : idEmprestimo;
  return devolverLivro(id);
}

export async function listarLivrosMaisEmprestados() {
  const response = await request(
    "/dashboard/livros-mais-emprestados",
    {},
    () => mockServer.listarLivrosMaisEmprestados(),
  );
  return asArray(response, ["livros", "items", "content"]).map(normalizeBook);
}

export async function listarLivrosRecentes() {
  const response = await request(
    "/dashboard/livros-recentes",
    {},
    () => mockServer.listarLivrosRecentes(),
  );
  return asArray(response, ["livros", "items", "content"]).map(normalizeBook);
}

export async function listarGenerosMaisConsumidos() {
  const response = await request(
    "/dashboard/generos-mais-consumidos",
    {},
    () => mockServer.listarGenerosMaisConsumidos(),
  );
  return asArray(response, ["generos", "items", "content"]).map(normalizeChartPoint);
}

export async function listarClientes(search = "") {
  const query = search ? `?busca=${encodeURIComponent(search)}` : "";
  const response = await request(`/clientes${query}`, {}, () => mockServer.listarClientes(search));
  return asArray(response, ["clientes", "usuarios", "items", "content"]).map(normalizeUser);
}

export async function listarEmprestimosAtivos(search = "") {
  const query = search ? `?busca=${encodeURIComponent(search)}` : "";
  const response = await request(
    `/emprestimos/ativos${query}`,
    {},
    () => mockServer.listarEmprestimosAtivos(search),
  );
  return asArray(response, ["emprestimos", "ativos", "items", "content"]).map(normalizeLoan);
}

export async function listarEmprestimosRecentes() {
  const response = await request(
    "/emprestimos/recentes",
    {},
    async () => {
      const dashboard = await listarDashboard();
      return dashboard.recentLoans;
    },
  );
  return asArray(response, ["emprestimos", "recentes", "items", "content"]).map(normalizeLoan);
}

export async function listarEmprestimosAtrasados(search = "") {
  const query = search ? `?busca=${encodeURIComponent(search)}` : "";
  const response = await request(
    `/emprestimos/atrasados${query}`,
    {},
    async () => {
      const loans = await mockServer.listarEmprestimosAtivos(search);
      return loans.map(normalizeLoan).filter((loan) => loan.status === "Atrasado");
    },
  );
  return asArray(response, ["emprestimos", "atrasados", "items", "content"]).map(normalizeLoan);
}

export async function listarLivrosIndisponiveis(search = "") {
  const query = search ? `?busca=${encodeURIComponent(search)}` : "";
  const response = await request(
    `/livros/indisponiveis${query}`,
    {},
    async () => {
      const books = await listarLivros();
      const normalizedSearch = String(search || "").toLowerCase();
      return books.filter((book) => {
        const unavailable = book.status !== "disponivel" || Number(book.availableQuantity) <= 0;
        const matches =
          !normalizedSearch ||
          [book.title, book.author, book.category].some((field) =>
            String(field || "").toLowerCase().includes(normalizedSearch),
          );
        return unavailable && matches;
      });
    },
    [400, 404, 500, 502, 503],
  );
  return asArray(response, ["livros", "indisponiveis", "items", "content"]).map(normalizeBook);
}

export async function listarMultasPendentes() {
  const response = await request(
    "/multas/pendentes",
    {},
    async () => {
      const activeLoans = await mockServer.listarEmprestimosAtivos("");
      return activeLoans
        .map(normalizeLoan)
        .filter((loan) => loan.status === "Atrasado")
        .map((loan) =>
          normalizeFine({
            emprestimo: loan,
            valor: Math.max(2.5, 2.5 * Math.ceil((Date.now() - new Date(loan.dueDate).getTime()) / 86400000)),
            paga: false,
          }),
        );
    },
  );
  return asArray(response, ["multas", "pendentes", "items", "content"]).map(normalizeFine);
}

export async function marcarMultaComoPaga() {
  // Endpoint futuro sugerido: PATCH /api/multas/{id}/pagar
  throw new Error("A API para marcar multa como paga ainda não está disponível.");
}

export async function listarHistoricoLivros() {
  return request("/livros/historico", {}, () => [], [400, 404, 500, 502, 503]);
}
