import { downloadWithYtDlp } from "./mediaDownloader";
import { DownloaderPlatform } from "@/lib/platformDetector";

const supportedPlatforms: DownloaderPlatform[] = [
  "instagram",
  "tiktok",
  "facebook",
  "twitter",
];

export async function downloadSocialMedia(
  url: string,
  platform: DownloaderPlatform
) {
  if (!supportedPlatforms.includes(platform)) {
    throw new Error(
      `Unsupported social media platform: ${platform}`
    );
  }

  return downloadWithYtDlp(url);
}