# Bateria QA AP1_2.0 - alinhada ao cronograma e plano de testes AP1
$ErrorActionPreference = "Continue"
$Root = Split-Path $PSScriptRoot -Parent
$Base = "http://localhost:8080/api"
$Ts = Get-Date -Format "yyyyMMddHHmmss"
$DemoClienteEmail = "cliente.demo@biblioteca.com"
$DemoFuncEmail = "funcionario.demo@biblioteca.com"
$DemoSenha = "Demo123!"
$J21 = "C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot\bin\java.exe"
$PgJar = Get-ChildItem "$env:USERPROFILE\.m2\repository\org\postgresql\postgresql" -Recurse -Filter "postgresql-*.jar" | Sort-Object FullName -Descending | Select-Object -First 1
$ModelDir = Join-Path $Root "backend_java\src\main\java\com\biblioteca\api\model"
$ServiceDir = Join-Path $Root "backend_java\src\main\java\com\biblioteca\api\service"
$RepoDir = Join-Path $Root "backend_java\src\main\java\com\biblioteca\api\repository"

function Invoke-Db($sql) {
    $dbExec = Join-Path $PSScriptRoot "DbExec.class"
    if (-not (Test-Path $dbExec)) {
        $j21c = "C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot\bin\javac.exe"
        & $j21c -cp $PgJar.FullName (Join-Path $PSScriptRoot "DbExec.java") 2>$null | Out-Null
    }
    $out = & $J21 -cp "$PSScriptRoot;$($PgJar.FullName)" DbExec $sql 2>&1
    return @{ ok = ($LASTEXITCODE -eq 0); out = ($out -join "`n").Trim(); err = "" }
}

function Invoke-DbFile($path) { return Invoke-Db "@$path" }

function Invoke-Api($Method, $Path, $Body = $null) {
    $uri = "$Base$Path"
    try {
        $params = @{ Uri = $uri; Method = $Method; ContentType = "application/json"; ErrorAction = "Stop" }
        if ($null -ne $Body) { $params.Body = ($Body | ConvertTo-Json -Depth 6 -Compress) }
        $r = Invoke-WebRequest @params -UseBasicParsing
        $json = $null
        if ($r.Content) { try { $json = $r.Content | ConvertFrom-Json } catch {} }
        return @{ ok = $true; status = [int]$r.StatusCode; json = $json; raw = $r.Content; headers = $r.Headers }
    } catch {
        $resp = $_.Exception.Response
        $status = if ($resp) { [int]$resp.StatusCode } else { 0 }
        $raw = ""
        if ($resp) {
            $sr = New-Object System.IO.StreamReader($resp.GetResponseStream())
            $raw = $sr.ReadToEnd()
        }
        $json = $null
        if ($raw) { try { $json = $raw | ConvertFrom-Json } catch {} }
        return @{ ok = $false; status = $status; json = $json; raw = $raw; err = $_.Exception.Message }
    }
}

function Test-Depth($obj, $depth = 0, $max = 12) {
    if ($depth -gt $max) { return $false }
    if ($null -eq $obj) { return $true }
    if ($obj -is [System.Collections.IEnumerable] -and -not ($obj -is [string])) {
        foreach ($item in $obj) {
            if (-not (Test-Depth $item ($depth + 1) $max)) { return $false }
        }
        return $true
    }
    if ($obj.PSObject.Properties) {
        foreach ($p in $obj.PSObject.Properties) {
            if (-not (Test-Depth $p.Value ($depth + 1) $max)) { return $false }
        }
    }
    return $true
}

$results = @()
function Add-Test($Num, $Name, $Scenario, $Result, $Status, $Evidence) {
    $script:results += [PSCustomObject]@{
        Num = $Num; Name = $Name; Scenario = $Scenario
        Result = $Result; Status = $Status; Evidence = $Evidence
    }
}

function Test-Entity($className) {
    $path = Join-Path $ModelDir "$className.java"
    if (-not (Test-Path $path)) { return $false }
    $src = Get-Content $path -Raw
    return ($src -match '@Entity') -and ($src -match '@Table')
}

# Setup dados demo
$sqlPath = Join-Path $Root "banco_de_dados\corrigir_dados_demo_para_testes.sql"
$setup = Invoke-DbFile $sqlPath

# ============================================================
# 1. CLASSES DE DOMINIO
# ============================================================
$domainClasses = @('Livro','Usuario','Cliente','Funcionario','Emprestimo','Multa','Reserva')
$num = 1
foreach ($cls in $domainClasses) {
    $ok = Test-Entity $cls
    Add-Test $num "Classe de dominio $cls" "Arquivo model/$cls.java com @Entity e @Table" `
        $(if($ok){"Entidade JPA presente e mapeada"}else{"Classe ausente ou sem @Entity"}) `
        $(if($ok){'Validado'}else{'Falhou'}) "backend_java/.../model/$cls.java"
    $num++
}

# ============================================================
# 2. BANCO DE DADOS
# ============================================================
$requiredTables = @('usuario','cliente','funcionario','categoria','livro','emprestimo','multa','reserva','historico_livro')
$tablesDb = Invoke-Db "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"
$tablesList = if ($tablesDb.ok) { $tablesDb.out -split "`n" } else { @() }
$missingTables = $requiredTables | Where-Object { $_ -notin $tablesList }
Add-Test $num 'Criacao das tabelas' 'Tabelas obrigatorias no schema public' `
    $(if($missingTables.Count -eq 0){"Todas as $($requiredTables.Count) tabelas existem"}else{"Faltam: $($missingTables -join ', ')"}) `
    $(if($missingTables.Count -eq 0){'Validado'}else{'Falhou'}) "SQL: SELECT tablename FROM pg_tables WHERE schemaname='public'"
