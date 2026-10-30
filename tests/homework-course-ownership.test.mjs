import test from "node:test";
import assert from "node:assert/strict";
import { canAssignHomeworkToCourse } from "../src/lib/homework-authorization.mjs";

test("teacher can attach homework only to a course they own", () => {
  assert.equal(
    canAssignHomeworkToCourse({
      role: "teacher",
      requesterId: "teacher-1",
      courseTeacherId: "teacher-1",
    }),
    true,
  );
  assert.equal(
    canAssignHomeworkToCourse({
      role: "teacher",
      requesterId: "teacher-1",
      courseTeacherId: "teacher-2",
    }),
    false,
  );
});

test("admin can attach homework to an existing course owned by another teacher", () => {
  assert.equal(
    canAssignHomeworkToCourse({
      role: "admin",
      requesterId: "admin-1",
      courseTeacherId: "teacher-2",
    }),
    true,
  );
});

test("missing identities or course owner and unsupported roles fail closed", () => {
  assert.equal(
    canAssignHomeworkToCourse({
      role: "teacher",
      requesterId: "teacher-1",
      courseTeacherId: "",
    }),
    false,
  );
  assert.equal(
    canAssignHomeworkToCourse({
      role: "teacher",
      requesterId: "",
      courseTeacherId: "teacher-1",
    }),
    false,
  );
  assert.equal(
    canAssignHomeworkToCourse({
      role: "parent",
      requesterId: "parent-1",
      courseTeacherId: "teacher-1",
    }),
    false,
  );
});
