import { scrypt } from "@noble/hashes/scrypt.js";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils.js";

async function testNobleScrypt() {
  const password = "TestPassword123!";
  const salt = "d4f7323259f9c77e3e14b8fface3a37d"; // Better Auth salt from test
  const expectedHash = "a89a443b5f200e046af4839a0988672b4778e29f4ddf169813424b97c5e85ed08ac805f590dabfeb810ae0ceb70ba474673bfbaf753c4c8e326d6bd99ac2d318";

  // Convert salt from hex to bytes
  const saltBytes = Buffer.from(salt, "hex");

  // Test 1: Password as UTF-8 bytes (no normalization)
  const passwordBytes = utf8ToBytes(password);
  console.log("=== Test 1: No NFKC normalization ===");
  let key = scrypt(passwordBytes, saltBytes, { N: 16384, r: 16, p: 1, dkLen: 64 });
  let derived = bytesToHex(key);
  console.log(`No normalization: ${derived === expectedHash ? "✓ MATCH" : "✗ no match"}`);
  if (derived !== expectedHash) console.log(`  Derived: ${derived}`);

  // Test 2: NFKC normalization (what Better Auth does)
  console.log("\n=== Test 2: With NFKC normalization ===");
  const normalizedPassword = password.normalize("NFKC");
  console.log("Original:", password, "-> Normalized:", normalizedPassword);
  console.log("Same:", password === normalizedPassword);
  const normalizedBytes = utf8ToBytes(normalizedPassword);
  key = scrypt(normalizedBytes, saltBytes, { N: 16384, r: 16, p: 1, dkLen: 64 });
  derived = bytesToHex(key);
  console.log(`NFKC normalized: ${derived === expectedHash ? "✓ MATCH" : "✗ no match"}`);
  if (derived !== expectedHash) console.log(`  Derived: ${derived}`);

  // Test 3: Using scryptAsync (what Better Auth uses)
  console.log("\n=== Test 3: Using scryptAsync ===");
  const { scryptAsync } = await import("@noble/hashes/scrypt.js");
  key = await scryptAsync(passwordBytes, saltBytes, { N: 16384, r: 16, p: 1, dkLen: 64, maxmem: 128 * 16384 * 16 * 2 });
  derived = bytesToHex(key);
  console.log(`scryptAsync no norm: ${derived === expectedHash ? "✓ MATCH" : "✗ no match"}`);
  if (derived !== expectedHash) console.log(`  Derived: ${derived}`);

  key = await scryptAsync(normalizedBytes, saltBytes, { N: 16384, r: 16, p: 1, dkLen: 64, maxmem: 128 * 16384 * 16 * 2 });
  derived = bytesToHex(key);
  console.log(`scryptAsync NFKC: ${derived === expectedHash ? "✓ MATCH" : "✗ no match"}`);
  if (derived !== expectedHash) console.log(`  Derived: ${derived}`);

  // Test 4: Test different salt encoding
  console.log("\n=== Test 4: Salt as hex string vs bytes ===");
  // Better Auth uses hex.encode which produces lowercase hex
  key = scrypt(utf8ToBytes(password.normalize("NFKC")), saltBytes, { N: 16384, r: 16, p: 1, dkLen: 64 });
  derived = bytesToHex(key);
  console.log(`Salt as bytes: ${derived === expectedHash ? "✓ MATCH" : "✗ no match"}`);

  // Test with Uint8Array salt
  const saltUint8 = new Uint8Array(saltBytes);
  key = scrypt(utf8ToBytes(password.normalize("NFKC")), saltUint8, { N: 16384, r: 16, p: 1, dkLen: 64 });
  derived = bytesToHex(key);
  console.log(`Salt as Uint8Array: ${derived === expectedHash ? "✓ MATCH" : "✗ no match"}`);
}

testNobleScrypt().catch(console.error);