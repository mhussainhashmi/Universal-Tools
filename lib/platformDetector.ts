export type DownloaderPlatform =
  | "youtube"
  | "instagram"
  | "tiktok"
  | "facebook"
  | "twitter"
  | "direct"
  | "unknown";

export function detectPlatform(
  url: string
): DownloaderPlatform {
  try {
    const parsedUrl = new URL(url);

    const hostname = parsedUrl.hostname
      .toLowerCase()
      .replace(/^www\./, "");

    if (
      hostname === "youtube.com" ||
      hostname === "youtu.be" ||
      hostname.endsWith(".youtube.com")
    ) {
      return "youtube";
    }

    if (
      hostname === "instagram.com" ||
      hostname.endsWith(".instagram.com")
    ) {
      return "instagram";
    }

    if (
      hostname === "tiktok.com" ||
      hostname.endsWith(".tiktok.com")
    ) {
      return "tiktok";
    }

    if (
      hostname === "facebook.com" ||
      hostname === "fb.watch" ||
      hostname.endsWith(".facebook.com")
    ) {
      return "facebook";
    }

    if (
      hostname === "twitter.com" ||
      hostname === "x.com" ||
      hostname.endsWith(".twitter.com") ||
      hostname.endsWith(".x.com")
    ) {
      return "twitter";
    }

    return "direct";
  } catch {
    return "unknown";
  }
}