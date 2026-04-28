CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('CLIENTE', 'FUNCIONARIO')),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    bloqueado BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cliente (
    id_cliente INTEGER PRIMARY KEY,
    limite_emprestimos INTEGER NOT NULL DEFAULT 3,
    FOREIGN KEY (id_cliente) REFERENCES usuario(id_usuario)
);

CREATE TABLE funcionario (
    id_funcionario INTEGER PRIMARY KEY,
    cargo VARCHAR(50) NOT NULL DEFAULT 'BIBLIOTECARIO',
    administrador BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (id_funcionario) REFERENCES usuario(id_usuario)
);

CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,
    nome VARCHAR(80) NOT NULL UNIQUE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE livro (
    id_livro SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    autor VARCHAR(150) NOT NULL,
    isbn VARCHAR(30) UNIQUE,
    descricao TEXT,
    ano_publicacao INTEGER,
    paginas INTEGER,
    editora VARCHAR(120),
    quantidade_total INTEGER NOT NULL DEFAULT 1 CHECK (quantidade_total >= 0),
    quantidade_disponivel INTEGER NOT NULL DEFAULT 1 CHECK (quantidade_disponivel >= 0),
    id_categoria INTEGER NOT NULL,
    imagem_capa VARCHAR(255),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);

CREATE TABLE emprestimo (
    id_emprestimo SERIAL PRIMARY KEY,
    id_cliente INTEGER NOT NULL,
    id_livro INTEGER NOT NULL,
    id_funcionario INTEGER,
    data_emprestimo DATE NOT NULL DEFAULT CURRENT_DATE,
    data_prevista_devolucao DATE NOT NULL,
    data_devolucao DATE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('ATIVO', 'DEVOLVIDO', 'ATRASADO', 'CANCELADO')),
    observacao TEXT,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    FOREIGN KEY (id_livro) REFERENCES livro(id_livro),
    FOREIGN KEY (id_funcionario) REFERENCES funcionario(id_funcionario)
);

CREATE TABLE multa (
    id_multa SERIAL PRIMARY KEY,
    id_emprestimo INTEGER NOT NULL UNIQUE,
    valor NUMERIC(10,2) NOT NULL CHECK (valor >= 0),
    paga BOOLEAN NOT NULL DEFAULT FALSE,
    motivo VARCHAR(200),
    criada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_emprestimo) REFERENCES emprestimo(id_emprestimo) ON DELETE CASCADE
);

CREATE TABLE favorito (
    id_cliente INTEGER NOT NULL,
    id_livro INTEGER NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_cliente, id_livro),
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente) ON DELETE CASCADE,
    FOREIGN KEY (id_livro) REFERENCES livro(id_livro) ON DELETE CASCADE
);

CREATE TABLE reserva (
    id_reserva SERIAL PRIMARY KEY,
    id_cliente INTEGER NOT NULL,
    id_livro INTEGER NOT NULL,
    data_reserva TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL CHECK (status IN ('ATIVA', 'ATENDIDA', 'CANCELADA')),
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    FOREIGN KEY (id_livro) REFERENCES livro(id_livro)
);
