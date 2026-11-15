import test from "node:test";
import assert from "node:assert/strict";
import { SMART_CURRICULUM_SEEDS } from "../src/data/smart-curriculum-seed.ts";
import { CURRICULUM_2026_GRADES, getCurriculumUnits, getCurriculumStory } from "../src/config/curriculum-2026.ts";

test("Curriculum System: all 6 mandatory 2026/2027 grades are defined", () => {
  const expectedCodes = ["prep_1", "prep_2", "prep_3", "sec_1", "sec_2", "sec_3"];
  const seedCodes = SMART_CURRICULUM_SEEDS.map((g) => g.code);

  for (const code of expectedCodes) {
    assert.ok(
      seedCodes.includes(code),
      `Grade code ${code} must be present in curriculum seeds.`
    );
  }
  assert.equal(SMART_CURRICULUM_SEEDS.length >= 6, true);
});

test("Curriculum System: Third Secondary 2026/2027 has exact 6 Units and 2 independent Reviews", () => {
  const sec3 = SMART_CURRICULUM_SEEDS.find((g) => g.code === "sec_3");
  assert.ok(sec3, "Third Secondary must exist");

  const coreUnits = sec3.units.filter((u) => u.type === "unit");
  const reviews = sec3.units.filter((u) => u.type === "review");

  assert.equal(coreUnits.length, 6, "Must contain exactly 6 core Units");
  assert.equal(reviews.length, 2, "Must contain exactly 2 Reviews");

  // Verify exact official 2026/2027 unit titles
  assert.equal(coreUnits[0].titleEn, "Unit 1: Inside the World of Care");
  assert.equal(coreUnits[1].titleEn, "Unit 2: The Power of Machines");
  assert.equal(coreUnits[2].titleEn, "Unit 3: Protect Nature, Protect Future");
  assert.equal(coreUnits[3].titleEn, "Unit 4: Marine Life");
  assert.equal(coreUnits[4].titleEn, "Unit 5: From Muscles to Mindset");
  assert.equal(coreUnits[5].titleEn, "Unit 6: Let's Hang Out!");

  // Verify review placement
  const review1 = reviews.find((r) => r.orderIndex === 4);
  const review2 = reviews.find((r) => r.orderIndex === 8);

  assert.ok(review1, "Review 1 must be placed after Unit 3 (orderIndex 4)");
  assert.equal(review1.reviewScope, "Units 1–3");

  assert.ok(review2, "Review 2 must be placed after Unit 6 (orderIndex 8)");
  assert.equal(review2.reviewScope, "Units 4–6");
});

test("Curriculum System: First Secondary 2026/2027 has official units and Hemingway's story", () => {
  const sec1 = SMART_CURRICULUM_SEEDS.find((g) => g.code === "sec_1");
  assert.ok(sec1, "First Secondary must exist");

  const coreUnits = sec1.units.filter((u) => u.type === "unit");
  assert.equal(coreUnits[0].titleEn, "Unit 1: Egypt's Heritage");
  assert.equal(coreUnits[1].titleEn, "Unit 2: Hands Help, Hearts Care");
  assert.equal(coreUnits[2].titleEn, "Unit 3: Truth Vs. Lies");
  assert.equal(coreUnits[3].titleEn, "Unit 4: Save and Shine");
  assert.equal(coreUnits[4].titleEn, "Unit 5: Using Technology at Schools");
  assert.equal(coreUnits[5].titleEn, "Unit 6: Job Hunting");

  assert.equal(sec1.story.titleEn, "The Old Man and the Sea");
  assert.equal(sec1.story.author, "Ernest Hemingway");
});

test("Curriculum System: Second Secondary 2026/2027 has official units and Jules Verne story", () => {
  const sec2 = SMART_CURRICULUM_SEEDS.find((g) => g.code === "sec_2");
  assert.ok(sec2, "Second Secondary must exist");

  const coreUnits = sec2.units.filter((u) => u.type === "unit");
  assert.equal(coreUnits[0].titleEn, "Unit 1: Egypt-Africa Cooperation");
  assert.equal(coreUnits[1].titleEn, "Unit 2: Startups & Young Entrepreneurs");
  assert.equal(coreUnits[2].titleEn, "Unit 3: Sustainable Development Goals (SDG)");
  assert.equal(coreUnits[3].titleEn, "Unit 4: Natural Disasters");
  assert.equal(coreUnits[4].titleEn, "Unit 5: Media Manipulation");
  assert.equal(coreUnits[5].titleEn, "Unit 6: Soft Skills Vs. Hard Skills");

  assert.equal(sec2.story.titleEn, "Around the World in Eighty Days");
  assert.equal(sec2.story.author, "Jules Verne");
});

