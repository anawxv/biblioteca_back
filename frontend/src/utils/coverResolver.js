const MIN_COVER_DIMENSION = 2;

export function normalizeIsbn(isbn) {
  return String(isbn || "").replace(/\D/g, "");
}

export function slugifyCoverFilename(title) {
  return String(title || "livro")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96) || "livro";
}

export function getBookCacheKey(book = {}) {
  return String(book.id || book.idLivro || slugifyCoverFilename(book.title));
}

export function getSlugCoverPath(book = {}) {
  return `/capas/${slugifyCoverFilename(book.title)}.jpg`;
}

/** URL gravada no banco (imagemCapa / coverImage). Ignora localhost para ngrok. */
export function getStoredCoverUrl(book = {}) {
  const raw = String(book.coverImage || book.imagemCapa || "").trim();
  if (!raw) return null;
  if (raw.includes("localhost") || raw.includes("127.0.0.1")) {
    return null;
  }
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/capas/")) {
    return raw;
  }
  return null;
}

export function getLocalCoverPath(book = {}) {
  const stored = getStoredCoverUrl(book);
  if (stored?.startsWith("/capas/")) {
    return stored;
  }
  return getSlugCoverPath(book);
}

export function getOpenLibraryCoverUrl(book = {}) {
  const isbn = normalizeIsbn(book.isbn);
  if (isbn.length < 10) {
    return null;
  }
  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
}

function normalizeGoogleImageUrl(raw) {
  if (!raw) return null;
  return String(raw).replace("http://", "https://").replace("&edge=curl", "");
}

function pickGoogleImageUrl(links = {}) {
  for (const key of ["extraLarge", "large", "medium", "thumbnail", "smallThumbnail"]) {
    const normalized = normalizeGoogleImageUrl(links[key]);
    if (normalized) return normalized;
  }
  return null;
}

export async function fetchGoogleBooksCover(book = {}) {
  const title = book.title;
  const author = book.author || "";
  const isbn = normalizeIsbn(book.isbn);

  const queries = [];
  if (isbn.length >= 10) queries.push(`isbn:${isbn}`);
  if (title) queries.push(`intitle:${title} inauthor:${author}`);

  for (const query of queries) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1`,
      );
      if (!response.ok) continue;

      const payload = await response.json();
      const imageUrl = pickGoogleImageUrl(payload.items?.[0]?.volumeInfo?.imageLinks);
      if (imageUrl) return imageUrl;
    } catch {
      continue;
    }
  }

  return null;
}

export function isValidCoverDimensions(width, height) {
  return width > MIN_COVER_DIMENSION && height > MIN_COVER_DIMENSION;
}

/** Candidatos sincronos: banco -> Open Library -> capa local. */
export function buildCoverCandidates(book = {}) {
  const candidates = [];
  const stored = getStoredCoverUrl(book);
  if (stored) candidates.push(stored);

  const openLibrary = getOpenLibraryCoverUrl(book);
  if (openLibrary) candidates.push(openLibrary);

  const slug = getSlugCoverPath(book);
  if (!candidates.includes(slug)) {
    candidates.push(slug);
  }

  return candidates;
}

/** @deprecated Mantido por compatibilidade. */
export async function resolveCoverCascade(book = {}) {
  const candidates = buildCoverCandidates(book);
  const googleUrl = await fetchGoogleBooksCover(book);
  if (googleUrl) {
    const slug = getSlugCoverPath(book);
    const slugIndex = candidates.indexOf(slug);
    if (slugIndex >= 0) {
      candidates.splice(slugIndex, 0, googleUrl);
    } else {
      candidates.push(googleUrl);
    }
  }
  return candidates[0] || null;
}
