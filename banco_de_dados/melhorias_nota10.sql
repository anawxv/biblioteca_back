-- Melhorias incrementais para o projeto Biblioteca.
-- Execute este arquivo no pgAdmin depois dos scripts originais.
-- Nao apaga dados, nao recria tabelas existentes e evita operacoes destrutivas.

CREATE TABLE IF NOT EXISTS genero (
    id_genero SERIAL PRIMARY KEY,
    nome VARCHAR(80) UNIQUE NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS livro_genero (
    id_livro INTEGER NOT NULL,
    id_genero INTEGER NOT NULL,
    PRIMARY KEY (id_livro, id_genero),
    CONSTRAINT fk_livro_genero_livro FOREIGN KEY (id_livro) REFERENCES livro(id_livro),
    CONSTRAINT fk_livro_genero_genero FOREIGN KEY (id_genero) REFERENCES genero(id_genero)
);

CREATE TABLE IF NOT EXISTS subgenero (
    id_subgenero SERIAL PRIMARY KEY,
    id_categoria INTEGER NOT NULL,
    nome VARCHAR(100) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_subgenero_categoria FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria),
    CONSTRAINT uk_subgenero_categoria_nome UNIQUE (id_categoria, nome)
);

CREATE TABLE IF NOT EXISTS livro_subgenero (
    id_livro INTEGER NOT NULL,
    id_subgenero INTEGER NOT NULL,
    PRIMARY KEY (id_livro, id_subgenero),
    CONSTRAINT fk_livro_subgenero_livro FOREIGN KEY (id_livro) REFERENCES livro(id_livro),
    CONSTRAINT fk_livro_subgenero_subgenero FOREIGN KEY (id_subgenero) REFERENCES subgenero(id_subgenero)
);

CREATE TABLE IF NOT EXISTS historico_livro (
    id_historico SERIAL PRIMARY KEY,
    id_livro INTEGER,
    id_funcionario INTEGER,
    acao VARCHAR(30) NOT NULL,
    dados_anteriores TEXT,
    dados_novos TEXT,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_historico_livro FOREIGN KEY (id_livro) REFERENCES livro(id_livro),
    CONSTRAINT fk_historico_funcionario FOREIGN KEY (id_funcionario) REFERENCES funcionario(id_funcionario)
);

CREATE TABLE IF NOT EXISTS codigo_funcionario (
    id_codigo SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usado_em TIMESTAMP
);

INSERT INTO codigo_funcionario (codigo, ativo, usado)
VALUES
    ('FUNC-2026-001', TRUE, FALSE),
    ('FUNC-2026-002', TRUE, FALSE),
    ('BIBLIOTECARIO-AP1', TRUE, FALSE)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO genero (nome)
VALUES
    ('Romance'), ('Comedia'), ('Drama'), ('Fantasia'), ('Aventura'),
    ('Suspense'), ('Misterio'), ('Ficcao Cientifica'), ('Historia'), ('Infantil')
ON CONFLICT (nome) DO NOTHING;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_livro_quantidade_total_nao_negativa') THEN
        ALTER TABLE livro ADD CONSTRAINT chk_livro_quantidade_total_nao_negativa CHECK (quantidade_total >= 0) NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_livro_quantidade_disponivel_nao_negativa') THEN
        ALTER TABLE livro ADD CONSTRAINT chk_livro_quantidade_disponivel_nao_negativa CHECK (quantidade_disponivel >= 0) NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_livro_quantidade_disponivel_total') THEN
        ALTER TABLE livro ADD CONSTRAINT chk_livro_quantidade_disponivel_total CHECK (quantidade_disponivel <= quantidade_total) NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_livro_paginas_positivas') THEN
        ALTER TABLE livro ADD CONSTRAINT chk_livro_paginas_positivas CHECK (paginas IS NULL OR paginas > 0) NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_livro_ano_publicacao_intervalo') THEN
        ALTER TABLE livro ADD CONSTRAINT chk_livro_ano_publicacao_intervalo CHECK (ano_publicacao IS NULL OR ano_publicacao BETWEEN 1000 AND 2100) NOT VALID;
    END IF;
END $$;

-- As constraints acima ficam NOT VALID para nao quebrar a execucao se houver dado antigo fora da regra.
-- Depois de corrigir eventuais dados invalidos, valide manualmente com:
-- ALTER TABLE livro VALIDATE CONSTRAINT nome_da_constraint;

