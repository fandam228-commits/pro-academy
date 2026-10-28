/**
 * Generated exam attempts currently have no course ownership relationship.
 * Until that relationship exists, teachers must not receive this history.
 * Admins, parents, and students still require the endpoint's normal
 * student-data relationship checks before any records are returned.
 */
export function canReadUnscopedGeneratedExamHistory(role) {
  return role === "admin" || role === "parent" || role === "student";
}
