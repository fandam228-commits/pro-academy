import test from "node:test";
import assert from "node:assert/strict";
import { canAccessHomeworkRecord } from "./homework-authorization.mjs";

test("admin can read homework records regardless of owner", () => {
  assert.equal(
    canAccessHomeworkRecord({ role: "admin", requesterId: "admin-1", homeworkTeacherId: "teacher-2" }),
    true
  );
});

test("teacher can read their own homework and its submissions", () => {
  assert.equal(
    canAccessHomeworkRecord({ role: "teacher", requesterId: "teacher-1", homeworkTeacherId: "teacher-1" }),
    true
  );
});

test("teacher cannot read another teacher's homework or submissions", () => {
  assert.equal(
    canAccessHomeworkRecord({ role: "teacher", requesterId: "teacher-1", homeworkTeacherId: "teacher-2" }),
    false
  );
});

test("students, parents, unknown roles, and missing identifiers are denied", () => {
  for (const role of ["student", "parent", "staff", ""]) {
    assert.equal(
      canAccessHomeworkRecord({ role, requesterId: "user-1", homeworkTeacherId: "teacher-1" }),
      false
    );
  }
  assert.equal(
    canAccessHomeworkRecord({ role: "teacher", requesterId: "", homeworkTeacherId: "teacher-1" }),
    false
  );
  assert.equal(
    canAccessHomeworkRecord({ role: "teacher", requesterId: "teacher-1", homeworkTeacherId: "" }),
    false
  );
});