CREATE INDEX IF NOT EXISTS idx_livro_titulo ON livro (titulo);
CREATE INDEX IF NOT EXISTS idx_livro_autor ON livro (autor);
CREATE INDEX IF NOT EXISTS idx_livro_isbn ON livro (isbn);
CREATE INDEX IF NOT EXISTS idx_livro_ativo ON livro (ativo);
CREATE INDEX IF NOT EXISTS idx_livro_categoria ON livro (id_categoria);
CREATE INDEX IF NOT EXISTS idx_usuario_email ON usuario (email);
CREATE INDEX IF NOT EXISTS idx_usuario_tipo ON usuario (tipo_usuario);
CREATE INDEX IF NOT EXISTS idx_emprestimo_cliente ON emprestimo (id_cliente);
CREATE INDEX IF NOT EXISTS idx_emprestimo_livro ON emprestimo (id_livro);
CREATE INDEX IF NOT EXISTS idx_emprestimo_status ON emprestimo (status);
CREATE INDEX IF NOT EXISTS idx_multa_paga ON multa (paga);
CREATE INDEX IF NOT EXISTS idx_genero_nome ON genero (nome);
CREATE INDEX IF NOT EXISTS idx_subgenero_nome ON subgenero (nome);

CREATE OR REPLACE VIEW vw_dashboard_resumo AS
SELECT
    (SELECT COUNT(*) FROM livro WHERE ativo = TRUE) AS livros_no_acervo,
    (SELECT COUNT(*) FROM cliente) AS clientes_cadastrados,
    (SELECT COUNT(*) FROM emprestimo WHERE status = 'ATIVO') AS emprestimos_ativos,
    (SELECT COUNT(*) FROM emprestimo WHERE status = 'ATIVO' AND data_prevista_devolucao < CURRENT_DATE) AS emprestimos_atrasados,
    (SELECT COALESCE(SUM(valor), 0) FROM multa WHERE paga = FALSE) AS multas_pendentes,
    (SELECT COUNT(*) FROM livro WHERE ativo = TRUE AND quantidade_disponivel <= 0) AS livros_indisponiveis;

CREATE OR REPLACE VIEW vw_livros_mais_emprestados AS
SELECT
    l.id_livro,
    l.titulo,
    COUNT(e.id_emprestimo) AS total_emprestimos
FROM livro l
LEFT JOIN emprestimo e ON e.id_livro = l.id_livro
GROUP BY l.id_livro, l.titulo
ORDER BY total_emprestimos DESC;

CREATE OR REPLACE VIEW vw_generos_mais_consumidos AS
SELECT
    COALESCE(g.nome, c.nome) AS genero,
    COUNT(e.id_emprestimo) AS total_emprestimos
FROM emprestimo e
JOIN livro l ON l.id_livro = e.id_livro
JOIN categoria c ON c.id_categoria = l.id_categoria
LEFT JOIN livro_genero lg ON lg.id_livro = l.id_livro
LEFT JOIN genero g ON g.id_genero = lg.id_genero
GROUP BY COALESCE(g.nome, c.nome)
ORDER BY total_emprestimos DESC;

CREATE OR REPLACE VIEW vw_emprestimos_atrasados AS
SELECT
    e.id_emprestimo,
    u.nome AS nome_cliente,
    u.email AS email_cliente,
    l.titulo AS titulo_livro,
    e.data_emprestimo,
    e.data_prevista_devolucao,
    GREATEST(0, CURRENT_DATE - e.data_prevista_devolucao) AS dias_atraso
FROM emprestimo e
JOIN cliente c ON c.id_cliente = e.id_cliente
JOIN usuario u ON u.id_usuario = c.id_cliente
JOIN livro l ON l.id_livro = e.id_livro
WHERE e.status = 'ATIVO'
  AND e.data_prevista_devolucao < CURRENT_DATE;

CREATE OR REPLACE VIEW vw_multas_pendentes AS
SELECT
    m.id_multa,
    u.nome AS nome_cliente,
    u.email AS email_cliente,
    l.titulo AS titulo_livro,
    m.valor,
    m.motivo,
    m.paga
FROM multa m
JOIN emprestimo e ON e.id_emprestimo = m.id_emprestimo
JOIN cliente c ON c.id_cliente = e.id_cliente
JOIN usuario u ON u.id_usuario = c.id_cliente
JOIN livro l ON l.id_livro = e.id_livro
WHERE m.paga = FALSE;

CREATE OR REPLACE FUNCTION fn_livro_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_livro_atualizado_em ON livro;
CREATE TRIGGER trg_livro_atualizado_em
BEFORE UPDATE ON livro
FOR EACH ROW
EXECUTE FUNCTION fn_livro_atualizado_em();
