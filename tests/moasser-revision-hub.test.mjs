import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { MOASSER_SECTIONS, MOASSER_INTERACTIVE_EXAMS } from "../src/data/moasser-revision-index.ts";
import { GEM_SECTIONS, GEM_INTERACTIVE_EXAMS } from "../src/data/gem-revision-index.ts";

test("El-Moasser & GEM Official Revision Hub Suite", async (t) => {
  await t.test("1. Data Integrity: All 3 Tracks and Official GPS Links Exist (El-Moasser)", () => {
    assert.equal(MOASSER_SECTIONS.length, 3, "Must have exactly 3 educational tracks");
    
    const general = MOASSER_SECTIONS.find((s) => s.id === "general");
    assert.ok(general, "General track must exist");
    const languages = MOASSER_SECTIONS.find((s) => s.id === "languages");
    assert.ok(languages, "Languages track must exist");
    const azhar = MOASSER_SECTIONS.find((s) => s.id === "azhar");
    assert.ok(azhar, "Azhar track must exist");

    // Check General track has Secondary, Prep, Primary
    const secStage = general.stages.find((st) => st.id === "secondary");
    assert.ok(secStage, "Secondary stage must exist in General track");
    assert.equal(secStage.grades[0].name, "الصف الأول الثانوي");
    assert.ok(secStage.grades[0].links[0].url.startsWith("https://gps-eg.org/"));

    const prepStage = general.stages.find((st) => st.id === "prep");
    assert.ok(prepStage, "Prep stage must exist in General track");
    assert.equal(prepStage.grades.length, 3, "Prep stage must have 3 grades (1st, 2nd, 3rd prep)");

    const prep3 = prepStage.grades.find((g) => g.en === "3rd Prep");
    assert.ok(prep3, "3rd Prep must exist");
    assert.equal(prep3.links.length, 2, "3rd Prep must have 2 booklet links (Revision + Modified Exercises)");
  });

  await t.test("2. Data Integrity: GEM (Nahdet Misr / Al-Adwaa) Series Tracks & Specs Exist", () => {
    assert.equal(GEM_SECTIONS.length, 3, "GEM must have 3 educational tracks (general, languages, azhar)");
    
    const gemGeneral = GEM_SECTIONS.find((s) => s.id === "general");
    assert.ok(gemGeneral, "GEM General track must exist");
    assert.ok(gemGeneral.badge.includes("نهضة مصر"), "Must highlight Nahdet Misr publisher");

    const secStage = gemGeneral.stages.find((st) => st.id === "secondary");
    assert.ok(secStage, "GEM Secondary stage must exist");
    assert.equal(secStage.grades.length, 3, "Secondary must have 3 grades");
    assert.equal(secStage.grades[0].examId, "gem_sec1_exam1");

    const prepStage = gemGeneral.stages.find((st) => st.id === "prep");
    assert.ok(prepStage, "GEM Prep stage must exist");
    assert.equal(prepStage.grades.length, 3, "Prep must have 3 grades");
    assert.equal(prepStage.grades[0].examId, "gem_prep3_exam1");
  });

  await t.test("3. Interactive Model Exams: Moasser & GEM Specifications & Rubrics", () => {
    // 1st Secondary Exam - Moasser
    const sec1Exam = MOASSER_INTERACTIVE_EXAMS["moasser_sec1_exam1"];
    assert.ok(sec1Exam, "1st Secondary Moasser exam must exist");
    assert.equal(sec1Exam.questions.length, 20, "1st Secondary Moasser must have 20 comprehensive questions");
    assert.equal(sec1Exam.durationMinutes, 45, "Duration should be 45 minutes");

    sec1Exam.questions.forEach((q, idx) => {
      assert.ok(q.question, `Q${idx + 1} must have question text`);
      assert.equal(q.options.length, 4, `Q${idx + 1} must have 4 options`);
      assert.ok(q.options.includes(q.correctAnswer), `Q${idx + 1} correct answer must be in options`);
      assert.ok(q.explanationAr, `Q${idx + 1} must provide Arabic explanation`);
    });

    // 1st Secondary Exam - GEM
    const gemSec1 = GEM_INTERACTIVE_EXAMS["gem_sec1_exam1"];
    assert.ok(gemSec1, "1st Secondary GEM exam must exist");
    assert.equal(gemSec1.questions.length, 20, "1st Secondary GEM must have 20 questions");
    gemSec1.questions.forEach((q, idx) => {
      assert.ok(q.options.includes(q.correctAnswer), `GEM Sec1 Q${idx + 1} correct answer must be in options`);
      assert.ok(q.explanationAr, `GEM Sec1 Q${idx + 1} must have Arabic explanation`);
    });

    // 3rd Prep Exam - GEM
    const gemPrep3 = GEM_INTERACTIVE_EXAMS["gem_prep3_exam1"];
    assert.ok(gemPrep3, "3rd Prep GEM exam must exist");
    assert.equal(gemPrep3.questions.length, 15, "3rd Prep GEM must have 15 questions");
    gemPrep3.questions.forEach((q, idx) => {
      assert.ok(q.options.includes(q.correctAnswer), `GEM Prep3 Q${idx + 1} correct answer must be in options`);
      assert.ok(q.explanationAr, `GEM Prep3 Q${idx + 1} must have Arabic explanation`);
    });
  });

  await t.test("4. Physical Files & Navigation Integration", () => {
    const root = process.cwd();
    const moasserPath = path.join(root, "src/data/moasser-revision-index.ts");
    assert.ok(fs.existsSync(moasserPath), "moasser-revision-index.ts must exist");

    const gemPath = path.join(root, "src/data/gem-revision-index.ts");
    assert.ok(fs.existsSync(gemPath), "gem-revision-index.ts must exist");

    const hubPath = path.join(root, "src/components/revision/MoasserRevisionHub.tsx");
    assert.ok(fs.existsSync(hubPath), "MoasserRevisionHub.tsx must exist");

    const hubCode = fs.readFileSync(hubPath, "utf-8");
    assert.ok(hubCode.includes("selectedPublisher"), "MoasserRevisionHub must support publisher switcher");
    assert.ok(hubCode.includes("GEM_SECTIONS"), "MoasserRevisionHub must import GEM sections");

    const routePath = path.join(root, "src/app/revision/page.tsx");
    assert.ok(fs.existsSync(routePath), "src/app/revision/page.tsx must exist");

    const navbarCode = fs.readFileSync(path.join(root, "src/components/Navbar.tsx"), "utf-8");
    assert.ok(navbarCode.includes("moasser_revision"), "Navbar must include moasser_revision");
    assert.ok(navbarCode.includes("جيم GEM"), "Navbar must highlight GEM alongside Moasser");

    const homeCode = fs.readFileSync(path.join(root, "src/components/home/ModernHomePage.tsx"), "utf-8");
    assert.ok(homeCode.includes("moasser_revision"), "ModernHomePage must include moasser_revision button");
    assert.ok(homeCode.includes("جيم GEM"), "ModernHomePage must highlight GEM");

    const pageCode = fs.readFileSync(path.join(root, "src/app/page.tsx"), "utf-8");
    assert.ok(pageCode.includes("moasser_revision"), "src/app/page.tsx must render MoasserRevisionHub");
  });
});
