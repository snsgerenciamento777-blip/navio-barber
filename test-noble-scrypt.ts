import { scrypt } from "@noble/hashes/scrypt.js";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils.js";

async function testNobleScrypt() {
  const password = "TestPassword123!";
  const salt = "d4f7323259f9c77e3e14b8fface3a37d"; // Better Auth salt from test
  const expectedHash = "a89a443b5f200e046af4839a0988672b4778e29f4ddf169813424b97c5e85ed08ac805f590dabfeb810ae0ceb70ba474673bfbaf753c4c8e326d6bd99ac2d318";

  // Convert salt from hex to bytes
  const saltBytes = Buffer.from(salt, "hex");
  const passwordBytes = utf8ToBytes(password);

  console.log("=== Testing @noble/hashes scrypt ===");

  // Test various parameter combinations
  const params = [
    { N: 16384, r: 16, p: 1, dkLen: 64, name: "Better Auth: N=16384, r=16, p=1, dkLen=64" },
    { N: 16384, r: 8, p: 1, dkLen: 64, name: "N=16384, r=8, p=1, dkLen=64" },
    { N: 16384, r: 8, p: 1, dkLen: 32, name: "N=16384, r=8, p=1, dkLen=32 (default)" },
    { N: 32768, r: 8, p: 1, dkLen: 64, name: "N=32768, r=8, p=1" },
    { N: 8192, r: 8, p: 1, dkLen: 64, name: "N=8192, r=8, p=1" },
    { N: 4096, r: 8, p: 1, dkLen: 64, name: "N=4096, r=8, p=1" },
    { N: 2048, r: 8, p: 1, dkLen: 64, name: "N=2048, r=8, p=1" },
    { N: 1024, r: 8, p: 1, dkLen: 64, name: "N=1024, r=8, p=1" },
    { N: 16384, r: 4, p: 1, dkLen: 64, name: "r=4" },
    { N: 16384, r: 2, p: 1, dkLen: 64, name: "r=2" },
    { N: 16384, r: 1, p: 1, dkLen: 64, name: "r=1" },
    { N: 16384, r: 16, p: 1, dkLen: 64, name: "r=16" },
    { N: 16384, r: 8, p: 2, dkLen: 64, name: "p=2" },
  ];

  for (const param of params) {
    try {
      const key = scrypt(passwordBytes, saltBytes, {
        N: param.N,
        r: param.r,
        p: param.p,
        dkLen: param.dkLen
      });
      const derived = bytesToHex(key);
      const match = derived === expectedHash;
      console.log(`${param.name}: ${match ? "✓ MATCH" : "✗ no match"}`);
      if (match) {
        console.log("  Derived:", derived);
        break;
      }
    } catch (e) {
      console.log(`${param.name}: ERROR - ${e.message}`);
    }
  }
}

testNobleScrypt().catch(console.error);