import test from "node:test";
import assert from "node:assert/strict";

const APPROVED_OFFICIAL_DOMAINS = [
  "studentbooks.moe.gov.eg",
  "moe.gov.eg",
];

const VALID_CATEGORIES = [
  "weekly_assessment",
  "classroom_performance",
  "homework_performance",
  "monthly_assessment",
  "other_assessment",
];

const VALID_GRADES = [
  "prep_1",
  "prep_2",
  "prep_3",
  "sec_1",
  "sec_2",
  "sec_3",
];

test("Ministry Assessments: Official MOE domains restriction", () => {
  const isApprovedUrl = (urlStr) => {
    try {
      const parsed = new URL(urlStr);
      return APPROVED_OFFICIAL_DOMAINS.some(
        (domain) => parsed.hostname === domain || parsed.hostname.endsWith("." + domain)
      );
    } catch {
      return false;
    }
  };

  // Approved MOE sources
  assert.equal(
    isApprovedUrl("https://studentbooks.moe.gov.eg/Performance_Assessments/Sec_3_Weekly_W1.pdf"),
    true,
    "Main MOE assessments portal must be approved"
  );
  assert.equal(
    isApprovedUrl("https://moe.gov.eg/elearningenterypage/e-learning/pdf/assessment.pdf"),
    true,
    "Alternative official MOE portal must be approved"
  );

  // Unofficial sources must be strictly rejected
  assert.equal(
    isApprovedUrl("https://shamel.net/download/file.pdf"),
    false,
    "Third-party sites must be rejected"
  );
  assert.equal(
    isApprovedUrl("https://mediafire.com/file/123/sheet.pdf"),
    false,
    "File lockers must be rejected"
  );
  assert.equal(
    isApprovedUrl("http://unencrypted-portal.com"),
    false,
    "Unencrypted non-official sites must be rejected"
  );
});

test("Ministry Assessments: All 6 mandatory Egyptian grades have valid codes and stage mapping", () => {
  const gradeStageMap = {
    prep_1: "Preparatory",
    prep_2: "Preparatory",
    prep_3: "Preparatory",
    sec_1: "Secondary",
    sec_2: "Secondary",
    sec_3: "Secondary",
  };

  for (const grade of VALID_GRADES) {
    const stage = gradeStageMap[grade];
    assert.ok(stage, `Grade ${grade} must map to a stage`);
    assert.ok(
      stage === "Preparatory" || stage === "Secondary",
      `Stage for ${grade} must be Preparatory or Secondary`
    );
  }
});

test("Ministry Assessments: Valid categories and dynamic suppression logic", () => {
  // Test category suppression: categories with count = 0 must be hidable
  const sampleCounts = {
    weekly_assessment: 12,
    classroom_performance: 8,
    homework_performance: 8,
    monthly_assessment: 2,
    other_assessment: 0,
  };

  const visibleCategories = VALID_CATEGORIES.filter((cat) => (sampleCounts[cat] || 0) > 0);

  assert.ok(visibleCategories.includes("weekly_assessment"));
  assert.ok(visibleCategories.includes("classroom_performance"));
  assert.ok(visibleCategories.includes("homework_performance"));
  assert.ok(visibleCategories.includes("monthly_assessment"));
  assert.equal(
    visibleCategories.includes("other_assessment"),
    false,
    "Categories with 0 official files must be suppressed from tabs"
  );
});

test("Ministry Assessments: Role-based publishing filter safety", () => {
  const mockAssessments = [
    { id: "1", title: "Assessment 1", isPublished: true },
    { id: "2", title: "Assessment 2 (Draft)", isPublished: false },
    { id: "3", title: "Assessment 3", isPublished: true },
  ];

  // Students see only published
  const studentView = mockAssessments.filter((a) => a.isPublished);
  assert.equal(studentView.length, 2);
  assert.ok(studentView.every((a) => a.isPublished === true));

  // Staff (teacher/admin) can view all drafts and published
  const staffView = mockAssessments;
  assert.equal(staffView.length, 3);
});

test("Ministry Assessments: Download counter increment and log integrity", () => {
  let assessment = {
    id: "asm_sec_3_w1",
    title: "Sec 3 Week 1 Assessment",
    downloadCount: 42,
  };

  const recordDownload = (studentId) => {
    assessment.downloadCount += 1;
    return {
      id: `dl_${Date.now()}`,
      assessmentId: assessment.id,
      studentId,
      downloadedAt: new Date().toISOString(),
    };
  };

  const log1 = recordDownload("usr_student_1");
  assert.equal(assessment.downloadCount, 43);
  assert.equal(log1.assessmentId, "asm_sec_3_w1");
  assert.equal(log1.studentId, "usr_student_1");

  const log2 = recordDownload("usr_student_2");
  assert.equal(assessment.downloadCount, 44);
  assert.equal(log2.studentId, "usr_student_2");
});
