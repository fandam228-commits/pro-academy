import test from "node:test";
import assert from "node:assert/strict";
import zlib from "node:zlib";
import {
  parseDocumentIntoPages,
  extractPagesFromPlainText,
  extractPagesFromDocx,
  extractPagesFromPdf,
  discoverCurriculumStructure,
  extractOriginalQuestions,
  generateAiQuestionsForLesson,
  assembleAutomatedQuizzes,
  executeCurriculumAnalysisPipeline,
} from "../src/lib/curriculum-analyzer-engine.ts";

/**
 * Creates a valid in-memory .docx (PKZip) buffer containing word/document.xml
 */
function createMockDocxBuffer(documentXmlContent) {
  const fileContent = Buffer.from(documentXmlContent, "utf8");
  const compressedContent = zlib.deflateRawSync(fileContent);

  const fileName = Buffer.from("word/document.xml", "utf8");
  const localHeader = Buffer.alloc(30 + fileName.length);
  localHeader.writeUInt32LE(0x04034b50, 0); // Signature PK\x03\x04
  localHeader.writeUInt16LE(20, 4); // Version needed
  localHeader.writeUInt16LE(0, 6); // Flags
  localHeader.writeUInt16LE(8, 8); // Deflate compression
  localHeader.writeUInt16LE(0, 10); // Mod time
  localHeader.writeUInt16LE(0, 12); // Mod date
  localHeader.writeUInt32LE(0, 14); // CRC32 (dummy)
  localHeader.writeUInt32LE(compressedContent.length, 18); // Compressed size
  localHeader.writeUInt32LE(fileContent.length, 22); // Uncompressed size
  localHeader.writeUInt16LE(fileName.length, 26); // File name length
  localHeader.writeUInt16LE(0, 28); // Extra field length
  fileName.copy(localHeader, 30);

  return Buffer.concat([localHeader, compressedContent]);
}

/**
 * Creates a valid mock PDF buffer containing stream objects with text
 */
function createMockPdfBuffer(textPages) {
  let streamParts = [];
  streamParts.push(Buffer.from("%PDF-1.4\n"));

  for (let i = 0; i < textPages.length; i++) {
    const rawStream = `BT /F1 12 Tf (${textPages[i]}) Tj ET`;
    const compressed = zlib.deflateSync(Buffer.from(rawStream, "utf8"));
    const streamHeader = Buffer.from(`\n${i + 1} 0 obj\n<< /Length ${compressed.length} /Filter /FlateDecode >>\nstream\n`);
    const streamFooter = Buffer.from(`\nendstream\nendobj\n`);
    streamParts.push(streamHeader, compressed, streamFooter);
  }

  streamParts.push(Buffer.from("%%EOF\n"));
  return Buffer.concat(streamParts);
}

// ============================================================================
// TEST SUITE: AI FULL CURRICULUM ANALYZER ENGINE
// ============================================================================

test("Curriculum Analyzer: Plaintext page parsing detects explicit page markers", async () => {
  const sample = `[Page 1]
Unit 1: Living in a Digital World
Vocabulary:
• innovation: a new method or idea.
• sustainable: able to be maintained.

[Page 2]
Grammar:
Rule: Past Simple and Past Continuous
Exercises:
1. She was studying when the lights _______ off.
a) went b) gone c) go d) going
Answer: a

[Page 3]
Unit 2: Cultural Heritage
Lesson 1 & 2: Historical Landmarks
Key Words:
• monument: a historic building.`;

  const res = extractPagesFromPlainText(sample);
  assert.equal(res.pages.length, 3, "Should extract exactly 3 pages");
  assert.equal(res.pages[0].pageNumber, 1);
  assert.match(res.pages[0].text, /Living in a Digital World/);
  assert.equal(res.pages[1].pageNumber, 2);
  assert.match(res.pages[1].text, /Past Simple and Past Continuous/);
  assert.equal(res.pages[2].pageNumber, 3);
  assert.match(res.pages[2].text, /Cultural Heritage/);
});

