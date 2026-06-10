-- Limpeza segura de dados temporarios de testes.
-- Sem DROP. Sem DELETE destrutivo. Apenas exclusao logica / ajustes de apresentacao.
-- Senhas permanecem inalteradas.

-- ============================================================
-- 1. Livros de teste (Fluxo QA, Playwright, etc.)
-- ============================================================
UPDATE livro
SET ativo = false,
    atualizado_em = CURRENT_TIMESTAMP
WHERE titulo ILIKE 'Fluxo QA%'
   OR titulo ILIKE 'TESTE_PLAYWRIGHT_%'
   OR titulo ILIKE 'QA Livro%'
   OR titulo ILIKE 'Livro Teste%';

-- ============================================================
-- 2. Usuarios de teste QA (mantem registro, oculta de listas ativas)
-- ============================================================
UPDATE usuario
SET ativo = false,
    bloqueado = true
WHERE lower(email) LIKE 'qa.%'
   OR lower(email) LIKE '%@test.com'
   OR lower(email) LIKE '%@teste.com'
   OR lower(nome) LIKE '%codex%'
   OR lower(nome) LIKE '%ngrok%'
   OR lower(nome) LIKE 'qa %'
   OR lower(nome) LIKE '%cliente teste%';

-- Restaura contas demo oficiais
UPDATE usuario
SET ativo = true,
    bloqueado = false
WHERE lower(email) IN (
    lower('cliente.demo@biblioteca.com'),
    lower('funcionario.demo@biblioteca.com')
);

-- ============================================================
-- Validacao
-- ============================================================
-- SELECT id_livro, titulo, ativo FROM livro WHERE titulo ILIKE 'Fluxo QA%';
-- SELECT id_livro, titulo, ativo FROM livro WHERE titulo ILIKE 'TESTE_PLAYWRIGHT_%';
