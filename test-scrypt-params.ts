import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Test different scrypt parameters
async function testScryptParams() {
  const password = "TestPassword123!";
  const salt = "d4f7323259f9c77e3e14b8fface3a37d"; // Better Auth salt from test
  const expectedHash = "a89a443b5f200e046af4839a0988672b4778e29f4ddf169813424b97c5e85ed08ac805f590dabfeb810ae0ceb70ba474673bfbaf753c4c8e326d6bd99ac2d318";

  // Node.js defaults: N=16384, r=8, p=1, keylen=64
  console.log("=== Testing Node.js default scrypt (N=16384, r=8, p=1) ===");
  const key1 = (await scryptAsync(password, salt, 64, { N: 16384, r: 8, p: 1 })) as Buffer;
  console.log("Derived:", key1.toString("hex"));
  console.log("Expected:", expectedHash);
  console.log("Match:", key1.toString("hex") === expectedHash);

  // Common alternative: N=32768, r=8, p=1
  console.log("\n=== Testing N=32768, r=8, p=1 ===");
  const key2 = (await scryptAsync(password, salt, 64, { N: 32768, r: 8, p: 1 })) as Buffer;
  console.log("Derived:", key2.toString("hex"));
  console.log("Match:", key2.toString("hex") === expectedHash);

  // N=65536
  console.log("\n=== Testing N=65536, r=8, p=1 ===");
  const key3 = (await scryptAsync(password, salt, 64, { N: 65536, r: 8, p: 1 })) as Buffer;
  console.log("Derived:", key3.toString("hex"));
  console.log("Match:", key3.toString("hex") === expectedHash);

  // N=1024 (weaker)
  console.log("\n=== Testing N=1024, r=8, p=1 ===");
  const key4 = (await scryptAsync(password, salt, 64, { N: 1024, r: 8, p: 1 })) as Buffer;
  console.log("Derived:", key4.toString("hex"));
  console.log("Match:", key4.toString("hex") === expectedHash);

  // r=1
  console.log("\n=== Testing N=16384, r=1, p=1 ===");
  const key5 = (await scryptAsync(password, salt, 64, { N: 16384, r: 1, p: 1 })) as Buffer;
  console.log("Derived:", key5.toString("hex"));
  console.log("Match:", key5.toString("hex") === expectedHash);

  // r=16
  console.log("\n=== Testing N=16384, r=16, p=1 ===");
  const key6 = (await scryptAsync(password, salt, 64, { N: 16384, r: 16, p: 1 })) as Buffer;
  console.log("Derived:", key6.toString("hex"));
  console.log("Match:", key6.toString("hex") === expectedHash);

  // p=2
  console.log("\n=== Testing N=16384, r=8, p=2 ===");
  const key7 = (await scryptAsync(password, salt, 64, { N: 16384, r: 8, p: 2 })) as Buffer;
  console.log("Derived:", key7.toString("hex"));
  console.log("Match:", key7.toString("hex") === expectedHash);
}

testScryptParams().catch(console.error);