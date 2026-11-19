import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { calculateSM2, mapActionToRating } from "../src/lib/sm2-spaced-repetition.ts";
import { MASTER_FLASHCARDS_CATALOG } from "../src/data/flashcards-master-catalog.ts";

test("Spaced Repetition Flashcards & SM-2 Engine Master Suite", async (t) => {
  await t.test("1. SM-2 Algorithm Math: Repetitions, Intervals & EF Curve", () => {
    // Initial card state
    const initialState = {
      repetitionCount: 0,
      easinessFactor: 2.5,
      intervalDays: 0,
    };

    // First review: Good (rating 4)
    const step1 = calculateSM2(initialState, 4);
    assert.equal(step1.repetitionCount, 1, "Repetition count should increment to 1");
    assert.equal(step1.intervalDays, 1, "1st interval should be 1 day");
    assert.equal(step1.masteryLevel, 2, "Level should be familiar (2)");
    assert.equal(step1.actionKey, "good");
    assert.ok(step1.easinessFactor >= 2.4, "EF should adjust slightly");

    // Second review: Good (rating 4)
    const step2 = calculateSM2(step1, 4);
    assert.equal(step2.repetitionCount, 2, "Repetition count should increment to 2");
    assert.ok(step2.intervalDays >= 3, "2nd interval should be at least 3 days");

    // Third review: Easy / Mastered (rating 5)
    const step3 = calculateSM2(step2, 5);
    assert.equal(step3.repetitionCount, 3, "Repetition count should increment to 3");
    assert.ok(step3.intervalDays >= 7, "3rd interval should be 7+ days");
    assert.equal(step3.masteryLevel, 3, "Level should be Mastered (3)");
    assert.equal(step3.xpAwarded, 5, "Mastering card must award +5 XP");
    assert.ok(step3.easinessFactor > step2.easinessFactor, "EF should increase on rating 5");

    // Failure / Reset review: Again (rating 1)
    const stepFailure = calculateSM2(step3, 1);
    assert.equal(stepFailure.repetitionCount, 0, "Failed recall must reset repetition count to 0");
    assert.equal(stepFailure.intervalDays, 0, "Failed recall must reset interval to 0 (repeat in 10 mins)");
    assert.equal(stepFailure.actionKey, "again");
    assert.ok(stepFailure.messageAr.includes("10 دقائق"));
    assert.ok(stepFailure.easinessFactor >= 1.3, "EF must never drop below 1.3");
  });

  await t.test("2. Action to Rating Mapping", () => {
    assert.equal(mapActionToRating("again"), 1);
    assert.equal(mapActionToRating("hard"), 3);
    assert.equal(mapActionToRating("good"), 4);
    assert.equal(mapActionToRating("mastered"), 5);
    assert.equal(mapActionToRating("unknown"), 4);
  });

  await t.test("3. Master Flashcards Catalog Integrity & Rich Content", () => {
    assert.ok(MASTER_FLASHCARDS_CATALOG.length >= 40, "Must contain rich catalog of flashcards");

    // Verify grades coverage
    const sec1Cards = MASTER_FLASHCARDS_CATALOG.filter((c) => c.gradeLevel === "sec_1");
    const sec2Cards = MASTER_FLASHCARDS_CATALOG.filter((c) => c.gradeLevel === "sec_2");
    const sec3Cards = MASTER_FLASHCARDS_CATALOG.filter((c) => c.gradeLevel === "sec_3");

    assert.ok(sec1Cards.length > 0, "Must contain First Secondary cards");
    assert.ok(sec2Cards.length > 0, "Must contain Second Secondary cards");
    assert.ok(sec3Cards.length > 0, "Must contain Third Secondary cards");

    // Verify categories
    const coreCards = MASTER_FLASHCARDS_CATALOG.filter((c) => c.category === "core");
    const synCards = MASTER_FLASHCARDS_CATALOG.filter((c) => c.category === "synonyms");
    const prepCards = MASTER_FLASHCARDS_CATALOG.filter((c) => c.category === "prepositions");

    assert.ok(coreCards.length > 0, "Must contain core vocabulary cards");
    assert.ok(synCards.length > 0, "Must contain synonyms cards");
    assert.ok(prepCards.length > 0, "Must contain prepositions/collocations cards");

    // Content completeness
    MASTER_FLASHCARDS_CATALOG.forEach((card, idx) => {
      assert.ok(card.id, `Card #${idx} must have id`);
      assert.ok(card.word, `Card #${idx} must have word`);
      assert.ok(card.meaningAr, `Card #${idx} must have Arabic meaning`);
      assert.ok(card.partOfSpeech, `Card #${idx} must have part of speech`);
    });
  });

  await t.test("4. Physical Files & Components Architecture Verification", () => {
    const root = process.cwd();

    const sm2Path = path.join(root, "src/lib/sm2-spaced-repetition.ts");
    assert.ok(fs.existsSync(sm2Path), "sm2-spaced-repetition.ts must exist");

    const catalogPath = path.join(root, "src/data/flashcards-master-catalog.ts");
    assert.ok(fs.existsSync(catalogPath), "flashcards-master-catalog.ts must exist");

    const deckRoutePath = path.join(root, "src/app/api/flashcards/deck/route.ts");
    assert.ok(fs.existsSync(deckRoutePath), "deck/route.ts must exist");

    const reviewRoutePath = path.join(root, "src/app/api/flashcards/review/route.ts");
    assert.ok(fs.existsSync(reviewRoutePath), "review/route.ts must exist");

    const workspacePath = path.join(root, "src/components/pro-suite/FlashcardsWorkspace.tsx");
    assert.ok(fs.existsSync(workspacePath), "FlashcardsWorkspace.tsx must exist");

    const workspaceCode = fs.readFileSync(workspacePath, "utf-8");
    assert.ok(workspaceCode.includes("handleReviewRating"), "Workspace must handle SM-2 ratings");
    assert.ok(workspaceCode.includes("speakWord"), "Workspace must support audio speech synthesis");
    assert.ok(workspaceCode.includes("isFlipped"), "Workspace must support 3D card flip");
  });
});
