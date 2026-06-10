const KNOWN_EMPLOYEE_NAMES = {
  1: "Administrador Biblioteca",
  f1: "Bibliotecária Ana",
};

export function getEmployeeLabel(id) {
  if (id === null || id === undefined || id === "unknown") {
    return "Não informado";
  }
  return KNOWN_EMPLOYEE_NAMES[id] || KNOWN_EMPLOYEE_NAMES[String(id)] || `Funcionário #${id}`;
}

export function mergeLoansUnique(...lists) {
  const map = new Map();
  for (const list of lists) {
    for (const loan of list || []) {
      if (!loan?.id) continue;
      map.set(loan.id, loan);
    }
  }
  return [...map.values()];
}

export function buildEmployeeStats(loans = [], totalEmployees = 0) {
  const byId = new Map();

  for (const loan of loans) {
    const id = loan.funcionarioId ?? "unknown";
    if (!byId.has(id)) {
      byId.set(id, {
        id,
        name: getEmployeeLabel(id),
        loansRegistered: 0,
        returnsRegistered: 0,
      });
    }

    const entry = byId.get(id);
    entry.loansRegistered += 1;
    if (loan.returnedAt) {
      entry.returnsRegistered += 1;
    }
  }

  const employees = [...byId.values()].sort((a, b) => b.loansRegistered - a.loansRegistered);

  return {
    totalActive: Number(totalEmployees) || employees.length,
    employees,
    withoutMovements: Math.max(0, (Number(totalEmployees) || employees.length) - employees.length),
  };
}
