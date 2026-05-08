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

Para testar como app instalável, rode o projeto e abra o menu do navegador na página da aplicação. O manifest PWA já usa o nome Biblioteca, tema rosa, modo standalone e tela offline amigável.

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
- `listarMultasPendentes()`
- `listarEmprestimosAtrasados()`
- `listarLivrosIndisponiveis()`
- `listarClientes()`
- `listarHistoricoLivros()`
- `listarEmprestimosRecentes()`
- `atualizarLivro(idLivro, dados)`
- `listarGeneros()`
- `listarSubgenerosPorCategoria(idCategoria)`
- `listarHistoricoLivro(idLivro)`

Os mocks continuam apenas como fallback visual temporário para consultas quando a API não está disponível. Ações de escrita, como login, cadastro, empréstimo, devolução, criação e exclusão de livro, chamam a API real e não simulam sucesso.

## Fluxo de teste recomendado

1. Abra `/` e escolha `Sou cliente` ou `Sou funcionário`.
2. Valide login sem e-mail/senha.
3. Cadastre um usuário com telefone de 10 ou 11 dígitos.
4. Entre com um usuário real retornado pelo back-end.
5. No cliente, teste catálogo, categorias, detalhes, empréstimos e perfil.
6. No funcionário, teste painel, gerenciar livros, controlar empréstimos, recentes e dashboard.
7. Teste PWA em modo build/preview ou pelo navegador com o projeto rodando.

## Edição de livros no front-end

Entre como funcionário, acesse `Gerenciar livros` e clique em `Editar`. O modal carrega os dados atuais, permite alterar campos principais, categoria, gêneros extras e IDs de subgêneros, e chama:

```text
PUT http://localhost:8080/api/livros/{id}
```

Se o back-end responder sucesso, o modal fecha e a lista é atualizada. Se falhar, a interface mostra uma mensagem amigável e não simula sucesso.

## Banco necessário para multigêneros e histórico

Execute no pgAdmin:

```sql
banco_de_dados/melhorias_nota10.sql
```

Esse script cria as tabelas `genero`, `livro_genero`, `subgenero`, `livro_subgenero` e `historico_livro`, além das views de dashboard e códigos de funcionário.
