import { test, expect } from "@playwright/test";

test.describe("Security - Session and Access", () => {
  test("public pages redirect authenticated users", async ({ page }) => {
    await page.goto("/login");
    await page.waitForURL("/", { timeout: 15000 });
    await page.goto("/cadastro");
    await page.waitForURL("/", { timeout: 15000 });
  });

  test("protected pages redirect unauthenticated users", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/servicos");
    await page.waitForURL("/login", { timeout: 15000 });
  });

  test("protected page agendamentos redirects unauthenticated", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/agendamentos");
    await page.waitForURL("/login", { timeout: 15000 });
  });

  test("logout clears session and protects routes", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('button:has-text("Sair")')).toBeVisible({ timeout: 15000 });
    await page.click('button:has-text("Sair")');
    await page.waitForURL(/\/login/, { timeout: 20000 });
  });
});
