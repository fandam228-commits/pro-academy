import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Story World Integration - All 6 Curriculum Story JSON Files Exist and Are Valid", () => {
  const jsonFiles = [
    "prep1-stories.json",
    "prep2-stories.json",
    "prep3-story.json",
    "sec1-story.json",
    "sec2-story.json",
    "sec3-story.json",
  ];

  for (const f of jsonFiles) {
    const fpath = path.join(process.cwd(), "src/data/story-world", f);
    assert.ok(fs.existsSync(fpath), `File ${f} must exist in src/data/story-world`);
    const content = JSON.parse(fs.readFileSync(fpath, "utf-8"));
    assert.ok(content, `File ${f} must be valid JSON`);
    if (Array.isArray(content)) {
      assert.ok(content.length > 0, `File ${f} must have at least one story`);
    } else {
      assert.ok(content.id, `File ${f} must have story id`);
      assert.ok(Array.isArray(content.chapters), `File ${f} must have chapters array`);
    }
  }
});

test("Story World Integration - Grade and Term Allocation Rules", () => {
  const p1 = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/story-world/prep1-stories.json"), "utf-8"));
  assert.equal(p1.length, 2, "Prep 1 must contain 2 stories (Term 1 & Term 2)");
  assert.equal(p1[0].term, "first");
  assert.equal(p1[1].term, "second");
  assert.equal(p1[0].chapters.length, 3);
  assert.equal(p1[1].chapters.length, 3);

  const p2 = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/story-world/prep2-stories.json"), "utf-8"));
  assert.equal(p2.length, 2, "Prep 2 must contain 2 stories (Term 1 & Term 2)");
  assert.equal(p2[0].term, "first");
  assert.equal(p2[1].term, "second");
  assert.equal(p2[0].chapters.length, 3);
  assert.equal(p2[1].chapters.length, 3);

  const p3 = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/story-world/prep3-story.json"), "utf-8"));
  assert.equal(p3.chapters.length, 6, "Prep 3 School Garden Project must have 6 chapters");

  const s1 = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/story-world/sec1-story.json"), "utf-8"));
  assert.equal(s1.chapters.length, 6, "Sec 1 The Old Man and the Sea must have 6 chapters");

  const s2 = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/story-world/sec2-story.json"), "utf-8"));
  assert.equal(s2.chapters.length, 5, "Sec 2 The Lost World must have 5 chapters");

  const s3 = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/story-world/sec3-story.json"), "utf-8"));
  assert.equal(s3.chapters.length, 6, "Sec 3 The Count of Monte Cristo (Term 1) must have 6 chapters");
});

test("Story World Integration - 11 Required Sections Integrity in Third Secondary", () => {
  const s3 = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/story-world/sec3-story.json"), "utf-8"));
  
  // 1. Author and About Author
  assert.ok(s3.author.includes("Alexandre Dumas"));
  assert.ok(s3.aboutAuthorEn.length > 20);
  assert.ok(s3.aboutAuthorAr.length > 20);

  // 2. Characters
  assert.ok(s3.characters.length >= 6, "Sec 3 must have at least 6 characters");
  assert.ok(s3.characters.some(c => (c.name || c.nameEn || "").toLowerCase().includes("edmond")));
  assert.ok(s3.characters.some(c => (c.name || c.nameEn || "").toLowerCase().includes("faria")));

  // 3. Themes
  assert.ok(s3.themes.length >= 3, "Sec 3 must have at least 3 literary themes");

  // 4. Plot Summary
  assert.ok(s3.plotSummaryEn.length > 50);
  assert.ok(s3.plotSummaryAr.length > 50);

  // 5-11. Chapter content sections
  for (const ch of s3.chapters) {
    assert.ok(ch.chapterNumber >= 1 && ch.chapterNumber <= 6);
    assert.ok(ch.titleEn.length > 3);
    assert.ok(ch.titleAr.length > 3);

    // 6. Vocabulary
    assert.ok(ch.vocabulary.length > 0, `Ch ${ch.chapterNumber} must have vocabulary words`);

    // 7. Chapter in points
    assert.ok(ch.chapterInPoints.length > 0, `Ch ${ch.chapterNumber} must have chapterInPoints`);

    // 8. The Text (Bilingual)
    assert.ok(ch.theText.length > 0, `Ch ${ch.chapterNumber} must have theText paragraphs`);

    // 9. Questions & Answers (SB/WB)
    assert.ok(ch.questionsAndAnswers.length > 0, `Ch ${ch.chapterNumber} must have SB/WB questions`);

    // 10. Important / Critical Thinking Questions
    assert.ok(ch.importantQuestions.length > 0, `Ch ${ch.chapterNumber} must have importantQuestions`);

    // 11. Homework / Directorate Questions
    assert.ok(ch.homeworkQuestions.length > 0, `Ch ${ch.chapterNumber} must have homeworkQuestions`);
  }
});

