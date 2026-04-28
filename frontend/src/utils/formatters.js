export function formatDate(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function maskPassword(value) {
  if (!value) {
    return "********";
  }

  return "•".repeat(Math.max(8, value.length));
}

export function getInitials(name = "") {
  const parts = name.trim().split(" ").filter(Boolean);

  if (!parts.length) {
    return "BL";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export function getLoanStatus(dueDate, returnedAt) {
  const today = new Date();
  const due = new Date(dueDate);
  const baseDate = returnedAt ? new Date(returnedAt) : today;
  const diffTime = due.getTime() - baseDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return "Atrasado";
  }

  if (diffDays <= 2) {
    return "Devolução breve";
  }

  return "Dentro do prazo";
}

export function currency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function slugify(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
