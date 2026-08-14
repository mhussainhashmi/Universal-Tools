"use client";

import { fetchFile } from "@ffmpeg/util";

let ffmpeg: import("@ffmpeg/ffmpeg").FFmpeg | null = null;
let loaded = false;

async function loadFFmpeg() {
  if (!ffmpeg) {
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");

    ffmpeg = new FFmpeg();
  }

  if (!loaded) {
    await ffmpeg.load();

    loaded = true;
  }

  return ffmpeg;
}

export async function convertWithFFmpeg(
  file: File,
  targetFormat: string
): Promise<Blob> {
  const engine = await loadFFmpeg();

  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const inputName = `${crypto.randomUUID()}_${safeFileName}`;
  const outputName = `${crypto.randomUUID()}.${targetFormat}`;

  await engine.writeFile(
    inputName,
    await fetchFile(file)
  );

  const codecMap: Record<string, string[]> = {
    mp3: ["-vn", "-codec:a", "libmp3lame"],
    wav: ["-vn", "-codec:a", "pcm_s16le"],
    m4a: ["-vn", "-codec:a", "aac"],
    ogg: ["-vn", "-codec:a", "libvorbis"],
  };

  const args = [
    "-y",
    "-i",
    inputName,
    ...((codecMap[targetFormat] ?? ["-vn"]) as string[]),
    outputName,
  ];

  await engine.exec(args);

  const data = await engine.readFile(outputName);

  const output = new Uint8Array(
    data as Uint8Array
  );

  await engine.deleteFile(inputName);
await engine.deleteFile(outputName);

  const mimeTypes: Record<string, string> = {
    mp3: "audio/mpeg",
    wav: "audio/wav",
    m4a: "audio/mp4",
    ogg: "audio/ogg",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
  };

  return new Blob([output], {
    type: mimeTypes[targetFormat] ?? "application/octet-stream",
  });
}