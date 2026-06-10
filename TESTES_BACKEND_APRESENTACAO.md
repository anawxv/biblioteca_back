# Testes de Back-end — Apresentação AP1_2.0

Guia passo a passo para demonstrar o sistema ao professor. Execute o back-end em `http://localhost:8080` e o front-end em `http://localhost:5173` (ou `5174`).

## Pré-requisitos

1. PostgreSQL com banco `biblioteca` criado (`banco_de_dados/tabelas_criadas.sql`).
2. Dados iniciais: `inserir_dados.sql` e, se aplicável, `seed_biblioteca_completa.sql`.
3. Capas externas (opcional antes da demo): `psql -f banco_de_dados/update_capas_faltantes.sql`.
4. Códigos de funcionário: `melhorias_nota10.sql` (códigos `FUNC-2026-001`, `FUNC-2026-002`).
5. Back-end: `cd backend_java` → `mvnw.cmd spring-boot:run`.
6. Front-end: `cd frontend` → `npm.cmd run dev`.

### Credenciais de exemplo (inserir_dados.sql)

| Perfil      | E-mail                   | Senha  |
|------------|---------------------------|--------|
| Funcionário | admin@biblioteca.com      | 123456 |
| Cliente     | joao@gmail.com            | 123456 |
| Cliente     | maria@gmail.com           | 123456 |

---

## Ordem ideal de apresentação

1. Login cliente → catálogo no front-end  
2. Login funcionário → painel  
3. Cadastro cliente (novo e-mail)  
4. Cadastro funcionário (com código)  
5. CRUD de livros (API)  
6. Registrar empréstimo  
7. Bloqueio por atraso (cliente Maria)  
8. Devolução e multa  
9. Histórico de empréstimos  
10. Dashboard completo  

---

## 1. Login cliente

**URL:** `POST http://localhost:8080/api/auth/login`

```powershell
curl.exe -X POST "http://localhost:8080/api/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"joao@gmail.com\",\"senha\":\"123456\"}"
```

**Esperado:** HTTP 200 com `id`, `nome`, `email`, `tipoUsuario` = `CLIENTE`.

**Senha incorreta:**

```powershell
curl.exe -X POST "http://localhost:8080/api/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"joao@gmail.com\",\"senha\":\"errada\"}"
```

**Esperado:** HTTP 400 com mensagem `E-mail ou senha invalidos.`

---

## 2. Login funcionário

```powershell
curl.exe -X POST "http://localhost:8080/api/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@biblioteca.com\",\"senha\":\"123456\"}"
```

**Esperado:** `tipoUsuario` = `FUNCIONARIO`.

---

## 3. Cadastro cliente

**URL:** `POST http://localhost:8080/api/usuarios`

```powershell
curl.exe -X POST "http://localhost:8080/api/usuarios" ^
  -H "Content-Type: application/json" ^
  -d "{\"nome\":\"Cliente Demo\",\"email\":\"cliente.demo@ap1.com\",\"senha\":\"123456\",\"telefone\":\"11988887777\",\"tipoUsuario\":\"CLIENTE\"}"
```

**SQL para conferir:**

```sql
SELECT u.id_usuario, u.nome, u.email, u.tipo_usuario, c.limite_emprestimos
FROM usuario u
JOIN cliente c ON c.id_cliente = u.id_usuario
WHERE u.email = 'cliente.demo@ap1.com';
```

---

## 4. Cadastro funcionário

```powershell
curl.exe -X POST "http://localhost:8080/api/usuarios" ^
  -H "Content-Type: application/json" ^
  -d "{\"nome\":\"Func Demo\",\"email\":\"func.demo@ap1.com\",\"senha\":\"123456\",\"telefone\":\"11977776666\",\"tipoUsuario\":\"FUNCIONARIO\",\"codigoAutorizacao\":\"FUNC-2026-001\"}"
```

**E-mail duplicado (deve falhar):** repetir o mesmo e-mail.

**SQL código usado:**

```sql
SELECT codigo, usado, usado_em FROM codigo_funcionario WHERE codigo = 'FUNC-2026-001';
```

---

## 5. Cadastro de livro

**URL:** `POST http://localhost:8080/api/livros`

```powershell
curl.exe -X POST "http://localhost:8080/api/livros" ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Livro Apresentacao\",\"author\":\"Autor AP1\",\"isbn\":\"9780000000001\",\"description\":\"Livro criado na demo\",\"publishedYear\":2026,\"pages\":200,\"publisher\":\"Editora AP1\",\"quantityTotal\":3,\"availableQuantity\":3,\"categoryId\":1,\"coverImage\":\"https://covers.openlibrary.org/b/isbn/9780000000001-L.jpg\",\"generosExtras\":[\"Drama\"],\"idsGenerosExtras\":[],\"idsSubgeneros\":[]}"
```

**SQL histórico:**

```sql
SELECT acao, titulo, autor, data_evento FROM historico_livro ORDER BY data_evento DESC LIMIT 5;
```

---

## 6. Editar livro

Substitua `{id}` pelo ID retornado na listagem.

