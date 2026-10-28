export interface AttendanceRecord {
  status: string;
}

/** Returns null when no attendance records have been collected. */
export function calculateOverallAttendanceRate(records: AttendanceRecord[]): number | null;
