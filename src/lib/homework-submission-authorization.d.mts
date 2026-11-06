export type CurrentHomeworkSubmissionAccess =
  | {
      allowed: true;
      homework: {
        id: string;
        title: string;
        grade: string | null;
        courseId: string | null;
        teacherId: string;
      };
      student: {
        id: string;
        name: string;
        role: "student";
        grade: string | null;
      };
    }
  | {
      allowed: false;
      reason: "homework-not-found" | "student-not-authorized" | "grade-mismatch" | "not-enrolled";
    };

export function lockCurrentHomeworkSubmissionAccess(
  tx: any,
  ids: { homeworkId: string; studentId: string },
  tables: { users: any; homework: any; enrollments: any },
): Promise<CurrentHomeworkSubmissionAccess>;
