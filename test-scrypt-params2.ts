import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function testScryptParams() {
  const password = "TestPassword123!";
  const salt = "d4f7323259f9c77e3e14b8fface3a37d"; // Better Auth salt from test
  const expectedHash = "a89a443b5f200e046af4839a0988672b4778e29f4ddf169813424b97c5e85ed08ac805f590dabfeb810ae0ceb70ba474673bfbaf753c4c8e326d6bd99ac2d318";

  // Test various parameter combinations
  const params = [
    { N: 16384, r: 8, p: 1, name: "Node.js default" },
    { N: 8192, r: 8, p: 1, name: "N=8192" },
    { N: 4096, r: 8, p: 1, name: "N=4096" },
    { N: 2048, r: 8, p: 1, name: "N=2048" },
    { N: 1024, r: 8, p: 1, name: "N=1024" },
    { N: 16384, r: 4, p: 1, name: "r=4" },
    { N: 16384, r: 2, p: 1, name: "r=2" },
    { N: 16384, r: 1, p: 1, name: "r=1" },
    { N: 16384, r: 8, p: 2, name: "p=2" },
    { N: 16384, r: 8, p: 3, name: "p=3" },
    { N: 16384, r: 8, p: 4, name: "p=4" },
    { N: 32768, r: 4, p: 1, name: "N=32768,r=4" },
  ];

  for (const param of params) {
    try {
      const key = (await scryptAsync(password, salt, 64, {
        N: param.N,
        r: param.r,
        p: param.p
      })) as Buffer;
      const match = key.toString("hex") === expectedHash;
      console.log(`${param.name}: ${match ? "✓ MATCH" : "✗ no match"}`);
      if (match) {
        console.log("  Derived:", key.toString("hex"));
        break;
      }
    } catch (e) {
      console.log(`${param.name}: ERROR - ${e.message}`);
    }
  }
}

testScryptParams().catch(console.error);