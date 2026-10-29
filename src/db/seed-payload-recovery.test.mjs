import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { brotliDecompressSync, gunzipSync } from "node:zlib";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const cases = [
  {
    name: "First Secondary Units 1-2 review",
    path: new URL("./seed-unit12-review.ts", import.meta.url),
    decompress: gunzipSync,
    repair: "insert",
  },
  {
    name: "Baccalaureate Model A 2027",
    path: new URL("./seed-baccalaureate-model-a-2027.ts", import.meta.url),
    decompress: brotliDecompressSync,
    repair: "substitute",
  },
];

function extractPayload(path) {
  const source = readFileSync(path, "utf8");
  const match = source.match(/const DATA\s*=\s*"([A-Za-z0-9+/=]+)"/);
  assert.ok(match, `Missing embedded DATA payload in ${path}`);
  return match[1];
}

function parsePayload(payload, decompress) {
  try {
    const value = JSON.parse(decompress(Buffer.from(payload, "base64")).toString("utf8"));
    if (!Array.isArray(value) || value.length === 0) return null;
    if (!value.every((row) => row && Number.isInteger(row.n) && typeof row.q === "string" && Array.isArray(row.o) && typeof row.a === "string")) return null;
    return value;
  } catch {
    return null;
  }
}

function recover(payload, decompress, mode) {
  if (mode === "insert") {
    // The candidate must be valid padded base64; insertion is only attempted before padding.
    const firstPadding = payload.indexOf("=");
    const lastPosition = firstPadding === -1 ? payload.length : firstPadding;
    for (let position = 0; position <= lastPosition; position++) {
      for (const character of alphabet) {
        const candidate = payload.slice(0, position) + character + payload.slice(position);
        if (candidate.length % 4 !== 0) continue;
        if (parsePayload(candidate, decompress)) return candidate;
      }
    }
    return null;
  }

  // Search for a single substituted base64 character. Gzip/Brotli integrity plus JSON
  // structure validation makes a successful candidate substantially stronger than a
  // decompression-only match.
  for (let position = 0; position < payload.length; position++) {
    if (payload[position] === "=") continue;
    for (const character of alphabet) {
      if (character === payload[position]) continue;
      const candidate = payload.slice(0, position) + character + payload.slice(position + 1);
      if (parsePayload(candidate, decompress)) return candidate;
    }
  }
  return null;
}

for (const item of cases) {
  test(`diagnose embedded seed payload: ${item.name}`, () => {
    const payload = extractPayload(item.path);
    if (parsePayload(payload, item.decompress)) {
      console.log(`SEED_PAYLOAD_VALID ${item.name} length=${payload.length}`);
      return;
    }

    console.log(`SEED_PAYLOAD_INVALID ${item.name} length=${payload.length}`);
    const repaired = recover(payload, item.decompress, item.repair);
    if (repaired) {
      console.log(`RECOVERED_PAYLOAD_BEGIN ${item.name}`);
      for (let offset = 0; offset < repaired.length; offset += 120) {
        console.log(`RECOVERED_PAYLOAD_CHUNK ${offset} ${repaired.slice(offset, offset + 120)}`);
      }
      console.log(`RECOVERED_PAYLOAD_END ${item.name}`);
    } else {
      console.log(`NO_SINGLE_CHARACTER_RECOVERY ${item.name}`);
    }
    // This temporary diagnostic intentionally reports findings without altering seed data.
    assert.ok(true);
  });
}
