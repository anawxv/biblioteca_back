# Biblioteca App

Front-end mobile-first em React + Vite para um sistema de biblioteca, inspirado nas referências visuais enviadas: fundo branco, rosa como cor principal, cards arredondados, botões arredondados e experiência de aplicativo centralizada também no desktop.

## O que está pronto

- Tela inicial com escolha entre cliente e funcionário
- Login e cadastro
- Catálogo do cliente com busca, categorias, carrossel e listas
- Tela de categorias
- Detalhes do livro com favoritos e solicitação de empréstimo
- Meus empréstimos com abas de ativos e histórico
- Perfil do cliente com edição local
- Painel do bibliotecário com métricas, ações rápidas, empréstimos recentes e gráficos
- Fluxos de adicionar livro, remover livro, registrar empréstimo e registrar devolução
- Camada de serviço centralizada em `src/services/api.js`
- Mocks temporários com persistência em memória para facilitar a troca pela API real

## Tecnologias

- React
- Vite
- React Router
- CSS puro, sem dependência visual externa

## Como executar

1. Instale as dependências:

```bash
npm install
```

No PowerShell do Windows, se houver bloqueio do script `npm`, use:

```bash
npm.cmd install
```

2. Crie seu arquivo de ambiente:

```bash
cp .env.example .env
```

No Windows, você também pode simplesmente duplicar o arquivo `.env.example` e renomear para `.env`.

3. Rode o projeto:

```bash
npm run dev
```

Ou no Windows:

```bash
npm.cmd run dev
```

4. Gere o build de produção:

```bash
npm run build
```

## Variáveis de ambiente

O projeto já inclui:

```env
VITE_API_URL=http://localhost:8080/api
```

## Integração com API real

A camada de integração está em `src/services/api.js` e já expõe as funções:

- `login`
- `cadastrarUsuario`
- `listarLivros`
- `buscarLivros`
- `detalharLivro`
- `listarCategorias`
- `solicitarEmprestimo`
- `listarMeusEmprestimos`
- `devolverLivro`
- `listarDashboard`
- `adicionarLivro`
- `excluirLivro`
- `registrarEmprestimo`
- `registrarDevolucao`
- `listarLivrosMaisEmprestados`
- `listarLivrosRecentes`
- `listarGenerosMaisConsumidos`

Enquanto a API não responde, o projeto usa fallback automático para os mocks definidos em `src/mocks/mockServer.js`.

## Endpoints mapeados

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

## Observações sobre os mocks

- A exclusão de livro só remove o item da interface quando a operação retorna sucesso.
- O fluxo de empréstimo bloqueia clientes com multa pendente e livros indisponíveis.
- O fluxo de devolução calcula multa por atraso.
- As buscas administrativas de clientes e empréstimos ativos usam helpers mockados até que o backend exponha endpoints equivalentes.

## Credenciais mock para teste

- Cliente: `joaosilva@gmail.com` / `123456`
- Funcionária: `ana@biblioteca.com` / `123456`

## Estrutura principal

```text
src/
  components/
  context/
  mocks/
  pages/
  services/
  utils/
```
