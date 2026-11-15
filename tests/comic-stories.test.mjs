import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

test("Comic Stories Pilot - Data Schema and Chapter 1 Storyboards", async (t) => {
  await t.test("Sec 3 (The Count of Monte Cristo) Chapter 1 Comic Storyboard", () => {
    const sec3Path = path.join(rootDir, "src/data/story-world/sec3-story.json");
    const sec3 = JSON.parse(fs.readFileSync(sec3Path, "utf-8"));
    const ch1 = sec3.chapters[0];

    assert.ok(Array.isArray(ch1.comicScenes), "comicScenes should be an array");
    assert.equal(ch1.comicScenes.length, 5, "Chapter 1 should contain 5 sequential comic scenes");

    // Check character references
    assert.ok(Array.isArray(ch1.characterReferences), "characterReferences should be an array");
    assert.ok(ch1.characterReferences.length >= 5, "Should have at least 5 character references");
    const charNames = ch1.characterReferences.map((c) => c.nameEn);
    assert.ok(charNames.includes("Edmond Dantès"), "Should have Edmond Dantès");
    assert.ok(charNames.includes("Mercédès"), "Should have Mercédès");
    assert.ok(charNames.includes("Danglars"), "Should have Danglars");
    assert.ok(charNames.includes("Fernand Mondego"), "Should have Fernand Mondego");

    // Check each scene has required visual and dialogue fields
    ch1.comicScenes.forEach((scene, idx) => {
      assert.ok(scene.id, `Scene ${idx + 1} must have id`);
      assert.ok(scene.titleEn && scene.titleAr, `Scene ${idx + 1} must have bilingual titles`);
      assert.ok(scene.settingEn && scene.settingAr, `Scene ${idx + 1} must have bilingual settings`);
      assert.ok(scene.visualDescriptionEn, `Scene ${idx + 1} must have visualDescriptionEn for image generation`);
      assert.ok(scene.visualDescriptionAr, `Scene ${idx + 1} must have visualDescriptionAr`);
      assert.ok(scene.bgGradient, `Scene ${idx + 1} must have bgGradient`);
      assert.ok(Array.isArray(scene.bubbles) && scene.bubbles.length > 0, `Scene ${idx + 1} must have dialogue bubbles`);

      // Verify bubbles have no invented empty text
      scene.bubbles.forEach((b, bIdx) => {
        assert.ok(b.speakerEn && b.speakerAr, `Bubble ${bIdx} must have speaker names`);
        assert.ok(b.textEn && b.textAr, `Bubble ${bIdx} must have bilingual text`);
        assert.ok(b.position, `Bubble ${bIdx} must have layout positioning`);
      });
    });
  });

  await t.test("Sec 1 (The Old Man and the Sea) Chapter 1 Comic Storyboard", () => {
    const sec1Path = path.join(rootDir, "src/data/story-world/sec1-story.json");
    const sec1 = JSON.parse(fs.readFileSync(sec1Path, "utf-8"));
    const ch1 = sec1.chapters[0];

    assert.ok(Array.isArray(ch1.comicScenes), "comicScenes should be an array");
    assert.equal(ch1.comicScenes.length, 4, "Chapter 1 should contain 4 sequential comic scenes");

    assert.ok(Array.isArray(ch1.characterReferences), "characterReferences should be an array");
    const charNames = ch1.characterReferences.map((c) => c.nameEn);
    assert.ok(charNames.includes("Santiago"), "Should have Santiago");
    assert.ok(charNames.includes("Manolin"), "Should have Manolin");

    ch1.comicScenes.forEach((scene, idx) => {
      assert.ok(scene.titleEn && scene.titleAr, `Sec1 Scene ${idx + 1} must have bilingual titles`);
      assert.ok(scene.visualDescriptionEn, `Sec1 Scene ${idx + 1} must have visual description`);
      assert.ok(Array.isArray(scene.bubbles) && scene.bubbles.length > 0, `Sec1 Scene ${idx + 1} must have bubbles`);
    });
  });
});