test("Curriculum System: Preparatory stages have verified units & Second Prep story is unconfirmed", () => {
  // Prep 1
  const prep1 = SMART_CURRICULUM_SEEDS.find((g) => g.code === "prep_1");
  assert.equal(prep1.story.titleEn, "The Magic Classroom");
  const p1Units = prep1.units.filter((u) => u.type === "unit");
  assert.equal(p1Units[0].titleEn, "Unit 1: Life in a Digital World");

  // Prep 2: Story must remain unconfirmed per user instruction
  const prep2 = SMART_CURRICULUM_SEEDS.find((g) => g.code === "prep_2");
  assert.ok(prep2.story.titleAr.includes("قيد التحقق"));
  const p2Units = prep2.units.filter((u) => u.type === "unit");
  assert.equal(p2Units[0].titleEn, "Unit 1: Gen Alpha");
  assert.equal(p2Units[1].titleEn, "Unit 2: My Digital Footprint");

  // Prep 3
  const prep3 = SMART_CURRICULUM_SEEDS.find((g) => g.code === "prep_3");
  assert.equal(prep3.story.titleEn, "The School Garden Project");
  const p3Units = prep3.units.filter((u) => u.type === "unit");
  assert.equal(p3Units[0].titleEn, "Unit 1: Personal Identity");
  assert.equal(p3Units[2].titleEn, "Unit 3: Artificial Intelligence");
});

test("Curriculum System: Unit 1 contains Vocabulary, Grammar, and Writing Skills with full rubrics", () => {
  const sec3 = SMART_CURRICULUM_SEEDS.find((g) => g.code === "sec_3");
  const unit1 = sec3.units.find((u) => u.unitNumber === 1);
  assert.ok(unit1, "Unit 1 must exist");

  const sectionTypes = unit1.sections.map((s) => s.sectionType);
  assert.ok(sectionTypes.includes("vocabulary"), "Unit 1 must contain Vocabulary section");
  assert.ok(sectionTypes.includes("grammar"), "Unit 1 must contain Grammar section");
  assert.ok(sectionTypes.includes("writing"), "Unit 1 must contain Writing Skills section");

  // Check Vocabulary contents
  const vocabSec = unit1.sections.find((s) => s.sectionType === "vocabulary");
  const words = vocabSec.contentData?.words || [];
  assert.ok(words.length > 0, "Vocabulary must contain words");
  const firstWord = words[0];
  assert.ok(firstWord.word, "Word must have name");
  assert.ok(firstWord.arabicMeaning, "Word must have Arabic meaning");
  assert.ok(firstWord.definitionEn, "Word must have English definition");
  assert.ok(Array.isArray(firstWord.synonyms), "Word must have synonyms array");
  assert.ok(Array.isArray(firstWord.collocations), "Word must have collocations array");

  // Check Grammar contents
  const grammarSec = unit1.sections.find((s) => s.sectionType === "grammar");
  const gData = grammarSec.contentData || {};
  assert.ok(gData.ruleTitleAr, "Grammar must have rule title");
  assert.ok(Array.isArray(gData.usages), "Grammar must have usages array");
  assert.ok(Array.isArray(gData.sentenceStructures), "Grammar must have sentence structures");
  assert.ok(Array.isArray(gData.commonMistakes), "Grammar must have common mistakes analysis");

  // Check Writing contents
  const writingSec = unit1.sections.find((s) => s.sectionType === "writing");
  const wData = writingSec.contentData || {};
  assert.ok(Array.isArray(wData.guidelines), "Writing must have guidelines");
  assert.ok(Array.isArray(wData.templates), "Writing must have templates");
  assert.ok(Array.isArray(wData.modelAnswers), "Writing must have model answers");
  assert.ok(Array.isArray(wData.assessmentCriteria), "Writing must have assessment criteria");
});

