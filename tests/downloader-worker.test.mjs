import test from "node:test";
import assert from "node:assert/strict";

import {
  buildWorkerDownloadError,
  getDownloaderWorkerUrl,
  shouldUseWorkerDownload,
} from "../lib/downloader/workerConfig.js";

test("returns null when no worker URL is configured", () => {
  const previousValue = process.env.DOWNLOADER_WORKER_URL;

  delete process.env.DOWNLOADER_WORKER_URL;

  try {
    assert.equal(getDownloaderWorkerUrl(), null);
  } finally {
    if (previousValue === undefined) {
      delete process.env.DOWNLOADER_WORKER_URL;
    } else {
      process.env.DOWNLOADER_WORKER_URL = previousValue;
    }
  }
});

test("normalizes configured worker URLs", () => {
  const previousValue = process.env.DOWNLOADER_WORKER_URL;

  process.env.DOWNLOADER_WORKER_URL = "https://worker.example.com";

  try {
    assert.equal(getDownloaderWorkerUrl(), "https://worker.example.com");
  } finally {
    if (previousValue === undefined) {
      delete process.env.DOWNLOADER_WORKER_URL;
    } else {
      process.env.DOWNLOADER_WORKER_URL = previousValue;
    }
  }
});

test("social media downloads require the worker route", () => {
  assert.equal(shouldUseWorkerDownload("youtube"), true);
  assert.equal(shouldUseWorkerDownload("instagram"), true);
  assert.equal(shouldUseWorkerDownload("direct"), false);
});

test("returns a clear unsupported-worker message", () => {
  assert.match(
    buildWorkerDownloadError(),
    /separate worker|Vercel/i
  );
});
