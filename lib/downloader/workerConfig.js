export function getDownloaderWorkerUrl() {
  const workerUrl = process.env.DOWNLOADER_WORKER_URL?.trim();

  if (!workerUrl) {
    return null;
  }

  return workerUrl.replace(/\/$/, "");
}

export function shouldUseWorkerDownload(platform) {
  return [
    "youtube",
    "instagram",
    "tiktok",
    "facebook",
    "twitter",
  ].includes(platform);
}

export function buildWorkerDownloadError() {
  const workerUrl = getDownloaderWorkerUrl();

  if (workerUrl) {
    return "The Vercel app cannot complete this download directly. The request was forwarded to the configured worker, but the worker returned an error.";
  }

  return "Social media downloads require a separate free worker because Vercel serverless cannot safely run native media extraction for YouTube and Instagram. Set DOWNLOADER_WORKER_URL to your worker endpoint.";
}
