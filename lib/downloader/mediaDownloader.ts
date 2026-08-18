import fs from "fs/promises";
import os from "os";
import path from "path";
import { existsSync } from "fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

function getYtDlpBinaryPath() {
  const binaryName =
    process.platform === "win32"
      ? "yt-dlp.exe"
      : "yt-dlp";

  const binaryPath = path.join(
    process.cwd(),
    "node_modules",
    "yt-dlp-exec",
    "bin",
    binaryName
  );

  if (!existsSync(binaryPath)) {
    throw new Error(
      `yt-dlp binary not found at ${binaryPath}. Please reinstall dependencies.`
    );
  }

  return binaryPath;
}

export async function downloadWithYtDlp(
  url: string
) {
  const tempDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "media-")
  );

  const outputPath = path.join(
    tempDir,
    "media.%(ext)s"
  );

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
      {
        cwd: process.cwd(),
        windowsHide: true,
      }
    );

    const files = await fs.readdir(tempDir, {
      withFileTypes: true,
    });

    const fileEntries = await Promise.all(
      files
        .filter((entry) => entry.isFile())
        .map(async (entry) => {
          const filePath = path.join(
            tempDir,
            entry.name
          );

          const stats = await fs.stat(filePath);

          return {
            name: entry.name,
            size: stats.size,
          };
        })
    );

    const mediaFile = fileEntries
      .filter(
        (entry) =>
          !entry.name.endsWith(".part") &&
          !entry.name.endsWith(".info.json")
      )
      .sort(
        (left, right) =>
          right.size - left.size
      )[0]?.name;

    if (!mediaFile) {
      throw new Error(
        "yt-dlp did not create a downloadable media file."
      );
    }

    const filePath = path.join(
      tempDir,
      mediaFile
    );

    const buffer = await fs.readFile(filePath);

    return {
      buffer,
      filename: mediaFile,
    };
  } finally {
    await fs.rm(tempDir, {
      recursive: true,
      force: true,
    });
  }
}