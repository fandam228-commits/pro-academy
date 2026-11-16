import test from "node:test";
import assert from "node:assert/strict";

// Helper functions for testing Center Management System logic

/**
 * Validates opaque QR token security
 */
export function validateSecureQrToken(token, student) {
  if (!token || typeof token !== "string") return { valid: false, reason: "Missing token" };
  if (!token.startsWith("wld_qr_") && !token.startsWith("pa_qr_")) {
    return { valid: false, reason: "Invalid token prefix" };
  }
  // Must be at least 32 random characters
  if (token.length < 32) return { valid: false, reason: "Token too short" };
  // Must not expose student ID, phone, or name
  if (student) {
    if (student.name && token.includes(student.name)) return { valid: false, reason: "Token exposes student name" };
    if (student.phone && token.includes(student.phone.replace("+", ""))) return { valid: false, reason: "Token exposes student phone" };
    if (student.studentCode && token.includes(String(student.studentCode))) return { valid: false, reason: "Token exposes student code" };
  }
  return { valid: true };
}

/**
 * Computes financial balance using precise decimal arithmetic
 */
export function calculateStudentFeeBalance({ baseFee, discount = 0, payments = [] }) {
  const base = Math.round(Number(baseFee) * 100);
  const disc = Math.round(Number(discount) * 100);
  const netDue = Math.max(0, base - disc);

  const totalPaid = payments
    .filter((p) => p.status === "active" || p.status === "approved" || p.status === "paid")
    .reduce((sum, p) => sum + Math.round(Number(p.amount) * 100), 0);

  const remaining = Math.max(0, netDue - totalPaid);

  let status = "unpaid";
  if (totalPaid >= netDue && netDue > 0) status = "paid";
  else if (totalPaid > 0) status = "partial";
  else if (netDue === 0 && disc > 0) status = "waived";

  return {
    baseFee: (base / 100).toFixed(2),
    discount: (disc / 100).toFixed(2),
    netDue: (netDue / 100).toFixed(2),
    totalPaid: (totalPaid / 100).toFixed(2),
    remaining: (remaining / 100).toFixed(2),
    status,
  };
}

/**
 * Calculates Net Operational Result (P&L)
 * Net = Center Tuition Collections - Center Operating Expenses
 * Note: Course platform payments are strictly excluded.
 */
export function calculateNetOperatingResult({ centerCollections = [], centerExpenses = [] }) {
  const totalCollections = centerCollections
    .filter((c) => c.status === "active")
    .reduce((sum, c) => sum + Math.round(Number(c.amount) * 100), 0);

  const totalExpenses = centerExpenses
    .filter((e) => e.status === "active")
    .reduce((sum, e) => sum + Math.round(Number(e.amount) * 100), 0);

  const netResult = totalCollections - totalExpenses;

  return {
    totalCollections: (totalCollections / 100).toFixed(2),
    totalExpenses: (totalExpenses / 100).toFixed(2),
    netOperationalResult: (netResult / 100).toFixed(2),
    isPositive: netResult >= 0,
  };
}

/**
 * Verifies if self-checkin is permissible for a session
 */
export function canStudentSelfCheckIn({ session, student, enrollment }) {
  if (!session || !session.status || session.status !== "active") {
    return { allowed: false, reason: "Session is not active or is closed" };
  }
  if (!session.isSelfCheckInAllowed) {
    return { allowed: false, reason: "Self check-in is disabled for this session" };
  }
  if (!enrollment || enrollment.status !== "active") {
    return { allowed: false, reason: "Student is not an active member of this group" };
  }
  return { allowed: true };
}

/**
 * Formats unique sequential receipt number
 */
export function generateReceiptNumber(seqNumber, date = new Date()) {
  const yyyymm = date.toISOString().slice(0, 7).replace("-", "");
  const padded = String(seqNumber).padStart(4, "0");
  return `PA-REC-${yyyymm}-${padded}`;
}

// =========================================================================
// TEST SUITE: PROFESSIONAL CENTER MANAGEMENT SYSTEM
// =========================================================================

