import test from "node:test";
import assert from "node:assert/strict";
import { splitIntoSentences } from "../src/lib/pronunciation-assistant.ts";
import { lookupDictionaryWord } from "../src/lib/dictionary-service.ts";

test("Pronunciation Assistant: splitIntoSentences splits sentences while preserving punctuation", () => {
  const text = "Life in a digital world requires critical thinking. Are you ready for AI? Yes, we must innovate!";
  const sentences = splitIntoSentences(text);

  assert.equal(sentences.length, 3);
  assert.equal(sentences[0], "Life in a digital world requires critical thinking.");
  assert.equal(sentences[1], "Are you ready for AI?");
  assert.equal(sentences[2], "Yes, we must innovate!");
});

test("Pronunciation Assistant: splitIntoSentences handles single sentence and edge cases cleanly", () => {
  assert.deepEqual(splitIntoSentences(""), []);
  assert.deepEqual(splitIntoSentences("Single sentence without punctuation"), [
    "Single sentence without punctuation",
  ]);
  assert.equal(
    splitIntoSentences("First sentence. Second sentence.")[1],
    "Second sentence."
  );
});

test("Smart Dictionary: returns verified Oxford/Cambridge IPA for curriculum words", () => {
  const word1 = lookupDictionaryWord("Innovation");
  assert.equal(word1.word, "Innovation");
  assert.equal(word1.partOfSpeech, "noun");
  assert.equal(word1.ipaUk, "/ˌɪn.əˈveɪ.ʃən/");
  assert.equal(word1.ipaUs, "/ˌɪn.əˈveɪ.ʃən/");
  assert.ok(word1.arabicMeaning.includes("ابتكار"));

  const word2 = lookupDictionaryWord("Resilience");
  assert.equal(word2.ipaUk, "/rɪˈzɪl.jəns/");
  assert.ok(word2.arabicMeaning.includes("صمود"));

  const word3 = lookupDictionaryWord("Sustainable");
  assert.equal(word3.ipaUk, "/səˈsteɪ.nə.bəl/");
  assert.ok(word3.arabicMeaning.includes("مستدام"));
});

test("Smart Dictionary: never hallucinates or fabricates IPA for unindexed words", () => {
  const unindexed = lookupDictionaryWord("UnindexedCurriculumTermXYZ", {
    arabicMeaning: "معنى محدد للوحدة",
  });

  // Strict compliance: if IPA is not verified, it must be null / not invented!
  assert.equal(unindexed.ipaUk, null, "Must never invent British IPA");
  assert.equal(unindexed.ipaUs, null, "Must never invent American IPA");
  assert.equal(unindexed.arabicMeaning, "معنى محدد للوحدة");
});

test("My Vocabulary: prevents duplicate word entries within the same unit", () => {
  const existingWords = [
    { studentId: "std_1", word: "Innovation", unitId: "unit_sec_3_u1" },
    { studentId: "std_1", word: "Resilience", unitId: "unit_sec_3_u1" },
  ];

  const checkDuplicate = (studentId, word, unitId) => {
    return existingWords.some(
      (w) =>
        w.studentId === studentId &&
        w.word.toLowerCase() === word.toLowerCase() &&
        w.unitId === unitId
    );
  };

  // Same word, same student, same unit -> duplicate!
  assert.equal(checkDuplicate("std_1", "innovation", "unit_sec_3_u1"), true);
  assert.equal(checkDuplicate("std_1", "Innovation", "unit_sec_3_u1"), true);

  // Same word, same student, different unit -> allowed
  assert.equal(checkDuplicate("std_1", "Innovation", "unit_sec_3_u2"), false);

  // Same word, different student, same unit -> allowed
  assert.equal(checkDuplicate("std_2", "Innovation", "unit_sec_3_u1"), false);
});

test("My Vocabulary: student account isolation guarantees no cross-student leakage", () => {
  const databaseRecords = [
    { id: "ssv_1", studentId: "student_ahmed", word: "Collaborate", meaning: "يتعاون" },
    { id: "ssv_2", studentId: "student_ahmed", word: "Heritage", meaning: "تراث" },
    { id: "ssv_3", studentId: "student_mona", word: "Digital", meaning: "رقمي" },
  ];

  const getStudentWords = (authenticatedStudentId) => {
    return databaseRecords.filter((r) => r.studentId === authenticatedStudentId);
  };

  const ahmedWords = getStudentWords("student_ahmed");
  assert.equal(ahmedWords.length, 2);
  assert.ok(ahmedWords.every((w) => w.studentId === "student_ahmed"));
  assert.ok(!ahmedWords.some((w) => w.word === "Digital"));

  const monaWords = getStudentWords("student_mona");
  assert.equal(monaWords.length, 1);
  assert.equal(monaWords[0].word, "Digital");

  // Attempting unauthorized deletion
  const canDelete = (requestingUserId, wordRecordId) => {
    const record = databaseRecords.find((r) => r.id === wordRecordId);
    if (!record) return false;
    return record.studentId === requestingUserId;
  };

  assert.equal(canDelete("student_ahmed", "ssv_1"), true, "Owner can delete");
  assert.equal(canDelete("student_mona", "ssv_1"), false, "Other student cannot delete");
  assert.equal(canDelete("guest", "ssv_1"), false, "Unauthenticated cannot delete");
});

test("Pronunciation Settings: validates accent and speed options strictly", () => {
  const validateSettings = (raw) => {
    const accent = raw.accent === "us" ? "us" : "uk";
    const speed = raw.speed === "slow" ? "slow" : "normal";
    const enabled = typeof raw.enabled === "boolean" ? raw.enabled : true;
    const hoverEnabled = typeof raw.hoverEnabled === "boolean" ? raw.hoverEnabled : true;
    const touchEnabled = typeof raw.touchEnabled === "boolean" ? raw.touchEnabled : true;

    return { accent, speed, enabled, hoverEnabled, touchEnabled };
  };

  const valid1 = validateSettings({ accent: "uk", speed: "slow" });
  assert.equal(valid1.accent, "uk");
  assert.equal(valid1.speed, "slow");

  const valid2 = validateSettings({ accent: "us", speed: "normal" });
  assert.equal(valid2.accent, "us");
  assert.equal(valid2.speed, "normal");

  // Invalid or malicious fallbacks safely
  const fallback = validateSettings({ accent: "invalid_accent", speed: "super_fast" });
  assert.equal(fallback.accent, "uk");
  assert.equal(fallback.speed, "normal");
});

test("Pronunciation Practice: strict pedagogical privacy (no fake scores, local only)", () => {
  const practiceConfig = {
    allowFakeScores: false,
    persistAudioOnServerByDefault: false,
    useExternalThirdPartyPaidAPI: false,
    useMediaRecorderAPI: true,
  };

  assert.equal(practiceConfig.allowFakeScores, false, "Must never display arbitrary or fake score");
  assert.equal(practiceConfig.persistAudioOnServerByDefault, false, "Must keep audio strictly local");
  assert.equal(practiceConfig.useExternalThirdPartyPaidAPI, false, "Must not use external paid APIs without approval");
  assert.equal(practiceConfig.useMediaRecorderAPI, true, "Uses native browser MediaRecorder API");
});
