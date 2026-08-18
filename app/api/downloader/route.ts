import { NextResponse } from "next/server";
import {
  buildWorkerDownloadError,
  getDownloaderWorkerUrl,
  shouldUseWorkerDownload,
} from "@/lib/downloader/workerConfig";
import { detectPlatform } from "@/lib/platformDetector";

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

    if (shouldUseWorkerDownload(platform)) {
      const workerUrl = getDownloaderWorkerUrl();

      if (!workerUrl) {
        return NextResponse.json(
          {
            error: buildWorkerDownloadError(),
          },
          { status: 501 }
        );
      }

      try {
        const workerResponse = await fetch(workerUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        });

        const contentType =
          workerResponse.headers.get("content-type") ??
          "application/octet-stream";

        const contentDisposition =
          workerResponse.headers.get("content-disposition") ??
          'attachment; filename="download"';

        if (!workerResponse.ok) {
          let payload: { error?: string } | null = null;

          try {
            payload = (await workerResponse.json()) as {
              error?: string;
            };
          } catch {
            // ignore invalid JSON and use the default error
          }

          return NextResponse.json(
            {
              error:
                payload?.error ?? buildWorkerDownloadError(),
            },
            { status: workerResponse.status || 502 }
          );
        }

        const blob = await workerResponse.blob();

        return new NextResponse(blob, {
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": contentDisposition,
          },
        });
      } catch (error) {
        console.error("Worker download failed:", error);

        return NextResponse.json(
          {
            error: `Worker download failed: ${
              error instanceof Error
                ? error.message
                : "unknown error"
            }`,
          },
          { status: 502 }
        );
      }
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
