import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const SCREENSHOT_DIR = "test-results/screenshots-correcao-final";
const CLIENTE_EMAIL = process.env.DEMO_CLIENTE_EMAIL || "cliente.demo@biblioteca.com";
const CLIENTE_SENHA = process.env.DEMO_CLIENTE_SENHA || "Demo123!";
const FUNC_EMAIL = process.env.DEMO_FUNC_EMAIL || "funcionario.demo@biblioteca.com";
const FUNC_SENHA = process.env.DEMO_FUNC_SENHA || "Demo123!";
const API_URL = process.env.PLAYWRIGHT_API_URL || "http://localhost:8080/api";

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

test.describe("Correção final — screenshots", () => {
  test.beforeAll(() => {
    fs.mkdirSync(path.resolve(SCREENSHOT_DIR), { recursive: true });
  });

  test("01 — catálogo sem Fluxo QA", async ({ page, request }) => {
    const livros = await request.get(`${API_URL}/livros`);
    const lista = await livros.json();
    const fluxoQa = lista.filter((livro) => String(livro.titulo || "").toLowerCase().startsWith("fluxo qa"));
    expect(fluxoQa.length).toBe(0);

    await loginCliente(page);
    await page.waitForTimeout(2500);
    await expect(page.locator("text=Fluxo QA")).toHaveCount(0);
    await shot(page, "01-catalogo-sem-fluxoqa");
  });

  test("02 — cards tamanho correto", async ({ page }) => {
    await loginCliente(page);
    await page.waitForTimeout(2000);
    const card = page.locator(".book-card").first();
    const box = await card.boundingBox();
    expect(box?.width).toBeLessThan(220);
    await shot(page, "02-cards-tamanho-correto");
  });

  test("03 — capas desktop", async ({ page }) => {
    await loginCliente(page);
    await page.waitForTimeout(3500);
    await shot(page, "03-capas-desktop");
  });

  test("04 — capas ngrok mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginCliente(page);
    await page.waitForTimeout(3500);
    await shot(page, "04-capas-ngrok-mobile");
  });

  test("05 — livros funcionário tamanho correto", async ({ page }) => {
    await loginFuncionario(page);
    await page.goto("/funcionario/dashboard");
    await page.getByRole("button", { name: "Gerenciar livros" }).click();
    await page.waitForTimeout(2500);
    await shot(page, "05-livros-funcionario-tamanho-correto");
  });

  test("06 — registrar empréstimo ok", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginFuncionario(page);
    await page.goto("/funcionario/registrar-emprestimo");
    await page.waitForTimeout(1200);
    await shot(page, "06-registrar-emprestimo-ok");
  });

  test("07 — dashboard ok", async ({ page }) => {
    await loginFuncionario(page);
    await page.goto("/funcionario/dashboard");
    await page.waitForTimeout(1500);
    await shot(page, "07-dashboard-ok");
  });
});