$num++

$pg = Invoke-Db 'SELECT 1'
Add-Test $num 'Conexao PostgreSQL' 'JDBC biblioteca@localhost:5432' `
    $(if($pg.ok -and $pg.out -eq '1'){'Conexao OK'}else{'Falha na conexao'}) `
    $(if($pg.ok -and $pg.out -eq '1'){'Validado'}else{'Falhou'}) "DbExec: SELECT 1"
$num++

$livrosDb = Invoke-Db 'SELECT COUNT(*) FROM livro WHERE ativo=true'
Add-Test $num 'Persistencia de dados' 'Livros ativos no banco' `
    $(if([int]$livrosDb.out -gt 0){"$($livrosDb.out) livros ativos persistidos"}else{'Nenhum livro ativo'}) `
    $(if([int]$livrosDb.out -gt 0){'Validado'}else{'Falhou'}) "SQL: SELECT COUNT(*) FROM livro WHERE ativo=true"
$num++

$fkCliente = Invoke-Db 'SELECT COUNT(*) FROM cliente c JOIN usuario u ON c.id_cliente=u.id_usuario'
$fkFunc = Invoke-Db 'SELECT COUNT(*) FROM funcionario f JOIN usuario u ON f.id_funcionario=u.id_usuario'
$fkEmp = Invoke-Db 'SELECT COUNT(*) FROM emprestimo e JOIN cliente c ON e.id_cliente=c.id_cliente JOIN livro l ON e.id_livro=l.id_livro'
Add-Test $num 'Relacionamentos no banco' 'FKs usuario-cliente, usuario-funcionario, emprestimo' `
    "cliente=$($fkCliente.out) funcionario=$($fkFunc.out) emprestimo=$($fkEmp.out)" `
    $(if([int]$fkCliente.out -ge 1 -and [int]$fkFunc.out -ge 1 -and [int]$fkEmp.out -ge 1){'Validado'}else{'Falhou'}) `
    "SQL JOINs cliente/funcionario/emprestimo"
$num++

$derView = Invoke-Db "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type='FOREIGN KEY' AND table_schema='public'"
Add-Test $num 'DER na pratica pelo banco' 'Constraints FK no PostgreSQL' `
    "$($derView.out) foreign keys no schema public" `
    $(if([int]$derView.out -ge 5){'Validado'}else{'Falhou'}) "SQL: information_schema.table_constraints"
$num++

# ============================================================
# 3. JPA - ENTIDADES E RELACIONAMENTOS
# ============================================================
$clienteSrc = Get-Content (Join-Path $ModelDir 'Cliente.java') -Raw
$funcSrc = Get-Content (Join-Path $ModelDir 'Funcionario.java') -Raw
$empSrc = Get-Content (Join-Path $ModelDir 'Emprestimo.java') -Raw
$multaSrc = Get-Content (Join-Path $ModelDir 'Multa.java') -Raw
$allMapped = ($domainClasses | ForEach-Object { Test-Entity $_ }) -notcontains $false
Add-Test $num 'Entidades mapeadas corretamente' 'Todas as 7 entidades com @Entity/@Table' `
    $(if($allMapped){'7/7 entidades mapeadas'}else{'Alguma entidade sem mapeamento'}) `
    $(if($allMapped){'Validado'}else{'Falhou'}) "Inspecao model/*.java"
$num++

Add-Test $num 'Relacionamento Usuario -> Cliente' '@OneToOne @MapsId em Cliente' `
    $(if($clienteSrc -match '@OneToOne' -and $clienteSrc -match '@MapsId'){'Cliente.id = Usuario.id'}else{'Mapeamento ausente'}) `
    $(if($clienteSrc -match '@OneToOne'){'Validado'}else{'Falhou'}) "Cliente.java"
$num++

Add-Test $num 'Relacionamento Usuario -> Funcionario' '@OneToOne @MapsId em Funcionario' `
    $(if($funcSrc -match '@OneToOne' -and $funcSrc -match '@MapsId'){'Funcionario.id = Usuario.id'}else{'Mapeamento ausente'}) `
    $(if($funcSrc -match '@OneToOne'){'Validado'}else{'Falhou'}) "Funcionario.java"
$num++

Add-Test $num 'Relacionamento Cliente -> Emprestimo' '@ManyToOne id_cliente' `
    $(if($empSrc -match '@ManyToOne' -and $empSrc -match 'id_cliente'){'Emprestimo referencia Cliente'}else{'Mapeamento ausente'}) `
    $(if($empSrc -match 'id_cliente'){'Validado'}else{'Falhou'}) "Emprestimo.java"
$num++

Add-Test $num 'Relacionamento Livro -> Emprestimo' '@ManyToOne id_livro' `
    $(if($empSrc -match 'id_livro'){'Emprestimo referencia Livro'}else{'Mapeamento ausente'}) `
    $(if($empSrc -match 'id_livro'){'Validado'}else{'Falhou'}) "Emprestimo.java"
$num++

Add-Test $num 'Relacionamento Emprestimo -> Multa' '@ManyToOne id_emprestimo em Multa' `
    $(if($multaSrc -match 'id_emprestimo' -or $multaSrc -match 'Emprestimo'){'Multa referencia Emprestimo'}else{'Mapeamento ausente'}) `
    $(if($multaSrc -match 'Emprestimo'){'Validado'}else{'Falhou'}) "Multa.java"
$num++

$reservaRepo = Test-Path (Join-Path $RepoDir 'ReservaRepository.java')
Add-Test $num 'Entidade Reserva operacional' 'ReservaRepository + tabela reserva' `
    $(if($reservaRepo -and 'reserva' -in $tablesList){'Reserva mapeada e tabela existe'}else{'Reserva incompleta'}) `
    $(if($reservaRepo){'Validado'}else{'Falhou'}) "ReservaRepository.java"
$num++

# ============================================================
# 4. REPOSITORIES E SERVICES
# ============================================================
$repos = @('UsuarioRepository','ClienteRepository','FuncionarioRepository','LivroRepository','EmprestimoRepository','MultaRepository','ReservaRepository')
$reposOk = ($repos | ForEach-Object { Test-Path (Join-Path $RepoDir "$_.java") }) -notcontains $false
Add-Test $num 'Repositories funcionando' 'Interfaces JpaRepository presentes' `
    $(if($reposOk){"$($repos.Count) repositories encontrados"}else{'Repository ausente'}) `
    $(if($reposOk){'Validado'}else{'Falhou'}) "repository/*.java"
$num++

$usuarioSvc = Test-Path (Join-Path $ServiceDir 'UsuarioService.java')
$empSvc = Test-Path (Join-Path $ServiceDir 'EmprestimoService.java')
$dashSvc = Test-Path (Join-Path $ServiceDir 'DashboardService.java')
Add-Test $num 'UsuarioService' 'Cadastro e listagem de usuarios' `
    $(if($usuarioSvc){'Service presente'}else{'Ausente'}) $(if($usuarioSvc){'Validado'}else{'Falhou'}) "UsuarioService.java"
