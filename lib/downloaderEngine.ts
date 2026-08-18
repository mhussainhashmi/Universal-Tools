export async function downloadFromUrl(
  url: string
): Promise<{
  blob: Blob;
  filename: string;
}> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Download failed: ${response.status}`
    );
  }

  const blob = await response.blob();

  const contentDisposition =
    response.headers.get("content-disposition");

  let filename = "download";

  if (contentDisposition) {
    const match =
      contentDisposition.match(
        /filename="?([^"]+)"?/i
      );

    if (match?.[1]) {
      filename = match[1];
    }
  }

  if (filename === "download") {
    try {
      const pathname = new URL(url).pathname;
      const lastPart = pathname.split("/").pop();

      if (lastPart) {
        filename = lastPart;
      }
    } catch {
      // Keep default filename.
    }
  }

  return {
    blob,
    filename,
  };
}