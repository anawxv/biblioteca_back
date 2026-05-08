export function normalizeSearchText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function levenshtein(a, b) {
  const left = normalizeSearchText(a).replace(/\s/g, "");
  const right = normalizeSearchText(b).replace(/\s/g, "");

  if (!left || !right) return Math.max(left.length, right.length);

  const matrix = Array.from({ length: left.length + 1 }, (_, index) => [index]);
  for (let column = 1; column <= right.length; column += 1) {
    matrix[0][column] = column;
  }

  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + cost,
      );
    }
  }

  return matrix[left.length][right.length];
}

export function getBookGenres(book = {}) {
  const extras = book.extraGenres || book.generosExtras || book.subgenres || book.subgeneros || [];
  const normalizedExtras = Array.isArray(extras) ? extras.filter(Boolean) : [];
  return [book.category, ...normalizedExtras].filter(Boolean);
}

export function bookMatchesSmartSearch(book, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const fields = [
    book.title,
    book.author,
    book.category,
    ...(book.extraGenres || []),
    ...(book.subgenres || []),
  ].filter(Boolean);

  const normalizedFields = fields.map(normalizeSearchText);
  if (normalizedFields.some((field) => field.includes(normalizedQuery) || normalizedQuery.includes(field))) {
    return true;
  }

  const queryWords = normalizedQuery.split(" ").filter((word) => word.length > 1);
  return normalizedFields.some((field) => {
    const fieldWords = field.split(" ").filter((word) => word.length > 1);
    const compactDistance = levenshtein(normalizedQuery, field);
    const compactLimit = normalizedQuery.length <= 8 ? 2 : Math.ceil(normalizedQuery.length * 0.28);

    if (compactDistance <= compactLimit) return true;

    return queryWords.every((queryWord) =>
      fieldWords.some((fieldWord) => {
        if (fieldWord.includes(queryWord) || queryWord.includes(fieldWord)) return true;
        const limit = queryWord.length <= 5 ? 1 : 2;
        return levenshtein(queryWord, fieldWord) <= limit;
      }),
    );
  });
}
