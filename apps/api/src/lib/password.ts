import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

// Better Auth parameters (from @better-auth/utils/password.ts)
const BA_SCRYPT_CONFIG = {
  N: 16384,
  r: 16,
  p: 1,
  dkLen: 64,
  maxmem: 128 * 16384 * 16 * 2,
};

// Legacy parameters (Node.js crypto defaults)
const LEGACY_SCRYPT_CONFIG = {
  N: 16384,
  r: 8,
  p: 1,
};

/**
 * Gera hash no formato Better Auth (scrypt N=16384, r=16, p=1, dkLen=64, NFKC)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const saltHex = salt.toString("hex");

  // Better Auth normaliza senha com NFKC antes do hash
  const normalizedPassword = password.normalize("NFKC");

  const derivedKey = (await scryptAsync(
    normalizedPassword,
    saltHex,
    KEY_LENGTH,
    BA_SCRYPT_CONFIG
  )) as Buffer;

  return `${saltHex}:${derivedKey.toString("hex")}`;
}

/**
 * Verifica senha tentando formato Better Auth primeiro, depois legado.
 * Retorna true se qualquer formato validar.
 *
 * Formato Better Auth: salt:hash (scrypt N=16384,r=16,p=1, NFKC)
 * Formato Legado: salt:hash (scrypt N=16384,r=8,p=1, sem NFKC)
 */
export async function verifyPassword(
  password: string,
  hashed: string,
): Promise<boolean> {
  const parts = hashed.split(":");
  if (parts.length !== 2) {
    return false;
  }
  const [salt, key] = parts as [string, string];
  const keyBuffer = Buffer.from(key, "hex");

  // 1. Tentar formato Better Auth (com NFKC, r=16)
  const normalizedPassword = password.normalize("NFKC");
  const baDerivedKey = (await scryptAsync(
    normalizedPassword,
    salt,
    KEY_LENGTH,
    BA_SCRYPT_CONFIG
  )) as Buffer;

  if (timingSafeEqual(keyBuffer, baDerivedKey)) {
    return true;
  }

  // 2. Fallback para formato legado (sem NFKC, r=8)
  const legacyDerivedKey = (await scryptAsync(
    password, // sem normalização
    salt,
    KEY_LENGTH,
    LEGACY_SCRYPT_CONFIG
  )) as Buffer;

  return timingSafeEqual(keyBuffer, legacyDerivedKey);
}

/**
 * Verifica senha e indica se migração é necessária
 * Retorna { valid: boolean, needsMigration: boolean }
 */
export async function verifyPasswordWithMigration(
  password: string,
  hashed: string,
): Promise<{ valid: boolean; needsMigration: boolean }> {
  const parts = hashed.split(":");
  if (parts.length !== 2) {
    return { valid: false, needsMigration: false };
  }
  const [salt, key] = parts as [string, string];
  const keyBuffer = Buffer.from(key, "hex");

  // 1. Tentar Better Auth
  const normalizedPassword = password.normalize("NFKC");
  const baDerivedKey = (await scryptAsync(
    normalizedPassword,
    salt,
    KEY_LENGTH,
    BA_SCRYPT_CONFIG
  )) as Buffer;

  if (timingSafeEqual(keyBuffer, baDerivedKey)) {
    return { valid: true, needsMigration: false };
  }

  // 2. Tentar legado
  const legacyDerivedKey = (await scryptAsync(
    password,
    salt,
    KEY_LENGTH,
    LEGACY_SCRYPT_CONFIG
  )) as Buffer;

  if (timingSafeEqual(keyBuffer, legacyDerivedKey)) {
    return { valid: true, needsMigration: true };
  }

  return { valid: false, needsMigration: false };
}