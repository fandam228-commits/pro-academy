import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { getTeacherAttendanceStudentIds } from "./attendance-authorization.mjs";

const rows = [
  { studentId: "student-1", courseId: "course-a", teacherId: "teacher-1", status: "active" },
  { studentId: "student-1", courseId: "course-b", teacherId: "teacher-1", status: "completed" },
  { studentId: "student-2", courseId: "course-c", teacherId: "teacher-2", status: "active" },
  { studentId: "student-3", courseId: "course-d", teacherId: "teacher-1", status: "cancelled" },
  { studentId: "student-4", courseId: "course-e", teacherId: "teacher-1", status: null },
  { studentId: "student-5", courseId: "", teacherId: "teacher-1", status: "active" },
];

test("teacher attendance roster includes only unique students in owned active/completed courses", () => {
  assert.deepEqual(getTeacherAttendanceStudentIds(rows, "teacher-1"), ["student-1"]);
  assert.deepEqual(getTeacherAttendanceStudentIds(rows, "teacher-2"), ["student-2"]);
});

test("malformed attendance enrollment input fails closed", () => {
  assert.deepEqual(getTeacherAttendanceStudentIds(null, "teacher-1"), []);
  assert.deepEqual(getTeacherAttendanceStudentIds(rows, ""), []);
  assert.deepEqual(getTeacherAttendanceStudentIds(rows, " "), []);
});

test("attendance API scopes teacher reads and writes to owned-course students", async () => {
  const route = await readFile(new URL("../app/api/attendance/route.ts", import.meta.url), "utf8");
  const teacherGet = route.match(/if \(role === "teacher"\) \{[\s\S]*?return NextResponse\.json\(\{ roster/);
  assert.ok(teacherGet, "teacher GET must have a separate authorization branch");
  assert.match(teacherGet[0], /eq\(courses\.teacherId, ctx\.user\.id\)/);
  assert.match(teacherGet[0], /inArray\(users\.id, allowedStudentIds\)/);
  assert.match(teacherGet[0], /eq\(attendanceRecords\.markedBy, ctx\.user\.id\)/);

  const bulkMark = route.match(/if \(action === "bulk_mark"\) \{[\s\S]*?return NextResponse\.json\(\{ success: true, saved \}\)/);
  assert.ok(bulkMark, "bulk mark handler must exist");
  assert.match(bulkMark[0], /getTeacherAttendanceStudentIds/);
  assert.match(bulkMark[0], /allowedStudentIds\.has\(m\.studentId\)/);
});
