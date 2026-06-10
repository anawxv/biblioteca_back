# Relatório de diagnóstico — capas via Google Books / Open Library

**Projeto:** AP1_2.0  
**Data:** 2026-05-29  
**Escopo:** análise somente leitura (sem alteração de layout, banco, regras de negócio ou fluxos de login/empréstimo/devolução).

---

## Resumo executivo

A integração de capas no front-end **estava estruturalmente correta na ordem da cascata** (Open Library → Google Books → local → fallback rosa), mas **falhava na prática** por três causas combinadas:

1. **Bug de validação no front-end:** Open Library devolve um GIF 1×1 px (placeholder) com HTTP 200 quando o ISBN não tem capa; `canLoadImage()` trata isso como sucesso e **impede** Google Books e capa local de serem tentados.
2. **Rate limit do Google Books (HTTP 429):** ao abrir telas com dezenas/centenas de livros, cada card dispara `fetch()` para a API pública sem chave; a cota diária esgota rapidamente.
3. **Campo `imagem_capa` do banco ignorado pelo resolver:** URLs gravadas no PostgreSQL (`https://covers.openlibrary.org/...`) **não são usadas** pelo `resolveCoverCascade`; só entram caminhos locais `/capas/...`.

**Causa dominante para a maioria dos livros brasileiros sem capa:** placeholder da Open Library + ausência de filtro de tamanho no front-end.

---

## 1. Front-end

### 1.1 BookCover chama coverResolver corretamente?

**Sim.** O componente importa e usa `resolveCoverCascade`:

```18:22:frontend/src/components/BookCover.jsx
    async function loadCover() {
      const resolved = await resolveCoverCascade(book);
      if (!cancelled) {
        setCoverUrl(resolved);
```

### 1.2 Ordem da cascata

**Correta** em `coverResolver.js`:

| Etapa | Fonte | Implementação |
|-------|--------|----------------|
| 1 | Open Library | `getOpenLibraryCoverUrl(book)` + `canLoadImage` |
| 2 | Google Books | `fetchGoogleBooksCover(title, author)` + `canLoadImage` |
| 3 | Capa local | `getLocalCoverPath(book)` + `canLoadImage` |
| 4 | Fallback rosa | retorna `null` → gradiente no JSX |

### 1.3 Google Books é chamado no navegador?

**Sim**, via `fetch()` direto do browser para:

```
https://www.googleapis.com/books/v1/volumes?q={query}&maxResults=1
```

Não passa pelo backend Java. Não usa API key.

### 1.4 Leitura do retorno Google Books

Implementação em `fetchGoogleBooksCover`:

- Lê `payload.items[0].volumeInfo.imageLinks`
- Usa **apenas** `thumbnail` ou `smallThumbnail` (nesta ordem)
- **Não** usa `medium`, `large` ou `extraLarge`
- Converte `http://` → `https://`
- Remove `&edge=curl`
- Se `response.ok === false` (incluindo 429), retorna `null` silenciosamente

Comparando com o script `download-missing-covers-google.mjs`, que é mais robusto: tenta `isbn:`, título em inglês, vários tamanhos de `imageLinks` e URL alternativa `books.google.com/books/content?id=...`.

### 1.5 Tratamento de imagem quebrada

| Camada | Comportamento |
|--------|----------------|
| `canLoadImage()` | `new Image()` com `onload` / `onerror` — **não verifica tamanho mínimo** |
| `<img onError>` | zera `coverUrl` e volta ao fallback rosa |
| Placeholder OL 1×1 | **Passa** em `canLoadImage` → `<img>` carrega → **não** dispara `onError` → card fica branco/sem texto (pior que o fallback rosa) |

### 1.6 Cai para fallback cedo demais?

**Não.** O problema oposto: **não cai** para Google Books/local quando deveria, porque o placeholder OL de 43 bytes é aceito como capa válida.

### 1.7 CORS

- **Google Books JSON API:** `fetch()` funciona; CORS liberado para origens web.
- **Imagens Google Books (`books.googleusercontent.com`):** carregam em `<img>` sem bloqueio CORS típico.
- **Open Library:** sem bloqueio observado.
- **Conclusão:** CORS **não** foi a causa principal.

### 1.8 HTTP vs HTTPS

O front-end normaliza `http://` → `https://` nas URLs do Google Books. **Não** há mixed content por esse motivo.

### 1.9 Acentos e caracteres especiais

- Título/autor chegam corretamente do backend (UTF-8).
- A query usa `encodeURIComponent('intitle:... inauthor:...')` — acentos preservados.
- **Limitação:** busca só em português; livros como *Vermelho, Branco e Sangue Azul* têm edição catalogada no Google como **"Red White and Royal Blue"** — o front-end **não** tenta título em inglês (o script de download local faz isso).

---

## 2. Banco de dados

### 2.1 Campo `imagem_capa`

| Camada | Nome do campo |
|--------|----------------|
| PostgreSQL | `imagem_capa` |
| Backend Java (`BookResponse`) | `imagemCapa` |
| Front-end (`normalizeBook`) | `coverImage` (mapeado de `imagemCapa`) |

