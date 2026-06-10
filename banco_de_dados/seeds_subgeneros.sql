-- Seeds opcionais de subgeneros. Execute depois de melhorias_nota10.sql.

INSERT INTO subgenero (id_categoria, nome)
SELECT c.id_categoria, v.nome
FROM categoria c
JOIN (VALUES
    ('Fantasia', 'Fantasia epica'),
    ('Fantasia', 'Fantasia urbana'),
    ('Fantasia', 'Fantasia sombria'),
    ('Fantasia', 'Mitologia'),
    ('Romance', 'Romance contemporaneo'),
    ('Romance', 'Romance historico'),
    ('Romance', 'Romance jovem adulto'),
    ('Suspense', 'Suspense psicologico'),
    ('Suspense', 'Suspense policial'),
    ('Mistério', 'Misterio investigativo'),
    ('MistÃ©rio', 'Misterio investigativo')
) AS v(categoria, nome) ON lower(c.nome) = lower(v.categoria)
ON CONFLICT (id_categoria, nome) DO NOTHING;
