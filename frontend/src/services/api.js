import { mockServer } from "../mocks/mockServer";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

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
      if (fallback && fallbackOnStatuses.includes(response.status)) {
        return fallback();
      }

      const errorPayload = await parseResponse(response);
      throw Object.assign(
        new Error(errorPayload?.message || "Não foi possível concluir a operação."),
        {
          fromResponse: true,
        },
      );
    }

    return parseResponse(response);
  } catch (error) {
    if (fallback && !error.fromResponse) {
      return fallback();
    }

    throw error;
  }
}

export function login(emailOrPayload, password) {
  const payload =
    typeof emailOrPayload === "object"
      ? emailOrPayload
      : {
          email: emailOrPayload,
          password,
        };

  return request(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    () => mockServer.login(payload),
    [404, 500, 502, 503],
  );
}

export function cadastrarUsuario(payload) {
  return request(
    "/usuarios",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    () => mockServer.cadastrarUsuario(payload),
  );
}

export function listarLivros() {
  return request("/livros", {}, () => mockServer.listarLivros());
}

export function buscarLivros(searchTerm) {
  return request(
    `/livros?busca=${encodeURIComponent(searchTerm || "")}`,
    {},
    () => mockServer.buscarLivros(searchTerm),
  );
}

export function detalharLivro(id) {
  return request(`/livros/${id}`, {}, () => mockServer.detalharLivro(id));
}

export function listarCategorias() {
  return request("/categorias", {}, () => mockServer.listarCategorias());
}

export function solicitarEmprestimo(payload) {
  return request(
    "/emprestimos",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    () => mockServer.solicitarEmprestimo(payload),
  );
}

export function listarMeusEmprestimos(clienteId) {
  return request(
    `/emprestimos/cliente/${clienteId}`,
    {},
    () => mockServer.listarMeusEmprestimos(clienteId),
  );
}

export function devolverLivro(emprestimoId) {
  return request(
    `/emprestimos/${emprestimoId}/devolver`,
    {
      method: "POST",
    },
    () => mockServer.devolverLivro(emprestimoId),
  );
}

export function listarDashboard() {
  return request("/dashboard", {}, () => mockServer.listarDashboard());
}

export function adicionarLivro(payload) {
  return request(
    "/livros",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    () => mockServer.adicionarLivro(payload),
  );
}

export function excluirLivro(id) {
  return request(
    `/livros/${id}`,
    {
      method: "DELETE",
    },
    () => mockServer.excluirLivro(id),
  );
}

export function registrarEmprestimo(payload) {
  return request(
    "/emprestimos",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    () => mockServer.registrarEmprestimo(payload),
  );
}

export function registrarDevolucao(payloadOrId) {
  const payload =
    typeof payloadOrId === "object"
      ? payloadOrId
      : {
          emprestimoId: payloadOrId,
        };

  return request(
    `/emprestimos/${payload.emprestimoId}/devolver`,
    {
      method: "POST",
    },
    () => mockServer.registrarDevolucao(payload),
  );
}

export function listarLivrosMaisEmprestados() {
  return request(
    "/dashboard/livros-mais-emprestados",
    {},
    () => mockServer.listarLivrosMaisEmprestados(),
  );
}

export function listarLivrosRecentes() {
  return request(
    "/dashboard/livros-recentes",
    {},
    () => mockServer.listarLivrosRecentes(),
  );
}

export function listarGenerosMaisConsumidos() {
  return request(
    "/dashboard/generos-mais-consumidos",
    {},
    () => mockServer.listarGenerosMaisConsumidos(),
  );
}

export function listarClientes(search) {
  return mockServer.listarClientes(search);
}

export function listarEmprestimosAtivos(search) {
  return mockServer.listarEmprestimosAtivos(search);
}
