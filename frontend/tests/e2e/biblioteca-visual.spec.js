import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const SCREENSHOT_DIR = "test-results/screenshots";
const CLIENTE_EMAIL = process.env.DEMO_CLIENTE_EMAIL || "cliente.demo@biblioteca.com";
const CLIENTE_SENHA = process.env.DEMO_CLIENTE_SENHA || "Demo123!";
const FUNC_EMAIL = process.env.DEMO_FUNC_EMAIL || "funcionario.demo@biblioteca.com";
const FUNC_SENHA = process.env.DEMO_FUNC_SENHA || "Demo123!";
const API_URL = process.env.PLAYWRIGHT_API_URL || "http://localhost:8080/api";

function shot(page, name) {
  const dir = path.resolve(SCREENSHOT_DIR);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${name}.png`);
  return page.screenshot({ path: filePath, fullPage: true });
}

async function escolherPerfil(page, role) {
  await page.goto("/");
  const label = role === "funcionario" ? "Sou funcionário" : "Sou cliente";
  await page.getByRole("button", { name: label }).click();
  await expect(page).toHaveURL(/\/login/);
}

async function fazerLogin(page, email, senha) {
  await page.getByPlaceholder("E-mail").fill(email);
  await page.getByPlaceholder("Senha").fill(senha);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
}

test.describe("Biblioteca AP1 — screenshots obrigatórios", () => {
  test.beforeAll(() => {
    fs.mkdirSync(path.resolve(SCREENSHOT_DIR), { recursive: true });
  });

  test("01 — tela inicial", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "BIBLIOTECA" })).toBeVisible();
    await shot(page, "01-tela-inicial");
  });

  test("02 — login", async ({ page }) => {
    await escolherPerfil(page, "cliente");
    await expect(page.getByText("Entrando como")).toContainText("cliente");
    await shot(page, "02-login");
  });

  test("03 — cadastro cliente", async ({ page }) => {
    await page.goto("/cadastro");
    await page.getByRole("button", { name: "Sou cliente" }).click();
    await expect(page).toHaveURL(/\/cadastro\/cliente/);
    await shot(page, "03-cadastro-cliente");
  });

  test("04 — cadastro funcionario", async ({ page }) => {
    await page.goto("/cadastro");
    await page.getByRole("button", { name: "Sou funcionário" }).click();
    await expect(page).toHaveURL(/\/cadastro\/funcionario/);
    await shot(page, "04-cadastro-funcionario");
  });

  test("05 — catalogo livros", async ({ page }) => {
    await escolherPerfil(page, "cliente");
    await fazerLogin(page, CLIENTE_EMAIL, CLIENTE_SENHA);
    await expect(page).toHaveURL(/\/cliente\/catalogo/);
    await page.waitForTimeout(2000);
    await shot(page, "05-catalogo-livros");
  });

  test("06 — categorias", async ({ page }) => {
    await escolherPerfil(page, "cliente");
    await fazerLogin(page, CLIENTE_EMAIL, CLIENTE_SENHA);
    await page.goto("/cliente/categorias");
    await page.waitForTimeout(1500);
    await shot(page, "06-categorias");
  });

  test("07 — perfil cliente", async ({ page }) => {
    await escolherPerfil(page, "cliente");
    await fazerLogin(page, CLIENTE_EMAIL, CLIENTE_SENHA);
    await page.goto("/cliente/perfil");
    await page.waitForTimeout(1500);
    await shot(page, "07-perfil-cliente");
  });

  test("08 — emprestimos cliente", async ({ page }) => {
    await escolherPerfil(page, "cliente");
    await fazerLogin(page, CLIENTE_EMAIL, CLIENTE_SENHA);
    await page.goto("/cliente/emprestimos");
    await page.waitForTimeout(2000);
    await shot(page, "08-emprestimos-cliente");
  });

  test("09 — painel funcionario", async ({ page }) => {
    await escolherPerfil(page, "funcionario");
    await fazerLogin(page, FUNC_EMAIL, FUNC_SENHA);
    await expect(page).toHaveURL(/\/funcionario\/painel/);
    await page.waitForTimeout(2500);
    await shot(page, "09-painel-funcionario");
  });

  test("10 — adicionar livro", async ({ page }) => {
    await escolherPerfil(page, "funcionario");
    await fazerLogin(page, FUNC_EMAIL, FUNC_SENHA);
    await page.goto("/funcionario/adicionar-livro");
    await page.waitForTimeout(1500);
    await shot(page, "10-adicionar-livro");
  });

  test("11 — remover livro", async ({ page }) => {
    await escolherPerfil(page, "funcionario");
    await fazerLogin(page, FUNC_EMAIL, FUNC_SENHA);
    await page.goto("/funcionario/remover-livro");
    await page.waitForTimeout(2000);
    await shot(page, "11-remover-livro");
  });

  test("12 — registrar emprestimo", async ({ page }) => {
    await escolherPerfil(page, "funcionario");
    await fazerLogin(page, FUNC_EMAIL, FUNC_SENHA);
    await expect(page).toHaveURL(/\/funcionario\/painel/);
    await page.goto("/funcionario/registrar-emprestimo");
    await expect(page.getByRole("heading", { name: /Registrar empréstimo/i })).toBeVisible();
    await page.waitForTimeout(2000);
    await shot(page, "12-registrar-emprestimo");
  });

  test("13 — registrar devolucao", async ({ page }) => {
    await escolherPerfil(page, "funcionario");
    await fazerLogin(page, FUNC_EMAIL, FUNC_SENHA);
    await page.goto("/funcionario/registrar-devolucao");
    await page.waitForTimeout(2000);
    await shot(page, "13-registrar-devolucao");
  });

  test("14 — consultar clientes", async ({ page }) => {
    await escolherPerfil(page, "funcionario");
    await fazerLogin(page, FUNC_EMAIL, FUNC_SENHA);
    await page.goto("/funcionario/clientes");
    await page.waitForTimeout(2000);
    await shot(page, "14-consultar-clientes");
  });

  test("15 — dashboard", async ({ page }) => {
    await escolherPerfil(page, "funcionario");
    await fazerLogin(page, FUNC_EMAIL, FUNC_SENHA);
    await page.goto("/funcionario/dashboard");
    await page.waitForTimeout(2500);
    await expect(page.locator(".metric-card, .panel, .dashboard").first()).toBeVisible();
    await shot(page, "15-dashboard");
  });

  test("16 — validacao banco via endpoint JSON", async ({ page }) => {
    await page.goto(`${API_URL}/dashboard`);
    await page.waitForTimeout(1000);
    const body = await page.locator("body").innerText();
    expect(body).toMatch(/livrosNoAcervo|clientesCadastrados/);
    await shot(page, "16-pgadmin-validacao-banco-ou-endpoint-json");
  });
});
