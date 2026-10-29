import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { brotliDecompressSync, gunzipSync } from "node:zlib";

const cases = [
  {
    name: "First Secondary Units 1-2 review",
    path: new URL("./seed-unit12-review.ts", import.meta.url),
    decompress: gunzipSync,
    format: "gzip",
  },
  {
    name: "Baccalaureate Model A 2027",
    path: new URL("./seed-baccalaureate-model-a-2027.ts", import.meta.url),
    decompress: brotliDecompressSync,
    format: "Brotli",
  },
];

function extractPayload(path) {
  const source = readFileSync(path, "utf8");
  const match = source.match(/const DATA\s*=\s*"([A-Za-z0-9+/=]+)"/);
  assert.ok(match, `Missing embedded DATA payload in ${path}`);
  return match[1];
}

function validateSeedPayload(item) {
  const payload = extractPayload(item.path);

  assert.match(
    payload,
    /^[A-Za-z0-9+/]+={0,2}$/,
    `${item.name}: payload contains characters outside canonical Base64`
  );
  assert.equal(
    payload.length % 4,
    0,
    `${item.name}: Base64 length ${payload.length} is not divisible by 4; payload is malformed or truncated`
  );

  const compressed = Buffer.from(payload, "base64");
  assert.equal(
    compressed.toString("base64"),
    payload,
    `${item.name}: payload is not canonical Base64`
  );

  let json;
  try {
    json = item.decompress(compressed).toString("utf8");
  } catch (error) {
    assert.fail(
      `${item.name}: ${item.format} decompression failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  let questions;
  try {
    questions = JSON.parse(json);
  } catch (error) {
    assert.fail(
      `${item.name}: decompressed payload is not valid JSON: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  assert.ok(Array.isArray(questions), `${item.name}: expected a question array`);
  assert.ok(questions.length > 0, `${item.name}: question array must not be empty`);
  assert.ok(
    questions.every(
      (row) =>
        row &&
        Number.isInteger(row.n) &&
        typeof row.q === "string" &&
        Array.isArray(row.o) &&
        typeof row.a === "string"
    ),
    `${item.name}: one or more questions do not match the expected schema`
  );

  return questions.length;
}

for (const item of cases) {
  test(`embedded seed payload is intact: ${item.name}`, () => {
    const count = validateSeedPayload(item);
    assert.ok(count > 0);
    console.log(`SEED_PAYLOAD_VALID ${item.name} questions=${count}`);
  });
}
