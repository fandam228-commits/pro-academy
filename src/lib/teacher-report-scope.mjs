/**
 * Restrict a teacher's weekly report to records that can be attributed to
 * that teacher's owned courses or teacher-owned homework.
 *
 * Attendance records have no courseId in the current schema, so only records
 * explicitly marked by this teacher can be included in their report.
 * Generated exams also lack course ownership metadata and are not included
 * by this weekly-report scope helper.
 */
export function scopeTeacherWeeklyReportData({
  teacherId,
  teacherCourseIds = [],
  attendanceRecords = [],
  homeworkRows = [],
  homeworkSubmissions = [],
  quizzes = [],
  quizSubmissions = [],
  enrollments = [],
  courses = [],
}) {
  if (typeof teacherId !== "string" || teacherId.length === 0) {
    return {
      attendanceRecords: [],
      homeworkRows: [],
      homeworkSubmissions: [],
      quizzes: [],
      quizSubmissions: [],
      enrollments: [],
      enrolledCourses: [],
    };
  }

  const ownedCourseIds = new Set(
    Array.isArray(teacherCourseIds)
      ? teacherCourseIds.filter((id) => typeof id === "string" && id.length > 0)
      : []
  );

  const scopedAttendance = (Array.isArray(attendanceRecords) ? attendanceRecords : [])
    .filter((record) => record?.markedBy === teacherId);

  const scopedHomework = (Array.isArray(homeworkRows) ? homeworkRows : []).filter((item) => {
    if (item?.teacherId !== teacherId) return false;
    return !item.courseId || ownedCourseIds.has(item.courseId);
  });
  const homeworkIds = new Set(scopedHomework.map((item) => item.id));
  const scopedHomeworkSubmissions = (Array.isArray(homeworkSubmissions) ? homeworkSubmissions : [])
    .filter((submission) => homeworkIds.has(submission?.homeworkId));

  const scopedQuizzes = (Array.isArray(quizzes) ? quizzes : [])
    .filter((quiz) => typeof quiz?.courseId === "string" && ownedCourseIds.has(quiz.courseId));
  const quizIds = new Set(scopedQuizzes.map((quiz) => quiz.id));
  const scopedQuizSubmissions = (Array.isArray(quizSubmissions) ? quizSubmissions : [])
    .filter((submission) => quizIds.has(submission?.quizId));

  const scopedEnrollments = (Array.isArray(enrollments) ? enrollments : [])
    .filter((enrollment) => ownedCourseIds.has(enrollment?.courseId));
  const enrolledCourseIds = new Set(scopedEnrollments.map((enrollment) => enrollment.courseId));
  const scopedCourses = (Array.isArray(courses) ? courses : [])
    .filter((course) => ownedCourseIds.has(course?.id) && enrolledCourseIds.has(course.id));

  return {
    attendanceRecords: scopedAttendance,
    homeworkRows: scopedHomework,
    homeworkSubmissions: scopedHomeworkSubmissions,
    quizzes: scopedQuizzes,
    quizSubmissions: scopedQuizSubmissions,
    enrollments: scopedEnrollments,
    enrolledCourses: scopedCourses,
  };
}
