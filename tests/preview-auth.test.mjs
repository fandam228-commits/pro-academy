import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("Preview Auth Fallback - Static Verification", () => {
  const securityPath = path.join(__dirname, "..", "src", "lib", "security.ts");
  const authRoutePath = path.join(__dirname, "..", "src", "app", "api", "auth", "route.ts");

  assert.ok(fs.existsSync(securityPath), "security.ts must exist");
  assert.ok(fs.existsSync(authRoutePath), "auth route.ts must exist");

  const secContent = fs.readFileSync(securityPath, "utf8");
  const authContent = fs.readFileSync(authRoutePath, "utf8");

  // Ensure PREVIEW_FALLBACK_USERS and in-memory sessions are implemented
  assert.ok(secContent.includes("PREVIEW_FALLBACK_USERS"), "Must define PREVIEW_FALLBACK_USERS");
  assert.ok(secContent.includes("findFallbackUser"), "Must export findFallbackUser");
  assert.ok(secContent.includes("__paMemorySessions"), "Must support in-memory sessions");

  // Ensure auth route doesn't crash on preview when DATABASE_URL is missing
  assert.ok(authContent.includes("findFallbackUser"), "Auth route must use fallback users when DATABASE_URL is missing");
  assert.ok(authContent.includes("!process.env.DATABASE_URL"), "Auth route must detect missing DATABASE_URL gracefully");
});