test("Curriculum System: Story Corner belongs to specific grade with rich chapters", () => {
  const sec3 = SMART_CURRICULUM_SEEDS.find((g) => g.code === "sec_3");
  assert.ok(sec3.story, "Third Secondary must have Story Corner");
  assert.equal(sec3.story.titleEn, "The Count of Monte Cristo");
  assert.equal(sec3.story.author, "Alexandre Dumas");

  const chapters = sec3.story.chapters || [];
  assert.ok(chapters.length >= 2, "Must contain dynamic chapters");

  const ch1 = chapters[0];
  assert.equal(ch1.chapterNumber, 1);
  assert.ok(ch1.explanation.length > 20, "Must have detailed explanation");
  assert.ok(ch1.characters.length > 0, "Must have characters array");
  assert.ok(ch1.events.length > 0, "Must have chronological events");
  assert.ok(ch1.importantQuotes.length > 0, "Must have important quotes with analysis");
  assert.ok(ch1.questionsAndAnswers.length > 0, "Must have critical thinking Q&A");
  assert.ok(ch1.mcqQuestions.length > 0, "Must have MCQs with explanations");
});

test("Curriculum System: Progress calculation handles 0%, partial, and 100% cleanly", () => {
  const calculateProgress = (total, completed) => {
    if (!total || total <= 0) return 0;
    return Math.round((completed / total) * 100);
  };

  assert.equal(calculateProgress(0, 0), 0, "Empty total returns 0%");
  assert.equal(calculateProgress(20, 0), 0, "0 completed returns 0%");
  assert.equal(calculateProgress(20, 10), 50, "10/20 returns 50%");
  assert.equal(calculateProgress(20, 7), 35, "7/20 returns 35%");
  assert.equal(calculateProgress(20, 20), 100, "20/20 returns 100%");
});

test("Curriculum System: getCurriculumUnits returns accurate 2026/2027 specs across all 6 stages", () => {
  const stages = [
    { code: "prep_1", firstUnit: "Unit 1: Life in a Digital World", lastUnit: "Unit 6: Global Citizens" },
    { code: "prep_2", firstUnit: "Unit 1: Gen Alpha", lastUnit: "Unit 6: Young Innovators" },
    { code: "prep_3", firstUnit: "Unit 1: Personal Identity", lastUnit: "Unit 6: Why We Love Stories" },
    { code: "sec_1", firstUnit: "Unit 1: Egypt's Heritage", lastUnit: "Unit 6: Job Hunting" },
    { code: "sec_2", firstUnit: "Unit 1: Egypt-Africa Cooperation", lastUnit: "Unit 6: Soft Skills Vs. Hard Skills" },
    { code: "sec_3", firstUnit: "Unit 1: Inside the World of Care", lastUnit: "Unit 6: Let's Hang Out!" },
  ];

  for (const s of stages) {
    const units = getCurriculumUnits(s.code);
    assert.equal(units.length, 8, `${s.code} must yield 8 items (6 units + 2 reviews)`);
    const core = units.filter((u) => u.type === "unit");
    assert.equal(core.length, 6);
    assert.equal(core[0].titleEn, s.firstUnit);
    assert.equal(core[5].titleEn, s.lastUnit);

    const revs = units.filter((u) => u.type === "review");
    assert.equal(revs.length, 2);
    assert.equal(revs[0].reviewScope, "Units 1–3");
    assert.equal(revs[1].reviewScope, "Units 4–6");
  }
});

test("Curriculum System: getCurriculumStory returns accurate novels per grade", () => {
  assert.equal(getCurriculumStory("prep_1").titleEn, "The Magic Classroom");
  assert.equal(getCurriculumStory("prep_2").isConfirmed, false, "Prep 2 story must be unconfirmed pending official textbook");
  assert.ok(getCurriculumStory("prep_2").titleAr.includes("قيد التحقق"));
  assert.equal(getCurriculumStory("prep_3").titleEn, "The School Garden Project");
  assert.equal(getCurriculumStory("sec_1").titleEn, "The Old Man and the Sea");
  assert.equal(getCurriculumStory("sec_2").titleEn, "Around the World in Eighty Days");
  assert.equal(getCurriculumStory("sec_3").titleEn, "The Count of Monte Cristo");
});

