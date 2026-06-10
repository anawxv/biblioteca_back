-- Corrige nomes/e-mails duplicados ou de teste em clientes.
-- Sem DELETE. Senhas permanecem inalteradas (BCrypt existente).
-- Senha padrao das contas demo: Demo123!

DO $$
DECLARE
    r RECORD;
    v_nomes TEXT[] := ARRAY[
        'Ana Clara Souza',
        'Beatriz Oliveira',
        'Hiroshi Tanaka',
        'Mariana Lima',
        'Rafael Santos',
        'Camila Rocha',
        'Lucas Almeida',
        'Fernanda Costa',
        'Joao Pedro Martins',
        'Juliana Mendes',
        'Pedro Henrique Dias',
        'Larissa Nunes',
        'Thiago Barbosa',
        'Patricia Gomes',
        'Rodrigo Freitas'
    ];
    v_emails TEXT[] := ARRAY[
        'ana.clara.souza@biblioteca.com',
        'beatriz.oliveira@biblioteca.com',
        'hiroshi.tanaka@biblioteca.com',
        'mariana.lima@biblioteca.com',
        'rafael.santos@biblioteca.com',
        'camila.rocha@biblioteca.com',
        'lucas.almeida@biblioteca.com',
        'fernanda.costa@biblioteca.com',
        'joao.martins@biblioteca.com',
        'juliana.mendes@biblioteca.com',
        'pedro.dias@biblioteca.com',
        'larissa.nunes@biblioteca.com',
        'thiago.barbosa@biblioteca.com',
        'patricia.gomes@biblioteca.com',
        'rodrigo.freitas@biblioteca.com'
    ];
    v_phones TEXT[] := ARRAY[
        '(11) 91234-1001',
        '(11) 91234-1002',
        '(11) 91234-1003',
        '(11) 91234-1004',
        '(11) 91234-1005',
        '(11) 91234-1006',
        '(11) 91234-1007',
        '(11) 91234-1008',
        '(11) 91234-1009',
        '(11) 91234-1010',
        '(11) 91234-1011',
        '(11) 91234-1012',
        '(11) 91234-1013',
        '(11) 91234-1014',
        '(11) 91234-1015'
    ];
    v_idx INTEGER := 0;
    v_total INTEGER;
    v_nome TEXT;
    v_email TEXT;
    v_phone TEXT;
BEGIN
    v_total := array_length(v_nomes, 1);

    FOR r IN
        WITH clientes_alvo AS (
            SELECT
                u.id_usuario,
                u.nome,
                u.email,
                c.id_cliente,
                COUNT(*) OVER (PARTITION BY lower(trim(u.nome))) AS qtd_mesmo_nome
            FROM usuario u
            JOIN cliente c ON c.id_cliente = u.id_usuario
            WHERE u.tipo_usuario = 'CLIENTE'
              AND lower(u.email) <> lower('cliente.demo@biblioteca.com')
        )
        SELECT id_usuario, id_cliente
        FROM clientes_alvo
        WHERE qtd_mesmo_nome > 1
           OR lower(nome) LIKE '%codex%'
           OR lower(email) LIKE '%codex%'
           OR lower(nome) LIKE '%cliente teste%'
           OR lower(nome) LIKE '%ngrok%'
           OR lower(email) LIKE '%ngrok%'
           OR lower(email) LIKE '%@email.com.%'
           OR lower(email) LIKE '%test.com%'
           OR lower(email) LIKE '%teste.com%'
           OR lower(email) LIKE 'qa.%'
           OR lower(nome) LIKE '%qa %'
        ORDER BY id_cliente
    LOOP
        v_idx := v_idx + 1;
        v_nome := v_nomes[((v_idx - 1) % v_total) + 1];
        v_email := v_emails[((v_idx - 1) % v_total) + 1];
        v_phone := v_phones[((v_idx - 1) % v_total) + 1];

        IF EXISTS (
            SELECT 1
            FROM usuario u2
            WHERE lower(u2.email) = lower(v_email)
              AND u2.id_usuario <> r.id_usuario
        ) THEN
            v_email := split_part(v_email, '@', 1) || '.' || r.id_cliente::TEXT || '@' || split_part(v_email, '@', 2);
        END IF;

        UPDATE usuario
        SET nome = v_nome,
            email = v_email,
            telefone = COALESCE(NULLIF(trim(telefone), ''), v_phone)
        WHERE id_usuario = r.id_usuario;
    END LOOP;
END $$;

-- Garante conta demo apresentavel
UPDATE usuario
SET nome = 'Cliente Demo',
    email = 'cliente.demo@biblioteca.com'
WHERE lower(email) = lower('cliente.demo@biblioteca.com');
