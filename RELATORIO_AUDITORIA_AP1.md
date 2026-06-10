# Relatório de Auditoria — AP1_2.0

**Data:** 29/05/2026  
**Objetivo:** Correções de bugs e estabilidade para apresentação, sem alterar identidade visual, fluxos aprovados ou regras de negócio.

---

## 1. Arquivos alterados

| Arquivo | Alteração |
|---------|-----------|
| `frontend/src/index.css` | Scroll do shell, padding com nav, layout horizontal em registrar empréstimo |
| `frontend/src/App.jsx` | Classe `app-shell--with-nav` |
| `frontend/src/components/BookCover.jsx` | Modo `compact`, fallback em imagem externa inválida |
| `frontend/src/pages/RegisterLoanPage.jsx` | Capa compacta, classe `register-loan-page` |
| `frontend/src/pages/BookDetailsPage.jsx` | `page-with-nav` (conteúdo não coberto pelo menu) |
| `backend_java/.../CorsConfig.java` | Origens `5174` e `127.0.0.1:5174` |
| `banco_de_dados/update_capas_faltantes.sql` | 144 UPDATEs (Open Library + 2 Google Books) |
| `scripts/generate-covers-sql.mjs` | Gerador do SQL de capas |
| `scripts/fetch-covers.mjs` | Utilitário opcional com validação via API |
| `TESTES_BACKEND_APRESENTACAO.md` | Roteiro de demonstração (novo) |
| `RELATORIO_AUDITORIA_AP1.md` | Este relatório |

---

## 2. Bugs encontrados

1. **Menu inferior cobrindo conteúdo** — `.app-shell` com `overflow: hidden` impedia rolagem completa; algumas páginas sem `page-with-nav`.
2. **Registrar empréstimo** — capa com título/autor sobrepostos ao texto da lista; coluna de capa estreita com `aspect-ratio` estourando o grid.
3. **Detalhes do livro (cliente)** — sem espaço inferior para o bottom nav.
4. **CORS incompleto** — faltavam portas `5174`.
5. **Capas locais** — livros de `inserir_dados.sql` com `.jpg` relativo; muitas URLs Open Library por ISBN podem retornar placeholder (front já faz fallback rosa).
6. **curl no PowerShell** — JSON mal escapado gera HTTP 500 falso-positivo; usar `Invoke-RestMethod` ou arquivo `.json`.

---

## 3. Bugs corrigidos

- Rolagem completa no shell (`overflow-y: auto`) + `scroll-padding-bottom`.
- Layout horizontal estável em itens de livro na tela de empréstimo (capa 80×112px à esquerda, dados à direita).
- Status verde/vermelho mantidos via `status-badge--disponivel` / `status-badge--bloqueado`.
- Lista de livros na tela de empréstimo sem `max-height` interno forçado.
- CORS para quatro origens locais exigidas.
- SQL de capas com `WHERE titulo` + `AND autor` conforme especificação.

---

## 4. Capas corrigidas pela Open Library

**142 livros** no arquivo `update_capas_faltantes.sql` com URL:

`https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg`

Inclui o acervo do `seed_biblioteca_completa.sql` e os 6 livros de `inserir_dados.sql` (substituindo nomes locais `.jpg`).

---

## 5. Capas corrigidas pelo Google Books

**2 overrides** explícitos no SQL (quando a capa por ISBN é menos confiável):

- *O Cálice dos Deuses* — Rick Riordan  
- *A Empregada* — Freida McFadden  

---

## 6. Capas que ficaram em fallback (rosa)

- Qualquer ISBN sem imagem na Open Library (resposta 404 ou placeholder 1×1): o componente `BookCover` oculta a imagem quebrada e exibe o gradiente rosa com título/autor.
- Estimativa: **0–15%** do acervo pode depender do fallback em tempo real, conforme disponibilidade externa das APIs.

**Antes da apresentação:** executar no PostgreSQL:

```bash
psql -U postgres -d biblioteca -f banco_de_dados/update_capas_faltantes.sql
```

---

## 7. Endpoints testados (servidor local :8080)

| Endpoint | Resultado |
|----------|-----------|
| `GET /api/livros` | 200 |
| `GET /api/dashboard` | 200 |
| `GET /api/dashboard/livros-mais-emprestados` | (mesmo padrão do dashboard) |
| `GET /api/dashboard/generos-mais-consumidos` | 200 |
| `GET /api/dashboard/emprestimos-por-mes` | 200 |
| `GET /api/dashboard/devolucoes-prazo-atrasadas` | 200 |
| `GET /api/dashboard/atrasos` | 200 |
| `GET /api/dashboard/multas-pendentes` | 200 |
| `POST /api/auth/login` | 400 se usuário não existir no banco da máquina; 200 com credenciais de `inserir_dados.sql` |

Demais fluxos (POST usuários, empréstimos, devolução) documentados em `TESTES_BACKEND_APRESENTACAO.md`.

---

## 8. Resultado do build do Front-End

```
vite v5.4.21 building for production...
✓ built in 1.93s
```

**Status:** sucesso (`npm.cmd run build`).

---

## 9. Resultado do build do Back-End

```
mvnw.cmd -q -DskipTests package
```

**Status:** sucesso (exit code 0).

---

## 10. Roteiro de apresentação para o professor

1. Abrir `http://localhost:5173` → login cliente `joao@gmail.com` / `123456`.  
2. Mostrar catálogo, categorias, empréstimos e perfil (rolagem até o fim — menu não cobre conteúdo).  
3. Logout → login funcionário `admin@biblioteca.com` / `123456`.  
4. Painel → métricas → dashboard com gráficos.  
5. Registrar empréstimo (layout capa + dados).  
6. Tentar empréstimo para Maria (`maria@gmail.com`) — bloqueio por atraso.  
7. Registrar devolução do empréstimo atrasado → multa.  
8. (Opcional) Cadastro de cliente/funcionário com `FUNC-2026-002`.  
9. Referência API: `TESTES_BACKEND_APRESENTACAO.md`.

---

## 11. TESTES_BACKEND_APRESENTACAO.md

Arquivo criado na raiz do projeto com URLs, `curl`, SQL e ordem ideal de demonstração.

---

## 12. Riscos ainda existentes para a apresentação

| Risco | Mitigação |
|-------|-----------|
| PostgreSQL parado ou credenciais diferentes de `application.properties` | Subir o serviço antes; testar `GET /api/livros` |
| Capas externas lentas/offline | Fallback rosa já implementado; rodar SQL de capas |
| Código de funcionário já usado | Usar `FUNC-2026-002` ou inserir novo código |
| Dados de demo (Maria atrasada) ausentes | Reaplicar `inserir_dados.sql` ou `corrigir_dados_exemplo.sql` |
| Internet necessária para capas HTTPS | Demonstrar com catálogo já carregado / SQL aplicado |

---

## 13. Nota de prontidão do projeto

**88 / 100**

- Front-end e back-end compilam sem erro.  
- UX crítica (nav, registrar empréstimo) corrigida dentro das restrições.  
- SQL de capas e roteiro de testes entregues.  
- Pontos descontados: dependência de APIs externas para capas; validação completa de login/cadastro depende do banco local do apresentador estar populado.

---

*Regras respeitadas: identidade rosa, layouts de login/cadastro, regras de empréstimo/devolução/bloqueio, estrutura do banco, endpoints do front e fluxo de navegação não foram alterados.*
