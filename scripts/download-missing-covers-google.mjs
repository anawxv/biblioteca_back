/**
 * Baixa capas faltantes em lotes pequenos (máx. 5 por execução).
 * Google Books (flexível) → Open Library.
 * Não apaga capas existentes. Não altera o banco.
 *
 * Uso: node scripts/download-missing-covers-google.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const MAX_BOOKS_PER_RUN = 5;
const DELAY_MIN_MS = 3000;
const DELAY_MAX_MS = 5000;
const RATE_LIMIT_WAIT_MS = 30000;
const RATE_LIMIT_MAX_RETRIES = 2;

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const seedPath = path.join(root, "banco_de_dados", "seed_biblioteca_completa.sql");
const insertPath = path.join(root, "banco_de_dados", "inserir_dados.sql");
const capasDir = path.join(root, "frontend", "public", "capas");
const reportPath = path.join(root, "RELATORIO_CAPAS_FALTANTES.md");

const ENGLISH_TITLES = {
  "Vermelho, Branco e Sangue Azul": "Red White and Royal Blue",
  "A Culpa é das Estrelas": "The Fault in Our Stars",
  "Um Dia": "One Day",
  "Teto Para Dois": "The Flatshare",
  "O Morro dos Ventos Uivantes": "Wuthering Heights",
  "O Cálice dos Deuses": "The Sun and the Star",
  "O Nome do Vento": "The Name of the Wind",
  "Percy Jackson e o Ladrão de Raios": "The Lightning Thief",
  "O Chamado da Selva": "The Call of the Wild",
  "O Silêncio dos Inocentes": "The Silence of the Lambs",
  "Assassinato no Expresso do Oriente": "Murder on the Orient Express",
  "O Nome da Rosa": "The Name of the Rose",
  "A Mulher na Janela": "The Woman in the Window",
  "O Chamado do Cuco": "The Cuckoo's Calling",
  "Morte no Nilo": "Death on the Nile",
  "O Exorcista": "The Exorcist",
  "A Assombração da Casa da Colina": "The Haunting of Hill House",
  "Longa Caminhada até a Liberdade": "Long Walk to Freedom",
  "A Segunda Guerra Mundial": "The Second World War",
  "Uma Breve História do Mundo": "A Short History of the World",
  "O Mito de Sísifo": "The Myth of Sisyphus",
  "Talvez Você Deva Conversar com Alguém": "Maybe You Should Talk to Someone",
  "A Coragem de Ser Imperfeito": "Daring Greatly",
  "Como Fazer Amigos e Influenciar Pessoas": "How to Win Friends and Influence People",
  "O Poder do Agora": "The Power of Now",
  "Aprendendo SQL": "Learning SQL",
  "Sistema de Banco de Dados": "Database System Concepts",
  "Algoritmos": "Introduction to Algorithms",
  "Lógica de Programação e Algoritmos com JavaScript": "Programming Logic JavaScript",
  "Antologia Poética": "Vinicius de Moraes poetry",
  "Poemas Completos de Alberto Caeiro": "Alberto Caeiro poems",
  "Melhores Poemas de Cecília Meireles": "Cecilia Meireles poems",
  "A Lista de Schindler": "Schindler's List",
  "As Vantagens de Ser Invisível": "The Perks of Being a Wallflower",
  "O Auto da Compadecida": "Auto da Compadecida",
};

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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay() {
  const ms = DELAY_MIN_MS + Math.floor(Math.random() * (DELAY_MAX_MS - DELAY_MIN_MS + 1));
  return sleep(ms);
}

function fileIsValid(filePath) {
  return fs.existsSync(filePath) && fs.statSync(filePath).size > 400;
}

function buildSearchQueries(book) {
  const isbn = String(book.isbn || "").replace(/\D/g, "");
  const titles = [book.titulo, ENGLISH_TITLES[book.titulo]].filter(Boolean);
  const author = book.autor || "";
  const firstAuthor = author.split(/\s+(?:e|and|,)\s+|,/i)[0]?.trim() || author;

  const queries = [];
  if (isbn.length >= 10) queries.push({ q: `isbn:${isbn}`, label: "google-isbn" });

  for (const title of titles) {
    queries.push({ q: `intitle:${title} inauthor:${author}`, label: "google-title-author" });
    if (firstAuthor) {
      queries.push({ q: `intitle:${title} inauthor:${firstAuthor}`, label: "google-title-first-author" });
    }
    queries.push({ q: `intitle:${title}`, label: "google-title-only" });
  }

  const seen = new Set();
  return queries.filter((item) => {
    if (seen.has(item.q)) return false;
    seen.add(item.q);
    return true;
  });
}

function imageUrlsFromVolume(item) {
  const links = item.volumeInfo?.imageLinks || {};
  const urls = [];
  for (const key of ["extraLarge", "large", "medium", "thumbnail", "smallThumbnail"]) {
    if (links[key]) {
      urls.push(
        String(links[key])
          .replace("http://", "https://")
          .replace("&edge=curl", "")
          .replace("zoom=1", "zoom=0"),
      );
    }
  }
  if (item.id) {
    urls.push(
      `https://books.google.com/books/content?id=${item.id}&printsec=frontcover&img=1&zoom=0&source=gbs_api`,
    );
  }
  return [...new Set(urls)];
}

async function downloadImage(url) {
  try {
    const response = await fetch(url, { redirect: "follow" });
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length < 400) return null;
    const type = response.headers.get("content-type") || "";
    if (type && !type.startsWith("image/")) return null;
    return buffer;
  } catch {
    return null;
  }
}

async function googleBooksSearch(query) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`;

  for (let attempt = 0; attempt <= RATE_LIMIT_MAX_RETRIES; attempt += 1) {
    const response = await fetch(url);

    if (response.status === 429) {
      if (attempt < RATE_LIMIT_MAX_RETRIES) {
        console.log(`  [429] Aguardando ${RATE_LIMIT_WAIT_MS / 1000}s antes de tentar novamente...`);
        await sleep(RATE_LIMIT_WAIT_MS);
        continue;
      }
      return { items: [], error: "HTTP 429 — rate limit Google Books (esgotadas as tentativas)" };
    }

    if (!response.ok) {
      return { items: [], error: `HTTP ${response.status}` };
    }

    const payload = await response.json();
    return { items: payload.items || [], error: null };
  }

  return { items: [], error: "HTTP 429 — rate limit Google Books" };
}

async function tryGoogleQueries(book) {
  const queries = buildSearchQueries(book);

  for (const { q, label } of queries) {
    await randomDelay();
    const { items, error } = await googleBooksSearch(q);

    if (error?.includes("429")) {
      return { error };
    }

    for (const item of items) {
      for (const imageUrl of imageUrlsFromVolume(item)) {
        await randomDelay();
        const buffer = await downloadImage(imageUrl);
        if (buffer) {
          return { source: label, url: imageUrl, buffer, matchedTitle: item.volumeInfo?.title || "" };
        }
      }
    }
  }

  return null;
}

async function tryOpenLibrary(book) {
  const isbn = String(book.isbn || "").replace(/\D/g, "");
  if (isbn.length >= 10) {
    await randomDelay();
    for (const suffix of ["-L.jpg?default=false", "-L.jpg"]) {
      const url = `https://covers.openlibrary.org/b/isbn/${isbn}${suffix}`;
      const buffer = await downloadImage(url);
      if (buffer) return { source: "openlibrary-isbn", url, buffer };
    }
  }

  const titles = [book.titulo, ENGLISH_TITLES[book.titulo]].filter(Boolean);
  for (const title of titles) {
    await randomDelay();
    const params = new URLSearchParams({ limit: "5", fields: "cover_i,title" });
    params.set("title", title);
    if (book.autor) params.set("author", book.autor);

    const response = await fetch(`https://openlibrary.org/search.json?${params.toString()}`);
    if (!response.ok) continue;

    const payload = await response.json();
    for (const doc of payload.docs || []) {
      if (!doc.cover_i) continue;
      await randomDelay();
      const url = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
      const buffer = await downloadImage(url);
      if (buffer) return { source: "openlibrary-search", url, buffer };
    }
  }

  return null;
}

async function resolveCover(book) {
  const google = await tryGoogleQueries(book);

  if (google?.buffer) return google;

  const openLibrary = await tryOpenLibrary(book);
  if (openLibrary?.buffer) return openLibrary;

  if (google?.error?.includes("429")) {
    return {
      skipped: true,
      reason: "HTTP 429 no Google Books (após 2 tentativas) e Open Library sem capa válida",
    };
  }

  return {
    skipped: true,
    reason: "Google Books e Open Library não retornaram imagem válida para este livro",
  };
}

function writeReport({ downloaded, skipped, remaining, totalLocal }) {
  const lines = [
    "# Relatório de capas faltantes",
    "",
    `Gerado em: ${new Date().toISOString()}`,
    "",
    "## Resumo desta execução",
    "",
    `- Livros processados nesta execução: **${downloaded.length + skipped.length}** (máx. ${MAX_BOOKS_PER_RUN})`,
    `- Capas baixadas: **${downloaded.length}**`,
    `- Livros pulados: **${skipped.length}**`,
    `- Capas locais no total: **${totalLocal}**`,
    `- Livros ainda sem capa local: **${remaining.length}**`,
    "",
    "## Capas baixadas nesta execução",
    "",
  ];

  if (downloaded.length) {
    for (const item of downloaded) {
      lines.push(`- **${item.titulo}** (${item.autor}) → \`${item.file}\` — ${item.source}`);
    }
  } else {
    lines.push("- Nenhuma capa baixada nesta execução.");
  }

  lines.push("", "## Livros pulados nesta execução", "");

  if (skipped.length) {
    for (const item of skipped) {
      lines.push(`- **${item.titulo}** (${item.autor})`);
      lines.push(`  - Motivo: ${item.reason}`);
    }
  } else {
    lines.push("- Nenhum livro pulado nesta execução.");
  }

  lines.push("", "## Ainda faltam capa local", "");

  if (remaining.length) {
    for (const item of remaining) {
      lines.push(`- ${item.titulo} (${item.autor})`);
    }
  } else {
    lines.push("- Todos os livros do catálogo já possuem capa local.");
  }

  lines.push(
    "",
    "## Próximo comando para continuar",
    "",
    "Execute novamente para processar os próximos 5 livros sem capa:",
    "",
    "```bash",
    "node scripts/download-missing-covers-google.mjs",
    "```",
    "",
    "Repita até `Ainda faltam capa local` ficar vazio.",
  );

  fs.writeFileSync(reportPath, lines.join("\n"), "utf8");
}

const books = [
  ...parseBooks(fs.readFileSync(seedPath, "utf8")),
  ...parseBooks(fs.readFileSync(insertPath, "utf8"), true),
];
const unique = new Map();
for (const book of books) unique.set(`${book.titulo}|${book.autor}`, book);

fs.mkdirSync(capasDir, { recursive: true });

const totalLocalBefore = fs
  .readdirSync(capasDir)
  .filter((name) => /\.(jpg|jpeg|png|webp)$/i.test(name) && fileIsValid(path.join(capasDir, name)))
  .length;

const missing = [...unique.values()].filter((book) => {
  const filePath = path.join(capasDir, `${slugify(book.titulo)}.jpg`);
  return !fileIsValid(filePath);
});

const batch = missing.slice(0, MAX_BOOKS_PER_RUN);
const downloaded = [];
const skipped = [];

console.log(`Capas locais existentes: ${totalLocalBefore}`);
console.log(`Livros sem capa: ${missing.length}`);
console.log(`Processando nesta execução: ${batch.length}\n`);

for (const book of batch) {
  const filename = `${slugify(book.titulo)}.jpg`;
  const filePath = path.join(capasDir, filename);

  console.log(`→ ${book.titulo}`);

  const result = await resolveCover(book);

  if (result?.buffer) {
    fs.writeFileSync(filePath, result.buffer);
    downloaded.push({
      titulo: book.titulo,
      autor: book.autor,
      file: filename,
      source: result.source,
    });
    console.log(`  [OK] ${filename} (${result.source})\n`);
    continue;
  }

  skipped.push({
    titulo: book.titulo,
    autor: book.autor,
    reason: result?.reason || "Falha desconhecida",
  });
  console.log(`  [PULADO] ${result?.reason || "sem capa"}\n`);
}

const totalLocal = fs
  .readdirSync(capasDir)
  .filter((name) => /\.(jpg|jpeg|png|webp)$/i.test(name) && fileIsValid(path.join(capasDir, name)))
  .length;

const remaining = missing.filter((book) => {
  const filePath = path.join(capasDir, `${slugify(book.titulo)}.jpg`);
  return !fileIsValid(filePath);
});

writeReport({ downloaded, skipped, remaining, totalLocal });

console.log("=== RESUMO ===");
console.log(`Baixadas: ${downloaded.length}`);
console.log(`Puladas: ${skipped.length}`);
console.log(`Total capas locais: ${totalLocal}`);
console.log(`Ainda faltam: ${remaining.length}`);
console.log(`Relatório: ${reportPath}`);
console.log("\nPróximo: node scripts/download-missing-covers-google.mjs");
