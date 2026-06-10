-- Correcoes seguras de categorias dos dados de exemplo.
-- Nao apaga livros. Atualiza apenas quando o titulo corresponde.

UPDATE livro
SET id_categoria = (SELECT id_categoria FROM categoria WHERE lower(nome) = lower('Fantasia') LIMIT 1)
WHERE lower(titulo) LIKE lower('%Harry Potter%')
  AND EXISTS (SELECT 1 FROM categoria WHERE lower(nome) = lower('Fantasia'));

UPDATE livro
SET id_categoria = (SELECT id_categoria FROM categoria WHERE lower(nome) = lower('Fantasia') LIMIT 1)
WHERE lower(titulo) LIKE lower('%Cálice dos Deuses%')
  AND EXISTS (SELECT 1 FROM categoria WHERE lower(nome) = lower('Fantasia'));

UPDATE livro
SET id_categoria = (SELECT id_categoria FROM categoria WHERE lower(nome) = lower('Infantil') LIMIT 1)
WHERE lower(titulo) LIKE lower('%Pequeno Príncipe%')
  AND EXISTS (SELECT 1 FROM categoria WHERE lower(nome) = lower('Infantil'));

UPDATE livro
SET id_categoria = (SELECT id_categoria FROM categoria WHERE lower(nome) = lower('Suspense') LIMIT 1)
WHERE lower(titulo) LIKE lower('%A Empregada%')
  AND EXISTS (SELECT 1 FROM categoria WHERE lower(nome) = lower('Suspense'));

UPDATE livro
SET id_categoria = (SELECT id_categoria FROM categoria WHERE lower(nome) = lower('Romance') LIMIT 1)
WHERE lower(titulo) LIKE lower('%É Assim que Acaba%')
  AND EXISTS (SELECT 1 FROM categoria WHERE lower(nome) = lower('Romance'));

UPDATE livro
SET id_categoria = (SELECT id_categoria FROM categoria WHERE lower(nome) = lower('Romance') LIMIT 1)
WHERE lower(titulo) LIKE lower('%Vermelho, Branco e Sangue Azul%')
  AND EXISTS (SELECT 1 FROM categoria WHERE lower(nome) = lower('Romance'));
