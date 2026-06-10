# Biblioteca API

Back-end Java com Spring Boot para o sistema de biblioteca, usando o banco PostgreSQL ja existente `biblioteca`.

## Stack

- Java 17+
- Spring Boot
- Spring Web
- Spring Data JPA
- PostgreSQL Driver
- Maven

## Configuracao

Arquivo principal:

- `src/main/resources/application.properties`

Propriedades:

- `server.port=8080`
- `spring.datasource.url=jdbc:postgresql://localhost:5432/biblioteca`
- `spring.datasource.username=postgres`
- `spring.datasource.password=${DB_PASSWORD:SUA_SENHA_AQUI}`
- `spring.jpa.hibernate.ddl-auto=none`

Voce pode definir a senha via variavel de ambiente:

```powershell
$env:DB_PASSWORD="SUA_SENHA_AQUI"
```

## Como rodar

1. Entre na pasta `backend_java`
2. Garanta que o PostgreSQL esteja ativo e que o banco `biblioteca` exista
3. Defina a senha do banco em `DB_PASSWORD` ou edite o `application.properties`
4. Execute:

```powershell
mvn spring-boot:run
```

## Endpoints

- `POST /api/auth/login`
- `POST /api/usuarios`
- `GET /api/livros`
- `GET /api/livros?busca=`
- `GET /api/livros/{id}`
- `POST /api/livros`
- `DELETE /api/livros/{id}`
- `GET /api/categorias`
- `POST /api/emprestimos`
- `GET /api/emprestimos/cliente/{id}`
- `POST /api/emprestimos/{id}/devolver`
- `GET /api/dashboard`
- `GET /api/dashboard/livros-mais-emprestados`
- `GET /api/dashboard/livros-recentes`
- `GET /api/dashboard/generos-mais-consumidos`

## Melhorias nota 10 do banco

Execute manualmente no pgAdmin, depois dos scripts originais:

```sql
banco_de_dados/melhorias_nota10.sql
```

O script cria tabelas de multigêneros, subgêneros, histórico de livros, códigos de funcionário, índices, views e trigger de `livro.atualizado_em`. Ele é incremental e não usa `DROP TABLE`, `TRUNCATE` ou recriação do banco.

## Edição real de livros

Endpoint:

- `PUT /api/livros/{id}`
- `GET /api/livros/{id}/historico`

Exemplo:

```powershell
curl.exe -X PUT "http://localhost:8080/api/livros/1" `
  -H "Content-Type: application/json" `
  -d "{\"title\":\"Livro editado\",\"author\":\"Autor\",\"isbn\":\"ISBN-EDITADO\",\"description\":\"Descricao\",\"publishedYear\":2026,\"pages\":250,\"publisher\":\"Editora\",\"quantityTotal\":5,\"availableQuantity\":4,\"categoryId\":1,\"coverImage\":\"\",\"generosExtras\":[\"Romance\",\"Drama\"],\"idsGenerosExtras\":[],\"idsSubgeneros\":[]}"
```

Confira o histórico:

```sql
SELECT * FROM historico_livro ORDER BY criado_em DESC;
```

## Código de funcionário

O cadastro de funcionário exige `codigoAutorizacao`. O script `melhorias_nota10.sql` cria a tabela `codigo_funcionario` e insere:

- `FUNC-2026-001`
- `FUNC-2026-002`
- `BIBLIOTECARIO-AP1`

## Scripts SQL novos

Execute no pgAdmin, nesta ordem, depois dos scripts originais:

1. `banco_de_dados/melhorias_nota10.sql`
2. `banco_de_dados/normalizar_status_emprestimo.sql`
3. `banco_de_dados/seeds_subgeneros.sql`
4. `banco_de_dados/corrigir_dados_exemplo.sql`

Todos sao incrementais e nao apagam dados.

## GitHub

Antes de enviar:

```powershell
cd C:\Users\gusta\OneDrive\AP1\AP1_2.0
git status
git add .
git commit -m "Melhora API, dashboard, status e documentacao"
git push
```