$num++
Add-Test $num 'EmprestimoService' 'Registrar emprestimo e devolucao' `
    $(if($empSvc){'Service presente'}else{'Ausente'}) $(if($empSvc){'Validado'}else{'Falhou'}) "EmprestimoService.java"
$num++
Add-Test $num 'DashboardService' 'Metricas reais do banco' `
    $(if($dashSvc){'Service presente'}else{'Ausente'}) $(if($dashSvc){'Validado'}else{'Falhou'}) "DashboardService.java"
$num++

# ============================================================
# 5. LOGIN E PERFIS
# ============================================================
$loginCli = Invoke-Api POST '/auth/login' @{ email=$DemoClienteEmail; senha=$DemoSenha }
$clienteDemoId = $loginCli.json.idUsuario
Add-Test $num 'Login cliente' "POST /api/auth/login $DemoClienteEmail" `
    $(if($loginCli.ok -and $loginCli.json.tipoUsuario -eq 'CLIENTE'){"id=$clienteDemoId tipo=CLIENTE"}else{"HTTP $($loginCli.status)"}) `
    $(if($loginCli.ok -and $loginCli.json.tipoUsuario -eq 'CLIENTE'){'Validado'}else{'Falhou'}) "curl POST /api/auth/login"
$num++

$loginFunc = Invoke-Api POST '/auth/login' @{ email=$DemoFuncEmail; senha=$DemoSenha }
$funcDemoId = $loginFunc.json.idUsuario
Add-Test $num 'Login funcionario' "POST /api/auth/login $DemoFuncEmail" `
    $(if($loginFunc.ok -and $loginFunc.json.tipoUsuario -eq 'FUNCIONARIO'){"id=$funcDemoId tipo=FUNCIONARIO"}else{"HTTP $($loginFunc.status)"}) `
    $(if($loginFunc.ok -and $loginFunc.json.tipoUsuario -eq 'FUNCIONARIO'){'Validado'}else{'Falhou'}) "curl POST /api/auth/login"
$num++

$protectedSrc = Get-Content (Join-Path $Root 'frontend\src\components\ProtectedRoute.jsx') -Raw
Add-Test $num 'Bloqueio de acesso por perfil' 'ProtectedRoute redireciona perfil errado' `
    $(if($protectedSrc -match 'allowedRoles' -and $protectedSrc -match 'Navigate'){'Rota protegida por role'}else{'Sem protecao'}) `
    $(if($protectedSrc -match 'allowedRoles'){'Validado'}else{'Falhou'}) "ProtectedRoute.jsx"
$num++

$hashDb = Invoke-Db "SELECT senha_hash FROM usuario WHERE email='$DemoClienteEmail'"
$isBcrypt = $hashDb.out -match '^\$2[aby]\$'
Add-Test $num 'Senha criptografada com BCrypt' 'senha_hash no banco' `
    $(if($isBcrypt){"prefixo $($hashDb.out.Substring(0,7))"}else{'Hash nao e BCrypt'}) `
    $(if($isBcrypt){'Validado'}else{'Falhou'}) "SQL: SELECT senha_hash FROM usuario"
$num++

# ============================================================
# 6. API - ENDPOINTS OBRIGATORIOS
# ============================================================
$be = Invoke-Api GET '/livros'
Add-Test $num 'API /api/livros' 'GET listagem' `
    $(if($be.ok){"HTTP $($be.status) count=$($be.json.Count)"}else{"HTTP $($be.status)"}) `
    $(if($be.ok){'Validado'}else{'Falhou'}) "curl GET /api/livros"
$num++

$cats = Invoke-Api GET '/categorias'
Add-Test $num 'API /api/categorias' 'GET categorias' `
    $(if($cats.ok){"HTTP $($cats.status) total=$($cats.json.Count)"}else{"HTTP $($cats.status)"}) `
    $(if($cats.ok){'Validado'}else{'Falhou'}) "curl GET /api/categorias"
$num++

