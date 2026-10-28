export interface TeacherAttendanceRecord {
  markedBy?: string | null;
  [key: string]: unknown;
}

export interface TeacherHomeworkRecord {
  id: string;
  teacherId: string;
  courseId?: string | null;
  [key: string]: unknown;
}

export interface TeacherHomeworkSubmission {
  homeworkId: string;
  [key: string]: unknown;
}

export interface TeacherQuizRecord {
  id: string;
  courseId?: string | null;
  [key: string]: unknown;
}

export interface TeacherQuizSubmission {
  quizId: string;
  [key: string]: unknown;
}

export interface TeacherEnrollment {
  courseId: string;
  [key: string]: unknown;
}

export interface TeacherCourse {
  id: string;
  [key: string]: unknown;
}

export interface TeacherWeeklyReportScopeInput {
  teacherId: string | null | undefined;
  teacherCourseIds?: string[];
  attendanceRecords?: TeacherAttendanceRecord[];
  homeworkRows?: TeacherHomeworkRecord[];
  homeworkSubmissions?: TeacherHomeworkSubmission[];
  quizzes?: TeacherQuizRecord[];
  quizSubmissions?: TeacherQuizSubmission[];
  enrollments?: TeacherEnrollment[];
  courses?: TeacherCourse[];
}

export function scopeTeacherWeeklyReportData(input: TeacherWeeklyReportScopeInput): {
  attendanceRecords: TeacherAttendanceRecord[];
  homeworkRows: TeacherHomeworkRecord[];
  homeworkSubmissions: TeacherHomeworkSubmission[];
  quizzes: TeacherQuizRecord[];
  quizSubmissions: TeacherQuizSubmission[];
  enrollments: TeacherEnrollment[];
  enrolledCourses: TeacherCourse[];
};
