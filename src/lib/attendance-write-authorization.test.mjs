import test from "node:test";
import assert from "node:assert/strict";
import { authorizeAttendanceWrite } from "./attendance-write-authorization.mjs";

test("only admins may bulk-mark unscoped attendance records", () => {
  assert.deepEqual(authorizeAttendanceWrite("admin", "bulk_mark"), { ok: true });
  assert.deepEqual(authorizeAttendanceWrite("teacher", "bulk_mark"), {
    ok: false, status: 403, reason: "teacher-scope-unavailable",
  });
  assert.deepEqual(authorizeAttendanceWrite("student", "bulk_mark"), {
    ok: false, status: 403, reason: "forbidden",
  });
  assert.deepEqual(authorizeAttendanceWrite("parent", "bulk_mark"), {
    ok: false, status: 403, reason: "forbidden",
  });
});

test("only students may check themselves in", () => {
  assert.deepEqual(authorizeAttendanceWrite("student", "check_in"), { ok: true });
  for (const role of ["admin", "teacher", "parent", "unknown", null, undefined]) {
    assert.deepEqual(authorizeAttendanceWrite(role, "check_in"), {
      ok: false, status: 403, reason: "forbidden",
    });
  }
});

test("unknown attendance write actions fail with a client error", () => {
  assert.deepEqual(authorizeAttendanceWrite("admin", "delete_all"), {
    ok: false, status: 400, reason: "invalid-action",
  });
});