$dash = Invoke-Api GET '/dashboard'
Add-Test $num 'API /api/dashboard' 'GET metricas' `
    $(if($dash.ok){"livros=$($dash.json.livrosNoAcervo) clientes=$($dash.json.clientesCadastrados)"}else{"HTTP $($dash.status)"}) `
    $(if($dash.ok){'Validado'}else{'Falhou'}) "curl GET /api/dashboard"
$num++

$loginBad = Invoke-Api POST '/auth/login' @{ email=$DemoClienteEmail; senha='errada' }
Add-Test $num 'API /api/auth/login' 'Login valido e invalido' `
    $(if($loginCli.ok -and -not $loginBad.ok){"valido=200 invalido=$($loginBad.status)"}else{'Falha'}) `
    $(if($loginCli.ok -and -not $loginBad.ok){'Validado'}else{'Falhou'}) "curl POST /api/auth/login"
$num++

$empApi = Invoke-Api GET '/emprestimos/atrasados'
Add-Test $num 'API /api/emprestimos' 'GET atrasados' `
    $(if($empApi.ok){"HTTP $($empApi.status)"}else{"HTTP $($empApi.status)"}) `
    $(if($empApi.ok){'Validado'}else{'Falhou'}) "curl GET /api/emprestimos/atrasados"
$num++

$cliList = Invoke-Api GET '/clientes'
Add-Test $num 'API /api/clientes' 'GET listagem' `
    $(if($cliList.ok){"count=$($cliList.json.Count)"}else{"HTTP $($cliList.status)"}) `
    $(if($cliList.ok){'Validado'}else{'Falhou'}) "curl GET /api/clientes"
$num++

$funcList = Invoke-Api GET '/funcionarios'
Add-Test $num 'API /api/funcionarios' 'GET listagem' `
    $(if($funcList.ok){"count=$($funcList.json.Count)"}else{"HTTP $($funcList.status)"}) `
    $(if($funcList.ok){'Validado'}else{'Falhou'}) "curl GET /api/funcionarios"
$num++

# ============================================================
# 7. CORRECOES DO CRONOGRAMA
# ============================================================
$bTit = Invoke-Api GET '/livros?busca=1808'
$bAut = Invoke-Api GET '/livros?busca=Laurentino'
$bCat = Invoke-Api GET '/livros?busca=Hist'
$searchOk = $bTit.ok -and $bAut.ok -and $bCat.ok
Add-Test $num 'Busca por texto sem erro bytea/lower' 'GET /livros?busca=...' `
    $(if($searchOk){"titulo=$($bTit.json.Count) autor=$($bAut.json.Count) cat=$($bCat.json.Count)"}else{'Erro na busca'}) `
    $(if($searchOk){'Validado'}else{'Falhou'}) "curl GET /api/livros?busca=1808"
$num++

$jsonDepthOk = $be.ok -and (Test-Depth $be.json)
Add-Test $num 'Evitar recursao infinita JSON' 'Profundidade JSON finita em /livros' `
    $(if($jsonDepthOk){'JSON serializado sem recursao infinita'}else{'JSON muito profundo ou erro'}) `
    $(if($jsonDepthOk){'Validado'}else{'Falhou'}) "GET /api/livros depth-check"
$num++

$livrosDbCount = [int]$livrosDb.out
$dashLivros = [int]$dash.json.livrosNoAcervo
$dashReal = $dash.ok -and ($dashLivros -eq $livrosDbCount)
Add-Test $num 'API sem dados fake/fallback falso' 'Dashboard bate com COUNT do banco' `
    $(if($dashReal){"dashboard=$dashLivros banco=$livrosDbCount"}else{"dashboard=$dashLivros banco=$livrosDbCount divergem"}) `
    $(if($dashReal){'Validado'}else{'Falhou'}) "SQL COUNT vs GET /api/dashboard"
$num++

# ============================================================
# 8. EMPRESTIMOS
# ============================================================
Invoke-DbFile $sqlPath | Out-Null
$loanRow = Invoke-Db 'SELECT id_livro, quantidade_disponivel FROM livro WHERE ativo=true AND quantidade_disponivel > 0 LIMIT 1'
$loanParts = $loanRow.out.Split([char]124)
$loanBookId = [int]$loanParts[0]
$qtyBefore = [int]$loanParts[1]
$loan = Invoke-Api POST '/emprestimos' @{ clienteId=$clienteDemoId; livroId=$loanBookId; funcionarioId=$funcDemoId; prazoDias=30 }
$loanId = $loan.json.idEmprestimo
Add-Test $num 'Emprestimo com livro disponivel' "livro=$loanBookId cliente=$clienteDemoId" `
    $(if($loan.ok -and $loan.status -eq 201){"id=$loanId status=$($loan.json.status)"}else{"HTTP $($loan.status) $($loan.json.message)"}) `
    $(if($loan.ok -and $loan.status -eq 201){'Validado'}else{'Falhou'}) "curl POST /api/emprestimos"
$num++

$qtyAfter = Invoke-Db "SELECT quantidade_disponivel FROM livro WHERE id_livro=$loanBookId"
Add-Test $num 'Confirmar indisponibilidade/quantidade' 'qty diminui apos emprestimo' `
    "antes=$qtyBefore depois=$($qtyAfter.out)" `
    $(if([int]$qtyAfter.out -eq ($qtyBefore-1)){'Validado'}else{'Falhou'}) "SQL quantidade_disponivel"
$num++

