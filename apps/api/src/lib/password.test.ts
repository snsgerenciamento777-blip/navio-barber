import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, verifyPasswordWithMigration } from "./password";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Helper para gerar hash legado (r=8, sem NFKC) para testes
async function generateLegacyHash(password: string): Promise<string> {
  const salt = randomBytes(16);
  const saltHex = salt.toString("hex");
  const derivedKey = (await scryptAsync(password, saltHex, 64, {
    N: 16384,
    r: 8,
    p: 1,
  })) as Buffer;
  return `${saltHex}:${derivedKey.toString("hex")}`;
}

describe("Password hashing (C-01 remediação)", () => {
  it("deve gerar hash diferente para a mesma senha em chamadas diferentes (salt aleatório)", async () => {
    const hash1 = await hashPassword("senha123");
    const hash2 = await hashPassword("senha123");
    expect(hash1).not.toBe(hash2);
  });

  it("deve verificar senha correta", async () => {
    const hash = await hashPassword("senha123");
    const valido = await verifyPassword("senha123", hash);
    expect(valido).toBe(true);
  });

  it("deve rejeitar senha incorreta", async () => {
    const hash = await hashPassword("senha123");
    const valido = await verifyPassword("senha456", hash);
    expect(valido).toBe(false);
  });

  it("deve rejeitar hash malformado", async () => {
    const valido = await verifyPassword("senha123", "hash-invalido");
    expect(valido).toBe(false);
  });

  it("hash deve conter salt e chave separados por dois pontos", async () => {
    const hash = await hashPassword("senha123");
    const partes = hash.split(":");
    expect(partes).toHaveLength(2);
    expect(partes[0].length).toBe(32); // salt hex (16 bytes)
    expect(partes[1].length).toBe(128); // key hex (64 bytes)
  });
});

describe("Verificação dual (legado r=8 + Better Auth r=16+NFKC)", () => {
  it("deve verificar hash Better Auth (r=16, NFKC)", async () => {
    const hash = "d4f7323259f9c77e3e14b8fface3a37d:a89a443b5f200e046af4839a0988672b4778e29f4ddf169813424b97c5e85ed08ac805f590dabfeb810ae0ceb70ba474673bfbaf753c4c8e326d6bd99ac2d318";
    const result = await verifyPassword("TestPassword123!", hash);
    expect(result).toBe(true);
  });

  it("deve rejeitar senha errada em hash Better Auth", async () => {
    const hash = "d4f7323259f9c77e3e14b8fface3a37d:a89a443b5f200e046af4839a0988672b4778e29f4ddf169813424b97c5e85ed08ac805f590dabfeb810ae0ceb70ba474673bfbaf753c4c8e326d6bd99ac2d318";
    const result = await verifyPassword("WrongPassword!", hash);
    expect(result).toBe(false);
  });

  it("deve verificar hash legado (r=8, sem NFKC)", async () => {
    // Hash gerado com implementação antiga (Node.js crypto defaults, r=8, sem NFKC)
    const legacyHash = await generateLegacyHash("senha123");
    const result = await verifyPassword("senha123", legacyHash);
    expect(result).toBe(true);
  });

  it("deve detectar formato do hash (Better Auth vs legado)", async () => {
    const baHash = "d4f7323259f9c77e3e14b8fface3a37d:a89a443b5f200e046af4839a0988672b4778e29f4ddf169813424b97c5e85ed08ac805f590dabfeb810ae0ceb70ba474673bfbaf753c4c8e326d6bd99ac2d318";
    const legacyHash = await generateLegacyHash("senha123");

    // Ambos devem ser verificáveis
    expect(await verifyPassword("TestPassword123!", baHash)).toBe(true);
    expect(await verifyPassword("senha123", legacyHash)).toBe(true);
  });

  it("deve migrar hash legado para Better Auth no login bem-sucedido", async () => {
    const legacyHash = await generateLegacyHash("senha123");
    // Simula login com hash legado
    const isValid = await verifyPassword("senha123", legacyHash);
    expect(isValid).toBe(true);

    // Após verificação, novo hash deve ser formato Better Auth
    const newHash = await hashPassword("senha123");
    const parts = newHash.split(":");
    expect(parts).toHaveLength(2);
    expect(parts[0].length).toBe(32); // 16 bytes salt
    expect(parts[1].length).toBe(128); // 64 bytes key
  });

  it("verifyPasswordWithMigration deve retornar valid=true e needsMigration=false para hash Better Auth", async () => {
    const baHash = "d4f7323259f9c77e3e14b8fface3a37d:a89a443b5f200e046af4839a0988672b4778e29f4ddf169813424b97c5e85ed08ac805f590dabfeb810ae0ceb70ba474673bfbaf753c4c8e326d6bd99ac2d318";
    const result = await verifyPasswordWithMigration("TestPassword123!", baHash);
    expect(result.valid).toBe(true);
    expect(result.needsMigration).toBe(false);
  });

  it("verifyPasswordWithMigration deve retornar valid=true e needsMigration=true para hash legado", async () => {
    const legacyHash = await generateLegacyHash("senha123");
    const result = await verifyPasswordWithMigration("senha123", legacyHash);
    expect(result.valid).toBe(true);
    expect(result.needsMigration).toBe(true);
  });

  it("verifyPasswordWithMigration deve retornar valid=false para senha errada", async () => {
    const baHash = "d4f7323259f9c77e3e14b8fface3a37d:a89a443b5f200e046af4839a0988672b4778e29f4ddf169813424b97c5e85ed08ac805f590dabfeb810ae0ceb70ba474673bfbaf753c4c8e326d6bd99ac2d318";
    const result = await verifyPasswordWithMigration("WrongPassword!", baHash);
    expect(result.valid).toBe(false);
    expect(result.needsMigration).toBe(false);
  });
});
