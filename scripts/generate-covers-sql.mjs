import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const seedPath = path.join(root, "banco_de_dados", "seed_biblioteca_completa.sql");
const insertPath = path.join(root, "banco_de_dados", "inserir_dados.sql");
const outPath = path.join(root, "banco_de_dados", "update_capas_faltantes.sql");

const googleOverrides = {
  "O Cálice dos Deuses|Rick Riordan":
    "https://books.google.com/books/content?id=0n6EzwEACAAJ&printsec=frontcover&img=1&zoom=1",
  "A Empregada|Freida McFadden":
    "https://books.google.com/books/content?id=YpKuzgEACAAJ&printsec=frontcover&img=1&zoom=1",
};

function escapeSql(v) {
  return String(v).replace(/'/g, "''");
}

function parseBooks(sql, fromInsert = false) {
  const books = [];
  for (const line of sql.split("\n")) {
    if (fromInsert) {
      const m = line.match(
        /\('([^']+)',\s*'([^']+)',\s*'(\d{13})'/,
      );
      if (m) books.push({ titulo: m[1], autor: m[2], isbn: m[3] });
      continue;
    }
    const m = line.match(/^\s*\('([^']+)','([^']+)','([^']+)','(\d{13})'/);
    if (m) books.push({ titulo: m[2], autor: m[3], isbn: m[4] });
  }
  return books;
}

const books = [
  ...parseBooks(fs.readFileSync(seedPath, "utf8")),
  ...parseBooks(fs.readFileSync(insertPath, "utf8"), true),
];
const unique = new Map();
for (const b of books) unique.set(`${b.titulo}|${b.autor}`, b);

const lines = [
  "-- Atualização de capas faltantes (somente imagem_capa).",
  "-- Estratégia: Open Library por ISBN; overrides Google Books quando indicado.",
  "-- Não altera estrutura, livros, categorias, empréstimos ou usuários.",
  "",
  "BEGIN;",
  "",
];

for (const book of unique.values()) {
  const key = `${book.titulo}|${book.autor}`;
  const url =
    googleOverrides[key] ||
    `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`;
  lines.push("UPDATE livro");
  lines.push(`SET imagem_capa = '${escapeSql(url)}'`);
  lines.push(`WHERE titulo = '${escapeSql(book.titulo)}'`);
  lines.push(`  AND autor = '${escapeSql(book.autor)}'`);
  lines.push(
    "  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://' OR imagem_capa ~* '\\.(jpg|jpeg|png|gif|webp)$');",
  );
  lines.push("");
}

lines.push("COMMIT;");
fs.writeFileSync(outPath, lines.join("\n"), "utf8");
console.log(`Gerados ${unique.size} UPDATEs em ${outPath}`);
