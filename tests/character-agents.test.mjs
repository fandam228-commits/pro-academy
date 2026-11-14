import { test } from "node:test";
import assert from "node:assert";
import path from "node:path";
import fs from "node:fs";

// Dynamically test character-agents logic
test("AI Character Agents - Personas Definition and Integrity", async () => {
  const tsContent = fs.readFileSync(
    path.join(process.cwd(), "src/lib/story-world/character-agents.ts"),
    "utf-8"
  );

  // Must include all core curriculum characters
  assert.ok(tsContent.includes("edmond_dantes"), "Must define Edmond Dantès persona");
  assert.ok(tsContent.includes("santiago"), "Must define Santiago persona");
  assert.ok(tsContent.includes("professor_challenger"), "Must define Professor Challenger persona");
  assert.ok(tsContent.includes("zeina"), "Must define Zeina persona");
  assert.ok(tsContent.includes("abbe_faria"), "Must define Abbé Faria persona");
  assert.ok(tsContent.includes("manolin"), "Must define Manolin persona");

  // Verify speech style and catchphrases
  assert.ok(tsContent.includes("Wait and hope"), "Edmond must have 'Wait and hope' maxim");
  assert.ok(tsContent.includes("destroyed, but not defeated"), "Santiago must have Hemingway's immortal maxim");
  assert.ok(tsContent.includes("eighty-four"), "Santiago must reference 84 days (not 64)");
  assert.ok(tsContent.includes("preposterous"), "Challenger must have academic vocabulary");

  // Verify knowledge boundary protection against story contamination
  assert.ok(tsContent.includes("isOutOfBounds"), "Must enforce knowledge boundaries");
  assert.ok(tsContent.includes("knowledgeBoundariesEn"), "Must specify knowledge limits in English");
  assert.ok(tsContent.includes("knowledgeBoundariesAr"), "Must specify knowledge limits in Arabic");
});

test("AI Character Agents - Route Handler Integration", async () => {
  const routeContent = fs.readFileSync(
    path.join(process.cwd(), "src/app/api/story-world/character-chat/route.ts"),
    "utf-8"
  );

  assert.ok(routeContent.includes("interactWithCharacterAgent"), "Route must call character agent engine");
  assert.ok(routeContent.includes("contextCitations"), "Route must return context citations");
  assert.ok(routeContent.includes("languageTip"), "Route must return educational language tips");
});
