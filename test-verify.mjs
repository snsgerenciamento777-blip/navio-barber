async function test() {
  const { verifyPassword } = await import("@better-auth/utils/password");
  
  // Admin hash from DB
  const adminHash = "658694d2a51a7a1c1471a090d20ad7cf:413b4adc8fb328e7cfc0b0fd69c74dc86cd545bc1e30b61f38235037c6ad3d53fff1c20e11a0faa7ac137caeb9de5d7443943e31228c0b2e345056a6412000e2";
  
  try {
    const result = await verifyPassword(adminHash, "Admin123!");
    console.log("Admin verify result:", result);
  } catch (e) {
    console.error("Admin verify error:", e.message);
  }
  
  // Also test with our own hash generation
  const { hashPassword } = await import("@better-auth/utils/password");
  const newHash = await hashPassword("Admin123!");
  console.log("New hash:", newHash);
  const result2 = await verifyPassword(newHash, "Admin123!");
  console.log("New hash verify:", result2);
  
  // Test the stored hash with the new verify
  const result3 = await verifyPassword(adminHash, "Admin123!");
  console.log("Stored hash verify:", result3);
}
test().catch(e => console.error(e));
