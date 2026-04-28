import { books, categories, loans, users } from "./mockData";
import { getLoanStatus } from "../utils/formatters";

const db = {
  books: structuredClone(books).map((book) => ({
    active: true,
    quantity: 1,
    availableQuantity: 1,
    publisher: "",
    coverImage: "",
    ...book,
  })),
  categories: [...categories],
  loans: structuredClone(loans),
  users: structuredClone(users),
};

const NETWORK_DELAY = 220;

function delay(payload, shouldReject = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldReject) {
        reject(payload);
        return;
      }

      resolve(payload);
    }, NETWORK_DELAY);
  });
}

function sanitizeUser(user) {
  const { password, ...rest } = user;
  return rest;
}

function enrichLoan(loan) {
  const client = db.users.find((user) => user.id === loan.clientId);
  const book = db.books.find((item) => item.id === loan.bookId);
  const status = getLoanStatus(loan.dueDate, loan.returnedAt);

  return {
    ...loan,
    client: sanitizeUser(client),
    book,
    status,
  };
}

function getActiveLoans() {
  return db.loans.filter((loan) => !loan.returnedAt);
}

function recomputeBookAvailability() {
  const activeCounts = getActiveLoans().reduce((accumulator, loan) => {
    accumulator[loan.bookId] = (accumulator[loan.bookId] || 0) + 1;
    return accumulator;
  }, {});

  db.books = db.books.map((book) => ({
    ...book,
    availableQuantity: Math.max(0, Number(book.quantity || 1) - Number(activeCounts[book.id] || 0)),
    status:
      book.active === false || Math.max(0, Number(book.quantity || 1) - Number(activeCounts[book.id] || 0)) === 0
        ? "indisponivel"
        : "disponivel",
  }));
}

function monthLabel(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
  })
    .format(new Date(date))
    .replace(".", "");
}

function buildDashboard() {
  const activeLoans = getActiveLoans();
  const overdueLoans = activeLoans.filter((loan) => getLoanStatus(loan.dueDate) === "Atrasado");
  const pendingFine = db.users.reduce((sum, user) => sum + (user.pendingFine || 0), 0);

  const recentLoans = [...db.loans]
    .sort((a, b) => new Date(b.borrowedAt) - new Date(a.borrowedAt))
    .slice(0, 4)
    .map(enrichLoan);

  const loanBuckets = [...db.loans]
    .sort((a, b) => new Date(a.borrowedAt) - new Date(b.borrowedAt))
    .reduce((accumulator, loan) => {
      const label = monthLabel(loan.borrowedAt);
      accumulator[label] = (accumulator[label] || 0) + 1;
      return accumulator;
    }, {});

  const returnsStats = db.loans.reduce(
    (accumulator, loan) => {
      if (!loan.returnedAt) {
        return accumulator;
      }

      if (new Date(loan.returnedAt) <= new Date(loan.dueDate)) {
        accumulator.onTime += 1;
      } else {
        accumulator.late += 1;
      }

      return accumulator;
    },
    { onTime: 0, late: 0 },
  );

  return {
    metrics: {
      totalBooks: db.books.filter((book) => book.active !== false).length,
      totalClients: db.users.filter((user) => user.role === "cliente").length,
      activeLoans: activeLoans.length,
      overdueLoans: overdueLoans.length,
      pendingFines: pendingFine,
    },
    recentLoans,
    loansByMonth: Object.entries(loanBuckets).map(([label, value]) => ({ label, value })),
    returnsStats,
  };
}

function ensureBook(bookId) {
  const book = db.books.find((item) => item.id === String(bookId));

  if (!book) {
    throw new Error("Livro não encontrado.");
  }

  if (book.active === false) {
    throw new Error("Livro inativo no acervo.");
  }

  return book;
}

function ensureClient(clientId) {
  const client = db.users.find(
    (user) => user.id === String(clientId) && user.role === "cliente",
  );

  if (!client) {
    throw new Error("Cliente não encontrado.");
  }

  return client;
}

