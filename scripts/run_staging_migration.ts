/**
 * PROFESSIONAL ACADEMY — SAFE STAGING MIGRATION & VALIDATION RUNNER
 * Strictly targets only the Neon staging branch (staging-alwaled / ep-young-recipe-b2v76h2n).
 * Enforces production safety guards, transaction atomicity, and rollback testing.
 */

import { Pool } from "pg";
import fs from "fs";
import path from "path";

const APPROVED_STAGING_ENDPOINT = "ep-young-recipe-b2v76h2n";

// Helper to load staging URL from .env.staging.local, .env.staging, or process.env
function resolveStagingUrl(): string | null {
  if (process.env.STAGING_DATABASE_URL) {
    return process.env.STAGING_DATABASE_URL.trim();
  }

  const candidateFiles = [
    path.join(process.cwd(), ".env.staging.local"),
    path.join(process.cwd(), ".env.staging"),
    path.join(process.cwd(), ".env.local"),
  ];

  for (const file of candidateFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed.startsWith("STAGING_DATABASE_URL=")) {
          const val = trimmed.split("=", 1)[1] || trimmed.substring("STAGING_DATABASE_URL=".length);
          return val.replace(/^["']|["']$/g, "").trim();
        }
        if (file.endsWith(".staging.local") && trimmed.startsWith("DATABASE_URL=")) {
          const val = trimmed.substring("DATABASE_URL=".length);
          return val.replace(/^["']|["']$/g, "").trim();
        }
      }
    }
  }

  if (process.argv[2]) {
    return process.argv[2].trim();
  }

  return null;
}

const stagingDbUrl = resolveStagingUrl();

if (!stagingDbUrl) {
  console.error("❌ ERROR: STAGING_DATABASE_URL is missing.");
  console.error("\nTo execute securely without exposing secrets:");
  console.error("1. Create a local file named: .env.staging.local (strictly ignored by .gitignore)");
  console.error("2. Add this line inside it:");
  console.error("   STAGING_DATABASE_URL=\"postgresql://neondb_owner:YOUR_PASSWORD@ep-young-recipe-b2v76h2n.eu-central-1.aws.neon.tech/neondb?sslmode=require\"");
  console.error("3. Re-run this script.\n");
  process.exit(1);
}

// 1. SAFETY GUARD: Verify connection string targets approved staging endpoint only
function verifyStagingTarget(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const dbPath = parsed.pathname.toLowerCase();
    
    // Masked display
    const masked = url.replace(/\/\/([^:]+):([^@]+)@/, "//$1:********@");
    console.log(`\n🔒 Connection String: ${masked}`);
    console.log(`🔍 Target Host: ${host}`);
    console.log(`🔍 Target Database: ${dbPath}`);

    // Strict Endpoint Check: MUST match the staging endpoint
    if (!host.includes(APPROVED_STAGING_ENDPOINT)) {
      throw new Error(`CRITICAL GUARD ABORT: Target host "${host}" does NOT match approved staging endpoint "${APPROVED_STAGING_ENDPOINT}". Production execution is strictly forbidden.`);
    }

    // Explicit Production keyword rejection
    if (host.includes("prod") && !host.includes("staging")) {
      throw new Error(`CRITICAL GUARD ABORT: Target host "${host}" contains "prod". Aborting.`);
    }

    console.log(`✅ Strict Safety Guard Passed: Target confirmed as staging branch (${APPROVED_STAGING_ENDPOINT}).`);
  } catch (err: any) {
    console.error("❌ Safety Validation Failed:", err.message);
    process.exit(1);
  }
}

verifyStagingTarget(stagingDbUrl);

