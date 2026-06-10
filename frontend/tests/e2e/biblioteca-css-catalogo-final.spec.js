import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const SCREENSHOT_DIR = "test-results/screenshots-css-catalogo-final";
const CLIENTE_EMAIL = process.env.DEMO_CLIENTE_EMAIL || "cliente.demo@biblioteca.com";
const CLIENTE_SENHA = process.env.DEMO_CLIENTE_SENHA || "Demo123!";
const API_URL = process.env.PLAYWRIGHT_API_URL || "http://localhost:8080/api";

function shot(page, name, options = {}) {
  const dir = path.resolve(SCREENSHOT_DIR);
  fs.mkdirSync(dir, { recursive: true });
  return page.screenshot({
    path: path.join(dir, `${name}.png`),
    fullPage: false,
    ...options,
  });
}

async function loginCliente(page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Sou cliente" }).click();
  await page.getByPlaceholder("E-mail").fill(CLIENTE_EMAIL);
  await page.getByPlaceholder("Senha").fill(CLIENTE_SENHA);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/cliente\/catalogo/);
}

test.describe("CSS catálogo — correção cards/carrosséis", () => {
  test.beforeAll(() => {
    fs.mkdirSync(path.resolve(SCREENSHOT_DIR), { recursive: true });
  });

  test("01 — catálogo desktop corrigido", async ({ page, request }) => {
    const livros = await request.get(`${API_URL}/livros`);
    const lista = await livros.json();
    const fluxoQa = lista.filter((livro) => String(livro.titulo || "").toLowerCase().startsWith("fluxo qa"));
    expect(fluxoQa.length).toBe(0);

    await loginCliente(page);
    await page.waitForTimeout(2500);
    await expect(page.locator("text=Fluxo QA")).toHaveCount(0);

    const carouselCard = page.locator(".carousel-row .book-card").first();
    const carouselBox = await carouselCard.boundingBox();
    expect(carouselBox?.width).toBeLessThanOrEqual(170);

    await shot(page, "01-catalogo-desktop-corrigido", { fullPage: true });
  });

  test("02 — recém adicionados corrigido", async ({ page }) => {
    await loginCliente(page);
    await page.waitForTimeout(2000);
    const section = page.locator(".carousel-section").filter({ hasText: "Recém adicionados" });
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const cover = section.locator(".book-cover").first();
    const coverBox = await cover.boundingBox();
    expect(coverBox?.height).toBeLessThan(260);

    await shot(page, "02-recem-adicionados-corrigido");
  });

  test("03 — mais populares corrigido", async ({ page }) => {
    await loginCliente(page);
    await page.waitForTimeout(2000);
    const section = page.locator(".section-block").filter({ hasText: "Mais populares" });
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const gridCard = section.locator(".books-grid .book-card").first();
    const gridCover = gridCard.locator(".book-cover").first();
    const cardBox = await gridCard.boundingBox();
    const coverBox = await gridCover.boundingBox();

    expect(cardBox?.width).toBeLessThan(400);
    expect(coverBox?.height).toBeLessThan(350);
    if (cardBox && coverBox) {
      expect(coverBox.width).toBeLessThanOrEqual(cardBox.width + 2);
      expect(coverBox.height).toBeLessThanOrEqual(cardBox.height);
    }

    await shot(page, "03-mais-populares-corrigido");
  });

  test("04 — catálogo mobile corrigido", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginCliente(page);
    await page.waitForTimeout(2500);

    const carouselCard = page.locator(".carousel-row .book-card").first();
    const carouselBox = await carouselCard.boundingBox();
    expect(carouselBox?.width).toBeLessThanOrEqual(170);

    await shot(page, "04-catalogo-mobile-corrigido");
  });

  test("05 — bottom nav sem cobrir", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginCliente(page);
    await page.waitForTimeout(2000);
    const lastCard = page.locator(".books-grid .book-card").last();
    await lastCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);

    const layout = await page.evaluate(() => {
      const nav = document.querySelector(".bottom-nav");
      const pageEl = document.querySelector(".page-with-nav");
      const card = document.querySelector(".books-grid .book-card:last-child");
      if (!nav || !pageEl || !card) return null;

      const navRect = nav.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const paddingBottom = Number.parseFloat(window.getComputedStyle(pageEl).paddingBottom) || 0;

      return {
        navTop: navRect.top,
        cardBottom: cardRect.bottom,
        paddingBottom,
        gap: navRect.top - cardRect.bottom,
      };
    });

    expect(layout).not.toBeNull();
    expect(layout.paddingBottom).toBeGreaterThanOrEqual(120);
    expect(layout.cardBottom).toBeLessThanOrEqual(layout.navTop + 8);

    await shot(page, "05-bottom-nav-sem-cobrir");
  });
});
