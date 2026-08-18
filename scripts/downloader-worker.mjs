import http from "node:http";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const PORT = Number(process.env.PORT || 3001);

function detectPlatform(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, "");

    if (hostname === "youtube.com" || hostname === "youtu.be" || hostname.endsWith(".youtube.com")) {
      return "youtube";
    }

    if (hostname === "instagram.com" || hostname.endsWith(".instagram.com")) {
      return "instagram";
    }

    if (hostname === "tiktok.com" || hostname.endsWith(".tiktok.com")) {
      return "tiktok";
    }

    if (hostname === "facebook.com" || hostname === "fb.watch" || hostname.endsWith(".facebook.com")) {
      return "facebook";
    }

    if (hostname === "twitter.com" || hostname === "x.com" || hostname.endsWith(".twitter.com") || hostname.endsWith(".x.com")) {
      return "twitter";
    }

    return "direct";
  } catch {
    return "unknown";
  }
}

function getYtDlpBinaryPath() {
  const binaryName = process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
  const binaryPath = path.join(process.cwd(), "node_modules", "yt-dlp-exec", "bin", binaryName);

  if (!existsSync(binaryPath)) {
    throw new Error(`yt-dlp binary not found at ${binaryPath}. Install dependencies before starting the worker.`);
  }

  return binaryPath;
}

async function downloadMedia(url) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "downloader-worker-"));
  const outputPath = path.join(tempDir, "media.%(ext)s");
  const binaryPath = getYtDlpBinaryPath();

  try {
    await execFileAsync(
      binaryPath,
      [
        url,
        "--output",
        outputPath,
        "--format",
        "best[ext=mp4]/best",
        "--no-warnings",
        "--no-playlist",
      ],
      { cwd: process.cwd(), windowsHide: true }
    );

    const files = await fs.readdir(tempDir, { withFileTypes: true });
    const mediaFile = files
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => !name.endsWith(".part") && !name.endsWith(".info.json"))
      .sort((a, b) => b.length - a.length)[0];

    if (!mediaFile) {
      throw new Error("yt-dlp did not create a downloadable media file.");
    }

    const buffer = await fs.readFile(path.join(tempDir, mediaFile));

    return {
      buffer,
      filename: mediaFile,
      contentType: "video/mp4",
    };
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Only POST requests are allowed." }));
    return;
  }

  let body = "";

  for await (const chunk of req) {
    body += chunk;
  }

  try {
    const payload = JSON.parse(body || "{}");
    const url = typeof payload.url === "string" ? payload.url.trim() : "";

    if (!url) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "URL is required." }));
      return;
    }

    const platform = detectPlatform(url);

    if (platform === "unknown" || platform === "direct") {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "This worker only supports supported social media links." }));
      return;
    }

    const result = await downloadMedia(url);

    res.statusCode = 200;
    res.setHeader("Content-Type", result.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
    res.end(result.buffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Download failed.";

    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: message }));
  }
});

server.listen(PORT, () => {
  console.log(`Downloader worker listening on http://localhost:${PORT}`);
});
