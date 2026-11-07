import test from "node:test";
import assert from "node:assert/strict";
import { getRequiredSecurityIntegrationTests } from "../../scripts/ci/require-security-integration-tests.mjs";

test("Analytics route and policy changes require all authorization integration suites", () => {
  assert.deepEqual(
    getRequiredSecurityIntegrationTests([
      "src/app/api/analytics/route.ts",
      "src/lib/analytics-report-scope.mjs",
    ]),
    [
      "tests/integration/analytics-authorization.integration.mjs",
      "tests/integration/parent-link-verification.integration.mjs",
      "tests/integration/parent-report-current-role.integration.mjs",
      "tests/integration/analytics-route-http-authorization.integration.mjs",
    ],
  );
});

test("Homework route changes require ownership, file-access, and replacement integration suites", () => {
  assert.deepEqual(
    getRequiredSecurityIntegrationTests(["src/app/api/homework/route.ts"]),
    [
      "tests/integration/homework-authorization.integration.mjs",
      "tests/integration/homework-file-access.integration.mjs",
      "tests/integration/homework-replacement-atomicity.integration.mjs",
    ],
  );
});

test("Homework storage audit changes require the storage-audit integration suite", () => {
  assert.deepEqual(
    getRequiredSecurityIntegrationTests(["src/lib/homework-storage-audit.mjs"]),
    ["tests/integration/homework-storage-audit.integration.mjs"],
  );
});

test("unrelated changes do not force unrelated security integration suites", () => {
  assert.deepEqual(
    getRequiredSecurityIntegrationTests(["src/components/Dashboard.tsx", "README.md"]),
    [],
  );
});
