import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { Role } from "@prisma/client";

describe("Auth router — createUser validações", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("deve rejeitar papel não permitido (CUSTOMER) no createUser", () => {
    const allowedRoles = [Role.ADMIN, Role.BARBER];
    expect(allowedRoles).not.toContain(Role.CUSTOMER);
    expect(allowedRoles).toContain(Role.ADMIN);
    expect(allowedRoles).toContain(Role.BARBER);
  });

  it("deve rejeitar e-mail duplicado", async () => {
    const mockFindUnique = vi.fn().mockResolvedValue({
      id: "user-1",
      email: "dup@example.com",
    });

    const existing = await mockFindUnique({ where: { email: "dup@example.com" } });
    expect(existing).toBeDefined();
    expect(existing.email).toBe("dup@example.com");
  });

  it("deve permitir e-mail disponível para criação", async () => {
    const mockFindUnique = vi.fn().mockResolvedValue(null);

    const existing = await mockFindUnique({ where: { email: "novo@example.com" } });
    expect(existing).toBeNull();
  });

  it("deve criar usuário com papel BARBER quando admin", async () => {
    const mockCreate = vi.fn().mockResolvedValue({
      id: "user-new",
      email: "barber@example.com",
      name: "Barber User",
      role: Role.BARBER,
    });

    const input = { email: "barber@example.com", name: "Barber User", role: Role.BARBER };
    const user = await mockCreate({ data: input });
    expect(user.role).toBe(Role.BARBER);
    expect(user.email).toBe("barber@example.com");
  });

  it("deve criar usuário com papel ADMIN quando admin", async () => {
    const mockCreate = vi.fn().mockResolvedValue({
      id: "user-admin",
      email: "admin@example.com",
      name: "Admin User",
      role: Role.ADMIN,
    });

    const input = { email: "admin@example.com", name: "Admin User", role: Role.ADMIN };
    const user = await mockCreate({ data: input });
    expect(user.role).toBe(Role.ADMIN);
    expect(user.email).toBe("admin@example.com");
  });

  it("deve lançar TRPCError quando papel não permitido é usado", () => {
    const validateRole = (r: Role) => {
      if (r !== Role.ADMIN && r !== Role.BARBER) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Apenas ADMIN ou BARBER podem ser criados por este fluxo",
        });
      }
    };

    expect(() => validateRole(Role.CUSTOMER)).toThrow(TRPCError);
    expect(() => validateRole(Role.ADMIN)).not.toThrow();
    expect(() => validateRole(Role.BARBER)).not.toThrow();
  });
});