test("Curriculum System: Second Year Egyptian Baccalaureate is independent with 10 Units and 5 Consolidation Reviews", () => {
  // 1. Must exist independently
  const bac = SMART_CURRICULUM_SEEDS.find((g) => g.code === "sec_2_bac");
  assert.ok(bac, "Second Year Egyptian Baccalaureate (sec_2_bac) must exist");
  assert.equal(bac.stage, "Secondary");

  // 2. Traditional Second Secondary must remain completely intact
  const sec2 = SMART_CURRICULUM_SEEDS.find((g) => g.code === "sec_2");
  assert.ok(sec2, "Traditional Second Secondary (sec_2) must remain intact");
  assert.equal(sec2.units.filter((u) => u.type === "unit").length, 6, "Traditional sec_2 must keep 6 units");
  assert.equal(sec2.units.filter((u) => u.type === "review").length, 2, "Traditional sec_2 must keep 2 reviews");

  // 3. Verify Baccalaureate units and reviews
  const coreUnits = bac.units.filter((u) => u.type === "unit");
  const reviews = bac.units.filter((u) => u.type === "review");

  assert.equal(coreUnits.length, 10, "Baccalaureate must contain exactly 10 Units");
  assert.equal(reviews.length, 5, "Baccalaureate must contain exactly 5 Consolidation Reviews (A, B, C, D, E)");

  // Part One
  assert.equal(coreUnits[0].titleEn, "Unit 1: Living Well in a Complex World");
  assert.equal(coreUnits[1].titleEn, "Unit 2: Leisure Time");
  assert.equal(reviews[0].titleEn, "Consolidation Review A (Units 1–2)");
  assert.equal(coreUnits[2].titleEn, "Unit 3: Echoes of the Past");
  assert.equal(coreUnits[3].titleEn, "Unit 4: The Power of Choice");
  assert.equal(reviews[1].titleEn, "Consolidation Review B (Units 3–4)");
  assert.equal(coreUnits[4].titleEn, "Unit 5: The Greenhouse Effect");

  // Part Two
  assert.equal(coreUnits[5].titleEn, "Unit 6: The Space We Share");
  assert.equal(reviews[2].titleEn, "Consolidation Review C (Units 5–6)");
  assert.equal(coreUnits[6].titleEn, "Unit 7: Discovering Your Passion");
  assert.equal(coreUnits[7].titleEn, "Unit 8: Pathways to Progress");
  assert.equal(reviews[3].titleEn, "Consolidation Review D (Units 7–8)");
  assert.equal(coreUnits[8].titleEn, "Unit 9: Circles of Belonging");
  assert.equal(coreUnits[9].titleEn, "Unit 10: Behind the Buy");
  assert.equal(reviews[4].titleEn, "Consolidation Review E (Units 9–10)");

  // 4. Verify Story: The Lost World by Arthur Conan Doyle with all 10 chapters
  assert.equal(bac.story.titleEn, "The Lost World");
  assert.equal(bac.story.author, "Arthur Conan Doyle");
  assert.equal(bac.story.chapters.length, 10, "Must contain all 10 chapters");

  const ch1 = bac.story.chapters[0];
  assert.equal(ch1.titleEn, "Chapter 1: A Dream of Adventure");
  assert.ok(ch1.vocabulary.length > 0, "Must contain vocabulary");
  assert.ok(ch1.characters.length > 0, "Must contain characters");
  assert.ok(ch1.events.length > 0, "Must contain events");
  assert.ok(ch1.mcqQuestions.length > 0, "Must contain MCQs");
  assert.ok(ch1.openEndedQuestions.length > 0, "Must contain open-ended questions");
  assert.ok(ch1.criticalThinkingQuestions.length > 0, "Must contain critical thinking questions");
  assert.ok(ch1.jreActivities.length > 0, "Must contain JRE activities");
  assert.equal(ch1.interactiveTestQuizId, "quiz_chapter_sec_2_bac_1");

  // Chapter 10
  const ch10 = bac.story.chapters[9];
  assert.equal(ch10.titleEn, "Chapter 10: Proof Before the World");
  assert.equal(ch10.chapterNumber, 10);

  // 5. Verify helper functions
  const bacUnits = getCurriculumUnits("sec_2_bac");
  assert.equal(bacUnits.length, 15, "getCurriculumUnits for sec_2_bac must return 15 items");
  assert.equal(getCurriculumStory("sec_2_bac").titleEn, "The Lost World");
});
