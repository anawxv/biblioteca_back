import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const SCREENSHOT_DIR = "test-results/screenshots-exemplares";
const FUNC_EMAIL = process.env.DEMO_FUNC_EMAIL || "funcionario.demo@biblioteca.com";
const FUNC_SENHA = process.env.DEMO_FUNC_SENHA || "Demo123!";
const API_URL = process.env.PLAYWRIGHT_API_URL || "http://localhost:8080/api";

function shot(page, name) {
  const dir = path.resolve(SCREENSHOT_DIR);
  fs.mkdirSync(dir, { recursive: true });
  return page.screenshot({ path: path.join(dir, `${name}.png`), fullPage: true });
}

async function loginFuncionario(page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Sou funcionário" }).click();
  await page.getByPlaceholder("E-mail").fill(FUNC_EMAIL);
  await page.getByPlaceholder("Senha").fill(FUNC_SENHA);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/funcionario/);
}

test.describe("Controle de exemplares — screenshots", () => {
  test.beforeAll(() => {
    fs.mkdirSync(path.resolve(SCREENSHOT_DIR), { recursive: true });
  });

  test("01 — exemplares no banco", async ({ page, request }) => {
    const response = await request.get(`${API_URL}/livros`);
    expect(response.ok()).toBeTruthy();
    const livros = await response.json();
    const livro = livros.find((item) => (item.quantidadeDisponivel ?? 0) > 0) || livros[0];
    expect(livro).toBeTruthy();

    const exemplares = await request.get(`${API_URL}/livros/${livro.idLivro}/exemplares`);
    expect(exemplares.ok()).toBeTruthy();
    const lista = await exemplares.json();
    expect(lista.length).toBeGreaterThan(0);

    await loginFuncionario(page);
    await page.goto("/funcionario/registrar-emprestimo");
    await page.getByPlaceholder("Buscar livro").fill(livro.titulo.slice(0, 8));
    await page.waitForTimeout(600);
    const bookButton = page.locator(".selection-item--book").first();
    await bookButton.click();
    await expect(page.getByText(/Próximo exemplar disponível:/)).toBeVisible();
    await shot(page, "01-exemplares-banco");
  });

  test("02 — registrar empréstimo com exemplar", async ({ page }) => {
    await loginFuncionario(page);
    await page.goto("/funcionario/registrar-emprestimo");
    await page.waitForTimeout(800);
    await shot(page, "02-registrar-emprestimo-exemplar");
  });

  test("03 — empréstimos com exemplar no dashboard", async ({ page }) => {
    await loginFuncionario(page);
    await page.goto("/funcionario/dashboard");
    await page.getByRole("button", { name: "Controlar empréstimos" }).click();
    await page.waitForTimeout(1200);
    await shot(page, "03-emprestimo-com-exemplar");
  });

  test("04 — devolução com exemplar", async ({ page }) => {
    await loginFuncionario(page);
    await page.goto("/funcionario/registrar-devolucao");
    await page.waitForTimeout(1200);
    await shot(page, "04-devolucao-com-exemplar");
  });

  test("05 — dashboard funcionário", async ({ page }) => {
    await loginFuncionario(page);
    await page.goto("/funcionario/dashboard");
    await page.waitForTimeout(1500);
    await shot(page, "05-dashboard-funcionario-exemplar");
  });

  test("06 — ngrok mobile exemplar", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginFuncionario(page);
    await page.goto("/funcionario/registrar-devolucao");
    await page.waitForTimeout(1200);
    await shot(page, "06-ngrok-mobile-exemplar");
  });
});