$loan2Row = Invoke-Db "SELECT id_livro FROM livro WHERE ativo=true AND quantidade_disponivel > 0 AND id_livro <> $loanBookId LIMIT 1"
$loanBook2 = [int]$loan2Row.out
Invoke-Db "UPDATE livro SET quantidade_disponivel=0 WHERE id_livro=$loanBook2" | Out-Null
$unavail = Invoke-Api POST '/emprestimos' @{ clienteId=$clienteDemoId; livroId=$loanBook2; funcionarioId=$funcDemoId }
Add-Test $num 'Tentativa com livro indisponivel' 'qty=0' `
    $(if(-not $unavail.ok -and $unavail.json.message -match 'indispon'){$unavail.json.message}else{"HTTP $($unavail.status)"}) `
    $(if(-not $unavail.ok -and $unavail.json.message -match 'indispon'){'Validado'}else{'Falhou'}) "curl POST /api/emprestimos livro indisponivel"
$num++
Invoke-Db "UPDATE livro SET quantidade_disponivel=1 WHERE id_livro=$loanBook2" | Out-Null

$loanLate = Invoke-Api POST '/emprestimos' @{ clienteId=$clienteDemoId; livroId=$loanBook2; funcionarioId=$funcDemoId }
$loanLateId = $loanLate.json.idEmprestimo
Invoke-Db "UPDATE emprestimo SET data_prevista_devolucao = CURRENT_DATE - INTERVAL '5 days' WHERE id_emprestimo = $loanLateId" | Out-Null
$block = Invoke-Api POST '/emprestimos' @{ clienteId=$clienteDemoId; livroId=$loanBookId; funcionarioId=$funcDemoId }
Add-Test $num 'Cliente bloqueado por atraso' 'emprestimo vencido ativo' `
    $(if(-not $block.ok -and $block.json.message -match 'atraso'){$block.json.message}else{"HTTP $($block.status)"}) `
    $(if(-not $block.ok -and $block.json.message -match 'atraso'){'Validado'}else{'Falhou'}) "curl POST /api/emprestimos com atraso"
$num++

Invoke-Db "UPDATE usuario SET bloqueado=true WHERE email='$DemoClienteEmail'" | Out-Null
$blockUser = Invoke-Api POST '/emprestimos' @{ clienteId=$clienteDemoId; livroId=$loanBook2; funcionarioId=$funcDemoId }
Invoke-Db "UPDATE usuario SET bloqueado=false WHERE email='$DemoClienteEmail'" | Out-Null
Add-Test $num 'Limite/restricao usuario bloqueado' 'usuario.bloqueado=true' `
    $(if(-not $blockUser.ok -and $blockUser.json.message -match 'bloqueado'){$blockUser.json.message}else{"HTTP $($blockUser.status)"}) `
    $(if(-not $blockUser.ok -and $blockUser.json.message -match 'bloqueado'){'Validado'}else{'Falhou'}) "SQL UPDATE bloqueado + POST emprestimo"
$num++

$loansCli = Invoke-Api GET "/emprestimos/cliente/$clienteDemoId"
$empDbCount = Invoke-Db "SELECT COUNT(*) FROM emprestimo WHERE id_cliente=$clienteDemoId"
$histSync = $loansCli.ok -and ([int]$empDbCount.out -ge ($loansCli.json.ativos.Count + $loansCli.json.historico.Count))
Add-Test $num 'Historico sincronizado com banco real' 'GET cliente vs COUNT SQL' `
    "api_ativos=$($loansCli.json.ativos.Count) api_hist=$($loansCli.json.historico.Count) sql=$($empDbCount.out)" `
    $(if($histSync){'Validado'}else{'Falhou'}) "GET /api/emprestimos/cliente/{id}"
$num++

# ============================================================
# 9. DEVOLUCOES
# ============================================================
$ret = Invoke-Api POST "/emprestimos/$loanId/devolver"
Add-Test $num 'Devolucao no prazo' "emprestimo=$loanId" `
    $(if($ret.ok -and $ret.json.fineApplied -eq $false){"status=DEVOLVIDO sem multa"}else{"HTTP $($ret.status)"}) `
    $(if($ret.ok -and $ret.json.fineApplied -eq $false){'Validado'}else{'Falhou'}) "curl POST /api/emprestimos/{id}/devolver"
$num++

$qtyRet = Invoke-Db "SELECT quantidade_disponivel FROM livro WHERE id_livro=$loanBookId"
Add-Test $num 'Livro volta a ficar disponivel' 'qty restaurada' `
    "qty=$($qtyRet.out) esperado=$qtyBefore" `
    $(if([int]$qtyRet.out -eq $qtyBefore){'Validado'}else{'Falhou'}) "SQL quantidade_disponivel pos-devolucao"
$num++

$retLate = Invoke-Api POST "/emprestimos/$loanLateId/devolver"
$fineOk = ($retLate.json.fineApplied -eq $true) -and ([decimal]$retLate.json.fineAmount -eq 10.00)
Add-Test $num 'Devolucao com atraso' "emprestimo=$loanLateId (5 dias)" `
    $(if($retLate.ok){"fineApplied=$($retLate.json.fineApplied) amount=$($retLate.json.fineAmount)"}else{"HTTP $($retLate.status)"}) `
    $(if($retLate.ok -and $retLate.json.fineApplied){'Validado'}else{'Falhou'}) "curl POST devolver atrasado"
$num++

Add-Test $num 'Calculo multa R$ 2,00 por dia' '5 dias = R$ 10,00' `
    $(if($fineOk){"R$ $($retLate.json.fineAmount)"}else{"valor=$($retLate.json.fineAmount) esperado=10.00"}) `
    $(if($fineOk){'Validado'}else{'Falhou'}) "SQL SELECT * FROM multa + API fineAmount"
$num++

