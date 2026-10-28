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

export interface TeacherWeeklyReportScopeInput<
  A extends TeacherAttendanceRecord = TeacherAttendanceRecord,
  H extends TeacherHomeworkRecord = TeacherHomeworkRecord,
  HS extends TeacherHomeworkSubmission = TeacherHomeworkSubmission,
  Q extends TeacherQuizRecord = TeacherQuizRecord,
  QS extends TeacherQuizSubmission = TeacherQuizSubmission,
  E extends TeacherEnrollment = TeacherEnrollment,
  C extends TeacherCourse = TeacherCourse
> {
  teacherId: string | null | undefined;
  teacherCourseIds?: string[];
  attendanceRecords?: A[];
  homeworkRows?: H[];
  homeworkSubmissions?: HS[];
  quizzes?: Q[];
  quizSubmissions?: QS[];
  enrollments?: E[];
  courses?: C[];
}

export function scopeTeacherWeeklyReportData<
  A extends TeacherAttendanceRecord = TeacherAttendanceRecord,
  H extends TeacherHomeworkRecord = TeacherHomeworkRecord,
  HS extends TeacherHomeworkSubmission = TeacherHomeworkSubmission,
  Q extends TeacherQuizRecord = TeacherQuizRecord,
  QS extends TeacherQuizSubmission = TeacherQuizSubmission,
  E extends TeacherEnrollment = TeacherEnrollment,
  C extends TeacherCourse = TeacherCourse
>(input: TeacherWeeklyReportScopeInput<A, H, HS, Q, QS, E, C>): {
  attendanceRecords: A[];
  homeworkRows: H[];
  homeworkSubmissions: HS[];
  quizzes: Q[];
  quizSubmissions: QS[];
  enrollments: E[];
  enrolledCourses: C[];
};
