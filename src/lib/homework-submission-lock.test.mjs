import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { withHomeworkSubmissionLock } from "./homework-submission-lock.mjs";

test("homework submission lock is acquired before persistence callback", async () => {
  const events = [];
  const tx = {
    async execute(statement) {
      events.push({ kind: "lock", statement });
      return { rows: [] };
    },
  };

  const result = await withHomeworkSubmissionLock(
    tx,
    { homeworkId: "homework-1", studentId: "student-1" },
    async (lockedTx) => {
      assert.equal(lockedTx, tx);
      events.push({ kind: "callback" });
      return "persisted";
    },
  );

  assert.equal(result, "persisted");
  assert.deepEqual(events.map((event) => event.kind), ["lock", "callback"]);
});

test("homework submission lock rejects incomplete identity before executing SQL", async () => {
  let executed = false;
  const tx = { async execute() { executed = true; } };

  await assert.rejects(
    () => withHomeworkSubmissionLock(
      tx,
      { homeworkId: "homework-1", studentId: "" },
      async () => "must-not-run",
    ),
    /homework ID and student ID are required/i,
  );
  assert.equal(executed, false);
});

test("homework submission POST rechecks the pair inside the advisory-lock transaction", async () => {
  const route = await readFile(new URL("../app/api/homework/route.ts", import.meta.url), "utf8");
  assert.match(
    route,
    /db\.transaction\(async \(tx\)\s*=>\s*withHomeworkSubmissionLock\(/,
    "submission persistence must execute inside the transaction-scoped lock",
  );
  assert.match(route, /const lockedExisting = await lockedTx\s*\.select\(\)/);
  assert.match(route, /if \(lockedExisting\.length > 1\)/,
    "legacy duplicate rows must fail closed instead of selecting an arbitrary row");
  assert.match(route, /await lockedTx\.insert\(homeworkSubmissions\)/,
    "the first submission insert must happen while the pair lock is held");
});
