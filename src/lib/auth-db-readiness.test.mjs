import test from "node:test";
import assert from "node:assert/strict";
import { prepareAuthDatabase } from "./auth-db-readiness.mjs";

test("reports database ready only after setup completes", async () => {
  let called = false;
  const result = await prepareAuthDatabase(async () => { called = true; });
  assert.equal(called, true);
  assert.deepEqual(result, { ready: true });
});

test("converts database setup failures into a safe unavailable result", async () => {
  const result = await prepareAuthDatabase(async () => {
    throw new Error("secret database host and credentials must not escape");
  });
  assert.deepEqual(result, { ready: false });
  assert.equal(JSON.stringify(result).includes("secret"), false);
});
