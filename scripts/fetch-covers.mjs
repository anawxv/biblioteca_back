/**
 * Gera UPDATEs para imagem_capa: Open Library (ISBN) → Google Books → skip (fallback no front).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const seedPath = path.join(root, "banco_de_dados", "seed_biblioteca_completa.sql");
const insertPath = path.join(root, "banco_de_dados", "inserir_dados.sql");
const outPath = path.join(root, "banco_de_dados", "update_capas_faltantes.sql");

function escapeSql(value) {
  return String(value).replace(/'/g, "''");
}

function parseSeedBooks(sql) {
  const books = [];
  const rowRe =
    /\('([^']*(?:''[^']*)*)','([^']*(?:''[^']*)*)','([^']*(?:''[^']*)*)'/g;
  let inValues = false;
  for (const line of sql.split("\n")) {
    if (line.includes("WITH livros_seed")) inValues = true;
    if (!inValues || !line.trim().startsWith("(")) continue;
    const m = line.match(
      /^\s*\('([^']+)','([^']+)','([^']+)','(\d{13})'/,
    );
    if (m) books.push({ titulo: m[2], autor: m[3], isbn: m[4] });
  }
  return books;
}

function parseInsertBooks(sql) {
  const books = [];
  const re =
    /\('([^']+)',\s*'([^']+)',\s*'(\d{13})',[^,]+,[^,]+,[^,]+,\s*\d+,\s*\d+,\s*\d+,\s*'[^']*'\)/g;
  let m;
  while ((m = re.exec(sql))) {
    books.push({ titulo: m[1], autor: m[2], isbn: m[3] });
  }
  return books;
}

function uniqueBooks(list) {
  const map = new Map();
  for (const b of list) {
    const key = `${b.titulo}|||${b.autor}`;
    if (!map.has(key)) map.set(key, b);
  }
  return [...map.values()];
}

async function openLibraryWorks(isbn) {
  const url = `https://openlibrary.org/isbn/${isbn}.json`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) return null;
  const data = await res.json();
  const covers = data.covers;
  if (covers?.length) {
    return `https://covers.openlibrary.org/b/id/${covers[0]}-L.jpg`;
  }
  return null;
}

async function openLibraryCover(isbn) {
  const head = await fetch(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`, {
    method: "HEAD",
  });
  if (head.ok) return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
  return openLibraryWorks(isbn);
}

async function googleBooksCover(titulo, autor) {
  const q = encodeURIComponent(`intitle:${titulo} inauthor:${autor}`);
  const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const links = data.items?.[0]?.volumeInfo?.imageLinks;
  if (!links) return null;
  const raw = links.thumbnail || links.smallThumbnail;
  if (!raw) return null;
  return raw.replace("http://", "https://");
}

async function resolveCover(book) {
  try {
    const ol = await openLibraryCover(book.isbn);
    if (ol) return { source: "openlibrary", url: ol };
  } catch {
    /* try google */
  }
  await new Promise((r) => setTimeout(r, 120));
  try {
    const gb = await googleBooksCover(book.titulo, book.autor);
    if (gb) return { source: "google", url: gb };
  } catch {
    /* fallback no app */
  }
  return { source: "fallback", url: null };
}

const seedSql = fs.readFileSync(seedPath, "utf8");
const insertSql = fs.readFileSync(insertPath, "utf8");
const books = uniqueBooks([...parseSeedBooks(seedSql), ...parseInsertBooks(insertSql)]);

const stats = { openlibrary: 0, google: 0, fallback: 0 };
const lines = [
  "-- Atualização de capas faltantes (somente imagem_capa).",
  "-- Open Library (ISBN/id) → Google Books → fallback rosa no front-end.",
  "",
  "BEGIN;",
  "",
];

for (const book of books) {
  const result = await resolveCover(book);
  stats[result.source]++;
  if (!result.url) continue;
  lines.push("UPDATE livro");
  lines.push(`SET imagem_capa = '${escapeSql(result.url)}'`);
  lines.push(`WHERE titulo = '${escapeSql(book.titulo)}'`);
  lines.push(`  AND autor = '${escapeSql(book.autor)}'`);
  lines.push(
    "  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');",
  );
  lines.push("");
  process.stdout.write(`[${result.source}] ${book.titulo}\n`);
  await new Promise((r) => setTimeout(r, 80));
}

lines.push("COMMIT;");
lines.push("");
fs.writeFileSync(outPath, lines.join("\n"), "utf8");
console.log("\nStats:", stats);
console.log("Written:", outPath);
