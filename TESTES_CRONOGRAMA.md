# Testes do cronograma AP1_2.0

Use este roteiro antes da apresentacao. A API real deve estar em `http://localhost:8080/api` e o front em `http://localhost:5173`.

## Preparacao

1. No pgAdmin, confirme que o banco `biblioteca` existe.
2. Execute apenas scripts incrementais se ainda nao tiver executado:
   - `banco_de_dados/melhorias_nota10.sql`
   - `banco_de_dados/seeds_subgeneros.sql`
   - `banco_de_dados/codigos_funcionarios.sql`
3. Nao execute scripts destrutivos e nao recrie tabelas.
4. No backend, confirme `spring.jpa.hibernate.ddl-auto=none`.

## Builds obrigatorios

Backend:

```powershell
cd C:\Users\gusta\OneDrive\AP1\AP1_2.0\backend_java
.\mvnw.cmd -q -DskipTests package
```

Frontend:

```powershell
cd C:\Users\gusta\OneDrive\AP1\AP1_2.0\frontend
npm.cmd install
npm.cmd run build
```

## Testes manuais por requisito

| ID | Teste | Passos | Resultado esperado |
| --- | --- | --- | --- |
| T01 | Conexao com banco | Subir backend com PostgreSQL ativo | API inicia na porta 8080 sem criar/alterar tabelas |
| T02 | Cadastro de cliente | `POST /api/usuarios` com `tipoUsuario=CLIENTE` | Cria registro em `usuario` e `cliente` |
| T03 | Cadastro de funcionario | `POST /api/usuarios` com `tipoUsuario=FUNCIONARIO` e codigo valido | Cria registro em `usuario` e `funcionario`; codigo fica usado |
| T04 | Login cliente | `POST /api/auth/login` com cliente ativo | Retorna `idUsuario`, `nome`, `email`, `tipoUsuario=CLIENTE` |
| T05 | Login funcionario | `POST /api/auth/login` com funcionario ativo | Retorna `tipoUsuario=FUNCIONARIO` |
| T06 | Login invalido | Senha incorreta | Retorna erro 400 com mensagem de credenciais invalidas |
| T07 | Cadastro de livro | `POST /api/livros` com titulo, autor, ISBN, editora, ano, categoria e quantidades | Livro ativo criado e aparece no catalogo |
| T08 | Edicao de livro | `PUT /api/livros/{id}` alterando editora/quantidade | Dados atualizados e historico registra `EDITADO` |
| T09 | Exclusao logica | `DELETE /api/livros/{id}` | `livro.ativo=false`; nao remove fisicamente; historico registra `EXCLUIDO_LOGICAMENTE` |
| T10 | Consulta de livro | `GET /api/livros/{id}` | Retorna livro ativo pelo ID |
| T11 | Busca por titulo | `GET /api/livros?busca=Harry` | Retorna titulos correspondentes ativos |
| T12 | Busca por autor | `GET /api/livros?busca=Rowling` | Retorna livros do autor |
| T13 | Busca por categoria | `GET /api/livros?busca=Fantasia` | Retorna livros da categoria/genero/subgenero |
| T14 | Livro inexistente | `GET /api/livros/999999` | Retorna 404 |
| T15 | Emprestimo disponivel | `POST /api/emprestimos` com cliente, funcionario e livro disponivel | Cria emprestimo ATIVO, prazo 30 dias, baixa estoque em 1 |
| T16 | Emprestimo indisponivel | Zerar disponibilidade e tentar emprestar | Retorna erro "Livro indisponivel" |
| T17 | Cliente bloqueado | Marcar `usuario.bloqueado=true` e tentar emprestar | Retorna erro "Cliente bloqueado" |
| T18 | Cliente com atraso | Criar emprestimo ativo vencido e tentar novo emprestimo | Retorna erro "Cliente possui emprestimo em atraso" |
| T19 | Devolucao no prazo | `POST /api/emprestimos/{id}/devolver` antes do vencimento | Status DEVOLVIDO, estoque sobe 1, sem multa |
| T20 | Devolucao com atraso | Devolver emprestimo vencido | Cria multa |
| T21 | Calculo de multa | Conferir valor na tabela `multa` | Valor = dias de atraso x R$ 2,00 |
| T22 | Dashboard | `GET /api/dashboard` | Cards usam dados reais: livros, clientes, funcionarios, emprestimos, multas, indisponiveis |
| T23 | Historico de livro | `GET /api/livros/{id}/historico` | Mostra acoes de CRIADO, EDITADO ou EXCLUIDO_LOGICAMENTE |
| T24 | Integracao front/back | Entrar no front, navegar catalogo, painel e emprestimos | Telas carregam da API real; fallback so aparece se API cair |
| T25 | Verificacao pgAdmin | Consultar tabelas apos operacoes | Dados batem com o que aparece no front |

## Comandos curl sugeridos

Troque IDs e credenciais pelos dados do seu banco.

```powershell
curl.exe http://localhost:8080/api/livros
curl.exe "http://localhost:8080/api/livros?busca=Harry"
curl.exe http://localhost:8080/api/categorias
curl.exe http://localhost:8080/api/dashboard

curl.exe -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"cliente@teste.com\",\"senha\":\"123456\"}"

curl.exe -X POST http://localhost:8080/api/livros -H "Content-Type: application/json" -d "{\"titulo\":\"Livro Teste AP1\",\"autor\":\"Autor Teste\",\"isbn\":\"AP1-TESTE-001\",\"editora\":\"Editora AP1\",\"anoPublicacao\":2026,\"quantidadeTotal\":2,\"quantidadeDisponivel\":2,\"categoryId\":1}"

curl.exe -X PUT http://localhost:8080/api/livros/ID_LIVRO -H "Content-Type: application/json" -d "{\"titulo\":\"Livro Teste AP1 Editado\",\"autor\":\"Autor Teste\",\"isbn\":\"AP1-TESTE-001\",\"editora\":\"Editora AP1\",\"anoPublicacao\":2026,\"quantidadeTotal\":2,\"quantidadeDisponivel\":2,\"categoryId\":1}"

curl.exe -X DELETE http://localhost:8080/api/livros/ID_LIVRO

curl.exe -X POST http://localhost:8080/api/emprestimos -H "Content-Type: application/json" -d "{\"clienteId\":ID_CLIENTE,\"livroId\":ID_LIVRO,\"funcionarioId\":ID_FUNCIONARIO}"

curl.exe -X POST http://localhost:8080/api/emprestimos/ID_EMPRESTIMO/devolver
```

## Consultas pgAdmin uteis

```sql
SELECT id_livro, titulo, ativo, quantidade_total, quantidade_disponivel FROM livro ORDER BY id_livro DESC;
SELECT * FROM emprestimo ORDER BY id_emprestimo DESC;
SELECT * FROM multa ORDER BY id_multa DESC;
SELECT * FROM historico_livro ORDER BY id_historico DESC;
SELECT * FROM vw_dashboard_resumo;
```
