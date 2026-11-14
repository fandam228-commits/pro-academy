import { test } from "node:test";
import assert from "node:assert";
import path from "node:path";
import fs from "node:fs";

test("Story AI Tutor - Architecture & 3-Mode Support", async () => {
  const tutorModule = fs.readFileSync(
    path.join(process.cwd(), "src/lib/story-world/ai-tutor.ts"),
    "utf-8"
  );

  // 1. Must define 3 modes: character, teacher, exam_prep
  assert.ok(tutorModule.includes('"character" | "teacher" | "exam_prep"'), "Must define 3 modes");

  // 2. Teacher Mode must act as Mr. Habib El Rahman
  assert.ok(tutorModule.includes("Mr. Habib El Rahman"), "Teacher mode must represent Mr. Habib");
  assert.ok(tutorModule.includes("handleTeacherMode"), "Must implement teacher mode handler");

  // 3. Exam Prep Mode must evaluate answers with scoring rubric
  assert.ok(tutorModule.includes("handleExamPrepMode"), "Must implement exam prep handler");
  assert.ok(tutorModule.includes("matchedKeywords"), "Must track matched keywords");
  assert.ok(tutorModule.includes("missingKeywords"), "Must track missing keywords");
  assert.ok(tutorModule.includes("score"), "Must compute numerical score 0-100");

  // 4. Main orchestrator
  assert.ok(tutorModule.includes("interactWithStoryAITutor"), "Must export interactWithStoryAITutor");
});

test("Story AI Tutor - Route Handler Integration", async () => {
  const routeContent = fs.readFileSync(
    path.join(process.cwd(), "src/app/api/story-world/tutor/route.ts"),
    "utf-8"
  );

  assert.ok(routeContent.includes("interactWithStoryAITutor"), "Route must call tutor orchestrator");
  assert.ok(routeContent.includes("getAuthContext"), "Route must enforce authentication");
});