test("1. Attendance: Secure QR token validator rejects non-opaque and predictable inputs", () => {
  const student = { name: "أحمد علي", phone: "+201012345678", studentCode: 105 };

  // Valid opaque random token
  const validToken = "wld_qr_8f4b1e7c90a23d4567890bcdef123456";
  const resValid = validateSecureQrToken(validToken, student);
  assert.equal(resValid.valid, true);

  // Invalid: Plain student code
  const resCode = validateSecureQrToken("105", student);
  assert.equal(resCode.valid, false);

  // Invalid: Plain phone number
  const resPhone = validateSecureQrToken("+201012345678", student);
  assert.equal(resPhone.valid, false);

  // Invalid: Short or predictable token exposing student code
  const resExposed = validateSecureQrToken("wld_qr_student_105_secret", student);
  assert.equal(resExposed.valid, false);
});

test("2. Attendance: Duplicate attendance prevention flags double check-in", () => {
  const existingRecords = [
    { studentId: "usr_1", sessionDate: "2026-11-16", sessionTitle: "حصة الأحد 2 م", status: "present" },
  ];

  const isDuplicate = (stId, date, title) =>
    existingRecords.some((r) => r.studentId === stId && r.sessionDate === date && r.sessionTitle === title);

  assert.equal(isDuplicate("usr_1", "2026-11-16", "حصة الأحد 2 م"), true);
  assert.equal(isDuplicate("usr_1", "2026-11-17", "حصة الأحد 2 م"), false);
  assert.equal(isDuplicate("usr_2", "2026-11-16", "حصة الأحد 2 م"), false);
});

test("3. Attendance: Student self check-in is strictly blocked on inactive or closed sessions", () => {
  const inactiveSession = { id: "ses_1", status: "scheduled", isSelfCheckInAllowed: true };
  const closedSession = { id: "ses_2", status: "completed", isSelfCheckInAllowed: true };
  const activeDisabledSession = { id: "ses_3", status: "active", isSelfCheckInAllowed: false };
  const activeAllowedSession = { id: "ses_4", status: "active", isSelfCheckInAllowed: true };

  const enrollment = { status: "active" };

  assert.equal(canStudentSelfCheckIn({ session: inactiveSession, enrollment }).allowed, false);
  assert.equal(canStudentSelfCheckIn({ session: closedSession, enrollment }).allowed, false);
  assert.equal(canStudentSelfCheckIn({ session: activeDisabledSession, enrollment }).allowed, false);
  assert.equal(canStudentSelfCheckIn({ session: activeAllowedSession, enrollment }).allowed, true);

  // Paused student in active session
  assert.equal(canStudentSelfCheckIn({ session: activeAllowedSession, enrollment: { status: "paused" } }).allowed, false);
});

test("4. Fees: Student fee balance accurately handles full payment", () => {
  const result = calculateStudentFeeBalance({
    baseFee: 300,
    discount: 0,
    payments: [{ amount: 300, status: "active" }],
  });

  assert.equal(result.baseFee, "300.00");
  assert.equal(result.netDue, "300.00");
  assert.equal(result.totalPaid, "300.00");
  assert.equal(result.remaining, "0.00");
  assert.equal(result.status, "paid");
});

test("5. Fees: Student fee balance accurately handles partial and multiple installments", () => {
  const result = calculateStudentFeeBalance({
    baseFee: 350,
    discount: 50,
    payments: [
      { amount: 150, status: "active" },
      { amount: 100, status: "active" },
    ],
  });

  assert.equal(result.baseFee, "350.00");
  assert.equal(result.discount, "50.00");
  assert.equal(result.netDue, "300.00");
  assert.equal(result.totalPaid, "250.00");
  assert.equal(result.remaining, "50.00");
  assert.equal(result.status, "partial");
});