```powershell
curl.exe -X PUT "http://localhost:8080/api/livros/{id}" ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Livro Apresentacao Editado\",\"author\":\"Autor AP1\",\"isbn\":\"9780000000001\",\"description\":\"Editado na demo\",\"publishedYear\":2026,\"pages\":220,\"publisher\":\"Editora AP1\",\"quantityTotal\":3,\"availableQuantity\":3,\"categoryId\":1,\"coverImage\":\"\",\"generosExtras\":[\"Drama\"],\"idsGenerosExtras\":[],\"idsSubgeneros\":[]}"
```

---

## 7. Excluir livro (lógico)

```powershell
curl.exe -X DELETE "http://localhost:8080/api/livros/{id}"
```

**SQL:**

```sql
SELECT id_livro, titulo, ativo FROM livro WHERE id_livro = {id};
```

---

## 8. Buscar livro

```powershell
curl.exe "http://localhost:8080/api/livros"
curl.exe "http://localhost:8080/api/livros?busca=Harry"
curl.exe "http://localhost:8080/api/livros/1"
```

---

## 9. Registrar empréstimo

```powershell
curl.exe -X POST "http://localhost:8080/api/emprestimos" ^
  -H "Content-Type: application/json" ^
  -d "{\"clienteId\":2,\"livroId\":3,\"funcionarioId\":1}"
```

**SQL estoque:**

```sql
SELECT titulo, quantidade_disponivel, quantidade_total FROM livro WHERE id_livro = 3;
```

**Front-end:** `/funcionario/registrar-emprestimo`

---

## 10. Bloqueio por atraso

Cliente **Maria** (`maria@gmail.com`) possui empréstimo `ATRASADO` em `inserir_dados.sql`.

```powershell
curl.exe -X POST "http://localhost:8080/api/emprestimos" ^
  -H "Content-Type: application/json" ^
  -d "{\"clienteId\":3,\"livroId\":3}"
```

**Esperado:** erro `Cliente possui emprestimo em atraso.`

**SQL:**

```sql
SELECT e.id_emprestimo, u.nome, e.status, e.data_prevista_devolucao
FROM emprestimo e
JOIN cliente c ON c.id_cliente = e.id_cliente
JOIN usuario u ON u.id_usuario = c.id_cliente
WHERE u.email = 'maria@gmail.com' AND e.data_devolucao IS NULL;
```

---

## 11. Registrar devolução

Use o ID do empréstimo ativo (ex.: empréstimo atrasado da Maria = `2`).

```powershell
curl.exe -X POST "http://localhost:8080/api/emprestimos/2/devolver"
```

**Esperado:** resposta com `fineAmount` se atrasado; estoque do livro incrementado.

**SQL multa:**

```sql
SELECT m.id_multa, m.valor, m.paga, m.motivo, e.id_emprestimo
FROM multa m
JOIN emprestimo e ON e.id_emprestimo = m.id_emprestimo
ORDER BY m.criada_em DESC LIMIT 5;
```

**Front-end:** `/funcionario/registrar-devolucao`

---

## 12. Histórico de empréstimos

```powershell
curl.exe "http://localhost:8080/api/emprestimos/cliente/2"
```

**Front-end cliente:** `/cliente/emprestimos`

---

## 13. Multas

```powershell
curl.exe "http://localhost:8080/api/dashboard/multas-pendentes"
```

**SQL:**

```sql
SELECT SUM(valor) AS total_pendente FROM multa WHERE paga = FALSE;
```

---

## 14. Dashboard

```powershell
curl.exe "http://localhost:8080/api/dashboard"
curl.exe "http://localhost:8080/api/dashboard/livros-mais-emprestados"
curl.exe "http://localhost:8080/api/dashboard/generos-mais-consumidos"
curl.exe "http://localhost:8080/api/dashboard/emprestimos-por-mes"
curl.exe "http://localhost:8080/api/dashboard/devolucoes-prazo-atrasadas"
curl.exe "http://localhost:8080/api/dashboard/atrasos"
curl.exe "http://localhost:8080/api/dashboard/multas-pendentes"
```

**Front-end:** `/funcionario/dashboard`

---

## SQL úteis rápidos

```sql
-- Resumo do acervo
SELECT COUNT(*) AS livros_ativos FROM livro WHERE ativo = TRUE;

-- Empréstimos abertos
SELECT COUNT(*) FROM emprestimo WHERE data_devolucao IS NULL AND status <> 'CANCELADO';

-- Livros sem capa HTTPS
SELECT titulo, autor, imagem_capa FROM livro
WHERE imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://'
LIMIT 20;
```

---

## Checklist antes de entrar na sala

- [ ] Back-end responde `GET /api/livros` com 200  
- [ ] Front-end abre login sem erro de CORS  
- [ ] `update_capas_faltantes.sql` executado (se quiser capas na demo)  
- [ ] Maria com empréstimo atrasado para demo de bloqueio  
- [ ] Código `FUNC-2026-002` disponível para cadastro de funcionário ao vivo  
