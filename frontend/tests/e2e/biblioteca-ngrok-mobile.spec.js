import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const SCREENSHOT_DIR = "test-results/screenshots-ngrok-mobile";
const CLIENTE_EMAIL = process.env.DEMO_CLIENTE_EMAIL || "cliente.demo@biblioteca.com";
const CLIENTE_SENHA = process.env.DEMO_CLIENTE_SENHA || "Demo123!";
const FUNC_EMAIL = process.env.DEMO_FUNC_EMAIL || "funcionario.demo@biblioteca.com";
const FUNC_SENHA = process.env.DEMO_FUNC_SENHA || "Demo123!";

function shot(page, name) {
  const dir = path.resolve(SCREENSHOT_DIR);
  fs.mkdirSync(dir, { recursive: true });
  return page.screenshot({
    path: path.join(dir, `${name}.png`),
    fullPage: true,
    timeout: 30_000,
  });
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

test.describe("Biblioteca AP1 — mobile ngrok 390x844", () => {
  test.beforeAll(() => {
    fs.mkdirSync(path.resolve(SCREENSHOT_DIR), { recursive: true });
  });

  test("01 — home mobile", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "BIBLIOTECA" })).toBeVisible();
    await shot(page, "01-ngrok-home-mobile");
  });

  test("02 — login cliente mobile", async ({ page }) => {
    await escolherPerfil(page, "cliente");
    await shot(page, "02-ngrok-login-cliente-mobile");
  });

  test("03 — catalogo cliente mobile", async ({ page }) => {
    await escolherPerfil(page, "cliente");
    await fazerLogin(page, CLIENTE_EMAIL, CLIENTE_SENHA);
    await expect(page).toHaveURL(/\/cliente\/catalogo/);
    await page.waitForTimeout(1500);
    await shot(page, "03-ngrok-catalogo-mobile");
  });

  test("04 — capas mobile (fallback rosa)", async ({ page }) => {
    await escolherPerfil(page, "cliente");
    await fazerLogin(page, CLIENTE_EMAIL, CLIENTE_SENHA);
    const covers = page.locator(".book-cover");
    await expect(covers.first()).toBeVisible({ timeout: 20_000 });
    const count = await covers.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < Math.min(count, 6); i += 1) {
      const cover = covers.nth(i);
      const bg = await cover.evaluate((el) => getComputedStyle(el).backgroundImage);
      expect(bg).toContain("linear-gradient");
    }
    await shot(page, "04-ngrok-capas-mobile");
  });

  test("05 — categorias mobile", async ({ page }) => {
    await escolherPerfil(page, "cliente");
    await fazerLogin(page, CLIENTE_EMAIL, CLIENTE_SENHA);
    await page.goto("/cliente/categorias");
    await page.waitForTimeout(1200);
    await shot(page, "05-ngrok-categorias-mobile");
  });

  test("06 — emprestimos cliente mobile", async ({ page }) => {
    await escolherPerfil(page, "cliente");
    await fazerLogin(page, CLIENTE_EMAIL, CLIENTE_SENHA);
    await page.goto("/cliente/emprestimos");
    await page.waitForTimeout(1200);
    await shot(page, "06-ngrok-emprestimos-cliente-mobile");
  });

  test("07 — perfil cliente mobile", async ({ page }) => {
    await escolherPerfil(page, "cliente");
    await fazerLogin(page, CLIENTE_EMAIL, CLIENTE_SENHA);
    await page.goto("/cliente/perfil");
    await page.waitForTimeout(1200);
    await shot(page, "07-ngrok-perfil-cliente-mobile");
  });

  test("08 — painel funcionario mobile", async ({ page }) => {
    await escolherPerfil(page, "funcionario");
    await fazerLogin(page, FUNC_EMAIL, FUNC_SENHA);
    await expect(page).toHaveURL(/\/funcionario\/painel/);
    await page.waitForTimeout(2000);
    await shot(page, "08-ngrok-painel-funcionario-mobile");
  });

  test("09 — dashboard funcionario mobile", async ({ page }) => {
    await escolherPerfil(page, "funcionario");
    await fazerLogin(page, FUNC_EMAIL, FUNC_SENHA);
    await page.goto("/funcionario/dashboard");
    await page.waitForTimeout(2000);
    await shot(page, "09-ngrok-dashboard-mobile");
  });

  test("10 — funcionarios cadastrados mobile (cards)", async ({ page }) => {
    await escolherPerfil(page, "funcionario");
    await fazerLogin(page, FUNC_EMAIL, FUNC_SENHA);
    await expect(page).toHaveURL(/\/funcionario\/painel/);
    await page.waitForTimeout(2000);
    const funcionariosMetric = page.locator("button.metric-button").nth(2);
    await funcionariosMetric.scrollIntoViewIfNeeded();
    await funcionariosMetric.click();
    await expect(page.locator(".dashboard-detail-panel").first()).toBeVisible({ timeout: 15_000 });
    await shot(page, "10-ngrok-funcionarios-cadastrados-mobile");
  });

  test("11 — bottom nav mobile", async ({ page }) => {
    await escolherPerfil(page, "funcionario");
    await fazerLogin(page, FUNC_EMAIL, FUNC_SENHA);
    const bottomNav = page.locator(".bottom-nav--admin");
    await expect(bottomNav).toBeVisible();
    const pageWithNav = page.locator(".page-with-nav");
    const paddingBottom = await pageWithNav.first().evaluate((el) => getComputedStyle(el).paddingBottom);
    expect(parseInt(paddingBottom, 10)).toBeGreaterThan(100);
    await shot(page, "11-ngrok-bottom-nav-mobile");
  });
});