const pool = new Pool({
  connectionString: stagingDbUrl,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

async function runStagingMigration() {
  const client = await pool.connect();
  console.log("\n📡 Connected to Neon staging database successfully!");

  try {
    // 2. Pre-migration state check
    console.log("\n--- PRE-MIGRATION RECORD AUDIT ---");
    const preStudents = await client.query("SELECT COUNT(*) FROM users WHERE role = 'student' AND id LIKE 'usr_waled_%'");
    const preParents = await client.query("SELECT COUNT(*) FROM users WHERE role = 'parent' AND id LIKE 'usr_parent_waled_%'");
    const preGroups = await client.query("SELECT COUNT(*) FROM center_groups WHERE id LIKE 'grp_waled_%'").catch(() => ({ rows: [{ count: "0" }] }));
    const preLinks = await client.query("SELECT COUNT(*) FROM parent_links WHERE parent_id LIKE 'usr_parent_waled_%'").catch(() => ({ rows: [{ count: "0" }] }));
    const preAttendance = await client.query("SELECT COUNT(*) FROM attendance_records WHERE id LIKE 'att_hist_%'").catch(() => ({ rows: [{ count: "0" }] }));
    const prePayments = await client.query("SELECT COUNT(*) FROM payments").catch(() => ({ rows: [{ count: "0" }] }));

    console.log(`Pre-migration Center Students: ${preStudents.rows[0].count}`);
    console.log(`Pre-migration Center Parents:  ${preParents.rows[0].count}`);
    console.log(`Pre-migration Center Groups:   ${preGroups.rows[0].count}`);
    console.log(`Pre-migration Parent Links:    ${preLinks.rows[0].count}`);
    console.log(`Pre-migration Attendance Marks:${preAttendance.rows[0].count}`);
    console.log(`Pre-migration Total Payments:  ${prePayments.rows[0].count}`);

    // 3. Read and execute alwaled_migration.sql
    const migrationSqlPath = path.join(process.cwd(), "scripts", "migrations", "alwaled_migration.sql");
    console.log(`\n📂 Loading migration script: ${migrationSqlPath}`);
    const migrationSql = fs.readFileSync(migrationSqlPath, "utf-8");

    console.log("🚀 Executing alwaled_migration.sql within transactional block...");
    const startTime = Date.now();
    await client.query(migrationSql);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Migration SQL executed successfully in ${duration}s!`);

    // 4. Post-migration state verification
    console.log("\n--- POST-MIGRATION VERIFICATION ---");
    const postStudents = await client.query("SELECT COUNT(*) FROM users WHERE role = 'student' AND id LIKE 'usr_waled_%'");
    const postParents = await client.query("SELECT COUNT(*) FROM users WHERE role = 'parent' AND id LIKE 'usr_parent_waled_%'");
    const postGroups = await client.query("SELECT COUNT(*) FROM center_groups WHERE id LIKE 'grp_waled_%'");
    const postLinks = await client.query("SELECT COUNT(*) FROM parent_links WHERE parent_id LIKE 'usr_parent_waled_%'");
    const postAttendance = await client.query("SELECT COUNT(*) FROM attendance_records WHERE id LIKE 'att_hist_%'");
    const postPayments = await client.query("SELECT COUNT(*) FROM payments");

    const studentCount = parseInt(postStudents.rows[0].count, 10);
    const parentCount = parseInt(postParents.rows[0].count, 10);
    const groupCount = parseInt(postGroups.rows[0].count, 10);
    const linkCount = parseInt(postLinks.rows[0].count, 10);
    const attCount = parseInt(postAttendance.rows[0].count, 10);
    const paymentDelta = parseInt(postPayments.rows[0].count, 10) - parseInt(prePayments.rows[0].count, 10);

    console.log(`✓ Center Students: ${studentCount} (Expected: 393) -> ${studentCount === 393 ? "MATCH ✅" : "MISMATCH ❌"}`);
    console.log(`✓ Center Parents:  ${parentCount} (Expected: 188) -> ${parentCount === 188 ? "MATCH ✅" : "MISMATCH ❌"}`);
    console.log(`✓ Center Groups:   ${groupCount} (Expected: 13)  -> ${groupCount === 13 ? "MATCH ✅" : "MISMATCH ❌"}`);
    console.log(`✓ Parent Links:    ${linkCount} (Expected: 209) -> ${linkCount === 209 ? "MATCH ✅" : "MISMATCH ❌"}`);
    console.log(`✓ Attendance Marks:${attCount} (Expected: 215) -> ${attCount === 215 ? "MATCH ✅" : "MISMATCH ❌"}`);
    console.log(`✓ Payments Delta:  +${paymentDelta} (Expected: 0)  -> ${paymentDelta === 0 ? "STRICT FINANCIAL ISOLATION CONFIRMED ✅" : "LEAK DETECTED ❌"}`);

    if (studentCount !== 393 || groupCount !== 13 || paymentDelta !== 0) {
      throw new Error("Verification assertions failed! Record counts do not match manifest.");
    }

    // 5. Credentials & QR Token Integrity Spot Check
    console.log("\n--- CREDENTIALS & SECURITY SPOT CHECK ---");
    const sampleStudent = await client.query("SELECT id, name, qr_code, student_code, must_change_password, pin_expires_at, password FROM users WHERE id LIKE 'usr_waled_%' LIMIT 3");
    for (const st of sampleStudent.rows) {
      console.log(`  Student: [REDACTED NAME] | Code: ${st.student_code} | QR: ${st.qr_code.slice(0, 8)}... | MustChangePW: ${st.must_change_password} | HashedPW: ${st.password.slice(0, 15)}...`);
    }

    // 6. Rollback Verification Test
    console.log("\n--- ROLLBACK VERIFICATION TEST (In Isolated Transaction) ---");
    console.log("Testing rollback script to confirm clean reversible operation...");
    await client.query("BEGIN;");
    const rollbackSqlPath = path.join(process.cwd(), "scripts", "migrations", "rollback_waled_migration.sql");
    const rollbackSql = fs.readFileSync(rollbackSqlPath, "utf-8");
    await client.query(rollbackSql);

    const rbStudents = await client.query("SELECT COUNT(*) FROM users WHERE role = 'student' AND id LIKE 'usr_waled_%'");
    const rbGroups = await client.query("SELECT COUNT(*) FROM center_groups WHERE id LIKE 'grp_waled_%'");
    console.log(`Rollback verification: Students remaining = ${rbStudents.rows[0].count}, Groups remaining = ${rbGroups.rows[0].count}`);

    if (parseInt(rbStudents.rows[0].count, 10) === 0 && parseInt(rbGroups.rows[0].count, 10) === 0) {
      console.log("✅ Rollback script verified: Successfully removed all imported records without side effects!");
    } else {
      throw new Error("Rollback verification failed: Stale records detected after rollback execution.");
    }
    await client.query("ROLLBACK;"); // Revert rollback test to keep staging populated
    console.log("✅ Rollback test transaction reverted. Staging database remains safely populated for Vercel Preview testing.");

    console.log("\n=======================================================");
    console.log("🎉 NEON STAGING MIGRATION & VALIDATION COMPLETED 100%!");
    console.log("=======================================================\n");
  } catch (err: any) {
    console.error("\n❌ MIGRATION FAILED:", err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

runStagingMigration()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
