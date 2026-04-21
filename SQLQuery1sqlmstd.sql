CREATE TABLE emprestimo (
    id_emprestimo INT PRIMARY KEY IDENTITY(1,1),

    id_cliente INT NOT NULL,
    id_livro INT NOT NULL,
    id_funcionario INT NOT NULL,

    data_emprestimo DATETIME NOT NULL DEFAULT GETDATE(),
    data_prevista DATETIME NOT NULL,
    data_devolucao DATETIME,

    status VARCHAR(20),

    CONSTRAINT FK_cliente FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    CONSTRAINT FK_livro FOREIGN KEY (id_livro) REFERENCES livro(id_livro),
    CONSTRAINT FK_func FOREIGN KEY (id_funcionario) REFERENCES funcionario(id_funcionario)
);

CREATE TABLE multa (
    id_multa INT PRIMARY KEY IDENTITY(1,1),
    id_emprestimo INT NOT NULL,
    valor DECIMAL(10,2),
    status VARCHAR(20),

    FOREIGN KEY (id_emprestimo) REFERENCES emprestimo(id_emprestimo)
);

CREATE TABLE reserva (
    id_reserva INT PRIMARY KEY IDENTITY(1,1),
    id_cliente INT NOT NULL,
    id_livro INT NOT NULL,
    data_reserva DATETIME DEFAULT GETDATE(),
    status VARCHAR(20),

    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    FOREIGN KEY (id_livro) REFERENCES livro(id_livro)
);