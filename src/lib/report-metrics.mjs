/**
 * Attendance scoring shared by weekly reports.
 * Missing attendance is unreported data, not perfect attendance.
 */
export function calculateOverallAttendanceRate(records) {
  if (!Array.isArray(records) || records.length === 0) return null;

  const present = records.filter((record) => record.status === "present").length;
  const late = records.filter((record) => record.status === "late").length;
  const excused = records.filter((record) => record.status === "excused").length;

  return Math.round(((present + late * 0.7 + excused * 0.85) / records.length) * 100);
}
