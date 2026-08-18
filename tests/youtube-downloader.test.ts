import test from "node:test";
import assert from "node:assert/strict";

import { detectPlatform } from "../lib/platformDetector";
import { downloadYouTube } from "../lib/downloader/youtubeDownloader";

test("detectPlatform identifies YouTube URLs", () => {
  assert.equal(detectPlatform("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), "youtube");
  assert.equal(detectPlatform("https://youtu.be/dQw4w9WgXcQ"), "youtube");
});

test("downloadYouTube rejects non-YouTube URLs with a clear message", async () => {
  await assert.rejects(
    () => downloadYouTube("https://example.com/video"),
    /YouTube URLs only|not a YouTube URL/i
  );
});
