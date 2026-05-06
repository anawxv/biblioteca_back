# Biblioteca App

Front-end mobile-first em React + Vite para o sistema de biblioteca. A interface foi organizada para parecer um aplicativo: fundo branco, rosa como cor principal, cards arredondados, campos cinza claro e moldura centralizada no desktop.

## Tecnologias

- React
- Vite
- React Router
- CSS puro organizado em `src/index.css` e `src/styles/mobile-app.css`
- PWA com `manifest.webmanifest` e service worker simples

## Como rodar

Instale as dependências:

```bash
npm install
```

Rode em desenvolvimento:

```bash
npm run dev
```

Gere o build:

```bash
npm run build
```

## Ambiente

Crie um arquivo `.env` baseado em `.env.example`:

```env
VITE_API_URL=http://localhost:8080/api
```

O back-end esperado é o Spring Boot em:

```text
http://localhost:8080/api
```

## Telas

- Tela inicial
- Login
- Cadastro
- Catálogo do cliente
- Categorias
- Detalhes do livro
- Meus empréstimos
- Perfil do cliente
- Painel do bibliotecário
- Adicionar livro
- Remover livro
- Registrar empréstimo
- Registrar devolução
- Dashboard avançado

## API

A integração fica em `src/services/api.js` e expõe:

- `login(email, senha)`
- `cadastrarUsuario(dados)`
- `listarLivros()`
- `buscarLivros(busca)`
- `detalharLivro(id)`
- `listarCategorias()`
- `solicitarEmprestimo(dados)`
- `listarMeusEmprestimos(idCliente)`
- `devolverLivro(idEmprestimo)`
- `listarDashboard()`
- `adicionarLivro(dados)`
- `excluirLivro(idLivro)`
- `registrarEmprestimo(dados)`
- `registrarDevolucao(idEmprestimo)`
- `listarLivrosMaisEmprestados()`
- `listarLivrosRecentes()`
- `listarGenerosMaisConsumidos()`

Os mocks continuam apenas como fallback temporário quando a API não está disponível.
