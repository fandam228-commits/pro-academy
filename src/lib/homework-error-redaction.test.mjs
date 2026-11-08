import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const homeworkRoute = await readFile(
  new URL("../app/api/homework/route.ts", import.meta.url),
  "utf8",
);
const homeworkFileRoute = await readFile(
  new URL("../app/api/homework/file/[id]/route.ts", import.meta.url),
  "utf8",
);

function getLogCalls(source) {
  return source
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^console\\.(?:error|warn|log)\\(/.test(line));
}

test("homework routes never log raw database or private Blob provider errors", () => {
  assert.deepEqual(getLogCalls(homeworkRoute), [
    'console.error("Homework GET failed; details withheld.");',
    'console.error("Private homework Blob cleanup failed; manual reconciliation may be required.");',
    'console.error("Private homework Blob cleanup failed; manual reconciliation may be required.");',
    'console.error("Homework submission failed; details withheld.");',
    'console.error("Homework POST failed; details withheld.");',
  ]);

  assert.deepEqual(getLogCalls(homeworkFileRoute), [
    'console.error("Homework file GET failed; details withheld.");',
  ]);
});