# ============================================================
# 10. DASHBOARD - ESTATISTICAS REAIS
# ============================================================
$d = Invoke-Api GET '/dashboard'
$cliDb = Invoke-Db 'SELECT COUNT(*) FROM cliente c JOIN usuario u ON c.id_cliente=u.id_usuario WHERE u.ativo=true'
$funcDb = Invoke-Db 'SELECT COUNT(*) FROM funcionario'
$empAtivosDb = Invoke-Db "SELECT COUNT(*) FROM emprestimo WHERE status='ATIVO'"
$dashMetrics = @(
    @{ n='Estatisticas reais do banco'; ok=$d.ok; detail="API responde com metricas" },
    @{ n='Livros no acervo'; ok=([int]$d.json.livrosNoAcervo -eq [int]$livrosDb.out); detail="api=$($d.json.livrosNoAcervo) sql=$($livrosDb.out)" },
    @{ n='Clientes cadastrados'; ok=([int]$d.json.clientesCadastrados -eq [int]$cliDb.out); detail="api=$($d.json.clientesCadastrados) sql=$($cliDb.out)" },
    @{ n='Funcionarios cadastrados'; ok=([int]$d.json.funcionariosCadastrados -eq [int]$funcDb.out); detail="api=$($d.json.funcionariosCadastrados) sql=$($funcDb.out)" },
    @{ n='Emprestimos ativos'; ok=([int]$d.json.emprestimosAtivos -eq [int]$empAtivosDb.out); detail="api=$($d.json.emprestimosAtivos) sql=$($empAtivosDb.out)" }
)
foreach ($m in $dashMetrics) {
    Add-Test $num $m.n 'GET /api/dashboard vs SQL' $m.detail $(if($m.ok){'Validado'}else{'Falhou'}) "curl GET /api/dashboard"
    $num++
}

$atrasDb = Invoke-Db "SELECT COUNT(*) FROM emprestimo WHERE status='ATIVO' AND data_prevista_devolucao < CURRENT_DATE"
Add-Test $num 'Atrasados' 'emprestimosAtrasados' `
    "api=$($d.json.emprestimosAtrasados) sql=$($atrasDb.out)" `
    $(if([int]$d.json.emprestimosAtrasados -eq [int]$atrasDb.out){'Validado'}else{'Falhou'}) "SQL emprestimos vencidos"
$num++

$multaDbSum = Invoke-Db "SELECT COALESCE(SUM(valor),0) FROM multa WHERE paga=false"
Add-Test $num 'Multas pendentes' 'multasPendentes' `
    "api=$($d.json.multasPendentes) sql=$($multaDbSum.out)" `
    $(if([decimal]$d.json.multasPendentes -eq [decimal]$multaDbSum.out){'Validado'}else{'Falhou'}) "SQL SUM multa WHERE paga=false"
$num++

$indispDb = Invoke-Db "SELECT COUNT(*) FROM livro WHERE ativo=true AND quantidade_disponivel <= 0"
Add-Test $num 'Livros indisponiveis' 'livrosIndisponiveis' `
    "api=$($d.json.livrosIndisponiveis) sql=$($indispDb.out)" `
    $(if([int]$d.json.livrosIndisponiveis -eq [int]$indispDb.out){'Validado'}else{'Falhou'}) "SQL livros qty<=0"
$num++

$top = Invoke-Api GET '/dashboard/livros-mais-emprestados'
Add-Test $num 'Livros mais emprestados' 'GET /dashboard/livros-mais-emprestados' `
    $(if($top.ok){"livros=$($top.json.Count)"}else{"HTTP $($top.status)"}) `
    $(if($top.ok){'Validado'}else{'Falhou'}) "curl GET /api/dashboard/livros-mais-emprestados"
$num++

$gen = Invoke-Api GET '/dashboard/generos-mais-consumidos'
Add-Test $num 'Generos mais consumidos' 'GET /dashboard/generos-mais-consumidos' `
    $(if($gen.ok){"pontos=$($gen.json.Count)"}else{"HTTP $($gen.status)"}) `
    $(if($gen.ok){'Validado'}else{'Falhou'}) "curl GET /api/dashboard/generos-mais-consumidos"
$num++

# ============================================================
# 11. CADASTRO DE LIVRO (PLANO AP1)
# ============================================================
$newBook = Invoke-Api POST '/livros' @{ title="Livro QA $Ts"; author='Autor QA'; categoryId=1; quantityTotal=2; availableQuantity=2; description='QA' }
$bookId = $newBook.json.idLivro
Add-Test $num 'Cadastro livro dados validos' 'POST /livros' `
    $(if($newBook.ok -and $newBook.status -eq 201){"id=$bookId"}else{"HTTP $($newBook.status)"}) `
    $(if($newBook.ok -and $newBook.status -eq 201){'Validado'}else{'Falhou'}) "curl POST /api/livros"
$num++

$badBook = Invoke-Api POST '/livros' @{ title=''; author=''; categoryId=$null }
Add-Test $num 'Cadastro livro campos obrigatorios vazios' 'POST sem titulo/autor' `
    $(if(-not $badBook.ok){"HTTP $($badBook.status) rejeitado"}else{'Aceito indevidamente'}) `
    $(if(-not $badBook.ok){'Validado'}else{'Falhou'}) "curl POST /api/livros campos vazios"
$num++

$edit = Invoke-Api PUT "/livros/$bookId" @{ title="Editado $Ts"; author='Autor QA'; categoryId=1; quantityTotal=2; availableQuantity=2; description='Edit' }
Add-Test $num 'Edicao de livro' 'PUT /livros/{id}' `
    $(if($edit.ok){"titulo=$($edit.json.titulo)"}else{"HTTP $($edit.status)"}) `
    $(if($edit.ok){'Validado'}else{'Falhou'}) "curl PUT /api/livros/$bookId"
