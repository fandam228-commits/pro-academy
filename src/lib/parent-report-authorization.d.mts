import type { SQL } from "drizzle-orm";

export function buildVerifiedParentLinkPredicate(args: {
  db: unknown;
  parentLinks: unknown;
  parentAccount: unknown;
  studentAccount: unknown;
  verifiedByUser: unknown;
  parentId: string;
  studentId: string;
}): SQL<unknown>;