test("Story World Integration - Total Curriculum Inventory Verification", () => {
  const allJson = [
    ...JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/story-world/prep1-stories.json"), "utf-8")),
    ...JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/story-world/prep2-stories.json"), "utf-8")),
    JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/story-world/prep3-story.json"), "utf-8")),
    JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/story-world/sec1-story.json"), "utf-8")),
    JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/story-world/sec2-story.json"), "utf-8")),
    JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/story-world/sec3-story.json"), "utf-8")),
  ];

  let totalChapters = 0;
  let totalVocab = 0;
  let totalPoints = 0;
  let totalText = 0;
  let totalQA = 0;
  let totalImp = 0;
  let totalHw = 0;

  for (const story of allJson) {
    for (const ch of story.chapters) {
      totalChapters++;
      totalVocab += (ch.vocabulary || []).length;
      totalPoints += (ch.chapterInPoints || []).length;
      totalText += (ch.theText || []).length;
      totalQA += (ch.questionsAndAnswers || []).length;
      totalImp += (ch.importantQuestions || []).length;
      totalHw += (ch.homeworkQuestions || []).length;
    }
  }

  assert.equal(totalChapters, 35, "Total chapters across all 6 grades must be exactly 35");
  assert.ok(totalVocab >= 300, `Total vocabulary must be at least 300 (actual: ${totalVocab})`);
  assert.ok(totalPoints >= 200, `Total points must be at least 200 (actual: ${totalPoints})`);
  assert.ok(totalText >= 250, `Total text paragraphs must be at least 250 (actual: ${totalText})`);
  assert.ok(totalQA >= 350, `Total SB/WB Q&A must be at least 350 (actual: ${totalQA})`);
  assert.ok(totalImp >= 250, `Total critical thinking questions must be at least 250 (actual: ${totalImp})`);
  assert.ok(totalHw >= 300, `Total homework questions must be at least 300 (actual: ${totalHw})`);
});

test("Official Ministry Story Content Audit - Zero OCR Noise, Pure Bilingual Text Verification", () => {
  const allJson = [
    ...JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/story-world/prep1-stories.json"), "utf-8")),
    ...JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/story-world/prep2-stories.json"), "utf-8")),
    JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/story-world/prep3-story.json"), "utf-8")),
    JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/story-world/sec1-story.json"), "utf-8")),
    JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/story-world/sec2-story.json"), "utf-8")),
    JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/story-world/sec3-story.json"), "utf-8")),
  ];

  const prohibitedTokens = [
    "Uljujla", "d'lf", "ARay", "Hone", "suttered", "retumed", "dectined",
    "01006468384", "010", "Mr. Habib", "professional",
  ];

  for (const story of allJson) {
    for (const ch of story.chapters) {
      assert.ok(ch.theText.length > 0, `Story ${story.id} Ch ${ch.chapterNumber} must have text paragraphs`);
      for (const p of ch.theText) {
        assert.ok(p.paragraphEn && p.paragraphEn.length > 10, `ParagraphEn in ${story.id} Ch ${ch.chapterNumber} must not be empty`);
        assert.ok(p.paragraphAr && p.paragraphAr.length > 10, `ParagraphAr in ${story.id} Ch ${ch.chapterNumber} must not be empty`);

        // Check for prohibited OCR tokens
        for (const token of prohibitedTokens) {
          assert.ok(!p.paragraphEn.includes(token), `Prohibited token ${token} in En: ${p.paragraphEn}`);
          assert.ok(!p.paragraphAr.includes(token), `Prohibited token ${token} in Ar: ${p.paragraphAr}`);
        }

        // Arabic paragraph must not leak English words (3+ chars)
        const enInAr = p.paragraphAr.match(/[A-Za-z]{3,}/g);
        assert.equal(enInAr, null, `Leaked English in Arabic paragraph: ${enInAr} in ${story.id} Ch ${ch.chapterNumber}`);

        // English paragraph must not leak Arabic characters
        const arInEn = p.paragraphEn.match(/[\u0600-\u06FF]/g);
        assert.equal(arInEn, null, `Leaked Arabic in English paragraph in ${story.id} Ch ${ch.chapterNumber}`);
      }
    }
  }
});
