-- Dados demo seguros para testes e apresentacao.
-- Sem DROP, sem DELETE, sem recriar tabelas.
-- Senha padrao dos usuarios demo: Demo123! (BCrypt)

-- ============================================================
-- 1. Codigos de funcionario para demonstracao
-- ============================================================
INSERT INTO codigo_funcionario (codigo, ativo, usado)
VALUES
    ('PROF-2026-001', TRUE, FALSE),
    ('PROF-2026-002', TRUE, FALSE),
    ('DEMO-2026-001', TRUE, FALSE)
ON CONFLICT (codigo) DO UPDATE
SET ativo = TRUE,
    usado = FALSE,
    usado_em = NULL;

-- ============================================================
-- 2. Usuario cliente demo (BCrypt)
-- ============================================================
DO $$
DECLARE
    v_hash TEXT := '$2a$10$CXImPWC28UeRpURoU.LH.eNbTQn9vm/guMDca2SH9MKdnyJUmtZBq';
    v_id   INTEGER;
BEGIN
    SELECT id_usuario INTO v_id FROM usuario WHERE lower(email) = lower('cliente.demo@biblioteca.com');

    IF v_id IS NULL THEN
        INSERT INTO usuario (nome, email, senha_hash, telefone, tipo_usuario, ativo, bloqueado)
        VALUES ('Cliente Demo', 'cliente.demo@biblioteca.com', v_hash, '(11)90000-0001', 'CLIENTE', TRUE, FALSE)
        RETURNING id_usuario INTO v_id;

        INSERT INTO cliente (id_cliente, limite_emprestimos)
        VALUES (v_id, 3)
        ON CONFLICT (id_cliente) DO NOTHING;
    ELSE
        UPDATE usuario
        SET senha_hash = v_hash,
            ativo = TRUE,
            bloqueado = FALSE,
            atualizado_em = CURRENT_TIMESTAMP
        WHERE id_usuario = v_id;

        INSERT INTO cliente (id_cliente, limite_emprestimos)
        VALUES (v_id, 3)
        ON CONFLICT (id_cliente) DO NOTHING;
    END IF;
END $$;

-- ============================================================
-- 3. Usuario funcionario demo (BCrypt)
-- ============================================================
DO $$
DECLARE
    v_hash TEXT := '$2a$10$CXImPWC28UeRpURoU.LH.eNbTQn9vm/guMDca2SH9MKdnyJUmtZBq';
    v_id   INTEGER;
BEGIN
    SELECT id_usuario INTO v_id FROM usuario WHERE lower(email) = lower('funcionario.demo@biblioteca.com');

    IF v_id IS NULL THEN
        INSERT INTO usuario (nome, email, senha_hash, telefone, tipo_usuario, ativo, bloqueado)
        VALUES ('Funcionario Demo', 'funcionario.demo@biblioteca.com', v_hash, '(11)90000-0002', 'FUNCIONARIO', TRUE, FALSE)
        RETURNING id_usuario INTO v_id;

        INSERT INTO funcionario (id_funcionario, cargo, administrador)
        VALUES (v_id, 'BIBLIOTECARIO', FALSE)
        ON CONFLICT (id_funcionario) DO NOTHING;
    ELSE
        UPDATE usuario
        SET senha_hash = v_hash,
            ativo = TRUE,
            bloqueado = FALSE,
            atualizado_em = CURRENT_TIMESTAMP
        WHERE id_usuario = v_id;

        INSERT INTO funcionario (id_funcionario, cargo, administrador)
        VALUES (v_id, 'BIBLIOTECARIO', FALSE)
        ON CONFLICT (id_funcionario) DO NOTHING;
    END IF;
END $$;

-- ============================================================
-- 4. Reset seguro para bateria de testes (sem DELETE)
-- ============================================================
DO $$
DECLARE
    v_cliente INTEGER;
BEGIN
    SELECT id_usuario INTO v_cliente FROM usuario WHERE lower(email) = lower('cliente.demo@biblioteca.com');

    IF v_cliente IS NOT NULL THEN
        UPDATE usuario SET bloqueado = FALSE, ativo = TRUE WHERE id_usuario = v_cliente;

        UPDATE livro l
           SET quantidade_disponivel = LEAST(l.quantidade_total, l.quantidade_disponivel + sub.qtd)
          FROM (
              SELECT e.id_livro, COUNT(*) AS qtd
                FROM emprestimo e
               WHERE e.id_cliente = v_cliente
                 AND e.status = 'ATIVO'
               GROUP BY e.id_livro
          ) sub
         WHERE l.id_livro = sub.id_livro;

        UPDATE emprestimo
           SET status = 'DEVOLVIDO',
               data_devolucao = CURRENT_DATE
         WHERE id_cliente = v_cliente
           AND status = 'ATIVO';

        UPDATE multa
           SET paga = TRUE
         WHERE id_emprestimo IN (
               SELECT id_emprestimo FROM emprestimo WHERE id_cliente = v_cliente
           )
           AND paga = FALSE;
    END IF;
END $$;
