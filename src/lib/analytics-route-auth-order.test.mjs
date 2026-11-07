import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const analyticsRoute = await readFile(
  new URL("../app/api/analytics/route.ts", import.meta.url),
  "utf8",
);

test("Analytics rejects unauthenticated and unsupported-role requests before database setup", () => {
  const getStart = analyticsRoute.indexOf("export async function GET(req: Request)");
  assert.ok(getStart >= 0, "the Analytics GET handler must exist");

  const getBody = analyticsRoute.slice(getStart);
  const authContext = getBody.indexOf("const ctx = await getAuthContext(req);");
  const unauthorizedGuard = getBody.indexOf('if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });');
  const roleRead = getBody.indexOf("const role = ctx.user.role as string;");
  const roleAllowlist = getBody.indexOf('if (!["admin", "teacher", "parent", "student"].includes(role))');
  const databaseSetup = getBody.indexOf("await ensureDbSetup();");
  const firstDatabaseRead = getBody.indexOf("db.select(");

  assert.ok(authContext >= 0, "the handler must resolve the authenticated session");
  assert.ok(unauthorizedGuard > authContext, "unauthenticated requests must be rejected immediately");
  assert.ok(roleRead > unauthorizedGuard, "the role must be read only after authentication");
  assert.ok(roleAllowlist > roleRead, "unsupported roles must be rejected");
  assert.ok(databaseSetup > roleAllowlist, "database setup must happen only after authentication and role validation");
  assert.ok(firstDatabaseRead === -1 || firstDatabaseRead > databaseSetup,
    "the handler must not read report data before database setup and authorization");
});
