-- Atualiza apenas livros que ainda usam capa local/vazia e por isso caem no fallback rosa.
-- Nao apaga dados, nao recria tabelas e nao altera regras de negocio.
-- Capas confirmadas na Open Library com default=false antes de entrar neste script.

BEGIN;

UPDATE livro l
SET
    titulo = 'Harry Potter e a Pedra Filosofal',
    autor = 'J. K. Rowling',
    isbn = '9788532511010',
    editora = 'Editora Rocco',
    ano_publicacao = 2000,
    paginas = 223,
    descricao = 'Primeiro livro da série Harry Potter, em que Harry descobre ser bruxo e entra para Hogwarts.',
    imagem_capa = 'https://covers.openlibrary.org/b/id/14512053-L.jpg',
    id_categoria = COALESCE((SELECT id_categoria FROM categoria WHERE lower(nome) = lower('Fantasia') LIMIT 1), l.id_categoria),
    ativo = TRUE
WHERE l.id_livro = 1
  AND (l.imagem_capa IS NULL OR btrim(l.imagem_capa) = '' OR l.imagem_capa !~* '^https?://')
  AND NOT EXISTS (
      SELECT 1 FROM livro outro
      WHERE outro.isbn = '9788532511010'
        AND outro.id_livro <> l.id_livro
  );

UPDATE livro l
SET
    titulo = 'O Cálice dos Deuses',
    autor = 'Rick Riordan',
    isbn = '9786555606492',
    editora = 'Intrínseca',
    ano_publicacao = 2023,
    paginas = 278,
    descricao = 'Percy Jackson encara uma nova missão envolvendo deuses gregos, amizade e muita aventura.',
    imagem_capa = 'https://covers.openlibrary.org/b/id/14596529-L.jpg',
    id_categoria = COALESCE((SELECT id_categoria FROM categoria WHERE lower(nome) = lower('Fantasia') LIMIT 1), l.id_categoria),
    ativo = TRUE
WHERE l.id_livro = 4
  AND (l.imagem_capa IS NULL OR btrim(l.imagem_capa) = '' OR l.imagem_capa !~* '^https?://')
  AND NOT EXISTS (
      SELECT 1 FROM livro outro
      WHERE outro.isbn = '9786555606492'
        AND outro.id_livro <> l.id_livro
  );

UPDATE livro l
SET
    titulo = 'O Pequeno Príncipe',
    autor = 'Antoine de Saint-Exupéry',
    isbn = '9788532531551',
    editora = 'Agir',
    ano_publicacao = 1943,
    paginas = 96,
    descricao = 'Clássico poético sobre amizade, infância e as descobertas de um pequeno príncipe entre planetas.',
    imagem_capa = 'https://covers.openlibrary.org/b/id/8570014-L.jpg',
    id_categoria = COALESCE((SELECT id_categoria FROM categoria WHERE lower(nome) = lower('Infantil') LIMIT 1), l.id_categoria),
    ativo = TRUE
WHERE l.id_livro = 2
  AND (l.imagem_capa IS NULL OR btrim(l.imagem_capa) = '' OR l.imagem_capa !~* '^https?://')
  AND NOT EXISTS (
      SELECT 1 FROM livro outro
      WHERE outro.isbn = '9788532531551'
        AND outro.id_livro <> l.id_livro
  );

UPDATE livro l
SET
    titulo = 'Vermelho, Branco e Sangue Azul',
    autor = 'Casey McQuiston',
    isbn = '9781250316776',
    editora = 'St. Martin''s Griffin',
    ano_publicacao = 2019,
    paginas = 432,
    descricao = 'Romance contemporâneo sobre política, identidade e uma relação inesperada entre Alex e Henry.',
    imagem_capa = 'https://covers.openlibrary.org/b/id/9171544-L.jpg',
    id_categoria = COALESCE((SELECT id_categoria FROM categoria WHERE lower(nome) = lower('Romance') LIMIT 1), l.id_categoria),
    ativo = TRUE
WHERE l.id_livro = 6
  AND (l.imagem_capa IS NULL OR btrim(l.imagem_capa) = '' OR l.imagem_capa !~* '^https?://')
  AND NOT EXISTS (
      SELECT 1 FROM livro outro
      WHERE outro.isbn = '9781250316776'
        AND outro.id_livro <> l.id_livro
  );

COMMIT;
