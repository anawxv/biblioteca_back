-- Permite status PENDENTE e RECUSADA na tabela emprestimo (solicitações de empréstimo).
ALTER TABLE emprestimo DROP CONSTRAINT IF EXISTS emprestimo_status_check;
ALTER TABLE emprestimo ADD CONSTRAINT emprestimo_status_check
    CHECK (status IN ('PENDENTE', 'ATIVO', 'DEVOLVIDO', 'ATRASADO', 'RECUSADA', 'CANCELADO'));
