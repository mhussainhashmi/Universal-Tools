import { NextResponse } from "next/server";
import { detectPlatform } from "@/lib/platformDetector";
import { downloadYouTube } from "@/lib/downloader/youtubeDownloader";
import { downloadSocialMedia } from "@/lib/downloader/socialDownloader";


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required." },
        { status: 400 }
      );
    }

    const platform = detectPlatform(url);

    console.log("Downloader platform:", platform);

    if (platform === "youtube") {
  const result = await downloadYouTube(url);

  return new NextResponse(result.buffer, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename="${result.filename}"`,
    },
  });
}

    if (
      platform === "instagram" ||
      platform === "tiktok" ||
      platform === "facebook" ||
      platform === "twitter"
    ) {
      const result = await downloadSocialMedia(
        url,
        platform
      );

      return new NextResponse(result.buffer, {
        headers: {
          "Content-Type": "video/mp4",
          "Content-Disposition": `attachment; filename="${result.filename}"`,
        },
      });
    }

    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch the file." },
        { status: 400 }
      );
    }

    const blob = await response.blob();

    return new NextResponse(blob, {
      headers: {
        "Content-Type":
          response.headers.get("content-type") ??
          "application/octet-stream",
      },
    });
  } catch (error) {
  console.error("Downloader error:", error);

  return NextResponse.json(
    {
      error:
        error instanceof Error
          ? error.message
          : "Download failed.",
    },
    { status: 500 }
  );
}
}