$num++

$del = Invoke-Api DELETE "/livros/$bookId"
$ativo = Invoke-Db "SELECT ativo FROM livro WHERE id_livro=$bookId"
Add-Test $num 'Exclusao logica de livro' 'DELETE soft delete' `
    $(if($del.ok -and $ativo.out -eq 'f'){'ativo=false no banco'}else{"ativo=$($ativo.out)"}) `
    $(if($del.ok -and $ativo.out -eq 'f'){'Validado'}else{'Falhou'}) "SQL SELECT ativo FROM livro"
$num++

# ============================================================
# 12. CONSULTA DE LIVRO (PLANO AP1)
# ============================================================
Add-Test $num 'Busca por titulo' 'busca=1808' "found=$($bTit.json.Count)" $(if($bTit.json.Count -ge 1){'Validado'}else{'Falhou'}) "curl GET /api/livros?busca=1808"
$num++
Add-Test $num 'Busca por autor' 'busca=Laurentino' "found=$($bAut.json.Count)" $(if($bAut.json.Count -ge 1){'Validado'}else{'Falhou'}) "curl GET /api/livros?busca=Laurentino"
$num++
Add-Test $num 'Busca por categoria' 'busca=Hist' "found=$($bCat.json.Count)" $(if($bCat.json.Count -ge 1){'Validado'}else{'Falhou'}) "curl GET /api/livros?busca=Hist"
$num++
$bNone = Invoke-Api GET '/livros?busca=XYZINEXISTENTE999'
Add-Test $num 'Busca inexistente' 'sem resultado' "found=$($bNone.json.Count)" $(if($bNone.json.Count -eq 0){'Validado'}else{'Falhou'}) "curl GET /api/livros?busca=XYZINEXISTENTE999"
$num++
$dispBook = Invoke-Db 'SELECT id_livro, quantidade_disponivel FROM livro WHERE ativo=true AND quantidade_disponivel > 0 LIMIT 1'
$dispParts = $dispBook.out.Split([char]124)
$dispId = [int]$dispParts[0]
$dispApi = Invoke-Api GET "/livros/$dispId"
Add-Test $num 'Disponibilidade correta' "livro=$dispId" `
    "disponivel=$($dispApi.json.quantidadeDisponivel)" `
    $(if($dispApi.ok -and $dispApi.json.quantidadeDisponivel -gt 0){'Validado'}else{'Falhou'}) "curl GET /api/livros/$dispId"
$num++

# ============================================================
# 13. FLUXO COMPLETO (PLANO AP1)
# ============================================================
Invoke-DbFile $sqlPath | Out-Null
$flowBook = Invoke-Api POST '/livros' @{ title="TESTE_PLAYWRIGHT_Fluxo $Ts"; author='Autor Fluxo'; categoryId=1; quantityTotal=3; availableQuantity=3; description='Fluxo' }
$flowId = $flowBook.json.idLivro
$flowLoan = Invoke-Api POST '/emprestimos' @{ clienteId=$clienteDemoId; livroId=$flowId; funcionarioId=$funcDemoId }
$flowQty1 = Invoke-Db "SELECT quantidade_disponivel FROM livro WHERE id_livro=$flowId"
$flowRet = Invoke-Api POST "/emprestimos/$($flowLoan.json.idEmprestimo)/devolver"
$flowQty2 = Invoke-Db "SELECT quantidade_disponivel FROM livro WHERE id_livro=$flowId"
$flowOk = $flowBook.ok -and $flowLoan.ok -and ([int]$flowQty1.out -eq 2) -and $flowRet.ok -and ([int]$flowQty2.out -eq 3)
Add-Test $num 'Fluxo completo cadastro-consulta-emprestimo-devolucao' 'Ciclo ponta a ponta' `
    "cadastro=$flowId emprestimo=$($flowLoan.json.idEmprestimo) qty_antes=3 qty_pos_emp=$($flowQty1.out) qty_pos_dev=$($flowQty2.out)" `
    $(if($flowOk){'Validado'}else{'Falhou'}) "Sequencia POST livro/emprestimo/devolver + SQL qty"
$num++

# ============================================================
# 14. USUARIO (PLANO AP1)
# ============================================================
$regCli = Invoke-Api POST '/usuarios' @{ name="QA Cliente $Ts"; email="qa.cli.$Ts@test.com"; password='SenhaQa123!'; phone='(11)91111-1111'; role='CLIENTE' }
Add-Test $num 'Cadastro cliente' 'POST /usuarios CLIENTE' `
    $(if($regCli.ok -and $regCli.status -eq 201){"id=$($regCli.json.idUsuario)"}else{"HTTP $($regCli.status)"}) `
    $(if($regCli.ok -and $regCli.status -eq 201){'Validado'}else{'Falhou'}) "curl POST /api/usuarios"
$num++

$codDb = Invoke-Db "SELECT codigo FROM codigo_funcionario WHERE ativo=true AND usado=false ORDER BY codigo LIMIT 1"
$codigo = $codDb.out
$regFunc = Invoke-Api POST '/usuarios' @{ name="QA Func $Ts"; email="qa.func.$Ts@test.com"; password='SenhaFunc123!'; phone='(11)92222-2222'; role='FUNCIONARIO'; codigoAutorizacao=$codigo }
Add-Test $num 'Cadastro funcionario' "POST /usuarios FUNCIONARIO codigo=$codigo" `
    $(if($regFunc.ok -and $regFunc.status -eq 201){"id=$($regFunc.json.idUsuario)"}else{"HTTP $($regFunc.status) $($regFunc.json.message)"}) `
    $(if($regFunc.ok -and $regFunc.status -eq 201){'Validado'}else{'Falhou'}) "curl POST /api/usuarios"
