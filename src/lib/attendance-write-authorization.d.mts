export type AttendanceWriteAuthorization =
  | { ok: true }
  | { ok: false; status: 403; reason: "teacher-scope-unavailable" | "forbidden" }
  | { ok: false; status: 400; reason: "invalid-action" };

export function authorizeAttendanceWrite(
  role: string,
  action: unknown,
): AttendanceWriteAuthorization;
