// Test Better Auth's actual hashPassword function
import { hashPassword, verifyPassword } from "@better-auth/utils/password";

async function testBetterAuthPassword() {
  const password = "TestPassword123!";

  console.log("=== Testing Better Auth password functions ===");

  // Generate a hash using Better Auth
  const hash = await hashPassword(password);
  console.log("Better Auth hash:", hash);
  console.log("Hash length:", hash.length);

  // Verify with Better Auth
  const verify = await verifyPassword(hash, password);
  console.log("Better Auth verify (correct):", verify);

  const verifyWrong = await verifyPassword(hash, "WrongPassword!");
  console.log("Better Auth verify (wrong):", verifyWrong);

  // Now test with the known hash from earlier test
  const knownHash = "d4f7323259f9c77e3e14b8fface3a37d:a89a443b5f200e046af4839a0988672b4778e29f4ddf169813424b97c5e85ed08ac805f590dabfeb810ae0ceb70ba474673bfbaf753c4c8e326d6bd99ac2d318";
  console.log("\n=== Testing with known hash ===");
  console.log("Known hash:", knownHash);

  const verifyKnown = await verifyPassword(knownHash, password);
  console.log("Better Auth verify of known hash:", verifyKnown);

  // Parse the known hash
  const [salt, key] = knownHash.split(":");
  console.log("Salt:", salt);
  console.log("Key:", key);

  // Generate another hash with same password
  const hash2 = await hashPassword(password);
  console.log("\nSecond hash:", hash2);
  const verify2 = await verifyPassword(hash2, password);
  console.log("Verify second:", verify2);
}

testBetterAuthPassword().catch(console.error);