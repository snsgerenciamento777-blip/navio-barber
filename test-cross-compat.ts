import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { hashPassword as baHashPassword, verifyPassword as baVerifyPassword } from "@better-auth/utils/password";

const scryptAsync = promisify(scrypt);

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

// Our custom implementation (Node.js crypto defaults: N=16384, r=8, p=1)
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

async function testCrossCompatibility() {
  const password = "TestPassword123!";
  const knownBetterAuthHash = "d4f7323259f9c77e3e14b8fface3a37d:a89a443b5f200e046af4839a0988672b4778e29f4ddf169813424b97c5e85ed08ac805f590dabfeb810ae0ceb70ba474673bfbaf753c4c8e326d6bd99ac2d318";

  console.log("=== CROSS-COMPATIBILITY TEST ===\n");

  // 1. Our hash -> Our verify
  console.log("1. Our hash -> Our verify");
  const ourHash = await hashPassword(password);
  console.log("  Our hash:", ourHash);
  const ourVerify = await verifyPassword(password, ourHash);
  console.log("  Our verify:", ourVerify);

  // 2. Better Auth hash -> Better Auth verify
  console.log("\n2. Better Auth hash -> Better Auth verify");
  const baHash = await baHashPassword(password);
  console.log("  BA hash:", baHash);
  const baVerify = await baVerifyPassword(baHash, password);
  console.log("  BA verify:", baVerify);

  // 3. Better Auth known hash -> Better Auth verify
  console.log("\n3. Known BA hash -> BA verify");
  const baVerifyKnown = await baVerifyPassword(knownBetterAuthHash, password);
  console.log("  BA verify known:", baVerifyKnown);

  // 4. Better Auth known hash -> OUR verify (THE CRITICAL TEST)
  console.log("\n4. Known BA hash -> OUR verify (CRITICAL)");
  const ourVerifyBA = await verifyPassword(password, knownBetterAuthHash);
  console.log("  Our verify of BA hash:", ourVerifyBA);
  console.log("  ⚠️  THIS MUST BE TRUE FOR COMPATIBILITY!");

  // 5. Our hash -> Better Auth verify
  console.log("\n5. Our hash -> Better Auth verify");
  const baVerifyOur = await baVerifyPassword(ourHash, password);
  console.log("  BA verify of our hash:", baVerifyOur);
  console.log("  ⚠️  THIS MUST BE TRUE FOR COMPATIBILITY!");

  // 6. Generate BA hash, verify with our code
  console.log("\n6. Fresh BA hash -> Our verify");
  const freshBAHash = await baHashPassword(password);
  console.log("  Fresh BA hash:", freshBAHash);
  const ourVerifyFreshBA = await verifyPassword(password, freshBAHash);
  console.log("  Our verify of fresh BA hash:", ourVerifyFreshBA);

  // 7. Generate our hash, verify with BA code
  console.log("\n7. Fresh Our hash -> BA verify");
  const freshOurHash = await hashPassword(password);
  console.log("  Fresh Our hash:", freshOurHash);
  const baVerifyFreshOur = await baVerifyPassword(freshOurHash, password);
  console.log("  BA verify of fresh our hash:", baVerifyFreshOur);

  // 8. Test with multiple passwords
  console.log("\n8. Multiple passwords test");
  const passwords = ["Simple123", "Complex!@#$%^&*()", "Unicode: ñáéíóú", "LongPasswordThatExceedsNormalLength123456789"];
  for (const pwd of passwords) {
    const ourH = await hashPassword(pwd);
    const baH = await baHashPassword(pwd);
    const ourV = await verifyPassword(pwd, baH);
    const baV = await baVerifyPassword(ourH, pwd);
    console.log(`  "${pwd}": our->BA=${baV}, BA->our=${ourV}`);
  }

  console.log("\n=== SUMMARY ===");
  console.log("Format compatible: YES (salt:hash, 16B salt, 64B key, hex)");
  console.log("Our verify of BA hash:", ourVerifyBA, ourVerifyBA ? "✅" : "❌ CRITICAL FAILURE");
  console.log("BA verify of our hash:", baVerifyOur, baVerifyOur ? "✅" : "❌ CRITICAL FAILURE");
  console.log("Cross-compatible:", (ourVerifyBA && baVerifyOur) ? "YES ✅" : "NO ❌");
}

testCrossCompatibility().catch(console.error);