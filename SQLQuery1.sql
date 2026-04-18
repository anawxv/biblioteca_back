CREATE TABLE emprestimo (
    id_emprestimo SERIAL PRIMARY KEY,

    id_cliente INT NOT NULL,
    id_livro INT NOT NULL,
    id_funcionario INT NOT NULL,

    data_emprestimo DATE NOT NULL,
    data_prevista DATE NOT NULL,
    data_devolucao DATE,

    status VARCHAR(20),

    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    FOREIGN KEY (id_livro) REFERENCES livro(id_livro),
    FOREIGN KEY (id_funcionario) REFERENCES funcionario(id_funcionario)
);

CREATE TABLE multa (
    id_multa SERIAL PRIMARY KEY,
    id_emprestimo INT NOT NULL,
    valor DECIMAL(10,2),
    status VARCHAR(20),

    FOREIGN KEY (id_emprestimo) REFERENCES emprestimo(id_emprestimo)
);

CREATE TABLE reserva (
    id_reserva SERIAL PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_livro INT NOT NULL,
    data_reserva DATE,
    status VARCHAR(20),

    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    FOREIGN KEY (id_livro) REFERENCES livro(id_livro)
);
