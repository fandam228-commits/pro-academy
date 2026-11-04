import test from "node:test";
import assert from "node:assert/strict";
import { shouldShowAcademyIntro, markAcademyIntroSeen } from "../src/lib/academy-intro.mjs";

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    get(key) { return values.get(key); },
  };
}

test("intro is shown when this browser session has not seen it", () => {
  assert.equal(shouldShowAcademyIntro(createStorage()), true);
});

test("intro is not shown again after it has been completed in this session", () => {
  assert.equal(shouldShowAcademyIntro(createStorage({ "pa_intro_seen_v1": "1" })), false);
});

test("completing or skipping the intro records the session flag", () => {
  const storage = createStorage();
  markAcademyIntroSeen(storage);
  assert.equal(storage.get("pa_intro_seen_v1"), "1");
  assert.equal(shouldShowAcademyIntro(storage), false);
});

test("storage failures never prevent the platform from loading", () => {
  const unavailableStorage = {
    getItem() { throw new Error("storage blocked"); },
    setItem() { throw new Error("storage blocked"); },
  };
  assert.equal(shouldShowAcademyIntro(unavailableStorage), true);
  assert.doesNotThrow(() => markAcademyIntroSeen(unavailableStorage));
});
