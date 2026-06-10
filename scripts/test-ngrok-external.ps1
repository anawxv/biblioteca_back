# Testes de acesso externo simulado via URLs ngrok
param(
    [string]$FrontendUrl = $env:NGROK_FRONTEND_URL,
    [string]$BackendUrl = $env:NGROK_BACKEND_URL
)

$ErrorActionPreference = "Continue"
$Root = Split-Path $PSScriptRoot -Parent
$Results = @()

function Add-Result($Name, $Status, $Detail) {
    $script:Results += [PSCustomObject]@{ Name = $Name; Status = $Status; Detail = $Detail }
}

function Invoke-NgrokApi($Method, $Path, $Origin, $Body = $null, [switch]$CrossOrigin) {
    $uri = "$BackendUrl$Path"
    $headers = @{ "ngrok-skip-browser-warning" = "true" }
    if ($CrossOrigin -and $Origin) {
        $headers.Origin = $Origin
    }
    try {
        $params = @{ Uri = $uri; Method = $Method; Headers = $headers; ContentType = "application/json"; ErrorAction = "Stop" }
        if ($null -ne $Body) { $params.Body = ($Body | ConvertTo-Json -Compress) }
        $r = Invoke-WebRequest @params -UseBasicParsing
        $json = $null
        if ($r.Content) { try { $json = $r.Content | ConvertFrom-Json } catch {} }
        return @{ ok = $true; status = [int]$r.StatusCode; json = $json; raw = $r.Content; cors = $r.Headers['Access-Control-Allow-Origin'] }
    } catch {
        $resp = $_.Exception.Response
        $status = if ($resp) { [int]$resp.StatusCode } else { 0 }
        $raw = ""
        if ($resp) {
            $sr = New-Object System.IO.StreamReader($resp.GetResponseStream())
            $raw = $sr.ReadToEnd()
        }
        return @{ ok = $false; status = $status; raw = $raw; cors = "" }
    }
}

if (-not $FrontendUrl -or -not $BackendUrl) {
    Write-Host "Defina NGROK_FRONTEND_URL e NGROK_BACKEND_URL ou passe -FrontendUrl / -BackendUrl"
    exit 1
}

$FrontendUrl = $FrontendUrl.TrimEnd('/')
$BackendUrl = $BackendUrl.TrimEnd('/')
if (-not $BackendUrl.EndsWith('/api')) { $BackendUrl = "$BackendUrl/api" }
$singleTunnel = ($FrontendUrl -eq ($BackendUrl -replace '/api$',''))

Write-Host "Frontend: $FrontendUrl"
Write-Host "Backend : $BackendUrl"
Write-Host "Modo    : $(if($singleTunnel){'1 tunel (same-origin via proxy)'}else{'2 tuneis (cross-origin)'})"
Write-Host ""

$crossOrigin = -not $singleTunnel

# 1 Frontend publico
$fe = try { (Invoke-WebRequest "$FrontendUrl/" -Headers @{ "ngrok-skip-browser-warning" = "true" } -UseBasicParsing -TimeoutSec 15).StatusCode } catch { 0 }
Add-Result "Frontend ngrok acessivel" $(if($fe -eq 200){'OK'}else{'FALHOU'}) "HTTP $fe $FrontendUrl/"

# 2 CORS preflight (relevante apenas no modo 2 tuneis)
if ($crossOrigin) {
    $cors = try {
        $o = Invoke-WebRequest -Uri "$BackendUrl/livros" -Method OPTIONS -Headers @{
            Origin = $FrontendUrl
            "Access-Control-Request-Method" = "GET"
            "ngrok-skip-browser-warning" = "true"
        } -UseBasicParsing
        $o.Headers['Access-Control-Allow-Origin']
    } catch { "" }
    Add-Result "CORS preflight ngrok" $(if($cors){'OK'}else{'FALHOU'}) "Allow-Origin=$cors"
} else {
    Add-Result "CORS preflight ngrok" "OK" "N/A same-origin (proxy /api no tunel unico)"
}

# 3 APIs principais
$livros = Invoke-NgrokApi GET '/livros' $FrontendUrl -CrossOrigin:$crossOrigin
Add-Result "GET /api/livros" $(if($livros.ok){'OK'}else{'FALHOU'}) "HTTP $($livros.status) count=$($livros.json.Count)"

$dash = Invoke-NgrokApi GET '/dashboard' $FrontendUrl -CrossOrigin:$crossOrigin
Add-Result "GET /api/dashboard" $(if($dash.ok){'OK'}else{'FALHOU'}) "HTTP $($dash.status) livros=$($dash.json.livrosNoAcervo)"

