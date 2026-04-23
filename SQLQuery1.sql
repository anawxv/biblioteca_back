
USE BibliotecaDB;
GO

CREATE TABLE emprestimo (
    id_emprestimo INT PRIMARY KEY IDENTITY(1,1),
    id_usuario INT FOREIGN KEY REFERENCES usuario(id_usuario),
    id_livro INT FOREIGN KEY REFERENCES livro(id_livro),
    data_emprestimo DATETIME DEFAULT GETDATE(),
    data_prevista_devolucao DATETIME,
    data_devolucao DATETIME,
    valor_multa DECIMAL(10,2) DEFAULT 0.00
);
GO