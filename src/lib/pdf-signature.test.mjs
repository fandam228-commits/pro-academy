import test from "node:test";
import assert from "node:assert/strict";
import { hasPdfHeader } from "./pdf-signature.mjs";

test("accepts a PDF header at the start of a file", () => {
  assert.equal(hasPdfHeader(Buffer.from("%PDF-1.7\nbody")), true);
});

test("accepts a PDF header within the first 1024 bytes for compatible readers", () => {
  const prefix = Buffer.alloc(512, 0);
  const file = Buffer.concat([prefix, Buffer.from("%PDF-1.4\nbody")]);
  assert.equal(hasPdfHeader(file), true);
});

test("rejects data without a PDF header even when the filename or MIME type claims PDF", () => {
  assert.equal(hasPdfHeader(Buffer.from("<html><body>not a PDF</body></html>")), false);
  assert.equal(hasPdfHeader(Buffer.from("PK\u0003\u0004archive")), false);
});

test("rejects missing, invalid, and late PDF headers", () => {
  assert.equal(hasPdfHeader(null), false);
  assert.equal(hasPdfHeader("%%PDF-1.7"), false);
  assert.equal(hasPdfHeader(Buffer.alloc(0)), false);
  assert.equal(hasPdfHeader(Buffer.concat([Buffer.alloc(1024, 0), Buffer.from("%PDF-1.7")])), false);
});