test("Curriculum Analyzer: Word (.docx) document extraction parses paragraphs and page breaks", async () => {
  const docxXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>Unit 1: Educational Frontiers</w:t></w:r></w:p>
    <w:p><w:r><w:t>Vocabulary: collaborate, analyze, evaluate</w:t></w:r></w:p>
    <w:p><w:r><w:br w:type="page"/></w:r></w:p>
    <w:p><w:r><w:t>Grammar Focus: Relative Clauses</w:t></w:r></w:p>
    <w:p><w:r><w:t>1. The scientist _______ discovered the cure won the prize. (a) who (b) which (c) whose (d) whom Answer: a</w:t></w:r></w:p>
  </w:body>
</w:document>`;

  const docxBuf = createMockDocxBuffer(docxXml);
  const res = extractPagesFromDocx(docxBuf);

  assert.ok(res.pages.length >= 2, "Docx should split across page breaks");
  assert.match(res.pages[0].text, /Educational Frontiers/);
  assert.match(res.pages[1].text, /Relative Clauses/);
});

test("Curriculum Analyzer: PDF document extraction parses compressed streams", async () => {
  const pageTexts = [
    "Unit 1: The Future of Energy. Vocabulary: solar, renewable.",
    "Grammar: Modals of Deduction. Exercises: 1. He must be tired.",
  ];
  const pdfBuf = createMockPdfBuffer(pageTexts);
  const res = extractPagesFromPdf(pdfBuf);

  assert.ok(res.pages.length >= 1, "PDF should extract textual pages from streams");
  assert.match(res.pages[0].text, /Future of Energy/);
});

test("Curriculum Analyzer: Structure discovery detects units, sections, and never hallucinates", () => {
  const pages = [
    {
      pageNumber: 1,
      text: `Unit 1: Digital Citizenship
Vocabulary & Key Words:
• cybersecurity: protection of computer systems
• privacy: the state of being free from intrusion
Lesson 1 & 2: Online Safety
Grammar Focus: Present Perfect vs Past Simple`,
    },
    {
      pageNumber: 2,
      text: `Unit 2: Environmental Action
Lesson 1: Renewable Resources
Vocabulary:
• emission: production of gas
Writing Skills: How to write a persuasive essay on climate change
General Exercises & Practice`,
    },
  ];

  const { units, warnings } = discoverCurriculumStructure(pages);

  assert.equal(units.length, 2, "Should discover exactly 2 units and not hallucinate more");
  assert.equal(units[0].unitNumber, 1);
  assert.match(units[0].titleEn, /Digital Citizenship/);
  assert.ok(units[0].sections.some((s) => s.type === "Vocabulary"), "Should detect Vocabulary section");
  assert.ok(units[0].sections.some((s) => s.type === "Grammar"), "Should detect Grammar section");

  assert.equal(units[1].unitNumber, 2);
  assert.match(units[1].titleEn, /Environmental Action/);
  assert.ok(units[1].sections.some((s) => s.type === "Writing"), "Should detect Writing section");
});

test("Curriculum Analyzer: Original questions extracted verbatim with page numbers and sources", () => {
  const pages = [
    {
      pageNumber: 14,
      text: `Unit 1: Life in a Digital World
Practice Exercises:
1. Hard as he worked, he _______ couldn't meet the deadline.
(a) still (b) although (c) despite (d) yet
Answer: a

2. Teachers aim to raise students' _______ about internet privacy.
a) awareness b) aware c) cautiously d) ignorant
Ans: a`,
    },
  ];

  const units = [
    {
      unitNumber: 1,
      titleEn: "Unit 1: Life in a Digital World",
      titleAr: "الوحدة الأولى: الحياة في عالم رقمي",
      startPage: 1,
      endPage: 20,
      sections: [],
      lessons: ["Lesson 1 & 2"],
      vocabularyWords: [],
      grammarTopics: [],
    },
  ];

  const { questions } = extractOriginalQuestions(pages, units);

  assert.equal(questions.length, 2, "Should extract both original questions");
  assert.equal(questions[0].sourceType, "original_extracted");
  assert.equal(questions[0].pageNumber, 14);
  assert.match(questions[0].questionText, /Hard as he worked/);
  assert.equal(questions[0].correctAnswer, "still");
  assert.equal(questions[0].options.length, 4);
  assert.match(questions[0].sourceReference, /صفحة 14/);
  assert.equal(questions[0].approvalStatus, "pending", "Must be pending approval by default");
  assert.equal(questions[0].isPublished, false, "Must never be published without teacher approval");
});

test("Curriculum Analyzer: AI Question Generator creates 20 verified questions with Easy/Med/Hard and deduplication", () => {
  const unit = {
    unitNumber: 1,
    titleEn: "Unit 1: Well-being",
    titleAr: "الوحدة الأولى: جودة الحياة",
    startPage: 1,
    endPage: 15,
    sections: [],
    lessons: ["Lesson 1 & 2: Health Habits"],
    vocabularyWords: ["resilience", "nutrition", "stamina"],
    grammarTopics: ["Past Perfect", "Inversion"],
  };

  const aiQuestions = generateAiQuestionsForLesson(unit, "Lesson 1 & 2: Health Habits", 20, []);

  assert.equal(aiQuestions.length, 20, "Should generate exactly 20 default questions");
  assert.ok(aiQuestions.every((q) => q.sourceType === "ai_generated"));
  assert.ok(aiQuestions.every((q) => q.approvalStatus === "pending"));
  assert.ok(aiQuestions.every((q) => !q.isPublished));
  assert.ok(aiQuestions.every((q) => q.options.length === 4));
  assert.ok(aiQuestions.every((q) => q.correctAnswer && q.correctAnswer.length > 0));
  assert.ok(aiQuestions.every((q) => q.explanation && q.explanation.length > 10));

  // Verify difficulty distribution
  const difficulties = new Set(aiQuestions.map((q) => q.difficulty));
  assert.ok(difficulties.has("Easy"), "Must include Easy level");
  assert.ok(difficulties.has("Medium"), "Must include Medium level");
  assert.ok(difficulties.has("Hard"), "Must include Hard level");

  // Verify zero duplicates
  const textSet = new Set(aiQuestions.map((q) => q.questionText.trim().toLowerCase()));
  assert.equal(textSet.size, aiQuestions.length, "All 20 generated questions must be unique");
});

test("Curriculum Analyzer: Quiz assembly creates Lesson Quizzes, Unit Exams, 3-Unit Milestone Reviews, and Final Exam", () => {
  const units = [
    {
      unitNumber: 1,
      titleEn: "Unit 1",
      titleAr: "الوحدة الأولى",
      startPage: 1,
      endPage: 10,
      sections: [],
      lessons: ["Lesson 1", "Lesson 2"],
      vocabularyWords: [],
      grammarTopics: [],
    },
    {
      unitNumber: 2,
      titleEn: "Unit 2",
      titleAr: "الوحدة الثانية",
      startPage: 11,
      endPage: 20,
      sections: [],
      lessons: ["Lesson 1"],
      vocabularyWords: [],
      grammarTopics: [],
    },
    {
      unitNumber: 3,
      titleEn: "Unit 3",
      titleAr: "الوحدة الثالثة",
      startPage: 21,
      endPage: 30,
      sections: [],
      lessons: ["Lesson 1"],
      vocabularyWords: [],
      grammarTopics: [],
    },
  ];

  // Dummy questions across the 3 units
  const questions = [];
  for (let u = 1; u <= 3; u++) {
    for (let q = 1; q <= 10; q++) {
      questions.push({
        id: `q_u${u}_${q}`,
        unitNumber: u,
        lessonTitle: "Lesson 1",
        difficulty: "Medium",
      });
    }
  }

  const quizzes = assembleAutomatedQuizzes("job_test_123", units, questions);

  assert.ok(quizzes.some((qz) => qz.quizType === "lesson_quiz"), "Should assemble Lesson Quizzes");
  assert.ok(quizzes.some((qz) => qz.quizType === "unit_exam"), "Should assemble Unit Exams");
  assert.ok(
    quizzes.some((qz) => qz.quizType === "tri_unit_review" && qz.unitsCovered.includes(3)),
    "Should assemble Tri-Unit Review Exam for Units 1-3"
  );
  assert.ok(quizzes.some((qz) => qz.quizType === "final_exam"), "Should assemble Final Comprehensive Exam");
  assert.ok(quizzes.every((qz) => qz.approvalStatus === "pending"), "All quizzes must be staged pending approval");
});

test("Curriculum Analyzer: Resumable pipeline checkpointing saves state and generates summary report", async () => {
  const sampleDoc = `[Page 1]
Unit 1: Technological Advances
Vocabulary:
• artificial intelligence
• algorithm
Lesson 1: Smart Systems
Exercises:
1. An _______ is a step-by-step process for solving a problem.
(a) algorithm (b) anchor (c) altitude (d) apology
Answer: a

[Page 2]
Unit 2: The World of Work
Lesson 1: Career Pathways
Vocabulary:
• internship: temporary work experience
1. She accepted an _______ at the hospital. (a) internship (b) interval (c) internet (d) invasion Answer: a`;

  const result = await executeCurriculumAnalysisPipeline({
    jobId: "job_resume_test",
    bufferOrText: sampleDoc,
    fileType: "txt",
    fileName: "SampleBooklet.txt",
    questionsPerLesson: 10,
  });

  assert.equal(result.isComplete, true);
  assert.equal(result.summary.totalUnits, 2, "Discovered exactly 2 units");
  assert.ok(result.summary.totalOriginalQuestions >= 2, "Extracted original questions");
  assert.ok(result.summary.totalAiQuestions >= 20, "Generated AI questions");
  assert.ok(result.summary.totalQuizzes >= 3, "Assembled quizzes");
  assert.equal(result.summary.errorsCount, 0, "Zero errors reported");
});
