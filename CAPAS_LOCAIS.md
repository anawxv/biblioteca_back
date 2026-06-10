# Capas locais — AP1_2.0

Este documento descreve como o sistema resolve a imagem de capa de cada livro.

## Ordem de busca (cascata automática)

O front-end tenta **sem intervenção do usuário**, nesta ordem:

| Etapa | Fonte | Como funciona |
|-------|--------|----------------|
| **1** | Open Library | `https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg` |
| **2** | Google Books | `GET https://www.googleapis.com/books/v1/volumes?q=intitle:{titulo}+inauthor:{autor}` → `volumeInfo.imageLinks.thumbnail` ou `smallThumbnail` |
| **3** | Capas locais | Arquivo em `frontend/public/capas/` servido como `/capas/{slug-do-titulo}.jpg` |
| **4** | Fallback rosa | Gradiente rosa com título e autor (nunca card branco ou imagem quebrada) |

Implementação: `frontend/src/utils/coverResolver.js` e `frontend/src/components/BookCover.jsx`.

## Onde as capas ficam armazenadas

| Tipo | Local |
|------|--------|
| Arquivos locais | `frontend/public/capas/` |
| URL no navegador | `http://localhost:5173/capas/nome-do-livro.jpg` |
| Banco (opcional) | coluna `livro.imagem_capa` com valor `/capas/nome-do-livro.jpg` |

O Vite expõe tudo que está em `public/` na raiz do site. Por isso o caminho no banco usa `/capas/...` e não `public/capas/...`.

### Padrão do nome do arquivo

Slug do **título** (minúsculas, sem acentos, hífens):

| Título | Arquivo |
|--------|---------|
| Harry Potter e a Pedra Filosofal | `harry-potter-e-a-pedra-filosofal.jpg` |
| O Hobbit | `o-hobbit.jpg` |
| 1984 | `1984.jpg` |

Função: `slugifyCoverFilename()` em `coverResolver.js`.

## Como adicionar novas capas manualmente

1. Coloque a imagem em `frontend/public/capas/` seguindo o padrão `{slug-do-titulo}.jpg`.
2. (Opcional) Atualize o banco:

```sql
UPDATE livro
SET imagem_capa = '/capas/o-hobbit.jpg'
WHERE titulo = 'O Hobbit'
  AND autor = 'J. R. R. Tolkien';
```

3. Reinicie ou atualize o front-end (`npm run dev`). A etapa 3 da cascata encontrará o arquivo.

## Como baixar capas em lote (script)

Na raiz do projeto:

```bash
node scripts/download-local-covers.mjs
```

O script:

- Lê os livros de `banco_de_dados/seed_biblioteca_completa.sql` e `inserir_dados.sql`;
- Tenta Open Library e depois Google Books;
- Salva em `frontend/public/capas/`;
- Gera `banco_de_dados/update_capas_locais.sql` com `UPDATE` por título/autor;
- Gera `frontend/public/capas/manifest.json` com o mapeamento.

Aplicar no PostgreSQL:

```bash
psql -U postgres -d biblioteca -f banco_de_dados/update_capas_locais.sql
```

## Como atualizar o banco

Use **apenas** `UPDATE` em `imagem_capa` (não altere estrutura nem apague livros):

```sql
UPDATE livro
SET imagem_capa = '/capas/matilda.jpg'
WHERE titulo = 'Matilda'
  AND autor = 'Roald Dahl';
```

Arquivos SQL prontos:

- `banco_de_dados/update_capas_faltantes.sql` — URLs externas (Open Library)
- `banco_de_dados/update_capas_locais.sql` — caminhos `/capas/...` (gerado pelo script)

## Comportamento garantido no front-end

- Capa válida → exibe a imagem após carregar.
- Qualquer falha → fallback rosa com título e autor.
- Sem imagem quebrada (`onError` limpa a URL).
- Sem card branco vazio (gradiente sempre visível por baixo).
- Tamanho e proporção dos cards inalterados.

## Fluxo resumido

```
Open Library (ISBN)
        ↓ falhou
Google Books API
        ↓ falhou
/capas/{slug}.jpg
        ↓ falhou
Fallback rosa
```
