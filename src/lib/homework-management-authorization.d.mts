import type { db } from "@/db";
import type { courses, homework, homeworkSubmissions, users } from "@/db/schema";

type HomeworkTables = {
  users: typeof users;
  courses: typeof courses;
  homework: typeof homework;
  homeworkSubmissions: typeof homeworkSubmissions;
};

type AuthorizationFailure = {
  ok: false;
  status: 403 | 404;
  error: string;
};

export function gradeHomeworkSubmission(options: {
  database: typeof db;
  tables: HomeworkTables;
  actorId: string;
  actorRole: string;
  submissionId: string;
  score: unknown;
  feedback: unknown;
}): Promise<
  | { ok: true; studentId: string; homeworkTitle: string; score: number; maxPoints: number }
  | AuthorizationFailure
>;

export function deleteHomeworkWithAuthorization(options: {
  database: typeof db;
  tables: Pick<HomeworkTables, "users" | "courses" | "homework">;
  actorId: string;
  actorRole: string;
  homeworkId: string;
}): Promise<{ ok: true } | AuthorizationFailure>;
