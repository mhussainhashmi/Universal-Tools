import { detectPlatform } from "@/lib/platformDetector";
import { downloadWithYtDlp } from "./mediaDownloader";

export async function downloadYouTube(
  url: string
) {
  if (!url || typeof url !== "string") {
    throw new Error(
      "A YouTube URL is required."
    );
  }

  const normalizedUrl = url.trim();

  if (
    detectPlatform(normalizedUrl) !==
    "youtube"
  ) {
    throw new Error(
      "YouTube URLs only. Please provide a valid YouTube video URL."
    );
  }

  return downloadWithYtDlp(normalizedUrl);
}