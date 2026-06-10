# Deploy AP1 Biblioteca via ngrok

## Domínio fixo

```
https://zoraida-prejuvenile-hyperflexibly.ngrok-free.dev
```

Use esta URL no celular (4G/5G), em outro computador ou na apresentação.

---

## Arquitetura (1 túnel)

```
[Celular / outro PC]
        |
        v
https://zoraida-prejuvenile-hyperflexibly.ngrok-free.dev
        |
        v
Vite :5173  ----proxy /api---->  Spring Boot :8080  -->  PostgreSQL local
```

O PostgreSQL permanece **somente na máquina host** (`localhost:5432`).

---

## Comandos para subir

### 1. Backend (terminal 1)

```powershell
cd C:\Users\gusta\OneDrive\AP1\AP1_2.0\backend_java
.\mvnw.cmd spring-boot:run
```

Aguarde: `Tomcat started on port 8080`.

### 2. Frontend (terminal 2)

```powershell
cd C:\Users\gusta\OneDrive\AP1\AP1_2.0\frontend
copy .env.ngrok.example .env
npm.cmd run dev
```

Confirme em `frontend/.env`:

```
VITE_API_URL=/api
```

O Vite expõe `0.0.0.0:5173` e encaminha `/api` para `http://127.0.0.1:8080`.

### 3. ngrok com domínio fixo (terminal 3)

```powershell
ngrok http 5173 --domain=zoraida-prejuvenile-hyperflexibly.ngrok-free.dev
```

Se o plano não tiver domínio reservado, use:

```powershell
ngrok http 5173
```

e copie a URL `Forwarding` exibida.

---

## Como testar no celular (4G/5G)

1. No PC: backend + frontend + ngrok rodando.
2. No celular: **desligue o Wi-Fi**, use dados móveis.
3. Abra o navegador e acesse:
   `https://zoraida-prejuvenile-hyperflexibly.ngrok-free.dev`
4. Toque em **Visit Site** se o ngrok mostrar aviso.
5. Login demo:
   - Cliente: `cliente.demo@biblioteca.com` / `Demo123!`
   - Funcionário: `funcionario.demo@biblioteca.com` / `Demo123!`

---

## Como verificar se a API está funcionando

### Pelo navegador (mesma URL do ngrok)

```
https://zoraida-prejuvenile-hyperflexibly.ngrok-free.dev/api/livros
https://zoraida-prejuvenile-hyperflexibly.ngrok-free.dev/api/dashboard
```

Deve retornar JSON (não HTML de erro).

### Pelo PowerShell (no PC)

```powershell
$headers = @{ "ngrok-skip-browser-warning" = "true" }
Invoke-RestMethod -Uri "https://zoraida-prejuvenile-hyperflexibly.ngrok-free.dev/api/dashboard" -Headers $headers
Invoke-RestMethod -Uri "https://zoraida-prejuvenile-hyperflexibly.ngrok-free.dev/api/livros" -Headers $headers
```

### Script automatizado

```powershell
$env:NGROK_FRONTEND_URL = "https://zoraida-prejuvenile-hyperflexibly.ngrok-free.dev"
$env:NGROK_BACKEND_URL  = "https://zoraida-prejuvenile-hyperflexibly.ngrok-free.dev"
powershell -File scripts/test-ngrok-external.ps1
```

Resultado em `scripts/ngrok_test_results.json`.

---

## URLs configuradas no projeto

| Arquivo | Valor |
|---------|-------|
| `frontend/.env` | `VITE_API_URL=/api` |
| `vite.config.js` | proxy `/api` → `127.0.0.1:8080` |
| `application.properties` | `server.address=0.0.0.0`, CORS com `*.ngrok-free.dev` |
| Domínio público | `https://zoraida-prejuvenile-hyperflexibly.ngrok-free.dev` |

---

## Testes E2E mobile

```powershell
cd frontend
npm.cmd run build
npm run test:e2e
```

Testes mobile ngrok (viewport 390×844):

```powershell
# Localhost (viewport 390x844)
npx playwright test --project=mobile-ngrok-local

# URL ngrok fixa (requer ngrok rodando)
$env:RUN_NGROK_E2E="1"
$env:PLAYWRIGHT_NGROK_URL="https://zoraida-prejuvenile-hyperflexibly.ngrok-free.dev"
npx playwright test --project=mobile-ngrok-external
```

Screenshots em `frontend/test-results/screenshots-ngrok-mobile/`.

---

## Checklist de funcionalidades (celular)

| Tela | Rota |
|------|------|
| Login cliente/funcionário | `/login` |
| Cadastro | `/cadastro/cliente` ou `/cadastro/funcionario` |
| Catálogo | `/cliente/catalogo` |
| Categorias | `/cliente/categorias` |
| Empréstimos cliente | `/cliente/emprestimos` |
| Perfil | `/cliente/perfil` |
| Painel funcionário | `/funcionario/painel` |
| Dashboard | `/funcionario/dashboard` |
| Consultar clientes | `/funcionario/clientes` |
| Registrar empréstimo | `/funcionario/registrar-emprestimo` |
| Registrar devolução | `/funcionario/registrar-devolucao` |

---

## Solução de problemas

| Sintoma | Solução |
|---------|---------|
| Failed to fetch no celular | Confirme `VITE_API_URL=/api` e reinicie `npm run dev` |
| Página ngrok de aviso | Toque Visit Site; header `ngrok-skip-browser-warning` já está no front |
| API retorna erro | Verifique backend em `:8080` e PostgreSQL ativo |
| URL mudou | No plano free sem domínio fixo, copie nova URL do terminal ngrok |
| Layout cortado no mobile | Atualize o front (CSS mobile + cards de funcionários) |

---

## Credenciais demo

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Cliente | `cliente.demo@biblioteca.com` | `Demo123!` |
| Funcionário | `funcionario.demo@biblioteca.com` | `Demo123!` |

Execute `banco_de_dados/corrigir_dados_demo_para_testes.sql` se necessário.