Mapeamento correto em `api.js`:

```143:143:frontend/src/services/api.js
    coverImage: book.coverImage ?? book.imagemCapa ?? "",
```

Backend aceita ambos os nomes via `@JsonAlias({"imagem_capa", "imagemCapa"})`.

### 2.2 O resolver usa `imagem_capa`?

**Parcialmente — e isso é um problema.**

`getLocalCoverPath` só reutiliza `coverImage`/`imagemCapa` se o valor **começar com** `/capas/`:

```17:22:frontend/src/utils/coverResolver.js
export function getLocalCoverPath(book = {}) {
  const raw = String(book.coverImage || book.imagemCapa || "").trim();
  if (raw.startsWith("/capas/")) {
    return raw;
  }
  return `/capas/${slugifyCoverFilename(book.title)}.jpg`;
}
```

URLs externas gravadas por `update_capas_faltantes.sql` (ex.: `https://covers.openlibrary.org/b/isbn/9788595084742-L.jpg`) **são ignoradas** na cascata. O front-end sempre refaz Open Library → Google Books do zero.

### 2.3 ISBN, título e autor nos 3 livros de teste

| Livro | ISBN (seed) | Título | Autor |
|-------|-------------|--------|-------|
| Vermelho, Branco e Sangue Azul | 9788555340940 | Vermelho, Branco e Sangue Azul | Casey McQuiston |
| Matilda | 9788574064389 | Matilda | Roald Dahl |
| O Hobbit | 9788595084742 | O Hobbit | J. R. R. Tolkien |

Dados consistentes entre `seed_biblioteca_completa.sql` e normalização do front-end.

---

## 3. Testes manuais de API (2026-05-29)

Ambiente: Node.js `fetch`, mesmas URLs que o front-end usa.

### 3.1 Vermelho, Branco e Sangue Azul

**Open Library**

| Item | Valor |
|------|-------|
| URL | `https://covers.openlibrary.org/b/isbn/9788555340940-L.jpg` |
| Status | **200** |
| Corpo | **43 bytes** — GIF 1×1 placeholder (`GIF89a...`) |
| Com `?default=false` | **404** (sem capa real) |

**Google Books**

| Item | Valor |
|------|-------|
| URL | `https://www.googleapis.com/books/v1/volumes?q=intitle%3AVermelho%2C%20Branco%20e%20Sangue%20Azul%20inauthor%3ACasey%20McQuiston&maxResults=1` |
| Status | **429** |
| Corpo | `Quota exceeded for quota metric 'Queries' and limit 'Queries per day'` |
| `imageLinks` | **Indisponível** (resposta de erro, sem `items`) |
| Imagem escolhida | **Nenhuma** |

**O que o front-end faz:** aceita placeholder OL → **nunca chega ao Google Books** → capa local inexistente → card branco ou fallback rosa.

---

### 3.2 Matilda

**Open Library**

| Item | Valor |
|------|-------|
| URL | `https://covers.openlibrary.org/b/isbn/9788574064389-L.jpg` |
| Status | **200** |
| Corpo | **43 bytes** — GIF 1×1 placeholder |
| Com `?default=false` | **404** |

**Google Books**

| Item | Valor |
|------|-------|
| URL | `https://www.googleapis.com/books/v1/volumes?q=intitle%3AMatilda%20inauthor%3ARoald%20Dahl&maxResults=1` |
| Status | **429** |
| `imageLinks` | **Indisponível** |
| Imagem escolhida | **Nenhuma** |

**Nota:** existe capa local `matilda.jpg` (56 KB) baixada depois via script com buscas mais amplas; **antes** das capas locais, o front-end ficava preso no placeholder OL.

---

### 3.3 O Hobbit

**Open Library**

| Item | Valor |
|------|-------|
| URL | `https://covers.openlibrary.org/b/isbn/9788595084742-L.jpg` |
| Status | **200** |
| Corpo | **85 655 bytes** — JPEG válido |
| Com `?default=false` | **200** (capa real) |

**Google Books**

| Item | Valor |
|------|-------|
| URL | `https://www.googleapis.com/books/v1/volumes?q=intitle%3AO%20Hobbit%20inauthor%3AJ.%20R.%20R.%20Tolkien&maxResults=1` |
| Status | **429** |
| `imageLinks` | **Indisponível** neste teste |
| Imagem escolhida pelo front | **Open Library** (etapa 1 já resolve) |

**Observação:** *O Hobbit* é o caso em que a API Open Library **funciona** na cascata atual. Se chegou a aparecer sem capa antes das locais, causas prováveis secundárias: falha pontual de rede em `canLoadImage`, carga simultânea de muitas imagens, ou confusão visual com livros presos no placeholder. O problema sistêmico do Google Books (429) **não** deveria afetar este título enquanto OL responder.

---

## 4. Conclusão

### 4.1 Causa provável do problema

