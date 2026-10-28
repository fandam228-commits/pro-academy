import test from "node:test";
import assert from "node:assert/strict";
import { canReadUnscopedGeneratedExamHistory } from "./student-performance-authorization.mjs";

test("teachers cannot read generated exam history without course attribution", () => {
  assert.equal(canReadUnscopedGeneratedExamHistory("teacher"), false);
});

test("admin, parent, and student roles may continue to use relationship-checked history", () => {
  assert.equal(canReadUnscopedGeneratedExamHistory("admin"), true);
  assert.equal(canReadUnscopedGeneratedExamHistory("parent"), true);
  assert.equal(canReadUnscopedGeneratedExamHistory("student"), true);
});

test("unknown and missing roles are denied generated exam history", () => {
  assert.equal(canReadUnscopedGeneratedExamHistory("staff"), false);
  assert.equal(canReadUnscopedGeneratedExamHistory(""), false);
  assert.equal(canReadUnscopedGeneratedExamHistory(null), false);
});
