-- Oculta livros criados por testes QA/Playwright.
-- Sem DROP. Sem DELETE. Exclusao logica (ativo=false).

UPDATE livro
SET ativo = false,
    atualizado_em = CURRENT_TIMESTAMP
WHERE titulo ILIKE 'Fluxo QA%'
   OR titulo ILIKE 'TESTE_PLAYWRIGHT_%';
