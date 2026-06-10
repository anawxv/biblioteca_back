# Relatorio QA AP1 - 20260609133422

Total: 76 | Validados: 75 | Pendentes:  | Falhas: 0

TESTE 1 - Classe de dominio Livro
CenÃ¡rio: Arquivo model/Livro.java com @Entity e @Table
Resultado: Entidade JPA presente e mapeada
Status: Validado
EvidÃªncia: backend_java/.../model/Livro.java

TESTE 2 - Classe de dominio Usuario
CenÃ¡rio: Arquivo model/Usuario.java com @Entity e @Table
Resultado: Entidade JPA presente e mapeada
Status: Validado
EvidÃªncia: backend_java/.../model/Usuario.java

TESTE 3 - Classe de dominio Cliente
CenÃ¡rio: Arquivo model/Cliente.java com @Entity e @Table
Resultado: Entidade JPA presente e mapeada
Status: Validado
EvidÃªncia: backend_java/.../model/Cliente.java

TESTE 4 - Classe de dominio Funcionario
CenÃ¡rio: Arquivo model/Funcionario.java com @Entity e @Table
Resultado: Entidade JPA presente e mapeada
Status: Validado
EvidÃªncia: backend_java/.../model/Funcionario.java

TESTE 5 - Classe de dominio Emprestimo
CenÃ¡rio: Arquivo model/Emprestimo.java com @Entity e @Table
Resultado: Entidade JPA presente e mapeada
Status: Validado
EvidÃªncia: backend_java/.../model/Emprestimo.java

TESTE 6 - Classe de dominio Multa
CenÃ¡rio: Arquivo model/Multa.java com @Entity e @Table
Resultado: Entidade JPA presente e mapeada
Status: Validado
EvidÃªncia: backend_java/.../model/Multa.java

TESTE 7 - Classe de dominio Reserva
CenÃ¡rio: Arquivo model/Reserva.java com @Entity e @Table
Resultado: Entidade JPA presente e mapeada
Status: Validado
EvidÃªncia: backend_java/.../model/Reserva.java

TESTE 8 - Criacao das tabelas
CenÃ¡rio: Tabelas obrigatorias no schema public
Resultado: Todas as 9 tabelas existem
Status: Validado
EvidÃªncia: SQL: SELECT tablename FROM pg_tables WHERE schemaname='public'

TESTE 9 - Conexao PostgreSQL
CenÃ¡rio: JDBC biblioteca@localhost:5432
Resultado: Conexao OK
Status: Validado
EvidÃªncia: DbExec: SELECT 1

TESTE 10 - Persistencia de dados
CenÃ¡rio: Livros ativos no banco
Resultado: 146 livros ativos persistidos
Status: Validado
EvidÃªncia: SQL: SELECT COUNT(*) FROM livro WHERE ativo=true

TESTE 11 - Relacionamentos no banco
CenÃ¡rio: FKs usuario-cliente, usuario-funcionario, emprestimo
Resultado: cliente=14 funcionario=8 emprestimo=16
Status: Validado
EvidÃªncia: SQL JOINs cliente/funcionario/emprestimo

TESTE 12 - DER na pratica pelo banco
CenÃ¡rio: Constraints FK no PostgreSQL
Resultado: 18 foreign keys no schema public
Status: Validado
EvidÃªncia: SQL: information_schema.table_constraints

