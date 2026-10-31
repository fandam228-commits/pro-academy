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

test("parent-link verification requires an authenticated administrator before mutation", () => {
  assert.match(postSource, /if\s*\(!ctx\)[\s\S]*?status:\s*401/);
  assert.match(postSource, /if\s*\(ctx\.user\.role\s*!==\s*"admin"\)[\s\S]*?status:\s*403/);
  assert.ok(
    postSource.indexOf('if (ctx.user.role !== "admin")') < postSource.indexOf("await db.update(parentLinks)"),
    "verification writes must occur only after the administrator guard",
  );
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

test("revoking a parent-link verification is administrator-only and clears both verification fields", () => {
  assert.match(deleteSource, /if\s*\(!ctx\)[\s\S]*?status:\s*401/);
  assert.match(deleteSource, /if\s*\(ctx\.user\.role\s*!==\s*"admin"\)[\s\S]*?status:\s*403/);
  assert.ok(
    deleteSource.indexOf('if (ctx.user.role !== "admin")') < deleteSource.indexOf("await db.update(parentLinks)"),
    "revocation writes must occur only after the administrator guard",
  );
  assert.match(deleteSource, /\.set\(\{\s*verifiedAt:\s*null,\s*verifiedBy:\s*null\s*\}\)/);
});