$cats = Invoke-NgrokApi GET '/categorias' $FrontendUrl -CrossOrigin:$crossOrigin
Add-Result "GET /api/categorias" $(if($cats.ok){'OK'}else{'FALHOU'}) "HTTP $($cats.status)"

$login = Invoke-NgrokApi POST '/auth/login' $FrontendUrl @{ email='cliente.demo@biblioteca.com'; senha='Demo123!' } -CrossOrigin:$crossOrigin
Add-Result "POST /api/auth/login cliente" $(if($login.ok -and $login.json.tipoUsuario -eq 'CLIENTE'){'OK'}else{'FALHOU'}) "HTTP $($login.status) id=$($login.json.idUsuario)"

$loginFunc = Invoke-NgrokApi POST '/auth/login' $FrontendUrl @{ email='funcionario.demo@biblioteca.com'; senha='Demo123!' } -CrossOrigin:$crossOrigin
Add-Result "POST /api/auth/login funcionario" $(if($loginFunc.ok -and $loginFunc.json.tipoUsuario -eq 'FUNCIONARIO'){'OK'}else{'FALHOU'}) "HTTP $($loginFunc.status)"

$clientes = Invoke-NgrokApi GET '/clientes' $FrontendUrl -CrossOrigin:$crossOrigin
Add-Result "GET /api/clientes" $(if($clientes.ok){'OK'}else{'FALHOU'}) "HTTP $($clientes.status) count=$($clientes.json.Count)"

$funcionarios = Invoke-NgrokApi GET '/funcionarios' $FrontendUrl -CrossOrigin:$crossOrigin
Add-Result "GET /api/funcionarios" $(if($funcionarios.ok){'OK'}else{'FALHOU'}) "HTTP $($funcionarios.status)"

$emp = Invoke-NgrokApi GET '/emprestimos/atrasados' $FrontendUrl -CrossOrigin:$crossOrigin
Add-Result "GET /api/emprestimos/atrasados" $(if($emp.ok){'OK'}else{'FALHOU'}) "HTTP $($emp.status)"

# 4 Cadastro (codigo funcionario)
$codDb = & "C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot\bin\java.exe" -cp "$PSScriptRoot;$env:USERPROFILE\.m2\repository\org\postgresql\postgresql\42.7.5\postgresql-42.7.5.jar" DbExec "SELECT codigo FROM codigo_funcionario WHERE ativo=true AND usado=false ORDER BY codigo LIMIT 1" 2>$null
$codigo = ($codDb -join "").Trim()
$ts = Get-Date -Format "yyyyMMddHHmmss"
$regCli = Invoke-NgrokApi POST '/usuarios' $FrontendUrl @{ name="Ngrok Cli $ts"; email="ngrok.cli.$ts@test.com"; password='SenhaNgrok123!'; phone='(11)91111-1111'; role='CLIENTE' } -CrossOrigin:$crossOrigin
Add-Result "POST /api/usuarios cliente" $(if($regCli.ok -and $regCli.status -eq 201){'OK'}else{'FALHOU'}) "HTTP $($regCli.status)"

if ($codigo) {
    $regFunc = Invoke-NgrokApi POST '/usuarios' $FrontendUrl @{ name="Ngrok Func $ts"; email="ngrok.func.$ts@test.com"; password='SenhaNgrok123!'; phone='(11)92222-2222'; role='FUNCIONARIO'; codigoAutorizacao=$codigo } -CrossOrigin:$crossOrigin
    Add-Result "POST /api/usuarios funcionario" $(if($regFunc.ok -and $regFunc.status -eq 201){'OK'}else{'FALHOU'}) "HTTP $($regFunc.status) codigo=$codigo"
} else {
    Add-Result "POST /api/usuarios funcionario" "PENDENTE" "Sem codigo_funcionario disponivel"
}

$out = Join-Path $PSScriptRoot "ngrok_test_results.json"
$Results | ConvertTo-Json -Depth 3 | Set-Content $out -Encoding UTF8
$ok = ($Results | Where-Object Status -eq 'OK').Count
$fail = ($Results | Where-Object Status -eq 'FALHOU').Count
Write-Host ""
Write-Host "Ngrok externo: OK=$ok FALHOU=$fail TOTAL=$($Results.Count)"
$Results | Format-Table Name, Status, Detail -AutoSize
exit $(if($fail -gt 0){1}else{0})