TESTE 13 - Entidades mapeadas corretamente
CenÃ¡rio: Todas as 7 entidades com @Entity/@Table
Resultado: 7/7 entidades mapeadas
Status: Validado
EvidÃªncia: Inspecao model/*.java

TESTE 14 - Relacionamento Usuario -> Cliente
CenÃ¡rio: @OneToOne @MapsId em Cliente
Resultado: Cliente.id = Usuario.id
Status: Validado
EvidÃªncia: Cliente.java

TESTE 15 - Relacionamento Usuario -> Funcionario
CenÃ¡rio: @OneToOne @MapsId em Funcionario
Resultado: Funcionario.id = Usuario.id
Status: Validado
EvidÃªncia: Funcionario.java

TESTE 16 - Relacionamento Cliente -> Emprestimo
CenÃ¡rio: @ManyToOne id_cliente
Resultado: Emprestimo referencia Cliente
Status: Validado
EvidÃªncia: Emprestimo.java

TESTE 17 - Relacionamento Livro -> Emprestimo
CenÃ¡rio: @ManyToOne id_livro
Resultado: Emprestimo referencia Livro
Status: Validado
EvidÃªncia: Emprestimo.java

TESTE 18 - Relacionamento Emprestimo -> Multa
CenÃ¡rio: @ManyToOne id_emprestimo em Multa
Resultado: Multa referencia Emprestimo
Status: Validado
EvidÃªncia: Multa.java

TESTE 19 - Entidade Reserva operacional
CenÃ¡rio: ReservaRepository + tabela reserva
Resultado: Reserva mapeada e tabela existe
Status: Validado
EvidÃªncia: ReservaRepository.java

TESTE 20 - Repositories funcionando
CenÃ¡rio: Interfaces JpaRepository presentes
Resultado: 7 repositories encontrados
Status: Validado
EvidÃªncia: repository/*.java

TESTE 21 - UsuarioService
CenÃ¡rio: Cadastro e listagem de usuarios
Resultado: Service presente
Status: Validado
EvidÃªncia: UsuarioService.java

TESTE 22 - EmprestimoService
CenÃ¡rio: Registrar emprestimo e devolucao
Resultado: Service presente
Status: Validado
EvidÃªncia: EmprestimoService.java

TESTE 23 - DashboardService
CenÃ¡rio: Metricas reais do banco
Resultado: Service presente
Status: Validado
EvidÃªncia: DashboardService.java

TESTE 24 - Login cliente
CenÃ¡rio: POST /api/auth/login cliente.demo@biblioteca.com
Resultado: id=31 tipo=CLIENTE
Status: Validado
EvidÃªncia: curl POST /api/auth/login

TESTE 25 - Login funcionario
CenÃ¡rio: POST /api/auth/login funcionario.demo@biblioteca.com
Resultado: id=32 tipo=FUNCIONARIO
Status: Validado
EvidÃªncia: curl POST /api/auth/login

TESTE 26 - Bloqueio de acesso por perfil
CenÃ¡rio: ProtectedRoute redireciona perfil errado
Resultado: Rota protegida por role
Status: Validado
EvidÃªncia: ProtectedRoute.jsx

TESTE 27 - Senha criptografada com BCrypt
CenÃ¡rio: senha_hash no banco
Resultado: prefixo $2a$10$
Status: Validado
EvidÃªncia: SQL: SELECT senha_hash FROM usuario

TESTE 28 - API /api/livros
CenÃ¡rio: GET listagem
Resultado: HTTP 200 count=146
Status: Validado
EvidÃªncia: curl GET /api/livros

TESTE 29 - API /api/categorias
CenÃ¡rio: GET categorias
Resultado: HTTP 200 total=18
Status: Validado
EvidÃªncia: curl GET /api/categorias

TESTE 30 - API /api/dashboard
CenÃ¡rio: GET metricas
Resultado: livros=146 clientes=14
Status: Validado
EvidÃªncia: curl GET /api/dashboard

TESTE 31 - API /api/auth/login
CenÃ¡rio: Login valido e invalido
Resultado: valido=200 invalido=400
Status: Validado
EvidÃªncia: curl POST /api/auth/login

TESTE 32 - API /api/emprestimos
CenÃ¡rio: GET atrasados
Resultado: HTTP 200
Status: Validado
EvidÃªncia: curl GET /api/emprestimos/atrasados

TESTE 33 - API /api/clientes
CenÃ¡rio: GET listagem
Resultado: count=14
Status: Validado
EvidÃªncia: curl GET /api/clientes

TESTE 34 - API /api/funcionarios
CenÃ¡rio: GET listagem
Resultado: count=8
Status: Validado
EvidÃªncia: curl GET /api/funcionarios

TESTE 35 - Busca por texto sem erro bytea/lower
CenÃ¡rio: GET /livros?busca=...
Resultado: titulo=1 autor=3 cat=18
Status: Validado
EvidÃªncia: curl GET /api/livros?busca=1808

TESTE 36 - Evitar recursao infinita JSON
CenÃ¡rio: Profundidade JSON finita em /livros
Resultado: JSON serializado sem recursao infinita
Status: Validado
EvidÃªncia: GET /api/livros depth-check

TESTE 37 - API sem dados fake/fallback falso
CenÃ¡rio: Dashboard bate com COUNT do banco
Resultado: dashboard=146 banco=146
Status: Validado
EvidÃªncia: SQL COUNT vs GET /api/dashboard

TESTE 38 - Emprestimo com livro disponivel
CenÃ¡rio: livro=4 cliente=31
Resultado: id=20 status=ATIVO
Status: Validado
EvidÃªncia: curl POST /api/emprestimos

TESTE 39 - Confirmar indisponibilidade/quantidade
CenÃ¡rio: qty diminui apos emprestimo
Resultado: antes=2 depois=1
Status: Validado
EvidÃªncia: SQL quantidade_disponivel

TESTE 40 - Tentativa com livro indisponivel
CenÃ¡rio: qty=0
Resultado: Livro indisponivel.
Status: Validado
EvidÃªncia: curl POST /api/emprestimos livro indisponivel

TESTE 41 - Cliente bloqueado por atraso
CenÃ¡rio: emprestimo vencido ativo
Resultado: Cliente possui emprestimo em atraso.
Status: Validado
EvidÃªncia: curl POST /api/emprestimos com atraso

TESTE 42 - Limite/restricao usuario bloqueado
CenÃ¡rio: usuario.bloqueado=true
Resultado: Cliente bloqueado.
Status: Validado
EvidÃªncia: SQL UPDATE bloqueado + POST emprestimo

TESTE 43 - Historico sincronizado com banco real
CenÃ¡rio: GET cliente vs COUNT SQL
Resultado: api_ativos=2 api_hist=4 sql=6
Status: Validado
EvidÃªncia: GET /api/emprestimos/cliente/{id}

TESTE 44 - Devolucao no prazo
CenÃ¡rio: emprestimo=20
Resultado: status=DEVOLVIDO sem multa
Status: Validado
EvidÃªncia: curl POST /api/emprestimos/{id}/devolver

TESTE 45 - Livro volta a ficar disponivel
CenÃ¡rio: qty restaurada
Resultado: qty=2 esperado=2
Status: Validado
EvidÃªncia: SQL quantidade_disponivel pos-devolucao

TESTE 46 - Devolucao com atraso
CenÃ¡rio: emprestimo=21 (5 dias)
Resultado: fineApplied=True amount=10.00
Status: Validado
EvidÃªncia: curl POST devolver atrasado

TESTE 47 - Calculo multa R$ 2,00 por dia
CenÃ¡rio: 5 dias = R$ 10,00
Resultado: R$ 10.00
Status: Validado
EvidÃªncia: SQL SELECT * FROM multa + API fineAmount

TESTE 48 - Estatisticas reais do banco
CenÃ¡rio: GET /api/dashboard vs SQL
Resultado: API responde com metricas
Status: Validado
EvidÃªncia: curl GET /api/dashboard

TESTE 49 - Livros no acervo
CenÃ¡rio: GET /api/dashboard vs SQL
Resultado: api=146 sql=146
Status: Validado
EvidÃªncia: curl GET /api/dashboard

TESTE 50 - Clientes cadastrados
CenÃ¡rio: GET /api/dashboard vs SQL
Resultado: api=14 sql=14
Status: Validado
EvidÃªncia: curl GET /api/dashboard

TESTE 51 - Funcionarios cadastrados
CenÃ¡rio: GET /api/dashboard vs SQL
Resultado: api=8 sql=8
Status: Validado
EvidÃªncia: curl GET /api/dashboard

TESTE 52 - Emprestimos ativos
CenÃ¡rio: GET /api/dashboard vs SQL
Resultado: api=4 sql=4
Status: Validado
EvidÃªncia: curl GET /api/dashboard

TESTE 53 - Atrasados
CenÃ¡rio: emprestimosAtrasados
Resultado: api=0 sql=0
Status: Validado
EvidÃªncia: SQL emprestimos vencidos

TESTE 54 - Multas pendentes
CenÃ¡rio: multasPendentes
Resultado: api=30.00 sql=30.00
Status: Validado
EvidÃªncia: SQL SUM multa WHERE paga=false

TESTE 55 - Livros indisponiveis
CenÃ¡rio: livrosIndisponiveis
Resultado: api=1 sql=1
Status: Validado
EvidÃªncia: SQL livros qty<=0

TESTE 56 - Livros mais emprestados
CenÃ¡rio: GET /dashboard/livros-mais-emprestados
Resultado: livros=10
Status: Validado
EvidÃªncia: curl GET /api/dashboard/livros-mais-emprestados

TESTE 57 - Generos mais consumidos
CenÃ¡rio: GET /dashboard/generos-mais-consumidos
Resultado: pontos=6
Status: Validado
EvidÃªncia: curl GET /api/dashboard/generos-mais-consumidos

TESTE 58 - Cadastro livro dados validos
CenÃ¡rio: POST /livros
Resultado: id=161
Status: Validado
EvidÃªncia: curl POST /api/livros

TESTE 59 - Cadastro livro campos obrigatorios vazios
CenÃ¡rio: POST sem titulo/autor
Resultado: HTTP 400 rejeitado
Status: Validado
EvidÃªncia: curl POST /api/livros campos vazios

TESTE 60 - Edicao de livro
CenÃ¡rio: PUT /livros/{id}
Resultado: titulo=Editado 20260609133422
Status: Validado
EvidÃªncia: curl PUT /api/livros/161

TESTE 61 - Exclusao logica de livro
CenÃ¡rio: DELETE soft delete
Resultado: ativo=false no banco
Status: Validado
EvidÃªncia: SQL SELECT ativo FROM livro

TESTE 62 - Busca por titulo
CenÃ¡rio: busca=1808
Resultado: found=1
Status: Validado
EvidÃªncia: curl GET /api/livros?busca=1808

TESTE 63 - Busca por autor
CenÃ¡rio: busca=Laurentino
Resultado: found=3
Status: Validado
EvidÃªncia: curl GET /api/livros?busca=Laurentino

TESTE 64 - Busca por categoria
CenÃ¡rio: busca=Hist
Resultado: found=18
Status: Validado
EvidÃªncia: curl GET /api/livros?busca=Hist

TESTE 65 - Busca inexistente
CenÃ¡rio: sem resultado
Resultado: found=0
Status: Validado
EvidÃªncia: curl GET /api/livros?busca=XYZINEXISTENTE999

TESTE 66 - Disponibilidade correta
CenÃ¡rio: livro=9
Resultado: disponivel=3
Status: Validado
EvidÃªncia: curl GET /api/livros/9

TESTE 67 - Fluxo completo cadastro-consulta-emprestimo-devolucao
CenÃ¡rio: Ciclo ponta a ponta
Resultado: cadastro=162 emprestimo=22 qty_antes=3 qty_pos_emp=2 qty_pos_dev=3
Status: Validado
EvidÃªncia: Sequencia POST livro/emprestimo/devolver + SQL qty

TESTE 68 - Cadastro cliente
CenÃ¡rio: POST /usuarios CLIENTE
Resultado: id=41
Status: Validado
EvidÃªncia: curl POST /api/usuarios

TESTE 69 - Cadastro funcionario
CenÃ¡rio: POST /usuarios FUNCIONARIO codigo=DEMO-2026-001
Resultado: id=42
Status: Validado
EvidÃªncia: curl POST /api/usuarios

TESTE 70 - Atualizacao de dados do usuario
CenÃ¡rio: ProfilePage updateProfile
Resultado: Edicao de perfil no front (localStorage)
Status: Pendente
EvidÃªncia: ProfilePage.jsx - persistencia no back-end nao implementada

TESTE 71 - Login valido
CenÃ¡rio: cliente e funcionario demo
Resultado: cliente=True funcionario=True
Status: Validado
EvidÃªncia: curl POST /api/auth/login

TESTE 72 - Login invalido
CenÃ¡rio: senha errada
Resultado: HTTP 400
Status: Validado
EvidÃªncia: curl POST /api/auth/login senha errada

TESTE 73 - Frontend sobe
CenÃ¡rio: Vite :5173
Resultado: HTTP 200
Status: Validado
EvidÃªncia: curl http://localhost:5173/

TESTE 74 - Build backend
CenÃ¡rio: mvnw package
Resultado: jar=True
Status: Validado
EvidÃªncia: backend_java/target/*.jar

TESTE 75 - Build frontend
CenÃ¡rio: npm run build
Resultado: dist=True
Status: Validado
EvidÃªncia: frontend/dist/index.html

TESTE 76 - Screenshots Playwright 16 telas
CenÃ¡rio: frontend/test-results/screenshots/
Resultado: 16/16 geradas
Status: Validado
EvidÃªncia: frontend/test-results/screenshots/*.png

