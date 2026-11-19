import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  MASTER_MOCK_EXAMS_REGISTRY,
  EXAM_SEC3_MINISTRY,
  EXAM_SEC1_MINISTRY,
  EXAM_PREP3_MINISTRY,
} from "../src/data/exam-simulator-catalog.ts";

test("Full Ministry Timed Exam Simulator 2026/2027 Master Suite", async (t) => {
  await t.test("1. Data Integrity: Master Mock Exams Registry Coverage", () => {
    assert.equal(MASTER_MOCK_EXAMS_REGISTRY.length, 3, "Must contain all 3 official simulation exams");

    // 1. Third Secondary
    const sec3 = MASTER_MOCK_EXAMS_REGISTRY.find((e) => e.gradeLevel === "3rd_sec");
    assert.ok(sec3, "3rd Secondary exam must exist");
    assert.equal(sec3.durationMinutes, 180, "3rd Secondary must be 180 minutes (3 hours)");
    assert.equal(sec3.totalMarks, 50, "3rd Secondary must be 50 marks");
    assert.ok(sec3.sections.mcq.length > 0, "Must have MCQs");
    assert.ok(sec3.sections.passage, "Must have reading passage");
    assert.ok(sec3.sections.translation?.length, "Must have translation");
    assert.ok(sec3.sections.novel?.length, "Must have novel section");
    assert.ok(sec3.sections.essay, "Must have essay prompt");

    // 2. First Secondary
    const sec1 = MASTER_MOCK_EXAMS_REGISTRY.find((e) => e.gradeLevel === "1st_sec");
    assert.ok(sec1, "1st Secondary exam must exist");
    assert.equal(sec1.durationMinutes, 120, "1st Secondary must be 120 minutes (2 hours)");
    assert.equal(sec1.totalMarks, 40, "1st Secondary must be 40 marks");
    assert.ok(sec1.sections.passage, "1st Secondary must have passage");

    // 3. Third Prep
    const prep3 = MASTER_MOCK_EXAMS_REGISTRY.find((e) => e.gradeLevel === "3rd_prep");
    assert.ok(prep3, "3rd Prep exam must exist");
    assert.equal(prep3.durationMinutes, 90, "3rd Prep must be 90 minutes");
    assert.equal(prep3.totalMarks, 30, "3rd Prep must be 30 marks");
  });

  await t.test("2. Question Formatting & Objective Rubric Keys", () => {
    EXAM_SEC3_MINISTRY.sections.mcq.forEach((q, idx) => {
      assert.ok(q.question, `Sec3 Q${idx + 1} must have question text`);
      assert.equal(q.options.length, 4, `Sec3 Q${idx + 1} must have 4 options`);
      assert.ok(q.options.includes(q.correctAnswer), `Sec3 Q${idx + 1} answer must be in options`);
      assert.ok(q.explanation, `Sec3 Q${idx + 1} must provide explanation`);
    });

    EXAM_SEC1_MINISTRY.sections.mcq.forEach((q, idx) => {
      assert.ok(q.options.includes(q.correctAnswer), `Sec1 Q${idx + 1} answer must be in options`);
      assert.ok(q.explanation, `Sec1 Q${idx + 1} must provide explanation`);
    });

    EXAM_PREP3_MINISTRY.sections.mcq.forEach((q, idx) => {
      assert.ok(q.options.includes(q.correctAnswer), `Prep3 Q${idx + 1} answer must be in options`);
    });
  });

  await t.test("3. Physical Files & Components Architecture Verification", () => {
    const root = process.cwd();

    const catalogPath = path.join(root, "src/data/exam-simulator-catalog.ts");
    assert.ok(fs.existsSync(catalogPath), "exam-simulator-catalog.ts must exist");

    const examsRoutePath = path.join(root, "src/app/api/exam-simulator/exams/route.ts");
    assert.ok(fs.existsSync(examsRoutePath), "exams/route.ts must exist");

    const submitRoutePath = path.join(root, "src/app/api/exam-simulator/submit/route.ts");
    assert.ok(fs.existsSync(submitRoutePath), "submit/route.ts must exist");

    const workspacePath = path.join(root, "src/components/pro-suite/ExamSimulatorWorkspace.tsx");
    assert.ok(fs.existsSync(workspacePath), "ExamSimulatorWorkspace.tsx must exist");

    const workspaceCode = fs.readFileSync(workspacePath, "utf-8");
    assert.ok(workspaceCode.includes("showBubbleSheet"), "Workspace must support Digital Bubble Sheet");
    assert.ok(workspaceCode.includes("همسة طمأنة"), "Workspace must provide pedagogical reassurance");
    assert.ok(workspaceCode.includes("handleSelectExam"), "Workspace must support multi-exam selection");
  });
});