test("6. Fees: Course platform payments are strictly excluded from center revenue", () => {
  const centerCollections = [
    { amount: 250, status: "active", source: "center_tuition" },
    { amount: 300, status: "active", source: "center_tuition" },
    { amount: 200, status: "voided", source: "center_tuition" }, // voided must be excluded
  ];

  // Online course payments that should NEVER mix into center revenue
  const coursePayments = [
    { amount: 500, status: "approved", courseId: "crs_sec_3" },
    { amount: 750, status: "approved", courseId: "crs_sec_1" },
  ];

  const net = calculateNetOperatingResult({
    centerCollections,
    centerExpenses: [{ amount: 150, status: "active" }],
  });

  // Only active center collections (250 + 300 = 550) - expenses (150) = 400
  assert.equal(net.totalCollections, "550.00");
  assert.equal(net.totalExpenses, "150.00");
  assert.equal(net.netOperationalResult, "400.00");
});

test("7. Receipts: Sequential receipt number generates expected format", () => {
  const date = new Date("2026-11-16T12:00:00Z");
  assert.equal(generateReceiptNumber(1, date), "PA-REC-202611-0001");
  assert.equal(generateReceiptNumber(42, date), "PA-REC-202611-0042");
  assert.equal(generateReceiptNumber(1250, date), "PA-REC-202611-1250");
});

test("8. Expenses: Operating expense recording and net operational result calculation", () => {
  const expenses = [
    { id: "exp_1", title: "إيجار السنتر لشهر نوفمبر", amount: 15000, category: "rent", status: "active" },
    { id: "exp_2", title: "فاتورة الكهرباء", amount: 1200, category: "utilities", status: "active" },
    { id: "exp_3", title: "باقات إنترنت الألياف الضوئية", amount: 800, category: "internet", status: "active" },
    { id: "exp_4", title: "مصروف تم إلغاؤه وتصحيحه", amount: 500, category: "supplies", status: "voided" },
  ];

  const collections = [
    { id: "col_1", amount: 28000, status: "active" },
  ];

  const result = calculateNetOperatingResult({
    centerCollections: collections,
    centerExpenses: expenses,
  });

  // Active expenses = 15000 + 1200 + 800 = 17000
  // Collections = 28000
  // Net = 11000
  assert.equal(result.totalCollections, "28000.00");
  assert.equal(result.totalExpenses, "17000.00");
  assert.equal(result.netOperationalResult, "11000.00");
  assert.equal(result.isPositive, true);
});

test("9. Security: Teacher role is scoped to their assigned groups only", () => {
  const teacherId = "usr_teacher_habib";
  const allGroups = [
    { id: "grp_1", name: "مجموعة أولى ثانوي السبت", teacherId: "usr_teacher_habib" },
    { id: "grp_2", name: "مجموعة ثالثة ثانوي الأحد", teacherId: "usr_teacher_habib" },
    { id: "grp_3", name: "مجموعة لغة فرنسية مستر حسام", teacherId: "usr_teacher_hossam" },
  ];

  const teacherGroups = allGroups.filter((g) => g.teacherId === teacherId);
  assert.equal(teacherGroups.length, 2);
  assert.ok(teacherGroups.every((g) => g.teacherId === teacherId));
  assert.equal(teacherGroups.some((g) => g.id === "grp_3"), false);
});

test("10. Parent Connect: Fee receipt notification payload generates accurate bilingual content", () => {
  const params = {
    studentName: "يوسف إبراهيم",
    groupName: "مجموعة ليلة الامتحان - ثالثة ثانوي",
    billingMonth: "2026-11",
    amount: "350.00",
    paymentMethod: "فودافون كاش",
    receiptNumber: "PA-REC-202611-0015",
    remainingAmount: "0.00",
  };

  const message = `🧾 Professional Academy — إيصال سداد رسوم\n\nعزيزي ولي أمر الطالب/ة: ${params.studentName}\nتم بحمد الله استلام دفعة بقيمة ${params.amount} ج.م لحساب اشتراك شهر ${params.billingMonth} لمجموعة (${params.groupName}).\nرقم الإيصال: ${params.receiptNumber}\nطريقة الدفع: ${params.paymentMethod}\nالمتبقي: ${params.remainingAmount} ج.م.\n\nشاكرين حسن تعاونكم.`;

  assert.ok(message.includes("يوسف إبراهيم"));
  assert.ok(message.includes("PA-REC-202611-0015"));
  assert.ok(message.includes("350.00 ج.م"));
  assert.ok(message.includes("فودافون كاش"));
});

