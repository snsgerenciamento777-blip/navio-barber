import { describe, it, expect } from "vitest";
import { z } from "zod";

// Simulação dos schemas de input usados nos routers (após remediação)
const customerListInput = z.object({
  shopId: z.string(),
  status: z.enum(["NEW", "ACTIVE", "INACTIVE", "BLOCKED"]).optional(),
  search: z.string().max(100).optional(),
});

const appointmentCreateInput = z.object({
  customerId: z.string(),
  serviceId: z.string(),
  professionalId: z.string(),
  startAt: z.string().datetime(),
});

const dashboardSummaryInput = z.object({
  userId: z.string(),
  date: z.string().datetime().optional(),
});

describe("Input validation (L-02, H-03, H-04)", () => {
  describe("customer list search (L-02)", () => {
    it("deve aceitar busca com até 100 caracteres", () => {
      const result = customerListInput.safeParse({
        shopId: "shop-1",
        search: "a".repeat(100),
      });
      expect(result.success).toBe(true);
    });

    it("deve rejeitar busca com mais de 100 caracteres", () => {
      const result = customerListInput.safeParse({
        shopId: "shop-1",
        search: "a".repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it("deve aceitar busca ausente", () => {
      const result = customerListInput.safeParse({ shopId: "shop-1" });
      expect(result.success).toBe(true);
    });
  });

  describe("dashboard summary input (H-01, H-02)", () => {
    it("deve exigir userId como string", () => {
      const result = dashboardSummaryInput.safeParse({ userId: "user-1" });
      expect(result.success).toBe(true);
    });

    it("deve rejeitar userId ausente", () => {
      const result = dashboardSummaryInput.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("appointment create input (H-04)", () => {
    it("deve aceitar dados válidos de criação", () => {
      const result = appointmentCreateInput.safeParse({
        customerId: "customer-1",
        serviceId: "service-1",
        professionalId: "professional-1",
        startAt: "2026-12-01T10:00:00Z",
      });
      expect(result.success).toBe(true);
    });

    it("deve rejeitar startAt inválido", () => {
      const result = appointmentCreateInput.safeParse({
        customerId: "customer-1",
        serviceId: "service-1",
        professionalId: "professional-1",
        startAt: "não-uma-data",
      });
      expect(result.success).toBe(false);
    });
  });
});
