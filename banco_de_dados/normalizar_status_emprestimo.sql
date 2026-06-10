-- Normaliza status antigos de emprestimo para valores tecnicos.
-- Execute manualmente no pgAdmin. Script seguro e nao destrutivo.

UPDATE emprestimo
SET status = 'ATIVO'
WHERE status IN ('Dentro do prazo', 'Devolucao breve', 'DEVOLUCAO_BREVE', 'EM_ANDAMENTO')
  AND data_devolucao IS NULL;

UPDATE emprestimo
SET status = 'DEVOLVIDO'
WHERE data_devolucao IS NOT NULL
  AND status <> 'DEVOLVIDO';

UPDATE emprestimo
SET status = 'ATIVO'
WHERE status = 'ATRASADO'
  AND data_devolucao IS NULL;

-- Atraso ativo deve ser calculado por data_prevista_devolucao < CURRENT_DATE,
-- mantendo status tecnico persistido como ATIVO ate a devolucao.
