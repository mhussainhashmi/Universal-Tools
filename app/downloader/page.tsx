"use client";

import { useState } from "react";

export default function DownloaderPage() {
  const [url, setUrl] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleDownload = async () => {
    if (!url.trim() || isDownloading) {
      return;
    }

    setIsDownloading(true);
    setStatusMessage("");

    try {
      const response = await fetch("/api/downloader", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Download failed.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = "download";

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(objectUrl);
      setStatusMessage("Download started.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Download failed.";

      console.error("Downloader request failed:", error);
      setStatusMessage(message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold">Universal Downloader</h1>

        <p className="mt-2 text-gray-600">
          Download direct files from a URL. Social downloads use a separate worker.
        </p>

        <div className="mt-8 max-w-3xl rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold">Enter URL</h2>

          <input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Paste a URL here..."
            className="mt-4 w-full rounded-lg border p-3"
          />

          <button
            type="button"
            onClick={handleDownload}
            disabled={!url.trim() || isDownloading}
            className="mt-4 rounded-lg bg-black px-5 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDownloading ? "Downloading..." : "Download"}
          </button>

          {statusMessage ? (
            <p className="mt-4 text-sm text-gray-700">{statusMessage}</p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
