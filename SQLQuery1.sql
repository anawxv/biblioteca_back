CREATE TABLE Usuario (
    id INT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL
);

CREATE TABLE Livro (
    id INT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    emprestado BIT NOT NULL
);

CREATE TABLE Emprestimo (
    id INT PRIMARY KEY IDENTITY,
    id_usuario INT NOT NULL,
    id_livro INT NOT NULL,
    data_emprestimo DATE NOT NULL,
    data_devolucao DATE,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id),
    FOREIGN KEY (id_livro) REFERENCES Livro(id)
);