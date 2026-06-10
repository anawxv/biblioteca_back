# Testes do Sistema Biblioteca

## Cadastro

- Cliente sem código: cadastrar com `tipoUsuario=CLIENTE`; deve criar `usuario` e `cliente`.
- Funcionário sem código: deve retornar erro amigável.
- Funcionário com código inválido: deve retornar `Código de autorizacao invalido.`
- Funcionário com código válido: deve criar `usuario` e `funcionario` e marcar o código como usado.
- E-mail repetido: deve retornar erro amigável.

## Login

- Login cliente válido: deve ir para área do cliente.
- Login funcionário válido: deve ir para área do funcionário.
- Cliente tentando rota de funcionário: deve bloquear/redirecionar.
- Funcionário tentando rota de cliente: deve bloquear/redirecionar conforme regra atual.

## Livros

- `GET /api/livros`: deve listar somente livros ativos.
- `GET /api/livros/{id}`: deve retornar detalhes, categoria, gêneros extras e subgêneros.
- `POST /api/livros`: deve criar livro e registrar `CRIADO` em `historico_livro`.
- `PUT /api/livros/{id}`: deve editar livro e registrar `EDITADO`.
- `DELETE /api/livros/{id}`: deve fazer exclusão lógica e registrar `EXCLUIDO_LOGICAMENTE`.
- ISBN duplicado em outro livro: deve retornar erro amigável.
- Quantidade disponível maior que total: deve retornar erro amigável.

## Edição no Front-end

- Entrar como funcionário.
- Abrir `Gerenciar livros`.
- Clicar em `Editar`.
- Alterar título, autor, categoria, quantidades e gêneros extras.
- Salvar.
- Ver mensagem `Livro atualizado com sucesso.`
- Reabrir o livro e confirmar dados atualizados.

## Empréstimo

- Registrar empréstimo com livro disponível: deve diminuir quantidade disponível.
- Registrar empréstimo com cliente bloqueado: deve bloquear ação.
- Registrar empréstimo com multa pendente: deve bloquear ação.
- Registrar empréstimo com livro indisponível: deve bloquear ação.

## Devolução

- Devolver no prazo: deve marcar como devolvido e aumentar disponibilidade.
- Devolver atrasado: deve criar multa.
- Repetir devolução do mesmo empréstimo: deve retornar erro amigável.

## Dashboard

- `GET /api/dashboard`: deve retornar resumo.
- `GET /api/dashboard/livros-mais-emprestados`: deve retornar ranking.
- `GET /api/dashboard/livros-recentes`: deve retornar recentes.
- `GET /api/dashboard/generos-mais-consumidos`: deve retornar gêneros/categorias consumidos.
- Views do banco: validar `vw_dashboard_resumo`, `vw_livros_mais_emprestados`, `vw_generos_mais_consumidos`, `vw_emprestimos_atrasados`, `vw_multas_pendentes`.

## Histórico

- Após criar livro: consultar `SELECT * FROM historico_livro`.
- Após editar livro: consultar `GET /api/livros/{id}/historico`.
- Após excluir logicamente: confirmar ação `EXCLUIDO_LOGICAMENTE`.

## Código de Funcionário

- Executar `banco_de_dados/melhorias_nota10.sql`.
- Usar `FUNC-2026-001` em um cadastro de funcionário.
- Conferir:

```sql
SELECT codigo, usado, usado_em FROM codigo_funcionario WHERE codigo = 'FUNC-2026-001';
```

## Comandos curl principais

Login:

```powershell
curl.exe -X POST "http://localhost:8080/api/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"cliente@teste.com\",\"senha\":\"123456\"}"
```

Cadastrar cliente:

```powershell
curl.exe -X POST "http://localhost:8080/api/usuarios" -H "Content-Type: application/json" -d "{\"nome\":\"Cliente Teste\",\"email\":\"cliente.novo@teste.com\",\"senha\":\"123456\",\"telefone\":\"11999999999\",\"tipoUsuario\":\"CLIENTE\"}"
```

Cadastrar funcionario com codigo:

```powershell
curl.exe -X POST "http://localhost:8080/api/usuarios" -H "Content-Type: application/json" -d "{\"nome\":\"Funcionario Teste\",\"email\":\"func.novo@teste.com\",\"senha\":\"123456\",\"telefone\":\"11999999999\",\"tipoUsuario\":\"FUNCIONARIO\",\"codigoAutorizacao\":\"FUNC-2026-001\"}"
```

Listar e buscar livros:

```powershell
curl.exe "http://localhost:8080/api/livros"
curl.exe "http://localhost:8080/api/livros?busca=Harry"
```

Criar livro:

```powershell
curl.exe -X POST "http://localhost:8080/api/livros" -H "Content-Type: application/json" -d "{\"title\":\"Livro Teste\",\"author\":\"Autor Teste\",\"isbn\":\"TESTE-001\",\"description\":\"Livro para teste\",\"publishedYear\":2026,\"pages\":200,\"publisher\":\"Editora Teste\",\"quantityTotal\":3,\"availableQuantity\":3,\"categoryId\":1,\"coverImage\":\"\",\"generosExtras\":[\"Drama\"],\"idsGenerosExtras\":[],\"idsSubgeneros\":[]}"
```

Editar livro:

```powershell
curl.exe -X PUT "http://localhost:8080/api/livros/1" -H "Content-Type: application/json" -d "{\"title\":\"Livro Editado\",\"author\":\"Autor Editado\",\"isbn\":\"TESTE-001-EDIT\",\"description\":\"Editado\",\"publishedYear\":2026,\"pages\":220,\"publisher\":\"Editora\",\"quantityTotal\":4,\"availableQuantity\":4,\"categoryId\":1,\"coverImage\":\"\",\"generosExtras\":[\"Drama\",\"Romance\"],\"idsGenerosExtras\":[],\"idsSubgeneros\":[]}"
```

Excluir livro:

```powershell
curl.exe -X DELETE "http://localhost:8080/api/livros/1"
```

Registrar emprestimo:

```powershell
curl.exe -X POST "http://localhost:8080/api/emprestimos" -H "Content-Type: application/json" -d "{\"clienteId\":1,\"livroId\":1}"
```

Registrar devolucao:

```powershell
curl.exe -X POST "http://localhost:8080/api/emprestimos/1/devolver"
```

Dashboard:

```powershell
curl.exe "http://localhost:8080/api/dashboard"
```
