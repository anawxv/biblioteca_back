USE [BibliotecaDB]
GO
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Livro')
BEGIN
    CREATE TABLE Livro (
        idLivro INT PRIMARY KEY IDENTITY(1,1),
        titulo VARCHAR(150) NOT NULL,
        autor VARCHAR(100) NOT NULL,
        categoria VARCHAR(50),
        emprestado BIT DEFAULT 0
    );
END
GO