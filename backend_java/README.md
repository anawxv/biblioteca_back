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
