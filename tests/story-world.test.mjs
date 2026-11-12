import test from "node:test";
import assert from "node:assert/strict";
import { CURRICULUM_2026_GRADES } from "../src/config/curriculum-2026.ts";
import {
  createExamAttemptSession,
  gradeExamAttempt,
} from "../src/lib/smart-shuffle-engine.mjs";

test("Story World: Confirmed grades have complete stories and structured chapters", () => {
  const confirmedGrades = CURRICULUM_2026_GRADES.filter((g) => g.story.isConfirmed);
  assert.equal(confirmedGrades.length >= 5, true, "At least 5 confirmed story grades required");

  for (const grade of confirmedGrades) {
    assert.ok(grade.story.titleAr, `Grade ${grade.code} must have story title in Arabic`);
    assert.ok(grade.story.titleEn, `Grade ${grade.code} must have story title in English`);
    assert.ok(grade.story.author, `Grade ${grade.code} must have author`);
    assert.equal(grade.story.sampleChapters.length > 0, true, `Grade ${grade.code} must have chapters`);

    for (const ch of grade.story.sampleChapters) {
      assert.ok(ch.chapterNumber >= 1, "Chapter number must be >= 1");
      assert.ok(ch.titleAr, "Chapter must have title in Arabic");
      assert.ok(ch.titleEn, "Chapter must have title in English");
      assert.ok(ch.summaryAr, "Chapter must have educational summary in Arabic");
    }
  }
});

test("Story World: 4-Option Smart Shuffle powers Story Exam Arena without leaks", () => {
  const storyQuestions = [
    {
      id: "STQ_1",
      questionText: "What was Santiago's main virtue when facing the ocean in Hemingway's novella?",
      options: [
        { label: "A", text: "Endurance and dignity" },
        { label: "B", text: "Impatience and greed" },
        { label: "C", text: "Carelessness" },
        { label: "D", text: "Giving up easily" },
      ],
      correctAnswer: "Endurance and dignity",
      explanation: "Hemingway emphasizes Santiago's resilience and quiet dignity throughout his journey.",
    },
    {
      id: "STQ_2",
      questionText: "Why did Phileas Fogg wager twenty thousand pounds to travel the world?",
      options: [
        { label: "A", text: "To prove mathematical possibility and honor a gentleman's bet" },
        { label: "B", text: "To escape from the authorities" },
        { label: "C", text: "To search for lost treasure" },
        { label: "D", text: "To buy an estate in India" },
      ],
      correctAnswer: "To prove mathematical possibility and honor a gentleman's bet",
      explanation: "Fogg accepted the wager at the Reform Club to prove the modern transit schedule.",
    },
    {
      id: "STQ_3",
      questionText: "What was Edmond Dantès' ultimate realization regarding justice and revenge?",
      options: [
        { label: "A", text: "Vengeance belongs to God and human wisdom is to wait and hope" },
        { label: "B", text: "Revenge solves all sorrows" },
        { label: "C", text: "Power must be used ruthlessly" },
        { label: "D", text: "Wealth is the only true measure of success" },
      ],
      correctAnswer: "Vengeance belongs to God and human wisdom is to wait and hope",
      explanation: "At the conclusion of Monte Cristo, Dantès learns mercy and the limits of human vengeance.",
    },
    {
      id: "STQ_4",
      questionText: "What attitude did Professor Summerlee initially exhibit towards Challenger's claims?",
      options: [
        { label: "A", text: "Outspoken scientific skepticism" },
        { label: "B", text: "Blind acceptance" },
        { label: "C", text: "Complete indifference" },
        { label: "D", text: "Enthusiastic belief without evidence" },
      ],
      correctAnswer: "Outspoken scientific skepticism",
      explanation: "Summerlee accompanied the expedition to demand concrete evidence.",
    },
  ];

  const session = createExamAttemptSession(storyQuestions);
  assert.equal(session.clientQuestions.length, 4);

  // Client questions must NEVER leak answers or explanations
  for (const q of session.clientQuestions) {
    assert.equal("correctAnswer" in q, false);
    assert.equal("explanation" in q, false);
    assert.equal(q.options.length, 4);
  }

  // Grade student submission
  const perfectAnswers = {};
  for (const qId of Object.keys(session.secrets)) {
    perfectAnswers[qId] = session.secrets[qId].correctVisualLabel;
  }

  const result = gradeExamAttempt(session.secrets, perfectAnswers);
  assert.equal(result.score, 4);
  assert.equal(result.percentage, 100);
  assert.equal(result.passed, true);
});

test("Story World: Badges criteria and thresholds are consistent", () => {
  const BADGES = {
    story_explorer: { minChapters: 1, icon: "🗺️" },
    master_reader: { minChapters: 5, icon: "📚" },
    listening_hero: { minListening: 100, icon: "🎧" },
    character_expert: { minCharacters: 3, icon: "🎭" },
    story_champion: { minFinalScore: 85, icon: "👑" },
  };

  assert.equal(Object.keys(BADGES).length, 5, "Must define all 5 core pedagogical badges");
  assert.equal(BADGES.story_champion.minFinalScore, 85, "Story Champion requires >= 85%");
  assert.equal(BADGES.character_expert.minCharacters, 3, "Character Expert requires 3 characters");
});
