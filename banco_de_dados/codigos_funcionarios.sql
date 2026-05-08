CREATE TABLE IF NOT EXISTS codigo_funcionario (
    id_codigo SERIAL PRIMARY KEY,
    codigo VARCHAR(80) NOT NULL UNIQUE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usado_em TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_codigo_funcionario_codigo
ON codigo_funcionario (LOWER(codigo));

-- Exemplo para teste local. Troque/remova em produção acadêmica conforme a regra do grupo.
INSERT INTO codigo_funcionario (codigo, ativo, usado)
VALUES ('ABC123', TRUE, FALSE)
ON CONFLICT (codigo) DO NOTHING;
