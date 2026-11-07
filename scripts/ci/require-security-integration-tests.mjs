import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const SECURITY_TEST_RULES = [
  {
    matches: (path) =>
      path === "src/app/api/analytics/route.ts" ||
      path === "src/lib/analytics-authorization.mjs" ||
      path === "src/lib/analytics-report-scope.mjs",
    required: [
      "tests/integration/analytics-authorization.integration.mjs",
      "tests/integration/parent-link-verification.integration.mjs",
      "tests/integration/parent-report-current-role.integration.mjs",
      "tests/integration/analytics-route-http-authorization.integration.mjs",
    ],
  },
  {
    matches: (path) => path === "src/app/api/homework/route.ts",
    required: [
      "tests/integration/homework-authorization.integration.mjs",
      "tests/integration/homework-file-access.integration.mjs",
      "tests/integration/homework-replacement-atomicity.integration.mjs",
    ],
  },
  {
    matches: (path) =>
      path === "src/app/api/homework/file/[id]/route.ts" ||
      path === "src/lib/homework-storage.mjs",
    required: ["tests/integration/homework-file-access.integration.mjs"],
  },
  {
    matches: (path) => path === "src/lib/homework-authorization.mjs",
    required: ["tests/integration/homework-authorization.integration.mjs"],
  },
  {
    matches: (path) => path === "src/lib/homework-replacement.mjs",
    required: ["tests/integration/homework-replacement-atomicity.integration.mjs"],
  },
  {
    matches: (path) => path === "src/lib/homework-storage-audit.mjs",
    required: ["tests/integration/homework-storage-audit.integration.mjs"],
  },
];

export function getRequiredSecurityIntegrationTests(changedPaths) {
  if (!Array.isArray(changedPaths)) {
    throw new TypeError("changedPaths must be an array");
  }

  const required = new Set();
  for (const path of changedPaths) {
    if (typeof path !== "string") continue;
    for (const rule of SECURITY_TEST_RULES) {
      if (rule.matches(path)) {
        for (const testPath of rule.required) required.add(testPath);
      }
    }
  }
  return [...required];
}

function main() {
  const baseSha = process.env.PR_BASE_SHA;
  const headSha = process.env.PR_HEAD_SHA;
  if (!baseSha || !headSha) {
    throw new Error("PR_BASE_SHA and PR_HEAD_SHA are required for the security integration-test guard");
  }

  const changedOutput = execFileSync(
    "git",
    ["diff", "--name-only", `${baseSha}...${headSha}`],
    { encoding: "utf8" },
  );
  const changedPaths = changedOutput.split(/\r?\n/).filter(Boolean);
  const required = getRequiredSecurityIntegrationTests(changedPaths);
  const missing = required.filter((path) => !existsSync(path));

  if (missing.length > 0) {
    for (const path of missing) {
      console.error(`::error::Required security integration test is missing: ${path}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(
    required.length
      ? `Verified ${required.length} required security integration test file(s) for ${changedPaths.length} changed file(s).`
      : `No protected Analytics/homework source files changed among ${changedPaths.length} changed file(s); no additional integration suite is required.`,
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