| Fator | Onde | Impacto |
|-------|------|---------|
| Placeholder Open Library 1×1 aceito como capa | **Front-end** (`canLoadImage` sem validação de tamanho; URL sem `?default=false`) | **Alto** — bloqueia Google Books e local para ~metade do acervo BR |
| Rate limit Google Books HTTP 429 | **API externa** (cota pública compartilhada) | **Alto** — após esgotar cota, nenhum livro dependente do Google recebe capa |
| Busca Google simplificada (só título PT + autor) | **Front-end** | **Médio** — falha em traduções/edições estrangeiras |
| Só `thumbnail` / `smallThumbnail` | **Front-end** | **Baixo** — ocasionalmente perde capas maiores |
| `imagem_capa` com URL externa ignorada | **Front-end + expectativa do banco** | **Médio** — SQL de capas OL no banco não refletia na UI |
| CORS / HTTP / acentos | — | **Descartados** como causa principal |

**Veredicto:** erro **primário no front-end** (validação de capa Open Library) **amplificado** por **limitação da API externa** (Google Books 429) e **desalinhamento** entre o que o banco guarda e o que o resolver usa.

### 4.2 Exemplos reais

1. **Matilda / Vermelho:** OL → 200 + 43 bytes → front-end para na etapa 1 → card sem capa real.
2. **Catálogo com ~150 livros:** dezenas de `fetch` Google Books → 429 em sequência → etapa 2 inútil para todos.
3. **`update_capas_faltantes.sql`:** gravou URLs OL no banco, mas `BookCover` continuou refazendo busca ao vivo, ignorando o campo.

### 4.3 Solução recomendada (sem implementar agora)

**Curto prazo (apresentação):** manter **capas locais** em `frontend/public/capas/` — estável, offline-friendly, sem rate limit.

**Médio prazo (pós-apresentação):**

1. Corrigir `coverResolver.js`:
   - Open Library com `?default=false` ou rejeitar imagens `< 400 bytes`
   - Priorizar `book.coverImage` quando for URL `http(s)://` válida
   - Busca Google: `isbn:` primeiro; fallback título EN para obras conhecidas
   - Usar todos os tamanhos de `imageLinks`
2. **Proxy no backend** para Google Books (API key + cache) — evita 429 no browser e esconde cota.
3. Pré-processar capas em build/deploy (scripts já existentes) e persistir `/capas/...` no banco.

### 4.4 Continuar com capas locais na apresentação?

**Sim.** É a opção mais confiável: 106 arquivos locais, sem dependência de APIs externas durante a demo, sem cards brancos por placeholder.

### 4.5 Livros que ainda faltam capa local

**24 títulos** sem arquivo em `frontend/public/capas/` (verificação cruzada manifest × disco):

1. Vermelho, Branco e Sangue Azul  
2. A Mulher na Janela  
3. O Chamado do Cuco  
4. Morte no Nilo  
5. O Exorcista  
6. A Assombração da Casa da Colina  
7. Longa Caminhada até a Liberdade  
8. A Segunda Guerra Mundial  
9. Uma Breve História do Mundo  
10. O Mito de Sísifo  
11. Talvez Você Deva Conversar com Alguém  
12. A Coragem de Ser Imperfeito  
13. Como Fazer Amigos e Influenciar Pessoas  
14. O Poder do Agora  
15. Aprendendo SQL  
16. Sistema de Banco de Dados  
17. Algoritmos  
18. Lógica de Programação e Algoritmos com JavaScript  
19. Antologia Poética  
20. Poemas Completos de Alberto Caeiro  
21. Melhores Poemas de Cecília Meireles  
22. A Lista de Schindler  
23. As Vantagens de Ser Invisível  
24. O Auto da Compadecida  

*(Matilda e O Hobbit já possuem `matilda.jpg` e `o-hobbit.jpg` locais.)*

---

## 5. Referências de código

| Arquivo | Papel |
|---------|--------|
| `frontend/src/components/BookCover.jsx` | UI da capa |
| `frontend/src/utils/coverResolver.js` | Cascata OL → Google → local |
| `frontend/src/services/api.js` | `imagemCapa` → `coverImage` |
| `scripts/fetch-covers.mjs` | OL com `?default=false` (correto) |
| `scripts/download-missing-covers-google.mjs` | Busca Google robusta + rate limit handling |
| `banco_de_dados/seed_biblioteca_completa.sql` | ISBNs de referência |

---

## Frases finais (conforme solicitado)

**O problema estava em** três pontos combinados: (1) o front-end tratava o placeholder 1×1 da Open Library como capa válida, interrompendo a cascata antes do Google Books e das capas locais; (2) a API pública do Google Books retornava HTTP 429 (cota esgotada) quando muitos livros eram carregados no navegador; (3) URLs de capa gravadas no banco (`imagem_capa`) não eram usadas pelo `resolveCoverCascade`, apenas caminhos `/capas/...`.

**A melhor solução para a apresentação é** continuar com as **capas locais** já baixadas em `frontend/public/capas/`, que eliminam dependência de APIs externas e garantem visual consistente.

**Depois da apresentação, a solução ideal seria** corrigir o `coverResolver` (validar tamanho da imagem ou usar `?default=false` na Open Library, respeitar URLs do banco, busca Google por ISBN com proxy/cache no backend) e manter um pipeline de pré-download de capas faltantes para os 24 livros restantes.
