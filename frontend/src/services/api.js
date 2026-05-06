import { mockServer } from "../mocks/mockServer";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

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
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
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
    category: book.category ?? book.categoria ?? "",
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
    loanCount: Number(book.loanCount ?? book.totalEmprestimos ?? 0),
    status,
    coverColors: book.coverColors || ["#FF66B3", "#FF4DA6"],
  };
}

function normalizeLoan(loan = {}) {
  return {
    id: loan.id ?? loan.idEmprestimo,
    client: normalizeUser(loan.client ?? loan.cliente ?? {}),
    book: normalizeBook(loan.book ?? loan.livro ?? {}),
    funcionarioId: loan.funcionarioId ?? loan.idFuncionario ?? null,
    borrowedAt: loan.borrowedAt ?? loan.dataEmprestimo,
    dueDate: loan.dueDate ?? loan.dataPrevistaDevolucao,
    returnedAt: loan.returnedAt ?? loan.dataDevolucao ?? null,
    status: loan.status || "Dentro do prazo",
    observacao: loan.observacao ?? "",
    fineApplied: loan.fineApplied ?? false,
    fineAmount: loan.fineAmount ?? 0,
    message: loan.message,
  };
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

function normalizeDashboard(payload = {}) {
  const metrics = payload.metrics || payload;
  return {
    metrics: {
      totalBooks: Number(metrics.totalBooks ?? metrics.livrosNoAcervo ?? 0),
      totalClients: Number(metrics.totalClients ?? metrics.clientesCadastrados ?? 0),
      activeLoans: Number(metrics.activeLoans ?? metrics.emprestimosAtivos ?? 0),
      overdueLoans: Number(metrics.overdueLoans ?? metrics.emprestimosAtrasados ?? 0),
      pendingFines: Number(metrics.pendingFines ?? metrics.multasPendentes ?? 0),
      unavailableBooks: Number(metrics.unavailableBooks ?? metrics.livrosIndisponiveis ?? 0),
    },
    recentLoans: (payload.recentLoans || payload.emprestimosRecentes || []).map(normalizeLoan),
    loansByMonth: (payload.loansByMonth || payload.emprestimosPorMes || []).map(normalizeChartPoint),
    returnsStats: {
      onTime: Number(payload.returnsStats?.onTime ?? payload.devolucoesNoPrazo ?? 0),
      late: Number(payload.returnsStats?.late ?? payload.devolucoesAtrasadas ?? 0),
    },
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

export async function cadastrarUsuario(dados) {
  const role = String(dados.tipoUsuario ?? dados.role ?? "").toUpperCase();
  const payload = {
    nome: dados.name ?? dados.nome,
    email: dados.email,
    senha: dados.password ?? dados.senha,
    telefone: dados.phone ?? dados.telefone,
    tipoUsuario: role,
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
  return (response || []).map(normalizeBook);
}

export async function buscarLivros(busca) {
  const response = await request(
    `/livros?busca=${encodeURIComponent(busca || "")}`,
    {},
    () => mockServer.buscarLivros(busca),
  );
  return (response || []).map(normalizeBook);
}

export async function detalharLivro(id) {
  const response = await request(`/livros/${id}`, {}, () => mockServer.detalharLivro(id));
  return normalizeBook(response);
}

export async function listarCategorias() {
  const response = await request("/categorias", {}, () => mockServer.listarCategorias());
  return (response || CATEGORY_NAMES).map(normalizeCategory);
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
    () => mockServer.solicitarEmprestimo(dados),
  );
  return normalizeLoan(response);
}

export async function listarMeusEmprestimos(idCliente) {
  const response = await request(
    `/emprestimos/cliente/${idCliente}`,
    {},
    () => mockServer.listarMeusEmprestimos(idCliente),
  );

  return {
    ativos: (response?.ativos || []).map(normalizeLoan),
    historico: (response?.historico || []).map(normalizeLoan),
  };
}

export async function devolverLivro(idEmprestimo) {
  const response = await request(
    `/emprestimos/${idEmprestimo}/devolver`,
    { method: "POST" },
    () => mockServer.devolverLivro(idEmprestimo),
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
    () => mockServer.adicionarLivro(dados),
  );
  return normalizeBook(response);
}

export async function excluirLivro(idLivro) {
  return request(
    `/livros/${idLivro}`,
    {
      method: "DELETE",
    },
    () => mockServer.excluirLivro(idLivro),
    [],
  );
}

export function registrarEmprestimo(dados) {
  return solicitarEmprestimo(dados);
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
  return (response || []).map(normalizeBook);
}

export async function listarLivrosRecentes() {
  const response = await request(
    "/dashboard/livros-recentes",
    {},
    () => mockServer.listarLivrosRecentes(),
  );
  return (response || []).map(normalizeBook);
}

export async function listarGenerosMaisConsumidos() {
  const response = await request(
    "/dashboard/generos-mais-consumidos",
    {},
    () => mockServer.listarGenerosMaisConsumidos(),
  );
  return (response || []).map(normalizeChartPoint);
}

export async function listarClientes(search = "") {
  // Endpoint futuro sugerido: GET /api/usuarios?tipo=CLIENTE&busca=
  return mockServer.listarClientes(search);
}

export async function listarEmprestimosAtivos(search = "") {
  // Endpoint futuro sugerido: GET /api/emprestimos?status=ATIVO&busca=
  return mockServer.listarEmprestimosAtivos(search);
}

export async function listarEmprestimosRecentes() {
  const dashboard = await listarDashboard();
  return dashboard.recentLoans;
}

export async function listarEmprestimosAtrasados(search = "") {
  // Endpoint futuro sugerido: GET /api/emprestimos/atrasados?busca=
  const loans = await mockServer.listarEmprestimosAtivos(search);
  return loans.map(normalizeLoan).filter((loan) => loan.status === "Atrasado");
}

export async function listarLivrosIndisponiveis(search = "") {
  // Endpoint futuro sugerido: GET /api/livros?disponibilidade=indisponivel&busca=
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
}

export async function listarMultasPendentes() {
  // Endpoint futuro sugerido: GET /api/multas?status=PENDENTE
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
}

export async function marcarMultaComoPaga() {
  // Endpoint futuro sugerido: PATCH /api/multas/{id}/pagar
  throw new Error("A API para marcar multa como paga ainda não está disponível.");
}

export async function listarHistoricoLivros() {
  // Endpoint futuro sugerido: GET /api/livros/historico
  return [];
}
