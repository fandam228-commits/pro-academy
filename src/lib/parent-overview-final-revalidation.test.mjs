import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const routeSource = await readFile(new URL("../app/api/parent/route.ts", import.meta.url), "utf8");
const authorizationSource = await readFile(new URL("./parent-report-authorization.mjs", import.meta.url), "utf8");

test("parent overview revalidates the verified parent/student relationship after report reads and before returning data", () => {
  const enrollmentRead = routeSource.indexOf("const studentEnrs = await db");
  const submissionRead = routeSource.indexOf("const studentSubs = await db");
  const attendanceRead = routeSource.indexOf("const studentAtt = await db");
  const finalCheck = routeSource.indexOf("const parentAccessStillValid = await db");
  const response = routeSource.indexOf("return NextResponse.json({", finalCheck);

  assert.ok(enrollmentRead >= 0 && submissionRead > enrollmentRead && attendanceRead > submissionRead,
    "all report data reads must be completed before the final authorization check");
  assert.ok(finalCheck > attendanceRead && response > finalCheck,
    "the final authorization check must run after report reads and before the response");

  const finalAuthorizationBlock = routeSource.slice(finalCheck);
  assert.match(finalAuthorizationBlock, /buildVerifiedParentLinkPredicate\(/,
    "the final check must use the shared verified-link SQL predicate");
  assert.match(finalAuthorizationBlock, /status:\s*403/,
    "a revoked or stale relationship must fail closed");

  assert.match(authorizationSource, /eq\(parentAccount\.role, "parent"\)/);
  assert.match(authorizationSource, /eq\(studentAccount\.role, "student"\)/);
  assert.match(authorizationSource, /eq\(verifiedByUser\.role, "admin"\)/);
  assert.match(authorizationSource, /isNotNull\(parentLinks\.verifiedAt\)/);
  assert.match(authorizationSource, /isNotNull\(parentLinks\.verifiedBy\)/);
});
