import { test, expect } from "@playwright/test";

test.describe("Admin - Core Flows", () => {
  test("dashboard loads with admin metrics and revenue", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Dashboard Administrativo")).toBeVisible({ timeout: 20000 });
    await expect(page.getByText("Receita do Dia")).toBeVisible();
  });

  test("can access serviços page", async ({ page }) => {
    await page.goto("/servicos");
    await expect(page.getByText("Serviços").first()).toBeVisible({ timeout: 15000 });
  });

  test("can access profissionais page", async ({ page }) => {
    await page.goto("/profissionais");
    await expect(page.getByText("Profissionais").first()).toBeVisible({ timeout: 15000 });
  });

  test("can access clientes page", async ({ page }) => {
    await page.goto("/clientes");
    await expect(page.getByText("Clientes").first()).toBeVisible({ timeout: 15000 });
  });

  test("can access agendamentos page", async ({ page }) => {
    await page.goto("/agendamentos");
    await expect(page.getByText("Agendamentos").first()).toBeVisible({ timeout: 15000 });
  });

  test("logout redirects to login", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('button:has-text("Sair")')).toBeVisible({ timeout: 15000 });
    await page.click('button:has-text("Sair")');
    await page.waitForURL(/\/login/, { timeout: 20000 });
  });
});