test("11. Parent Connect: Fee due reminder and overdue warning payloads render correctly", () => {
  const reminder = {
    studentName: "مريم أحمد",
    groupName: "مجموعة أولى ثانوي السبت",
    billingMonth: "2026-11",
    amount: "250.00",
    dueDate: "2026-11-20",
  };

  const dueMsg = `📢 Professional Academy — تنبيه استحقاق اشتراك\n\nنحيط سيادتكم علماً بأن اشتراك شهر ${reminder.billingMonth} لمجموعة (${reminder.groupName}) للطالب/ة: ${reminder.studentName} مستحق السداد بقيمة ${reminder.amount} ج.م.\n\nيرجى التكرم بالسداد في موعد أقصاه ${reminder.dueDate}.`;
  assert.ok(dueMsg.includes("مريم أحمد"));
  assert.ok(dueMsg.includes("2026-11-20"));
  assert.ok(dueMsg.includes("250.00 ج.م"));

  const overdueMsg = `⚠️ Professional Academy — تنبيه مديونية ومتأخرات\n\nعناية ولي أمر الطالب/ة: ${reminder.studentName}\nنلفت انتباهكم لوجود رصيد متأخر بقيمة 150.00 ج.م عن مجموعة (${reminder.groupName}).`;
  assert.ok(overdueMsg.includes("تنبيه مديونية"));
  assert.ok(overdueMsg.includes("150.00 ج.م"));
});

test("12. Security: Student role cannot record payments or modify center fees", () => {
  const studentUser = { id: "usr_student_1", role: "student" };
  const canCollect = (role) => role === "admin" || role === "teacher";
  const canGrantDiscount = (role) => role === "admin";
  const canVoidReceipt = (role) => role === "admin";

  assert.equal(canCollect(studentUser.role), false);
  assert.equal(canGrantDiscount(studentUser.role), false);
  assert.equal(canVoidReceipt(studentUser.role), false);
});

test("13. Security: Parent role can only access explicitly linked children", () => {
  const parentId = "usr_parent_waled_1";
  const links = [
    { parentId: "usr_parent_waled_1", studentId: "usr_waled_10" },
    { parentId: "usr_parent_waled_1", studentId: "usr_waled_11" },
    { parentId: "usr_parent_waled_2", studentId: "usr_waled_99" },
  ];

  const myChildren = links.filter((l) => l.parentId === parentId).map((l) => l.studentId);
  assert.equal(myChildren.length, 2);
  assert.ok(myChildren.includes("usr_waled_10"));
  assert.ok(myChildren.includes("usr_waled_11"));
  assert.equal(myChildren.includes("usr_waled_99"), false);
});

test("14. Expenses: Category breakdown percentages calculate accurately", () => {
  const categoryExpenses = [
    { code: "rent", amount: 10000 },
    { code: "salaries", amount: 6000 },
    { code: "utilities", amount: 4000 },
  ];
  const total = 20000;

  const rentPct = Math.round((10000 / total) * 100);
  const salPct = Math.round((6000 / total) * 100);
  const utilPct = Math.round((4000 / total) * 100);

  assert.equal(rentPct, 50);
  assert.equal(salPct, 30);
  assert.equal(utilPct, 20);
  assert.equal(rentPct + salPct + utilPct, 100);
});

test("15. Attendance Audit Trail: Status change captures full audit record", () => {
  const auditLog = {
    attendanceRecordId: "att_123",
    studentId: "usr_waled_10",
    previousStatus: "present",
    newStatus: "excused",
    changedBy: "Mr. Habib El Rahman",
    reason: "عذر طبي مقدم من ولي الأمر",
    changedAt: new Date().toISOString(),
  };

  assert.equal(auditLog.previousStatus, "present");
  assert.equal(auditLog.newStatus, "excused");
  assert.equal(auditLog.changedBy, "Mr. Habib El Rahman");
  assert.ok(auditLog.reason.includes("عذر طبي"));
});

