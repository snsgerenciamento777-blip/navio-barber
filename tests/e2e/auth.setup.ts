import { test as setup, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const BASE = "http://localhost:3000";

async function login(email: string, password: string) {
  const res = await fetch(`${BASE}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: BASE },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Sign-in ${email} failed: ${res.status}`);
  const setCookie = res.headers.get("set-cookie") || "";
  const match = setCookie.match(/better-auth\.session_token=([^;]+)/);
  if (!match) throw new Error("No session token for " + email);
  return decodeURIComponent(match[1]);
}

function writeState(file: string, token: string) {
  const state = {
    cookies: [
      {
        name: "better-auth.session_token",
        value: token,
        domain: "localhost",
        path: "/",
        expires: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
        httpOnly: true,
        secure: false,
        sameSite: "Strict" as const,
      },
    ],
    origins: [],
  };
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(state, null, 2));
}

setup("authenticate admin and barber", async () => {
  setup.setTimeout(60000);
  const adminToken = await login("admin@naviobarber.test", "Admin123!");
  const barberToken = await login("barber@naviobarber.test", "Barber123!");
  writeState("tests/e2e/.auth/admin.json", adminToken);
  writeState("tests/e2e/.auth/barber.json", barberToken);
  expect(adminToken.length).toBeGreaterThan(10);
  expect(barberToken.length).toBeGreaterThan(10);
});