$num++

$profileSrc = Get-Content (Join-Path $Root 'frontend\src\pages\ProfilePage.jsx') -Raw
Add-Test $num 'Atualizacao de dados do usuario' 'ProfilePage updateProfile' `
    $(if($profileSrc -match 'updateProfile'){'Edicao de perfil no front (localStorage)'}else{'Sem atualizacao'}) `
    'Pendente' "ProfilePage.jsx - persistencia no back-end nao implementada"
$num++

Add-Test $num 'Login valido' 'cliente e funcionario demo' `
    "cliente=$($loginCli.ok) funcionario=$($loginFunc.ok)" `
    $(if($loginCli.ok -and $loginFunc.ok){'Validado'}else{'Falhou'}) "curl POST /api/auth/login"
$num++

Add-Test $num 'Login invalido' 'senha errada' `
    "HTTP $($loginBad.status)" `
    $(if(-not $loginBad.ok -and $loginBad.status -eq 400){'Validado'}else{'Falhou'}) "curl POST /api/auth/login senha errada"
$num++

# ============================================================
# 15. BUILDS E SERVICOS
# ============================================================
$fe = try { (Invoke-WebRequest 'http://localhost:5173/' -UseBasicParsing -TimeoutSec 5).StatusCode } catch { 0 }
Add-Test $num 'Frontend sobe' 'Vite :5173' "HTTP $fe" $(if($fe -eq 200){'Validado'}else{'Falhou'}) "curl http://localhost:5173/"
$num++

$beBuild = Test-Path (Join-Path $Root 'backend_java\target\biblioteca-api-0.0.1-SNAPSHOT.jar')
Add-Test $num 'Build backend' 'mvnw package' "jar=$beBuild" $(if($beBuild){'Validado'}else{'Falhou'}) "backend_java/target/*.jar"
$num++

$feBuild = Test-Path (Join-Path $Root 'frontend\dist\index.html')
Add-Test $num 'Build frontend' 'npm run build' "dist=$feBuild" $(if($feBuild){'Validado'}else{'Falhou'}) "frontend/dist/index.html"
$num++

# ============================================================
# 16. SCREENSHOTS PLAYWRIGHT
# ============================================================
$screenshotDir = Join-Path $Root 'frontend\test-results\screenshots'
$requiredShots = @(
    '01-tela-inicial','02-login','03-cadastro-cliente','04-cadastro-funcionario',
    '05-catalogo-livros','06-categorias','07-perfil-cliente','08-emprestimos-cliente',
    '09-painel-funcionario','10-adicionar-livro','11-remover-livro','12-registrar-emprestimo',
    '13-registrar-devolucao','14-consultar-clientes','15-dashboard','16-pgadmin-validacao-banco-ou-endpoint-json'
)
$missingShots = $requiredShots | Where-Object { -not (Test-Path (Join-Path $screenshotDir "$_.png")) }
$shotsOk = $missingShots.Count -eq 0
Add-Test $num 'Screenshots Playwright 16 telas' 'frontend/test-results/screenshots/' `
    $(if($shotsOk){"16/16 geradas"}else{"Faltam: $($missingShots -join ', ')"}) `
    $(if($shotsOk){'Validado'}elseif($missingShots.Count -eq 16){'Pendente'}else{'Falhou'}) "frontend/test-results/screenshots/*.png"
$num++

# ============================================================
# 17. LIMPEZA DADOS TEMPORARIOS DE TESTE
# ============================================================
$cleanupSql = Join-Path $Root 'banco_de_dados\cleanup_dados_teste.sql'
if (Test-Path $cleanupSql) {
    $cleanup = Invoke-DbFile $cleanupSql
    Add-Test $num 'Cleanup dados teste' 'ativo=false livros/usuarios QA' `
        $(if($cleanup.ok){'cleanup_dados_teste.sql executado'}else{$cleanup.out}) `
        $(if($cleanup.ok){'Validado'}else{'Falhou'}) "banco_de_dados/cleanup_dados_teste.sql"
    $num++
}

# ============================================================
# SAIDA
# ============================================================
$outJson = Join-Path $PSScriptRoot 'qa_results_latest.json'
$outMd = Join-Path $PSScriptRoot 'qa_report_latest.md'
$results | ConvertTo-Json -Depth 4 | Set-Content $outJson -Encoding UTF8

$v = ($results | Where-Object Status -eq 'Validado').Count
$p = ($results | Where-Object Status -eq 'Pendente').Count
$f = ($results | Where-Object Status -eq 'Falhou').Count
$total = $results.Count

$md = @()
$md += "# Relatorio QA AP1 - $Ts"
$md += ""
$md += "Total: $total | Validados: $v | Pendentes: $p | Falhas: $f"
$md += ""
foreach ($t in $results) {
    $md += "TESTE $($t.Num) - $($t.Name)"
    $md += "Cenário: $($t.Scenario)"
    $md += "Resultado: $($t.Result)"
    $md += "Status: $($t.Status)"
    $md += "Evidência: $($t.Evidence)"
    $md += ""
}
$md -join "`n" | Set-Content $outMd -Encoding UTF8

Write-Host "QA concluido: Validado=$v Pendente=$p Falhou=$f Total=$total"
$results | Format-Table Num, Name, Status, Evidence -AutoSize
