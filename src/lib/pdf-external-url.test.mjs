import test from "node:test";
import assert from "node:assert/strict";
import { normalizePublicPdfUrl } from "./pdf-external-url.mjs";

test("accepts absolute HTTP and HTTPS URLs and normalizes them", () => {
  assert.equal(normalizePublicPdfUrl("https://example.com/notes.pdf"), "https://example.com/notes.pdf");
  assert.equal(normalizePublicPdfUrl(" http://example.com/notes.pdf "), "http://example.com/notes.pdf");
  assert.equal(normalizePublicPdfUrl("HTTPS://EXAMPLE.COM/notes.pdf"), "https://example.com/notes.pdf");
});

test("rejects non-web schemes that must never become redirect destinations", () => {
  assert.equal(normalizePublicPdfUrl("javascript:alert(1)"), null);
  assert.equal(normalizePublicPdfUrl("data:application/pdf;base64,AAAA"), null);
  assert.equal(normalizePublicPdfUrl("file:///etc/passwd"), null);
  assert.equal(normalizePublicPdfUrl("ftp://example.com/notes.pdf"), null);
});

test("rejects relative, malformed, empty, and non-string values", () => {
  assert.equal(normalizePublicPdfUrl("/notes.pdf"), null);
  assert.equal(normalizePublicPdfUrl("not a URL"), null);
  assert.equal(normalizePublicPdfUrl(""), null);
  assert.equal(normalizePublicPdfUrl(null), null);
  assert.equal(normalizePublicPdfUrl({ href: "https://example.com" }), null);
});

test("rejects embedded credentials, control/space characters, and oversized URLs", () => {
  assert.equal(normalizePublicPdfUrl("https://user:secret@example.com/notes.pdf"), null);
  assert.equal(normalizePublicPdfUrl("https://example.com/a b.pdf"), null);
  assert.equal(normalizePublicPdfUrl("https://example.com/notes.pdf\n"), "https://example.com/notes.pdf");
  assert.equal(normalizePublicPdfUrl("https://example.com/" + "a".repeat(2048)), null);
});
