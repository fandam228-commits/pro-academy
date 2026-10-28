import test from "node:test";
import assert from "node:assert/strict";
import {
  getHomeworkPrivateBlobToken,
  isLegacyPublicHomeworkBlobUrl,
  isPrivateHomeworkBlobPath,
} from "./homework-storage.mjs";

test("private homework storage fails closed when its dedicated token is absent", () => {
  assert.equal(getHomeworkPrivateBlobToken({}), null);
  assert.equal(getHomeworkPrivateBlobToken({ HOMEWORK_PRIVATE_BLOB_READ_WRITE_TOKEN: "   " }), null);
});

test("private homework storage token is trimmed", () => {
  assert.equal(
    getHomeworkPrivateBlobToken({ HOMEWORK_PRIVATE_BLOB_READ_WRITE_TOKEN: "  private-token  " }),
    "private-token"
  );
});

test("legacy public Blob URLs are detected and must not be redirected", () => {
  assert.equal(isLegacyPublicHomeworkBlobUrl("https://store.public.blob.vercel-storage.com/homework/file.pdf"), true);
  assert.equal(isLegacyPublicHomeworkBlobUrl("http://example.test/file.pdf"), true);
  assert.equal(isLegacyPublicHomeworkBlobUrl("homework/file.pdf"), false);
  assert.equal(isLegacyPublicHomeworkBlobUrl(null), false);
});

test("only safe homework namespace pathnames are accepted for private Blob reads", () => {
  assert.equal(isPrivateHomeworkBlobPath("homework/hws_123_file.pdf"), true);
  assert.equal(isPrivateHomeworkBlobPath("homework/nested/file.pdf"), true);
  assert.equal(isPrivateHomeworkBlobPath("https://store.public.blob.vercel-storage.com/homework/file.pdf"), false);
  assert.equal(isPrivateHomeworkBlobPath("homework/../secrets.txt"), false);
  assert.equal(isPrivateHomeworkBlobPath("homework//file.pdf"), false);
  assert.equal(isPrivateHomeworkBlobPath("other/file.pdf"), false);
  assert.equal(isPrivateHomeworkBlobPath("homework/file.pdf?token=x"), false);
  assert.equal(isPrivateHomeworkBlobPath(null), false);
});
