/**
 * Baixa capas para frontend/public/capas/ e gera SQL de UPDATE.
 * Cascata: Open Library (ISBN) → Google Books → salva localmente.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const seedPath = path.join(root, "banco_de_dados", "seed_biblioteca_completa.sql");
const insertPath = path.join(root, "banco_de_dados", "inserir_dados.sql");
const capasDir = path.join(root, "frontend", "public", "capas");
const sqlPath = path.join(root, "banco_de_dados", "update_capas_locais.sql");
const manifestPath = path.join(capasDir, "manifest.json");

function escapeSql(value) {
  return String(value).replace(/'/g, "''");
}

function slugify(title) {
  return String(title || "livro")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96) || "livro";
}

function parseBooks(sql, fromInsert = false) {
  const books = [];
  for (const line of sql.split("\n")) {
    if (fromInsert) {
      const match = line.match(/\('([^']+)',\s*'([^']+)',\s*'(\d{13})'/);
      if (match) books.push({ titulo: match[1], autor: match[2], isbn: match[3] });
      continue;
    }
    const match = line.match(/^\s*\('([^']+)','([^']+)','([^']+)','(\d{13})'/);
    if (match) books.push({ titulo: match[2], autor: match[3], isbn: match[4] });
  }
  return books;
}

async function imageUrlWorks(url) {
  try {
    const response = await fetch(url, { redirect: "follow" });
    if (!response.ok) return false;
    const type = response.headers.get("content-type") || "";
    if (!type.startsWith("image/")) return false;
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer.length > 400;
  } catch {
    return false;
  }
}

async function downloadImage(url) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) return null;
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 400) return null;
  return buffer;
}

async function fetchGoogleBooksCover(title, author) {
  const q = encodeURIComponent(`intitle:${title} inauthor:${author || ""}`);
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`,
  );
  if (!response.ok) return null;
  const payload = await response.json();
  const links = payload.items?.[0]?.volumeInfo?.imageLinks;
  const raw = links?.thumbnail || links?.smallThumbnail;
  if (!raw) return null;
  return raw.replace("http://", "https://").replace("&edge=curl", "");
}

async function resolveRemoteCover(book) {
  const isbn = String(book.isbn || "").replace(/\D/g, "");
  if (isbn.length >= 10) {
    const openLibrary = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
    if (await imageUrlWorks(openLibrary)) {
      return { source: "openlibrary", url: openLibrary };
    }
  }

  const google = await fetchGoogleBooksCover(book.titulo, book.autor);
  if (google && (await imageUrlWorks(google))) {
    return { source: "google", url: google };
  }

  return null;
}

const books = [
  ...parseBooks(fs.readFileSync(seedPath, "utf8")),
  ...parseBooks(fs.readFileSync(insertPath, "utf8"), true),
];
const unique = new Map();
for (const book of books) unique.set(`${book.titulo}|${book.autor}`, book);

fs.mkdirSync(capasDir, { recursive: true });

const stats = { openlibrary: 0, google: 0, skipped: 0, saved: 0 };
const manifest = [];
const sqlLines = [
  "-- Capas locais em frontend/public/capas (servidas em /capas/).",
  "-- Somente UPDATE em imagem_capa.",
  "",
  "BEGIN;",
  "",
];

for (const book of unique.values()) {
  const filename = `${slugify(book.titulo)}.jpg`;
  const filePath = path.join(capasDir, filename);
  const publicPath = `/capas/${filename}`;

  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 400) {
    stats.saved += 1;
    manifest.push({ ...book, file: filename, source: "existing" });
    sqlLines.push("UPDATE livro");
    sqlLines.push(`SET imagem_capa = '${escapeSql(publicPath)}'`);
    sqlLines.push(`WHERE titulo = '${escapeSql(book.titulo)}'`);
    sqlLines.push(`  AND autor = '${escapeSql(book.autor)}';`);
    sqlLines.push("");
    continue;
  }

  const remote = await resolveRemoteCover(book);
  if (!remote) {
    stats.skipped += 1;
    process.stdout.write(`[skip] ${book.titulo}\n`);
    await new Promise((r) => setTimeout(r, 80));
    continue;
  }

  const buffer = await downloadImage(remote.url);
  if (!buffer) {
    stats.skipped += 1;
    continue;
  }

  fs.writeFileSync(filePath, buffer);
  stats[remote.source] += 1;
  stats.saved += 1;
  manifest.push({ titulo: book.titulo, autor: book.autor, isbn: book.isbn, file: filename, source: remote.source });
  process.stdout.write(`[${remote.source}] ${book.titulo} → ${filename}\n`);

  sqlLines.push("UPDATE livro");
  sqlLines.push(`SET imagem_capa = '${escapeSql(publicPath)}'`);
  sqlLines.push(`WHERE titulo = '${escapeSql(book.titulo)}'`);
  sqlLines.push(`  AND autor = '${escapeSql(book.autor)}';`);
  sqlLines.push("");

  await new Promise((r) => setTimeout(r, 120));
}

sqlLines.push("COMMIT;");
fs.writeFileSync(sqlPath, sqlLines.join("\n"), "utf8");
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

console.log("\nEstatísticas:", stats);
console.log("SQL:", sqlPath);
console.log("Manifest:", manifestPath);
