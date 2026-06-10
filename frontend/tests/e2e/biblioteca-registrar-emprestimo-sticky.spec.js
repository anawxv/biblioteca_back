import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const SCREENSHOT_DIR = "test-results/screenshots-registrar-emprestimo-sticky-final";
const FUNC_EMAIL = process.env.DEMO_FUNC_EMAIL || "funcionario.demo@biblioteca.com";
const FUNC_SENHA = process.env.DEMO_FUNC_SENHA || "Demo123!";

function shot(page, name, options = {}) {
  const dir = path.resolve(SCREENSHOT_DIR);
  fs.mkdirSync(dir, { recursive: true });
  return page.screenshot({
    path: path.join(dir, `${name}.png`),
    fullPage: false,
    ...options,
  });
}

async function loginFuncionario(page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Sou funcionário" }).click();
  await page.getByPlaceholder("E-mail").fill(FUNC_EMAIL);
  await page.getByPlaceholder("Senha").fill(FUNC_SENHA);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/funcionario/);
}

async function selecionarClienteELivro(page) {
  await page.goto("/funcionario/registrar-emprestimo");
  await page.getByPlaceholder("Buscar cliente").fill("demo");
  await page.waitForTimeout(500);
  await page.locator(".selection-item").first().click();
  await page.getByPlaceholder("Buscar livro").fill("a");
  await page.waitForTimeout(800);

  const books = page.locator(".selection-item--book");
  const total = await books.count();

  for (let index = 0; index < total; index += 1) {
    await books.nth(index).click();
    await page.waitForTimeout(500);
    const registerButton = page.getByRole("button", { name: "Registrar empréstimo" });
    if (await registerButton.isEnabled()) {
      return;
    }
  }

  throw new Error("Nenhum livro disponível encontrado para o teste.");
}

test.describe("Registrar empréstimo — bloco sticky", () => {
  test.beforeAll(() => {
    fs.mkdirSync(path.resolve(SCREENSHOT_DIR), { recursive: true });
  });

  test("01 — desktop bloco lateral sticky", async ({ page }) => {
    await loginFuncionario(page);
    await selecionarClienteELivro(page);

    const confirm = page.locator(".register-loan-confirm");
    await expect(confirm).toBeVisible();
    await expect(confirm.getByRole("button", { name: "Registrar empréstimo" })).toBeVisible();

    const layout = await page.evaluate(() => {
      const confirmEl = document.querySelector(".register-loan-confirm");
      const mainEl = document.querySelector(".register-loan-page__main");
      if (!confirmEl || !mainEl) return null;

      const confirmRect = confirmEl.getBoundingClientRect();
      const mainRect = mainEl.getBoundingClientRect();
      const style = window.getComputedStyle(confirmEl);

      return {
        position: style.position,
        confirmLeft: confirmRect.left,
        mainRight: mainRect.right,
        isAside: confirmEl.tagName === "ASIDE",
      };
    });

    expect(layout?.position).toBe("sticky");
    expect(layout?.confirmLeft).toBeGreaterThanOrEqual(layout?.mainRight - 8);
    expect(layout?.isAside).toBe(true);

    await shot(page, "01-desktop-bloco-lateral-sticky");
  });

  test("02 — desktop rolagem bloco fixo", async ({ page }) => {
    await loginFuncionario(page);
    await selecionarClienteELivro(page);

    const confirm = page.locator(".register-loan-confirm");
    const initialBox = await confirm.boundingBox();

    await page.locator(".selection-list--books").evaluate((list) => {
      list.scrollTop = list.scrollHeight;
    });
    await page.locator(".app-shell").evaluate((shell) => {
      shell.scrollTop = Math.min(shell.scrollHeight, shell.scrollTop + 320);
    });
    await page.waitForTimeout(500);

    const scrolledBox = await confirm.boundingBox();
    const buttonBox = await confirm.getByRole("button", { name: "Registrar empréstimo" }).boundingBox();

    expect(initialBox).not.toBeNull();
    expect(scrolledBox).not.toBeNull();
    expect(buttonBox).not.toBeNull();
    expect(Math.abs((initialBox?.y || 0) - (scrolledBox?.y || 0))).toBeLessThan(24);
    expect(buttonBox?.y).toBeGreaterThan(0);
    expect((buttonBox?.y || 0) + (buttonBox?.height || 0)).toBeLessThan(780);

    await shot(page, "02-desktop-rolagem-bloco-fixo");
  });

  test("03 — mobile bloco sticky acima nav", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginFuncionario(page);
    await selecionarClienteELivro(page);

    const layout = await page.evaluate(() => {
      const confirm = document.querySelector(".register-loan-confirm");
      const nav = document.querySelector(".bottom-nav");
      const button = document.querySelector(".register-loan-confirm__button");
      if (!confirm || !nav || !button) return null;

      const confirmRect = confirm.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      return {
        position: window.getComputedStyle(confirm).position,
        confirmBottom: confirmRect.bottom,
        navTop: navRect.top,
        buttonBottom: buttonRect.bottom,
      };
    });

    expect(layout?.position).toBe("fixed");
    expect(layout?.confirmBottom).toBeLessThanOrEqual((layout?.navTop || 0) + 4);
    expect(layout?.buttonBottom).toBeLessThanOrEqual((layout?.navTop || 0) + 4);

    await shot(page, "03-mobile-bloco-sticky-acima-nav");
  });

  test("04 — mobile rolagem bloco fixo", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginFuncionario(page);
    await selecionarClienteELivro(page);

    const confirm = page.locator(".register-loan-confirm");
    const before = await confirm.boundingBox();

    await page.locator(".app-shell").evaluate((shell) => {
      shell.scrollTop = shell.scrollHeight;
    });
    await page.waitForTimeout(500);

    const after = await confirm.boundingBox();
    const buttonBox = await confirm.getByRole("button", { name: "Registrar empréstimo" }).boundingBox();

    expect(before).not.toBeNull();
    expect(after).not.toBeNull();
    expect(Math.abs((before?.y || 0) - (after?.y || 0))).toBeLessThan(8);
    expect(buttonBox).not.toBeNull();

    await shot(page, "04-mobile-rolagem-bloco-fixo");
  });

  test("05 — empréstimo registrado com sucesso", async ({ page }) => {
    await loginFuncionario(page);
    await page.goto("/funcionario/registrar-emprestimo");
    await page.getByPlaceholder("Buscar cliente").fill("");
    await page.waitForTimeout(600);

    const clients = page.locator(".selection-item");
    const totalClients = await clients.count();
    let registered = false;

    for (let clientIndex = 0; clientIndex < totalClients && !registered; clientIndex += 1) {
      await clients.nth(clientIndex).click();
      await page.getByPlaceholder("Buscar livro").fill("a");
      await page.waitForTimeout(800);

      const books = page.locator(".selection-item--book");
      const totalBooks = await books.count();

      for (let bookIndex = 0; bookIndex < totalBooks && !registered; bookIndex += 1) {
        await books.nth(bookIndex).click();
        await page.waitForTimeout(500);

        const registerButton = page.getByRole("button", { name: "Registrar empréstimo" });
        if (!(await registerButton.isEnabled())) {
          continue;
        }

        await registerButton.click();
        await page.waitForTimeout(1500);
        registered = await page.locator(".alert--success").isVisible();
      }
    }

    expect(registered).toBe(true);
    await shot(page, "05-emprestimo-registrado-com-sucesso");
  });
});
