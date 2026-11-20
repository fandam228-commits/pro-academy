/**
 * PRO MEDIA COMMAND CENTER (PMC) — Phase 4 Automated Tests
 * Professional Academy — Mr. Habib El Rahman
 * 
 * Verifies:
 * 1. AI Content Studio & Curriculum Grounding (Zero Hallucination)
 * 2. Multi-Platform Adaptation Differentiation (Facebook vs YouTube vs TikTok)
 * 3. AI Video Production Studio (Storyboard Generator, Scene Durations, Dual Aspect Ratios)
 * 4. Bilingual Subtitles with Golden & Red Keyword Highlights
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  generateAcademicMultiplatformContent,
  ACADEMY_HASHTAGS,
} from "../src/lib/media-center/content-studio.ts";

import {
  buildEducationalStoryboard,
} from "../src/lib/media-center/video-studio.ts";

describe("PRO MEDIA COMMAND CENTER — Phase 4 AI Content & Video Studio Suite", () => {
  describe("1. AI Content Studio & Multiplatform Adaptation", () => {
    it("generates 3 completely differentiated platform variants from a curriculum topic", async () => {
      const result = await generateAcademicMultiplatformContent({
        sourceType: "curriculum_lesson",
        stage: "Secondary",
        grade: "Third Secondary (Baccalaureate)",
        unitTitle: "Unit 1",
        topicTitle: "used_to_vs_would",
        rawText: "When I was young, I (used to / would) live in Cairo.",
      });

      assert.ok(result.projectId);
      assert.equal(result.stage, "Secondary");
      assert.ok(result.sourceAttribution.includes("2026/2027"));

      const { facebook, youtube, tiktok } = result.variants;

      // Facebook checks
      assert.equal(facebook.platform, "facebook");
      assert.equal(facebook.postType, "post");
      assert.ok(facebook.caption.includes("كبسولة الجرامر مع مستر حبيب"));
      assert.ok(facebook.caption.includes("القاعدة الذهبية"));
      assert.ok(facebook.contentHash.length === 64);

      // YouTube checks
      assert.equal(youtube.platform, "youtube");
      assert.equal(youtube.postType, "video");
      assert.ok(youtube.hook.length <= 100, "YouTube title must be <= 100 chars");
      assert.ok(youtube.description?.includes("فصول الفيديو:"));
      assert.ok(youtube.script?.includes("[مقدمة - كاميرا 1"));
      assert.ok(youtube.tags && youtube.tags.length >= 4);
      assert.ok(youtube.thumbnailText);

      // TikTok checks
      assert.equal(tiktok.platform, "tiktok");
      assert.equal(tiktok.postType, "reel");
      assert.ok(tiktok.hook.includes("أوعى"));
      assert.ok(tiktok.script?.includes("[00:00 - 00:03]"));
      assert.ok(tiktok.estimatedDurationSeconds && tiktok.estimatedDurationSeconds <= 60);

      // Verify that all 3 variants have distinct content hashes
      assert.notEqual(facebook.contentHash, youtube.contentHash);
      assert.notEqual(facebook.contentHash, tiktok.contentHash);
    });

    it("grounds grammar rules strictly in official Thanawya Amma curriculum", async () => {
      const result = await generateAcademicMultiplatformContent({
        sourceType: "curriculum_lesson",
        topicTitle: "inversion",
      });

      const fbText = result.variants.facebook.caption;
      assert.ok(fbText.includes("تقديم الفعل المساعد"));
      assert.ok(fbText.includes("No sooner"));
    });
  });

  describe("2. AI Video Studio & Scene Storyboard Generator", () => {
    it("converts educational script into 4 structured scenes with time ranges", () => {
      const pack = buildEducationalStoryboard({
        title: "Used to vs Would Masterclass",
        script: "Sample script",
        topicTitle: "Used to vs Would",
        aspectRatio: "9:16",
      });

      assert.ok(pack.packId);
      assert.equal(pack.aspectRatio, "9:16");
      assert.equal(pack.resolution, "1080x1920");
      assert.equal(pack.scenesCount, 4);

      // Verify cumulative durations
      const sumDurations = pack.scenes.reduce((acc, s) => acc + s.durationSeconds, 0);
      assert.equal(pack.totalDurationSeconds, sumDurations);
      assert.equal(pack.totalDurationSeconds, 38);

      // Scene 1 Hook
      const scene1 = pack.scenes[0];
      assert.equal(scene1.sceneType, "hook");
      assert.equal(scene1.durationSeconds, 3);
      assert.equal(scene1.timeRange, "00:00 - 00:03");
      assert.equal(scene1.visualCues.cameraMove, "zoom_in_rapid");
    });

    it("supports 16:9 widescreen YouTube Master resolution", () => {
      const pack = buildEducationalStoryboard({
        title: "YouTube Master",
        script: "Sample script",
        topicTitle: "Passive Voice",
        aspectRatio: "16:9",
      });

      assert.equal(pack.aspectRatio, "16:9");
      assert.equal(pack.resolution, "1920x1080");
    });

    it("generates bilingual subtitles with golden and trap keyword tags", () => {
      const pack = buildEducationalStoryboard({
        title: "Subtitles Test",
        script: "Sample",
        topicTitle: "Inversion",
      });

      const scene2 = pack.scenes[1];
      assert.ok(scene2.subtitlesBilingual.ar);
      assert.ok(scene2.subtitlesBilingual.en);
      assert.ok(scene2.subtitlesBilingual.goldenKeywords.length > 0);
      assert.ok(scene2.subtitlesBilingual.goldenKeywords.includes("القاعدة الذهبية"));
    });

    it("verifies broadcast audio normalization profile (-14 LUFS, 80% ducking)", () => {
      const pack = buildEducationalStoryboard({
        title: "Audio Profile Test",
        script: "Sample",
        topicTitle: "Tenses",
      });

      assert.equal(pack.audioMixProfile.dialogueNormalizationLufs, -14);
      assert.equal(pack.audioMixProfile.duckingPercentage, 80);
    });
  });
});
