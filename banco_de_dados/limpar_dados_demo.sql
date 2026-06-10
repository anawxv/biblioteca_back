-- Limpeza de nomes/e-mails de teste para apresentação.
-- Sem DELETE. Senhas permanecem inalteradas (BCrypt existente).
-- Senha padrão dos usuários demo: Demo123!

-- ============================================================
-- Clientes com nomes de teste → nomes reais (um e-mail por linha)
-- ============================================================
DO $$
DECLARE
    r RECORD;
    v_nomes TEXT[] := ARRAY[
        'Hiroshi Tanaka',
        'Ana Clara Souza',
        'Mariana Lima',
        'Rafael Santos',
        'Beatriz Oliveira'
    ];
    v_emails TEXT[] := ARRAY[
        'hiroshi.tanaka@email.com',
        'ana.clara@email.com',
        'mariana.lima@email.com',
        'rafael.santos@email.com',
        'beatriz.oliveira@email.com'
    ];
    v_idx INTEGER := 1;
BEGIN
    FOR r IN
        SELECT id_usuario
        FROM usuario
        WHERE tipo_usuario = 'CLIENTE'
          AND (
              lower(nome) LIKE '%codex%'
              OR lower(email) LIKE '%codex%'
              OR lower(nome) LIKE '%cliente teste%'
              OR lower(nome) LIKE '%ngrok%'
              OR lower(email) LIKE '%ngrok%'
              OR lower(email) LIKE '%test.com%'
              OR lower(email) LIKE '%teste.com%'
              OR lower(email) LIKE 'qa.%'
              OR lower(nome) LIKE '%qa %'
              OR lower(nome) LIKE '%teste gen%'
          )
          AND lower(email) <> lower('cliente.demo@biblioteca.com')
        ORDER BY id_usuario
    LOOP
        UPDATE usuario
        SET nome = v_nomes[((v_idx - 1) % array_length(v_nomes, 1)) + 1],
            email = v_emails[((v_idx - 1) % array_length(v_emails, 1)) + 1] || '.' || r.id_usuario
        WHERE id_usuario = r.id_usuario
          AND NOT EXISTS (
              SELECT 1
              FROM usuario u2
              WHERE lower(u2.email) = lower(v_emails[((v_idx - 1) % array_length(v_emails, 1)) + 1] || '.' || r.id_usuario)
                AND u2.id_usuario <> r.id_usuario
          );
        v_idx := v_idx + 1;
    END LOOP;
END $$;

-- Mantém conta demo oficial
UPDATE usuario
SET nome = 'Cliente Demo'
WHERE lower(email) = lower('cliente.demo@biblioteca.com')
  AND (nome IS NULL OR trim(nome) = '');

-- ============================================================
-- Funcionários com nomes de teste → nomes reais
-- ============================================================
DO $$
DECLARE
    r RECORD;
    v_nomes TEXT[] := ARRAY[
        'Gustavo Kanomato',
        'Ana Lívia Vieira',
        'Raquel Rodrigues',
        'Cesar Caetano'
    ];
    v_emails TEXT[] := ARRAY[
        'gustavo.kanomato@biblioteca.com',
        'ana.vieira@biblioteca.com',
        'raquel.rodrigues@biblioteca.com',
        'cesar.caetano@biblioteca.com'
    ];
    v_idx INTEGER := 1;
BEGIN
    FOR r IN
        SELECT id_usuario
        FROM usuario
        WHERE tipo_usuario = 'FUNCIONARIO'
          AND (
              lower(nome) LIKE '%codex%'
              OR lower(email) LIKE '%codex%'
              OR lower(nome) LIKE '%ngrok%'
              OR lower(email) LIKE '%ngrok%'
              OR lower(email) LIKE 'qa.%'
              OR lower(nome) LIKE '%funcionario teste%'
              OR lower(email) LIKE '%test.com%'
          )
          AND lower(email) <> lower('funcionario.demo@biblioteca.com')
        ORDER BY id_usuario
    LOOP
        UPDATE usuario
        SET nome = v_nomes[((v_idx - 1) % array_length(v_nomes, 1)) + 1],
            email = split_part(v_emails[((v_idx - 1) % array_length(v_emails, 1)) + 1], '@', 1)
                || '.' || r.id_usuario || '@'
                || split_part(v_emails[((v_idx - 1) % array_length(v_emails, 1)) + 1], '@', 2)
        WHERE id_usuario = r.id_usuario;
        v_idx := v_idx + 1;
    END LOOP;
END $$;

UPDATE usuario
SET nome = 'Funcionário Demo'
WHERE lower(email) = lower('funcionario.demo@biblioteca.com')
  AND (nome IS NULL OR trim(nome) = '');

-- ============================================================
-- Credenciais demo documentadas (senha: Demo123!)
-- ============================================================
-- cliente.demo@biblioteca.com / Demo123!
-- funcionario.demo@biblioteca.com / Demo123!
-- Contas migradas recebem sufixo .{id_usuario} no e-mail para evitar duplicidade.
