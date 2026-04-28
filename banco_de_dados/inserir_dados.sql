INSERT INTO categoria (nome) VALUES
('Romance'),
('Fantasia'),
('Aventura'),
('Ficção Científica'),
('Suspense'),
('Mistério'),
('Horror'),
('Biografia'),
('História'),
('Filosofia'),
('Psicologia'),
('Autoajuda'),
('Educação'),
('Infantil'),
('Poesia'),
('Drama'),
('Humor'),
('Nacionais');

INSERT INTO usuario (nome, email, senha_hash, telefone, tipo_usuario)
VALUES ('Administrador Biblioteca', 'admin@biblioteca.com', '123456', '(11)99999-9999', 'FUNCIONARIO');

INSERT INTO funcionario (id_funcionario, cargo, administrador)
VALUES (currval('usuario_id_usuario_seq'), 'BIBLIOTECARIO', TRUE);

INSERT INTO usuario (nome, email, senha_hash, telefone, tipo_usuario)
VALUES ('João Silva', 'joao@gmail.com', '123456', '(11)91234-5678', 'CLIENTE');

INSERT INTO cliente (id_cliente, limite_emprestimos)
VALUES (currval('usuario_id_usuario_seq'), 3);

INSERT INTO usuario (nome, email, senha_hash, telefone, tipo_usuario)
VALUES ('Maria Rodrigues', 'maria@gmail.com', '123456', '(11)98765-4321', 'CLIENTE');

INSERT INTO cliente (id_cliente, limite_emprestimos)
VALUES (currval('usuario_id_usuario_seq'), 3);

INSERT INTO livro (
    titulo, autor, isbn, descricao, ano_publicacao, paginas, editora,
    quantidade_total, quantidade_disponivel, id_categoria, imagem_capa
) VALUES
('Harry Potter e a Pedra Filosofal', 'J. K. Rowling', '9788532511010', 'Um garoto descobre que é bruxo e começa sua jornada em Hogwarts.', 1997, 264, 'Rocco', 5, 5, 2, 'harry_potter.jpg'),

('O Pequeno Príncipe', 'Antoine de Saint-Exupéry', '9788595081512', 'Uma história poética sobre amizade, amor e responsabilidade.', 1943, 96, 'Agir', 4, 4, 1, 'pequeno_principe.jpg'),

('É Assim que Acaba', 'Colleen Hoover', '9788501112514', 'Romance dramático sobre escolhas, amor e superação.', 2016, 368, 'Galera', 3, 3, 1, 'e_assim_que_acaba.jpg'),

('O Cálice dos Deuses', 'Rick Riordan', '9786555607890', 'Percy Jackson retorna em uma nova aventura mitológica.', 2023, 288, 'Intrínseca', 2, 2, 2, 'calice_dos_deuses.jpg'),

('A Empregada', 'Freida McFadden', '9786555654481', 'Suspense psicológico cheio de mistério.', 2022, 304, 'Arqueiro', 3, 3, 5, 'a_empregada.jpg'),

('Vermelho, Branco e Sangue Azul', 'Casey McQuiston', '9788555340940', 'Romance contemporâneo com política, humor e emoção.', 2019, 392, 'Seguinte', 2, 2, 1, 'vermelho_branco_sangue_azul.jpg');

INSERT INTO emprestimo (
    id_cliente, id_livro, id_funcionario, data_emprestimo, data_prevista_devolucao, status
) VALUES
(2, 1, 1, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '10 days', 'ATIVO'),
(3, 2, 1, CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '5 days', 'ATRASADO');
