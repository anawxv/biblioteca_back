import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const SCREENSHOT_DIR = "test-results/screenshots";
const CLIENTE_EMAIL = process.env.DEMO_CLIENTE_EMAIL || "cliente.demo@biblioteca.com";
const CLIENTE_SENHA = process.env.DEMO_CLIENTE_SENHA || "Demo123!";
const FUNC_EMAIL = process.env.DEMO_FUNC_EMAIL || "funcionario.demo@biblioteca.com";
const FUNC_SENHA = process.env.DEMO_FUNC_SENHA || "Demo123!";

function shot(page, name, fullPage = false) {
  fs.mkdirSync(path.resolve(SCREENSHOT_DIR), { recursive: true });
  return page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}.png`), fullPage, timeout: 30_000 });
}

async function fazerLogin(page, email, senha) {
  await page.getByPlaceholder("E-mail").fill(email);
  await page.getByPlaceholder("Senha").fill(senha);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
}

test.describe("Biblioteca AP1 — mobile / bottom nav", () => {
  test("10 — Bottom nav cliente nao cobre conteudo", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Sou cliente" }).click();
    await fazerLogin(page, CLIENTE_EMAIL, CLIENTE_SENHA);
    await expect(page).toHaveURL(/\/cliente\/catalogo/);
    await page.waitForTimeout(1500);

    const bottomNav = page.locator(".bottom-nav");
    await expect(bottomNav).toBeVisible();

    const pageWithNav = page.locator(".page-with-nav");
    await expect(pageWithNav).toBeVisible();

    const paddingBottom = await pageWithNav.evaluate((el) => getComputedStyle(el).paddingBottom);
    expect(parseInt(paddingBottom, 10)).toBeGreaterThan(100);

    const navBox = await bottomNav.boundingBox();
    expect(navBox?.height).toBeGreaterThan(0);

    await shot(page, "10-bottom-nav-mobile-cliente");
  });

  test("11 — Bottom nav funcionario mobile", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Sou funcionário" }).click();
    await fazerLogin(page, FUNC_EMAIL, FUNC_SENHA);
    await expect(page).toHaveURL(/\/funcionario\/painel/);
    await page.waitForTimeout(1500);
    await expect(page.locator(".bottom-nav--admin")).toBeVisible();
    await shot(page, "11-bottom-nav-mobile-funcionario");
  });
});
