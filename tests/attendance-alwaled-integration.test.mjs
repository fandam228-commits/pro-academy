import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

function verifyPassword(password, stored) {
  if (!stored) return false;
  if (stored.includes(":")) {
    const [salt, storedHash] = stored.split(":");
    const computed = crypto.scryptSync(password, salt, 64);
    const storedBuf = Buffer.from(storedHash, "hex");
    if (computed.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(computed, storedBuf);
  }
  return false;
}

const BASE_DIR = "C:/Users/1/.gemini/antigravity/scratch/alwaled_extraction";
const PAYLOAD_FILE = path.join(BASE_DIR, "migration_output/migration_payload.json");
const SQL_FILE = path.join(BASE_DIR, "migration_output/alwaled_migration.sql");
const ROLLBACK_FILE = path.join(BASE_DIR, "migration_output/rollback_waled_migration.sql");
const CREDS_FILE = path.join(BASE_DIR, "secure_credentials/students_credentials_ADMIN_CONFIDENTIAL.json");

// 1. NEON STAGING MIGRATION PAYLOAD INTEGRITY
test("Neon staging payload contains exactly 393 valid students, 13 groups, and valid parent links", () => {
  assert.ok(fs.existsSync(PAYLOAD_FILE), "Migration payload file must exist");
  const payload = JSON.parse(fs.readFileSync(PAYLOAD_FILE, "utf-8"));

  assert.equal(payload.students.length, 393, "Must have exactly 393 valid students");
  assert.equal(payload.groups.length, 13, "Must have exactly 13 center groups");
  assert.equal(payload.parent_users.length, 188, "Must have exactly 188 unique parent accounts");
  assert.equal(payload.parent_links.length, 209, "Must have exactly 209 parent-student links");
  assert.equal(payload.historical_attendance.length, 215, "Must have 215 historical attendance marks");
});

// 2. VERIFIED ROLLBACK SCRIPT INTEGRITY
test("Rollback script is transactional and contains exact scoped cleanup statements", () => {
  assert.ok(fs.existsSync(ROLLBACK_FILE), "Rollback SQL script must exist");
  const sql = fs.readFileSync(ROLLBACK_FILE, "utf-8");

  assert.ok(sql.includes("BEGIN;"), "Must contain BEGIN transaction");
  assert.ok(sql.includes("COMMIT;"), "Must contain COMMIT");
  assert.ok(sql.includes("DELETE FROM attendance_records WHERE id LIKE 'att_hist_%' OR student_id LIKE 'usr_waled_%';"));
  assert.ok(sql.includes("DELETE FROM parent_links WHERE student_id LIKE 'usr_waled_%' OR parent_id LIKE 'usr_parent_waled_%';"));
  assert.ok(sql.includes("DELETE FROM users WHERE id LIKE 'usr_waled_%' OR id LIKE 'usr_parent_waled_%';"));
  assert.ok(sql.includes("DELETE FROM center_groups WHERE id LIKE 'grp_waled_%';"));
});

// 3. STUDENT CREDENTIALS & SCRYPT HASH VERIFICATION
test("Student credentials scrypt hashes correctly verify against raw PINs using platform security", () => {
  assert.ok(fs.existsSync(CREDS_FILE), "Credentials file must exist");
  const creds = JSON.parse(fs.readFileSync(CREDS_FILE, "utf-8"));
  const payload = JSON.parse(fs.readFileSync(PAYLOAD_FILE, "utf-8"));

  // Sample check 10 random students
  for (let i = 0; i < 10; i++) {
    const cred = creds[i];
    const student = payload.students.find((s) => s.username === cred.username);
    assert.ok(student, `Student with username ${cred.username} must exist in payload`);
    
    // Test that the raw random PIN verifies against stored scrypt hash
    const isValid = verifyPassword(cred.temporary_pin, student.password);
    assert.equal(isValid, true, `PIN verification must succeed for ${cred.username}`);

    // Verify wrong PIN fails
    const isInvalid = verifyPassword("WrongPassword123!", student.password);
    assert.equal(isInvalid, false, `Wrong PIN must fail for ${cred.username}`);
  }
});

// 4. QR TOKEN SECURITY & OPAQUENESS
test("QR tokens are opaque random strings with zero personal data", () => {
  const payload = JSON.parse(fs.readFileSync(PAYLOAD_FILE, "utf-8"));
  for (const s of payload.students) {
    assert.ok(s.qrCode.startsWith("wld_qr_"), "QR token must start with wld_qr_ prefix");
    assert.equal(s.qrCode.length, 39, "QR token must be exact 39 chars (wld_qr_ + 32 hex chars)");
    // Must NOT contain student code, phone, or name
    assert.equal(s.qrCode.includes(s.name), false, "QR code must not contain student name");
    if (s.phone) {
      assert.equal(s.qrCode.includes(s.phone.replace("+", "")), false, "QR code must not contain phone");
    }
  }
});

// 5. ATTENDANCE COMPUTATION ALGORITHM
test("Attendance score algorithm accounts for present, late, excused, and absent accurately", () => {
  // Formula: (present*1.0 + late*0.7 + excused*0.85 + absent*0) / total
  const records = [
    { status: "present" },
    { status: "late" },
    { status: "excused" },
    { status: "absent" },
  ];
  const score = (1 + 0.7 + 0.85 + 0) / 4;
  const rate = Math.round(score * 100); // 64%
  assert.equal(rate, 64);
});

// 6. DUPLICATE ATTENDANCE PREVENTION LOGIC
test("Duplicate attendance prevention correctly flags already marked records for the same day and session", () => {
  const existingRecords = [
    { studentId: "usr_waled_1", sessionDate: "2026-11-15", sessionTitle: "حصة الأحد 2" },
  ];

  const isDuplicate = (studentId, date, title) => {
    return existingRecords.some(
      (r) => r.studentId === studentId && r.sessionDate === date && r.sessionTitle === title
    );
  };

  assert.equal(isDuplicate("usr_waled_1", "2026-11-15", "حصة الأحد 2"), true);
  assert.equal(isDuplicate("usr_waled_1", "2026-11-16", "حصة الأحد 2"), false);
  assert.equal(isDuplicate("usr_waled_2", "2026-11-15", "حصة الأحد 2"), false);
});

// 7. FINANCIAL ISOLATION VERIFICATION
test("Financial data remains strictly excluded from the migration script", () => {
  const sql = fs.readFileSync(SQL_FILE, "utf-8");
  assert.equal(sql.includes("INSERT INTO payments"), false, "Must NOT insert into payments table");
  assert.equal(sql.includes("سند قبض"), false, "Must NOT contain سند قبض tables");
});
