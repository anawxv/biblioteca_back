DROP TABLE IF EXISTS emprestimo;
DROP TABLE IF EXISTS multa;
DROP TABLE IF EXISTS reserva;
DROP TABLE IF EXISTS emprestimo;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS livro;

CREATE TABLE livro (
    id_livro INT PRIMARY KEY IDENTITY(1,1),
    titulo VARCHAR(150) NOT NULL,
    isbn VARCHAR(50) UNIQUE NOT NULL,
    ano INT,
    quantidade INT
);


CREATE TABLE usuario (
    id_usuario INT PRIMARY KEY IDENTITY(1,1),
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(50) NOT NULL,
    telefone VARCHAR(20),
    cargo VARCHAR(50), 
    tipo VARCHAR(20)  
);

CREATE TABLE emprestimo (
    id_emprestimo INT PRIMARY KEY IDENTITY(1,1),
    id_usuario INT NOT NULL,
    id_livro INT NOT NULL,
    data_emprestimo DATETIME DEFAULT GETDATE(),
    status VARCHAR(20) DEFAULT 'ATIVO',
    CONSTRAINT FK_usuario_emp FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    CONSTRAINT FK_livro_emp FOREIGN KEY (id_livro) REFERENCES livro(id_livro)
);