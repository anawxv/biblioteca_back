INSERT INTO emprestimo (
    id_cliente,
    id_livro,
    id_funcionario,
    data_emprestimo,
    data_prevista,
    status
)
VALUES (
    1,
    1,
    1,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '7 days',
    'EM_ANDAMENTO'
);
