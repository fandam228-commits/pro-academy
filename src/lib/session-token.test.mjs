import test from "node:test";
import assert from "node:assert/strict";
import { extractSessionToken } from "./session-token.mjs";

test("extracts a bearer token before considering cookies", () => {
  assert.equal(
    extractSessionToken("Bearer token-123", "pa_session=cookie-token"),
    "token-123",
  );
});

test("decodes a valid session cookie", () => {
  assert.equal(extractSessionToken(null, "theme=dark; pa_session=token%2D123"), "token-123");
});

test("malformed percent-encoding in a session cookie fails closed without throwing", () => {
  assert.doesNotThrow(() => extractSessionToken(null, "pa_session=%E0%A4%A"));
  assert.equal(extractSessionToken(null, "pa_session=%E0%A4%A"), null);
  assert.equal(extractSessionToken(null, "pa_session=%ZZ"), null);
});

test("missing or empty credentials produce no token", () => {
  assert.equal(extractSessionToken(null, null), null);
  assert.equal(extractSessionToken("Bearer ", "pa_session=cookie-token"), null);
  assert.equal(extractSessionToken(null, "pa_session="), null);
});
