import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const routeSource = await readFile(
  new URL("../app/api/parent-links/[id]/verify/route.ts", import.meta.url),
  "utf8",
);
const postStart = routeSource.indexOf("export async function POST(");
const deleteStart = routeSource.indexOf("export async function DELETE(");
assert.notEqual(postStart, -1, "parent-link verification POST handler must exist");
assert.notEqual(deleteStart, -1, "parent-link verification DELETE handler must exist");

const postSource = routeSource.slice(postStart, deleteStart);
const deleteSource = routeSource.slice(deleteStart);

test("parent-link verification authenticates an administrator before database setup or mutation", () => {
  const authIndex = postSource.indexOf("const ctx = await getAuthContext(req)");
  const unauthenticatedGuardIndex = postSource.indexOf("if (!ctx)");
  const adminGuardIndex = postSource.indexOf('if (ctx.user.role !== "admin")');
  const setupIndex = postSource.indexOf("await ensureDbSetup()");
  const mutationIndex = postSource.indexOf("await db.update(parentLinks)");

  assert.ok(authIndex >= 0, "POST must resolve the authenticated context");
  assert.ok(unauthenticatedGuardIndex > authIndex, "POST must reject unauthenticated callers");
  assert.ok(adminGuardIndex > unauthenticatedGuardIndex, "POST must reject non-admin callers");
  assert.ok(setupIndex > adminGuardIndex, "database setup must occur only after the admin guard");
  assert.ok(mutationIndex > setupIndex, "verification mutation must occur after authorization and setup");
  assert.match(postSource, /if\s*\(!ctx\)[\s\S]*?status:\s*401/);
  assert.match(postSource, /if\s*\(ctx\.user\.role\s*!==\s*"admin"\)[\s\S]*?status:\s*403/);
});

test("verification rejects links that do not resolve to current parent and student accounts", () => {
  assert.match(postSource, /db\.select\(\{ role: users\.role \}\)[\s\S]*?eq\(users\.id, link\.parentId\)/);
  assert.match(postSource, /db\.select\(\{ role: users\.role \}\)[\s\S]*?eq\(users\.id, link\.studentId\)/);
  assert.match(postSource, /parentRows\[0\]\?\.role !== "parent"/);
  assert.match(postSource, /studentRows\[0\]\?\.role !== "student"/);
  assert.match(postSource, /status:\s*409/);
});

test("verification records the authenticated administrator and timestamp, not caller-supplied identity", () => {
  assert.match(postSource, /const verifiedAt = new Date\(\)/);
  assert.match(postSource, /\.set\(\{\s*verifiedAt,\s*verifiedBy:\s*ctx\.user\.id\s*\}\)/);
  assert.doesNotMatch(postSource, /req\.json\(\)[\s\S]*?verifiedBy/);
});

test("verification re-checks parent and student roles atomically in the UPDATE predicate", () => {
  const mutationStart = postSource.indexOf("const verifiedRows = await db.update(parentLinks)");
  const mutationEnd = postSource.indexOf(".returning({ id: parentLinks.id })", mutationStart);
  assert.ok(mutationStart >= 0, "verification must use a guarded UPDATE");
  assert.ok(mutationEnd > mutationStart, "guarded UPDATE must return whether it matched");
  const mutationSource = postSource.slice(mutationStart, mutationEnd);

  assert.match(mutationSource, /exists\(db\.select\(\{ id: parentAccount\.id \}\)/);
  assert.match(mutationSource, /eq\(parentAccount\.role, "parent"\)/);
  assert.match(mutationSource, /exists\(db\.select\(\{ id: studentAccount\.id \}\)/);
  assert.match(mutationSource, /eq\(studentAccount\.role, "student"\)/);
  assert.match(postSource, /if\s*\(!verifiedRows\[0\]\)[\s\S]*?status:\s*409/);
});

test("revoking a parent-link verification is administrator-only and clears both verification fields", () => {
  const authIndex = deleteSource.indexOf("const ctx = await getAuthContext(req)");
  const unauthenticatedGuardIndex = deleteSource.indexOf("if (!ctx)");
  const adminGuardIndex = deleteSource.indexOf('if (ctx.user.role !== "admin")');
  const setupIndex = deleteSource.indexOf("await ensureDbSetup()");
  const mutationIndex = deleteSource.indexOf("await db.update(parentLinks)");

  assert.ok(authIndex >= 0, "DELETE must resolve the authenticated context");
  assert.ok(unauthenticatedGuardIndex > authIndex, "DELETE must reject unauthenticated callers");
  assert.ok(adminGuardIndex > unauthenticatedGuardIndex, "DELETE must reject non-admin callers");
  assert.ok(setupIndex > adminGuardIndex, "database setup must occur only after the admin guard");
  assert.ok(mutationIndex > setupIndex, "revocation mutation must occur after authorization and setup");
  assert.match(deleteSource, /\.set\(\{\s*verifiedAt:\s*null,\s*verifiedBy:\s*null\s*\}\)/);
});
