import { and, eq, exists, isNotNull } from "drizzle-orm";

/**
 * Build a SQL EXISTS predicate for a currently verified parent/student link.
 * Table aliases are supplied by the caller so the same predicate can be used
 * by the report route and exercised against isolated PostgreSQL fixtures.
 */
export function buildVerifiedParentLinkPredicate({
  db,
  parentLinks,
  parentAccount,
  studentAccount,
  verifiedByUser,
  parentId,
  studentId,
}) {
  return exists(
    db
      .select({ id: parentLinks.id })
      .from(parentLinks)
      .innerJoin(parentAccount, and(
        eq(parentAccount.id, parentLinks.parentId),
        eq(parentAccount.role, "parent"),
      ))
      .innerJoin(studentAccount, and(
        eq(studentAccount.id, parentLinks.studentId),
        eq(studentAccount.role, "student"),
      ))
      .innerJoin(verifiedByUser, and(
        eq(verifiedByUser.id, parentLinks.verifiedBy),
        eq(verifiedByUser.role, "admin"),
      ))
      .where(and(
        eq(parentLinks.parentId, parentId),
        eq(parentLinks.studentId, studentId),
        isNotNull(parentLinks.verifiedAt),
        isNotNull(parentLinks.verifiedBy),
      )),
  );
}
