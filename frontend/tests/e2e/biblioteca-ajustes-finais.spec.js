import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const SCREENSHOT_DIR = "test-results/screenshots-ajustes-finais";
const CLIENTE_EMAIL = process.env.DEMO_CLIENTE_EMAIL || "cliente.demo@biblioteca.com";
const CLIENTE_SENHA = process.env.DEMO_CLIENTE_SENHA || "Demo123!";
const FUNC_EMAIL = process.env.DEMO_FUNC_EMAIL || "funcionario.demo@biblioteca.com";
const FUNC_SENHA = process.env.DEMO_FUNC_SENHA || "Demo123!";

function shot(page, name) {
  const dir = path.resolve(SCREENSHOT_DIR);
  fs.mkdirSync(dir, { recursive: true });
  return page.screenshot({ path: path.join(dir, `${name}.png`), fullPage: true });
}

async function loginCliente(page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Sou cliente" }).click();
  await page.getByPlaceholder("E-mail").fill(CLIENTE_EMAIL);
  await page.getByPlaceholder("Senha").fill(CLIENTE_SENHA);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/cliente\/catalogo/);
}

async function loginFuncionario(page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Sou funcionário" }).click();
  await page.getByPlaceholder("E-mail").fill(FUNC_EMAIL);
  await page.getByPlaceholder("Senha").fill(FUNC_SENHA);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/funcionario/);
}

test.describe("Ajustes finais — screenshots", () => {
  test.beforeAll(() => {
    fs.mkdirSync(path.resolve(SCREENSHOT_DIR), { recursive: true });
  });

  test("01 — capas revertidas no catálogo", async ({ page }) => {
    await loginCliente(page);
    await page.waitForTimeout(2500);
    await shot(page, "01-capas-revertidas-catalogo");
  });

  test("02 — capas revertidas livros funcionário", async ({ page }) => {
    await loginFuncionario(page);
    await page.goto("/funcionario/dashboard");
    await page.getByRole("button", { name: "Gerenciar livros" }).click();
    await page.waitForTimeout(2500);
    await shot(page, "02-capas-revertidas-funcionario-livros");
  });

  test("03 — clientes sem duplicados", async ({ page }) => {
    await loginFuncionario(page);
    await page.goto("/funcionario/clientes");
    await page.waitForTimeout(1200);
    await shot(page, "03-clientes-sem-duplicados");
  });

  test("04 — registrar empréstimo sticky mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginFuncionario(page);
    await page.goto("/funcionario/registrar-emprestimo");
    await page.getByPlaceholder("Buscar cliente").fill("demo");
    await page.waitForTimeout(500);
    await page.locator(".selection-item").first().click();
    await page.getByPlaceholder("Buscar livro").fill("harry");
    await page.waitForTimeout(800);
    await expect(page.locator(".register-loan-confirm")).toBeVisible();
    await shot(page, "04-registrar-emprestimo-sticky-mobile");
  });

  test("05 — ngrok mobile final", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginFuncionario(page);
    await page.goto("/funcionario/registrar-emprestimo");
    await page.waitForTimeout(1200);
    await shot(page, "05-ngrok-mobile-final");
  });
});
