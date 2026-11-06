import test from "node:test";
import assert from "node:assert/strict";
import { getSupersededPrivateHomeworkPath } from "./homework-replacement.mjs";

test("returns the previous private object only after a successful replacement", () => {
  assert.equal(getSupersededPrivateHomeworkPath({
    previousStoragePath: "homework/submission-old.pdf",
    nextStoragePath: "homework/submission-new.pdf",
    updateSucceeded: true,
  }), "homework/submission-old.pdf");
});

test("does not delete the previous object when the database update did not succeed", () => {
  assert.equal(getSupersededPrivateHomeworkPath({
    previousStoragePath: "homework/submission-old.pdf",
    nextStoragePath: "homework/submission-new.pdf",
    updateSucceeded: false,
  }), null);
});

test("does not delete a previous object for a text-only replacement", () => {
  assert.equal(getSupersededPrivateHomeworkPath({
    previousStoragePath: "homework/submission-old.pdf",
    nextStoragePath: null,
    updateSucceeded: true,
  }), null);
});

test("does not send legacy public URLs to private-blob deletion", () => {
  assert.equal(getSupersededPrivateHomeworkPath({
    previousStoragePath: "https://public.example/old.pdf",
    nextStoragePath: "homework/submission-new.pdf",
    updateSucceeded: true,
  }), null);
});

test("does not delete malformed or traversal-like stored paths", () => {
  for (const previousStoragePath of [
    "homework/../outside.pdf",
    "homework/%2e%2e/outside.pdf",
    "homework\\outside.pdf",
    "other/submission-old.pdf",
  ]) {
    assert.equal(getSupersededPrivateHomeworkPath({
      previousStoragePath,
      nextStoragePath: "homework/submission-new.pdf",
      updateSucceeded: true,
    }), null);
  }
});

test("does not delete an object when old and new references are identical", () => {
  assert.equal(getSupersededPrivateHomeworkPath({
    previousStoragePath: "homework/same.pdf",
    nextStoragePath: "homework/same.pdf",
    updateSucceeded: true,
  }), null);
});
