const test = require("node:test");
const assert = require("node:assert/strict");
const { toYouTubeEmbedUrl } = require("../src/lib/youtube-url.js");

test("converts standard YouTube watch links to privacy-enhanced embed URLs", () => {
  assert.equal(
    toYouTubeEmbedUrl("https://www.youtube.com/watch?v=aqz-KE-bpKQ"),
    "https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ"
  );
});

test("converts youtu.be links and preserves a valid start time", () => {
  assert.equal(
    toYouTubeEmbedUrl("https://youtu.be/aqz-KE-bpKQ?t=42"),
    "https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ?start=42"
  );
});

test("accepts YouTube Shorts links", () => {
  assert.equal(
    toYouTubeEmbedUrl("https://www.youtube.com/shorts/aqz-KE-bpKQ"),
    "https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ"
  );
});

test("rejects non-YouTube hosts and malformed video IDs", () => {
  assert.equal(toYouTubeEmbedUrl("https://example.com/watch?v=aqz-KE-bpKQ"), null);
  assert.equal(toYouTubeEmbedUrl("https://youtube.com/watch?v=bad"), null);
  assert.equal(toYouTubeEmbedUrl("not a url"), null);
});
