USE [BibliotecaDB];
GO
DROP TABLE IF EXISTS Emprestimo;
DROP TABLE IF EXISTS Livro;
GO


CREATE TABLE Livro (
    idLivro INT PRIMARY KEY IDENTITY(1,1),
    titulo VARCHAR(150) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    categoria VARCHAR(50),
    emprestado BIT DEFAULT 0
);
GO


CREATE TABLE Emprestimo (
    idEmprestimo INT PRIMARY KEY IDENTITY(1,1),
    id_cliente INT, 
    id_livro INT FOREIGN KEY REFERENCES Livro(idLivro),
    data_emprestimo DATE,
    data_devolucao DATE
);
GO