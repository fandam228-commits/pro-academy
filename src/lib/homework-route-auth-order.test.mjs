import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../app/api/homework/route.ts", import.meta.url), "utf8");
const getStart = route.indexOf("export async function GET(req: Request)");
const postStart = route.indexOf("export async function POST(req: Request)");
assert.ok(getStart >= 0 && postStart > getStart, "homework GET and POST handlers must exist");

const getSource = route.slice(getStart, postStart);
const postSource = route.slice(postStart);
const jsonStart = postSource.indexOf("// ============ JSON ACTIONS: create / grade / delete ============");
assert.ok(jsonStart >= 0, "JSON action section must exist");
const jsonSource = postSource.slice(jsonStart);

test("homework GET authenticates and validates the role before database setup or reads", () => {
  const auth = getSource.indexOf("const ctx = await getAuthContext(req)");
  const unauth = getSource.indexOf('if (!ctx)');
  const role = getSource.indexOf('if (!["teacher", "admin", "student"].includes(role))');
  const setup = getSource.indexOf("await ensureDbSetup()");
  const read = getSource.indexOf("db.select(");

  assert.ok(auth >= 0, "GET must resolve authentication");
  assert.ok(unauth > auth, "GET must reject anonymous requests");
  assert.ok(role > unauth, "GET must reject unsupported roles");
  assert.ok(setup > role, "database setup must follow authentication and role checks");
  assert.ok(read > setup, "database reads must follow setup");
});

test("multipart homework submission checks student role before database setup", () => {
  const auth = postSource.indexOf("const ctx = await getAuthContext(req)");
  const unauth = postSource.indexOf('if (!ctx)');
  const multipart = postSource.indexOf('if (contentType.includes("multipart/form-data"))');
  const role = postSource.indexOf("if (!canSubmitHomework({ role: ctx.user.role }))", multipart);
  const setup = postSource.indexOf("await ensureDbSetup()", role);
  const formRead = postSource.indexOf("await req.formData()", setup);

  assert.ok(auth >= 0, "POST must resolve authentication");
  assert.ok(unauth > auth, "POST must reject anonymous requests");
  assert.ok(multipart > unauth, "content type must be handled after authentication");
  assert.ok(role > multipart, "submission role policy must be checked");
  assert.ok(setup > role, "database setup must follow the student submission role check");
  assert.ok(formRead > setup, "form parsing and database work must follow the guard");
});

test("JSON homework actions validate action and role before database setup", () => {
  const body = jsonSource.indexOf("const body = await req.json()");
  const actionGuard = jsonSource.indexOf('if (!["create", "grade", "delete"].includes(action))');
  const roleGuard = jsonSource.indexOf('if (!["admin", "teacher"].includes(ctx.user.role))');
  const setup = jsonSource.indexOf("await ensureDbSetup()");
  const firstRead = jsonSource.indexOf("db.");

  assert.ok(body >= 0, "JSON action must be parsed");
  assert.ok(actionGuard > body, "unknown actions must be rejected before setup");
  assert.ok(roleGuard > actionGuard, "non-teacher/admin roles must be rejected before setup");
  assert.ok(setup > roleGuard, "database setup must follow action and role guards");
  assert.ok(firstRead > setup, "database operations must follow setup");
});
