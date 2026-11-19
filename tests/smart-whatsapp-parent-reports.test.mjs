import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { formatWhatsAppParentReport, buildParentWhatsAppShareUrl } from "../src/lib/whatsapp-report-formatter.ts";
import { normalizePhoneNumber } from "../src/lib/whatsapp-cloud-api.ts";

test("Smart WhatsApp Parent Reports Suite", async (t) => {
  await t.test("1. Phone Number Normalization to E.164 for Egyptian Networks", () => {
    assert.equal(normalizePhoneNumber("01012345678"), "201012345678");
    assert.equal(normalizePhoneNumber("+201012345678"), "201012345678");
    assert.equal(normalizePhoneNumber("00201012345678"), "201012345678");
    assert.equal(normalizePhoneNumber("01123456789"), "201123456789");
    assert.equal(normalizePhoneNumber("01234567890"), "201234567890");
    assert.equal(normalizePhoneNumber("01555555555"), "201555555555");
  });

  await t.test("2. Format WhatsApp Parent Report with Metrics, Rubrics and Mistakes Bank", () => {
    const mockReport = {
      student: {
        id: "st_123",
        name: "عمر أحمد حسن",
        grade: "الصف الثالث الثانوي (Thanawya Amma)",
        stage: "المرحلة الثانوية",
        streak: 15,
        points: 850,
        level: "Advanced",
      },
      parent: {
        id: "p_123",
        name: "أحمد حسن",
        phone: "01001234567",
        relationship: "Father",
      },
      period: "weekly",
      generatedDate: "2026-11-19",
      attendance: {
        totalSessions: 10,
        present: 9,
        absent: 1,
        late: 0,
        excused: 0,
        attendanceRate: 90,
        statusLabel: "ممتاز — التزام تام",
        records: [],
      },
      academic: {
        totalQuizzes: 8,
        averagePercentage: 92,
        highestScore: 98,
        progressStatus: "Excellent",
        progressStatusAr: "ممتاز ومتفوق دراسياً",
        recentExams: [],
      },
      homework: {
        assigned: 6,
        submitted: 6,
        onTime: 6,
        late: 0,
        completionRate: 100,
      },
      mistakesBank: {
        total: 12,
        unresolved: 2,
        mastered: 10,
      },
      pedagogicalInsights: {
        strengths: ["إتقان تام لأزمنة الماضي والمضارع التام", "سرعة ممتازة في أسئلة الترجمة"],
        focusAreas: ["حفظ تعبيرات Prepositions الخاصة بـ Unit 3"],
        habibRecommendations: ["مواصلة حل امتحانات بنك الأسئلة الشاملة"],
      },
    };

    const formatted = formatWhatsAppParentReport({
      report: mockReport,
      reportUrl: "https://pro-academy-sfl3.vercel.app/parent/report?token=test_token_123",
      parentPhone: "01001234567",
    });

    assert.equal(formatted.studentName, "عمر أحمد حسن");
    assert.equal(formatted.periodLabel, "الأسبوعي");
    assert.equal(formatted.stats.attendanceRate, 90);
    assert.equal(formatted.stats.averageScore, 92);
    assert.equal(formatted.stats.masteredMistakes, 10);
    assert.equal(formatted.stats.streak, 15);

    // Verify WhatsApp text content
    const msg = formatted.whatsappMessage;
    assert.ok(msg.includes("منصة مستر حبيب الرحمن للغة الإنجليزية"));
    assert.ok(msg.includes("عمر أحمد حسن"));
    assert.ok(msg.includes("90%"));
    assert.ok(msg.includes("92%"));
    assert.ok(msg.includes("10 خطأ"));
    assert.ok(msg.includes("https://pro-academy-sfl3.vercel.app/parent/report?token=test_token_123"));

    // Verify WhatsApp link has direct normalized phone
    assert.ok(formatted.directPhoneLink?.includes("wa.me/201001234567"));
    assert.ok(formatted.whatsappLink.includes("wa.me/201001234567"));
  });

  await t.test("3. Build Parent WhatsApp Share URL Fallbacks", () => {
    // With Egyptian phone
    const urlWithPhone = buildParentWhatsAppShareUrl({
      phone: "01234567890",
      text: "مرحبا ولي الأمر",
    });
    assert.ok(urlWithPhone.startsWith("https://wa.me/201234567890?text="));

    // Without phone (allows user to select any contact in WhatsApp)
    const urlWithoutPhone = buildParentWhatsAppShareUrl({
      text: "مرحبا ولي الأمر",
    });
    assert.ok(urlWithoutPhone.startsWith("https://wa.me/?text="));
  });

  await t.test("4. Physical Page and Component Structure Verification", () => {
    const parentReportPagePath = path.resolve(process.cwd(), "src/app/parent/report/page.tsx");
    assert.ok(fs.existsSync(parentReportPagePath), "src/app/parent/report/page.tsx must exist");

    const formatterPath = path.resolve(process.cwd(), "src/lib/whatsapp-report-formatter.ts");
    assert.ok(fs.existsSync(formatterPath), "src/lib/whatsapp-report-formatter.ts must exist");

    const parentReportPageCode = fs.readFileSync(parentReportPagePath, "utf-8");
    assert.ok(parentReportPageCode.includes("ParentSmartReportView"), "Must render ParentSmartReportView");
    assert.ok(parentReportPageCode.includes("AppProvider"), "Must wrap in AppProvider");
    assert.ok(parentReportPageCode.includes("Suspense"), "Must wrap searchParams in Suspense");

    const smartReportViewPath = path.resolve(process.cwd(), "src/components/ParentSmartReportView.tsx");
    const smartReportViewCode = fs.readFileSync(smartReportViewPath, "utf-8");
    assert.ok(smartReportViewCode.includes("setShowWhatsAppModal"), "Must have WhatsApp dispatch modal");
    assert.ok(smartReportViewCode.includes("mistakesBank"), "Must display mistakes bank stats");
  });
});
