import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const routeSource = await readFile(
  new URL("../app/api/analytics/route.ts", import.meta.url),
  "utf8",
);
const getStart = routeSource.indexOf("export async function GET(req: Request)");
assert.notEqual(getStart, -1, "analytics GET handler must exist");
const getSource = routeSource.slice(getStart);

test("analytics GET authenticates before database setup", () => {
  const authIndex = getSource.indexOf("const ctx = await getAuthContext(req)");
  const unauthenticatedGuardIndex = getSource.indexOf(
    'if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });',
  );
  const setupIndex = getSource.indexOf("await ensureDbSetup()");
  const firstDatabaseReadIndex = getSource.indexOf("db.select(");

  assert.ok(authIndex >= 0, "GET must resolve the authenticated context");
  assert.ok(unauthenticatedGuardIndex > authIndex, "GET must reject unauthenticated callers");
  assert.ok(setupIndex > unauthenticatedGuardIndex, "database setup must follow the authentication guard");
  assert.ok(firstDatabaseReadIndex > setupIndex, "analytics data reads must follow authentication and setup");
});

test("analytics GET keeps the unauthenticated response as HTTP 401", () => {
  assert.match(
    getSource,
    /if\s*\(!ctx\)\s*return NextResponse\.json\(\{\s*error:\s*"Unauthorized"\s*\},\s*\{\s*status:\s*401\s*\}\)/,
  );
});
