export type HomeworkDeletionAuthorization =
  | { allowed: true; homeworkId: string }
  | {
      allowed: false;
      reason:
        | "invalid-input"
        | "account-not-found"
        | "role-changed"
        | "unsupported-role"
        | "homework-not-found"
        | "forbidden";
    };

export function lockHomeworkDeletionAuthorization(
  tx: any,
  ids: {
    homeworkId: string;
    requesterId: string;
    sessionRole: string;
  },
  tables: {
    users: any;
    homework: any;
    courses: any;
  },
): Promise<HomeworkDeletionAuthorization>;
