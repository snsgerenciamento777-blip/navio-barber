import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

// Our custom implementation
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

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
  const derivedKey = (await scryptAsync(
    password,
    salt,
    KEY_LENGTH,
  )) as Buffer;
  return timingSafeEqual(keyBuffer, derivedKey);
}

// Test compatibility
async function testCompatibility() {
  const password = "TestPassword123!";

  // 1. Hash with our implementation
  const ourHash = await hashPassword(password);
  console.log("Our hash:", ourHash);
  console.log("Our hash length:", ourHash.length);

  // 2. Verify our hash with our verify
  const ourVerify = await verifyPassword(password, ourHash);
  console.log("Our verify (correct):", ourVerify);

  const ourVerifyWrong = await verifyPassword("WrongPassword!", ourHash);
  console.log("Our verify (wrong):", ourVerifyWrong);

  // 3. Better Auth hash from test output
  const betterAuthHash = "d4f7323259f9c77e3e14b8fface3a37d:a89a443b5f200e046af4839a0988672b4778e29f4ddf169813424b97c5e85ed08ac805f590dabfeb810ae0ceb70ba474673bfbaf753c4c8e326d6bd99ac2d318";
  console.log("\nBetter Auth hash:", betterAuthHash);
  console.log("Better Auth hash length:", betterAuthHash.length);

  // 4. Verify Better Auth hash with our verify
  const verifyBetterAuthWithOurs = await verifyPassword(password, betterAuthHash);
  console.log("Our verify of Better Auth hash:", verifyBetterAuthWithOurs);

  // 5. Hash same password with our implementation and compare format
  const ourHash2 = await hashPassword(password);
  console.log("\nSecond our hash:", ourHash2);

  // 6. Verify our second hash
  const verifyOur2 = await verifyPassword(password, ourHash2);
  console.log("Our verify of second hash:", verifyOur2);

  // 7. Cross-verify: our hash with Better Auth's verify would need Better Auth's verify function
  // But we can check if the format is parseable
  const parts = ourHash.split(":");
  console.log("\nOur hash parts:");
  console.log("  Salt:", parts[0], "(", parts[0].length, "chars =", parts[0].length/2, "bytes)");
  console.log("  Hash:", parts[1].substring(0, 32) + "...", "(", parts[1].length, "chars =", parts[1].length/2, "bytes)");

  const baParts = betterAuthHash.split(":");
  console.log("\nBetter Auth hash parts:");
  console.log("  Salt:", baParts[0], "(", baParts[0].length, "chars =", baParts[0].length/2, "bytes)");
  console.log("  Hash:", baParts[1].substring(0, 32) + "...", "(", baParts[1].length, "chars =", baParts[1].length/2, "bytes)");

  // 8. Test if salts are different (they should be - random per hash)
  console.log("\nSalts match:", parts[0] === baParts[0]);
  console.log("Hashes match:", parts[1] === baParts[1]);

  console.log("\n=== CONCLUSION ===");
  console.log("Format compatible:", parts.length === 2 && baParts.length === 2);
  console.log("Salt length match:", parts[0].length === baParts[0].length);
  console.log("Hash length match:", parts[1].length === baParts[1].length);
  console.log("Our verify works on Better Auth hash:", verifyBetterAuthWithOurs);
}

testCompatibility().catch(console.error);