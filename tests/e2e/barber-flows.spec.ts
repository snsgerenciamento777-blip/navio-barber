import { test, expect } from "@playwright/test";

test.describe("Barber - RBAC and Isolation", () => {
  test("dashboard shows barber panel without revenue", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Meus Agendamentos" })).toBeVisible({ timeout: 20000 });
    await expect(page.getByText("Receita do Dia")).toHaveCount(0);
  });

  test("cannot access admin shop config (redirects)", async ({ page }) => {
    await page.goto("/lojas/novo");
    await expect(page).not.toHaveURL("/lojas/novo", { timeout: 15000 });
  });

  test("cannot access service creation (redirects)", async ({ page }) => {
    await page.goto("/servicos/novo");
    await expect(page).not.toHaveURL("/servicos/novo", { timeout: 15000 });
  });

  test("can access agendamentos page", async ({ page }) => {
    await page.goto("/agendamentos");
    await expect(page.getByText("Agendamentos").first()).toBeVisible({ timeout: 15000 });
  });

  test("can access clientes page", async ({ page }) => {
    await page.goto("/clientes");
    await expect(page.getByText("Clientes").first()).toBeVisible({ timeout: 15000 });
  });

  test("logout redirects to login", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('button:has-text("Sair")')).toBeVisible({ timeout: 15000 });
    await page.click('button:has-text("Sair")');
    await page.waitForURL("/login", { timeout: 15000 });
  });
});
