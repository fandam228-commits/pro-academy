/**
 * Attendance records currently have no reliable course ownership key.
 * Fail closed for teacher bulk writes until the schema can enforce course scope.
 */
export function authorizeAttendanceWrite(role, action) {
  if (action === "bulk_mark") {
    if (role === "admin") return { ok: true };
    if (role === "teacher") {
      return { ok: false, status: 403, reason: "teacher-scope-unavailable" };
    }
    return { ok: false, status: 403, reason: "forbidden" };
  }

  if (action === "check_in") {
    return role === "student"
      ? { ok: true }
      : { ok: false, status: 403, reason: "forbidden" };
  }

  return { ok: false, status: 400, reason: "invalid-action" };
}
