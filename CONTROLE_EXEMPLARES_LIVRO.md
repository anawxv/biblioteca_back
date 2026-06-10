# Controle de Exemplares Físicos dos Livros

## Problema anterior

O sistema controlava apenas `quantidade_total` e `quantidade_disponivel` na tabela `livro`.  
Se um título tinha 5 cópias, não era possível saber **qual exemplar físico** foi emprestado para cada cliente.

## Solução

Foi criada a tabela `exemplar_livro`, com um código de tombo único por cópia física (ex.: `HP-001`, `HP-002`).

### Tabela `exemplar_livro`

| Coluna | Descrição |
|--------|-----------|
| `id_exemplar` | Identificador do exemplar |
| `id_livro` | Livro ao qual o exemplar pertence |
| `codigo_tombo` | Código legível (ex.: HP-003) |
| `status` | `DISPONIVEL`, `EMPRESTADO` ou `INATIVO` |
| `ativo` | Se o exemplar está ativo no acervo |
| `criado_em` | Data de criação |

### Relações

```
livro (1) ──→ (N) exemplar_livro
emprestimo (N) ──→ (1) exemplar_livro  [opcional, id_exemplar pode ser NULL em histórico antigo]
```

### Fluxo de empréstimo

1. Funcionário registra empréstimo de um livro.
2. O sistema busca o primeiro exemplar com `status = DISPONIVEL` e `ativo = true`.
3. O exemplar é vinculado ao empréstimo (`emprestimo.id_exemplar`).
4. O exemplar passa para `EMPRESTADO`.
5. `quantidade_disponivel` do livro diminui em 1.

### Fluxo de devolução

1. Funcionário registra devolução.
2. Se o empréstimo tem `id_exemplar`, o exemplar volta para `DISPONIVEL`.
3. `quantidade_disponivel` do livro aumenta em 1.
4. Multa por atraso continua funcionando normalmente.

### Empréstimos antigos

Empréstimos criados antes da migração podem ter `id_exemplar = NULL`.  
O sistema **não quebra**: na interface do funcionário aparece **"Sem tombo"**.

## Scripts SQL

| Arquivo | Função |
|---------|--------|
| `banco_de_dados/add_exemplares_livro.sql` | Cria tabela, coluna e popula exemplares |
| `banco_de_dados/limpar_dados_demo.sql` | Atualiza nomes/e-mails de teste |

## Como aplicar no pgAdmin

1. Abra o pgAdmin e conecte ao banco `biblioteca`.
2. Abra **Query Tool**.
3. Execute `banco_de_dados/add_exemplares_livro.sql`.
4. Execute `banco_de_dados/limpar_dados_demo.sql` (opcional, para apresentação).
5. Reinicie o backend Spring Boot.

## Comandos de validação

```sql
SELECT * FROM exemplar_livro LIMIT 20;

SELECT
    e.id_emprestimo,
    u.nome AS cliente,
    l.titulo,
    ex.codigo_tombo,
    e.status
FROM emprestimo e
JOIN cliente c ON c.id_cliente = e.id_cliente
JOIN usuario u ON u.id_usuario = c.id_cliente
JOIN livro l ON l.id_livro = e.id_livro
LEFT JOIN exemplar_livro ex ON ex.id_exemplar = e.id_exemplar
ORDER BY e.id_emprestimo DESC;
```

## API

```
GET /api/livros/{id}/exemplares
```

Retorno:

```json
[
  { "idExemplar": 1, "codigoTombo": "HP-001", "status": "DISPONIVEL", "ativo": true }
]
```

## Interface (discreta)

O código do exemplar aparece apenas nas telas do **funcionário**:

- Registrar empréstimo — "Próximo exemplar disponível: HP-003"
- Registrar devolução — "Exemplar: HP-003"
- Dashboard / listas de empréstimos — linha discreta com `muted-text`

A tela do **cliente** não exibe o tombo.

## Como apresentar ao professor

1. Mostre um livro com várias cópias no banco (`exemplar_livro`).
2. Registre um empréstimo e mostre que o sistema escolheu automaticamente um exemplar.
3. Consulte o empréstimo e mostre o código (ex.: HP-003) vinculado ao cliente.
4. Registre a devolução e mostre que o exemplar voltou para `DISPONIVEL`.
5. Execute o SQL de validação para provar a relação empréstimo → exemplar.

## Credenciais demo (senha: Demo123!)

- `cliente.demo@biblioteca.com`
- `funcionario.demo@biblioteca.com`
- Contas migradas de teste mantêm a mesma senha BCrypt existente.
