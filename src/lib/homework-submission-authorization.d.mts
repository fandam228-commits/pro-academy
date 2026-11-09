export type HomeworkSubmissionAuthorizationResult =
  | {
      allowed: true;
      homeworkId: string;
      homeworkTitle: string;
      homeworkTeacherId: string;
      courseId: string | null;
    }
  | {
      allowed: false;
      reason: string;
    };

export function lockHomeworkSubmissionAuthorization(
  tx: any,
  input: { homeworkId: string; studentId: string; sessionRole: string },
  tables: { users: any; homework: any; courses: any; enrollments: any },
): Promise<HomeworkSubmissionAuthorizationResult>;
