-- Controle de exemplares físicos dos livros.
-- Seguro: sem DROP, sem DELETE, sem recriar tabelas existentes.
-- Pode ser executado mais de uma vez sem erro.

-- ============================================================
-- 1. Tabela exemplar_livro
-- ============================================================
CREATE TABLE IF NOT EXISTS exemplar_livro (
    id_exemplar SERIAL PRIMARY KEY,
    id_livro INTEGER NOT NULL REFERENCES livro(id_livro),
    codigo_tombo VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'DISPONIVEL',
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exemplar_livro_id_livro ON exemplar_livro(id_livro);
CREATE INDEX IF NOT EXISTS idx_exemplar_livro_status ON exemplar_livro(status);

-- ============================================================
-- 2. Coluna id_exemplar em emprestimo (se ainda não existir)
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'emprestimo'
          AND column_name = 'id_exemplar'
    ) THEN
        ALTER TABLE emprestimo
            ADD COLUMN id_exemplar INTEGER NULL REFERENCES exemplar_livro(id_exemplar);
    END IF;
END $$;

-- ============================================================
-- 3. Função auxiliar: sigla do título
-- ============================================================
CREATE OR REPLACE FUNCTION fn_sigla_livro(p_titulo TEXT, p_id_livro INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_titulo TEXT;
    v_palavra TEXT;
    v_sigla TEXT := '';
    v_palavras TEXT[];
    v_ignorar TEXT[] := ARRAY['E', 'A', 'O', 'DE', 'DA', 'DO', 'DAS', 'DOS', 'EM', 'NO', 'NA', 'NOS', 'NAS'];
BEGIN
    v_titulo := upper(regexp_replace(coalesce(p_titulo, ''), '[^A-Za-z0-9 ]', ' ', 'g'));
    v_palavras := regexp_split_to_array(trim(v_titulo), '\s+');

    FOREACH v_palavra IN ARRAY v_palavras LOOP
        IF v_palavra IS NULL OR v_palavra = '' THEN
            CONTINUE;
        END IF;
        IF v_palavra = ANY (v_ignorar) THEN
            CONTINUE;
        END IF;
        v_sigla := v_sigla || left(v_palavra, 1);
        IF length(v_sigla) >= 4 THEN
            EXIT;
        END IF;
    END LOOP;

    IF length(v_sigla) < 2 THEN
        RETURN 'LIVRO-' || p_id_livro::TEXT;
    END IF;

    RETURN v_sigla;
END;
$$;

-- ============================================================
-- 4. Popular exemplares com base em quantidade_total
-- ============================================================
DO $$
DECLARE
    r_livro RECORD;
    v_sigla TEXT;
    v_seq INTEGER;
    v_total INTEGER;
    v_existentes INTEGER;
    v_codigo TEXT;
    v_emprestados INTEGER;
    v_id_exemplar INTEGER;
BEGIN
    FOR r_livro IN
        SELECT id_livro, titulo, quantidade_total, quantidade_disponivel
        FROM livro
        WHERE ativo = TRUE
        ORDER BY id_livro
    LOOP
        v_total := GREATEST(COALESCE(r_livro.quantidade_total, 0), 0);
        IF v_total = 0 THEN
            CONTINUE;
        END IF;

        SELECT COUNT(*) INTO v_existentes
        FROM exemplar_livro
        WHERE id_livro = r_livro.id_livro;

        v_sigla := fn_sigla_livro(r_livro.titulo, r_livro.id_livro);

        FOR v_seq IN (v_existentes + 1)..v_total LOOP
            IF strpos(v_sigla, 'LIVRO-') = 1 THEN
                v_codigo := v_sigla || '-' || lpad(v_seq::TEXT, 3, '0');
            ELSE
                v_codigo := v_sigla || '-' || lpad(v_seq::TEXT, 3, '0');
            END IF;

            INSERT INTO exemplar_livro (id_livro, codigo_tombo, status, ativo)
            VALUES (r_livro.id_livro, v_codigo, 'DISPONIVEL', TRUE)
            ON CONFLICT (codigo_tombo) DO NOTHING;
        END LOOP;

        -- Sincronizar status EMPRESTADO com quantidade emprestada (sem alterar empréstimos antigos)
        v_emprestados := GREATEST(v_total - COALESCE(r_livro.quantidade_disponivel, 0), 0);

        UPDATE exemplar_livro
        SET status = 'DISPONIVEL'
        WHERE id_livro = r_livro.id_livro
          AND status = 'EMPRESTADO'
          AND id_exemplar NOT IN (
              SELECT e.id_exemplar
              FROM emprestimo emp
              JOIN exemplar_livro e ON e.id_exemplar = emp.id_exemplar
              WHERE emp.data_devolucao IS NULL
                AND emp.id_livro = r_livro.id_livro
          );

        FOR v_id_exemplar IN
            SELECT id_exemplar
            FROM exemplar_livro
            WHERE id_livro = r_livro.id_livro
              AND ativo = TRUE
              AND status = 'DISPONIVEL'
            ORDER BY id_exemplar
            LIMIT v_emprestados
        LOOP
            UPDATE exemplar_livro
            SET status = 'EMPRESTADO'
            WHERE id_exemplar = v_id_exemplar;
        END LOOP;
    END LOOP;
END $$;

-- ============================================================
-- 5. Vincular empréstimos ativos sem exemplar (quando possível)
-- ============================================================
DO $$
DECLARE
    r_emp RECORD;
    v_exemplar_id INTEGER;
BEGIN
    FOR r_emp IN
        SELECT e.id_emprestimo, e.id_livro
        FROM emprestimo e
        WHERE e.data_devolucao IS NULL
          AND e.id_exemplar IS NULL
        ORDER BY e.id_emprestimo
    LOOP
        SELECT ex.id_exemplar INTO v_exemplar_id
        FROM exemplar_livro ex
        WHERE ex.id_livro = r_emp.id_livro
          AND ex.ativo = TRUE
          AND ex.status = 'EMPRESTADO'
          AND ex.id_exemplar NOT IN (
              SELECT COALESCE(emp.id_exemplar, 0)
              FROM emprestimo emp
              WHERE emp.id_exemplar IS NOT NULL
          )
        ORDER BY ex.id_exemplar
        LIMIT 1;

        IF v_exemplar_id IS NOT NULL THEN
            UPDATE emprestimo
            SET id_exemplar = v_exemplar_id
            WHERE id_emprestimo = r_emp.id_emprestimo
              AND id_exemplar IS NULL;
        END IF;
    END LOOP;
END $$;