function createLoan(clientId, bookId) {
  const client = ensureClient(clientId);
  const book = ensureBook(bookId);

  if (client.pendingFine > 0) {
    throw new Error("Usuário com pendência. Regularize antes de registrar o empréstimo.");
  }

  if (book.status !== "disponivel" || Number(book.availableQuantity || 0) <= 0) {
    throw new Error("Livro indisponível para empréstimo.");
  }

  const borrowedAt = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);

  const newLoan = {
    id: `e${Date.now()}`,
    clientId: client.id,
    bookId: book.id,
    borrowedAt: borrowedAt.toISOString(),
    dueDate: dueDate.toISOString(),
    returnedAt: null,
  };

  db.loans.unshift(newLoan);
  db.books = db.books.map((item) =>
    item.id === book.id
      ? {
          ...item,
          loanCount: item.loanCount + 1,
          availableQuantity: Math.max(0, Number(item.availableQuantity || item.quantity || 1) - 1),
          status:
            Math.max(0, Number(item.availableQuantity || item.quantity || 1) - 1) > 0
              ? "disponivel"
              : "indisponivel",
        }
      : item,
  );

  return enrichLoan(newLoan);
}

recomputeBookAvailability();

export const mockServer = {
  async login(payload) {
    const user = db.users.find((item) => item.email === payload.email);

    if (!user || user.password !== payload.password) {
      return delay(new Error("E-mail ou senha incorretos."), true);
    }

    return delay({
      token: `mock-token-${user.id}`,
      user: sanitizeUser(user),
    });
  },

  async cadastrarUsuario(payload) {
    const alreadyExists = db.users.some((user) => user.email === payload.email);

    if (alreadyExists) {
      return delay(new Error("Já existe um usuário cadastrado com este e-mail."), true);
    }

    const newUser = {
      id: `c${Date.now()}`,
      name: payload.name,
      email: payload.email,
      password: payload.password,
      phone: payload.phone,
      role: payload.role,
      pendingFine: 0,
    };

    db.users.push(newUser);

    return delay({
      message: "Cadastro realizado com sucesso.",
      user: sanitizeUser(newUser),
    });
  },

  async listarLivros() {
    return delay([...db.books].filter((book) => book.active !== false));
  },

  async buscarLivros(searchTerm = "") {
    const normalized = searchTerm.trim().toLowerCase();

    return delay(
      db.books.filter((book) =>
        book.active !== false &&
        [book.title, book.author, book.category].some((field) =>
          field.toLowerCase().includes(normalized),
        ),
      ),
    );
  },

  async detalharLivro(id) {
    const book = db.books.find((item) => item.id === String(id) && item.active !== false);

    if (!book) {
      return delay(new Error("Livro não encontrado."), true);
    }

    return delay(book);
  },

  async listarCategorias() {
    return delay([...db.categories]);
  },

  async solicitarEmprestimo(payload) {
    try {
      const loan = createLoan(payload.clienteId, payload.livroId);
      return delay(loan);
    } catch (error) {
      return delay(error, true);
    }
  },

  async listarMeusEmprestimos(clientId) {
    const myLoans = db.loans
      .filter((loan) => loan.clientId === String(clientId))
      .map(enrichLoan)
      .sort((a, b) => new Date(b.borrowedAt) - new Date(a.borrowedAt));

    return delay({
      ativos: myLoans.filter((loan) => !loan.returnedAt),
      historico: myLoans.filter((loan) => loan.returnedAt),
    });
  },

  async devolverLivro(loanId) {
    const loanIndex = db.loans.findIndex((loan) => loan.id === String(loanId));

    if (loanIndex < 0) {
      return delay(new Error("Empréstimo não encontrado."), true);
    }

    const loan = db.loans[loanIndex];

    if (loan.returnedAt) {
      return delay(new Error("Este empréstimo já foi finalizado."), true);
    }

    const returnedAt = new Date().toISOString();
    const isLate = new Date(returnedAt) > new Date(loan.dueDate);
    const updatedLoan = {
      ...loan,
      returnedAt,
    };

    db.loans[loanIndex] = updatedLoan;

    if (isLate) {
      const lateDays = Math.max(
        1,
        Math.ceil((new Date(returnedAt) - new Date(loan.dueDate)) / (1000 * 60 * 60 * 24)),
      );
      const fine = lateDays * 2.5;

      db.users = db.users.map((user) =>
        user.id === loan.clientId
          ? {
              ...user,
              pendingFine: Number((user.pendingFine + fine).toFixed(2)),
            }
          : user,
      );
    }

    recomputeBookAvailability();

    return delay({
      ...enrichLoan(updatedLoan),
      fineApplied: isLate,
      fineAmount: isLate
        ? Number(
            Math.max(
              1,
              Math.ceil((new Date(returnedAt) - new Date(loan.dueDate)) / (1000 * 60 * 60 * 24)),
            ) * 2.5,
          ).toFixed(2)
        : "0.00",
    });
  },

  async listarDashboard() {
    return delay(buildDashboard());
  },

  async adicionarLivro(payload) {
    const requiredFields = ["title", "author", "category", "isbn", "pages", "description"];
    const missingField = requiredFields.find((field) => !payload[field]);

    if (missingField) {
      return delay(new Error("Preencha todos os campos obrigatórios do livro."), true);
    }

    const book = {
      id: `${Date.now()}`,
      title: payload.title,
      author: payload.author,
      category: payload.category,
      isbn: payload.isbn,
      pages: Number(payload.pages),
      description: payload.description,
      publishedYear: payload.publishedYear || "",
      publisher: payload.publisher || "",
      shelf: payload.shelf || "",
      quantity: Number(payload.quantity || 1),
      availableQuantity: Number(payload.quantity || 1),
      coverImage: payload.coverImage || "",
      status: payload.status || "disponivel",
      active: true,
      createdAt: new Date().toISOString(),
      loanCount: 0,
      coverColors: payload.coverColors || ["#FF66B3", "#FF4DA6"],
    };

    db.books.unshift(book);

    return delay(book);
  },

  async excluirLivro(bookId) {
    const hasActiveLoan = db.loans.some(
      (loan) => loan.bookId === String(bookId) && !loan.returnedAt,
    );

    if (hasActiveLoan) {
      return delay(
        new Error("Não é possível excluir um livro com empréstimo ativo."),
        true,
      );
    }

    const target = db.books.find((book) => book.id === String(bookId));

    if (!target) {
      return delay(new Error("Livro não encontrado."), true);
    }

    db.books = db.books.map((book) =>
      book.id === String(bookId)
        ? {
            ...book,
            active: false,
            status: "indisponivel",
            availableQuantity: 0,
          }
        : book,
    );

    return delay({
      success: true,
      id: String(bookId),
    });
  },

  async registrarEmprestimo(payload) {
    try {
      const loan = createLoan(payload.clienteId, payload.livroId);
      return delay(loan);
    } catch (error) {
      return delay(error, true);
    }
  },

  async registrarDevolucao(payload) {
    return this.devolverLivro(payload.emprestimoId);
  },

  async listarLivrosMaisEmprestados() {
    return delay(
      [...db.books]
        .filter((book) => book.active !== false)
        .sort((a, b) => b.loanCount - a.loanCount)
        .slice(0, 6),
    );
  },

  async listarLivrosRecentes() {
    return delay(
      [...db.books]
        .filter((book) => book.active !== false)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6),
    );
  },

  async listarGenerosMaisConsumidos() {
    const byGenre = db.loans.reduce((accumulator, loan) => {
      const book = db.books.find((item) => item.id === loan.bookId);
      if (!book) {
        return accumulator;
      }

      accumulator[book.category] = (accumulator[book.category] || 0) + 1;
      return accumulator;
    }, {});

    return delay(
      Object.entries(byGenre)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6),
    );
  },

  async listarClientes(search = "") {
    const normalized = search.trim().toLowerCase();

    return delay(
      db.users
        .filter((user) => user.role === "cliente")
        .filter((user) =>
          [user.name, user.email, user.phone].some((field) =>
            field.toLowerCase().includes(normalized),
          ),
        )
        .map(sanitizeUser),
    );
  },

  async listarEmprestimosAtivos(search = "") {
    const normalized = search.trim().toLowerCase();

    return delay(
      getActiveLoans()
        .map(enrichLoan)
        .filter((loan) =>
          [loan.client.name, loan.client.email, loan.book.title, loan.book.author].some((field) =>
            field.toLowerCase().includes(normalized),
          ),
        ),
    );
  },
};
