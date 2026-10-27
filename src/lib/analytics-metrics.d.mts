export interface AttendanceRecord {
  status: string;
}

export function attendanceRate(records: AttendanceRecord[]): number | null;

export interface PerformanceIndexInput {
  avgScore: number;
  hwAvg: number;
  attRate: number | null;
  hwCompletion: number;
}

export function calculatePerformanceIndex(input: PerformanceIndexInput): number;

export interface HomeworkSubmissionRef {
  homeworkId: string;
}

export function homeworkCompletion(relevantHomeworkIds: string[], submissions: HomeworkSubmissionRef[]): number;
