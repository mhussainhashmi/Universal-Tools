"use client";

import { useState } from "react";
import {
  compressImage,
  type CompressionResult,
} from "@/lib/imageCompressionEngine";

interface CompressedImage {
  original: File;
  result: CompressionResult;
}

const outputExtensions: Record<string, string> = {
  jpeg: "jpg",
  png: "png",
  webp: "webp",
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getReductionPercentage(original: number, compressed: number) {
  if (compressed >= original) return 0;
  return Math.round(((original - compressed) / original) * 100);
}

export default function ImageSizeReducerPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<CompressedImage[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    setFiles(Array.from(event.target.files));
    setResults([]);
    setError("");
    event.target.value = "";
  };

  const handleCompress = async () => {
    if (files.length === 0) return;

    setIsCompressing(true);
    setError("");

    try {
      const compressedResults: CompressedImage[] = [];
      for (const file of files) {
        compressedResults.push({
          original: file,
          result: await compressImage(file, {
            quality: 0.85,
            smallestOutput: true,
          }),
        });
      }
      setResults(compressedResults);
    } catch (compressionError) {
      console.error("Image compression failed:", compressionError);
      setError(
        compressionError instanceof Error
          ? compressionError.message
          : "Image compression failed."
      );
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = ({ original, result }: CompressedImage) => {
    const url = URL.createObjectURL(result.blob);
    const baseName = original.name.replace(/\.[^/.]+$/, "");
    const extension =
      outputExtensions[result.outputFormat] ??
      original.name.split(".").pop()?.toLowerCase() ??
      "img";
    const link = document.createElement("a");
    link.href = url;
    link.download = `${baseName}-compressed.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold">Image Size Reducer</h1>
        <p className="mt-2 text-gray-600">
          Reduce image file sizes while preserving visual quality.
        </p>

        <div className="mt-8 max-w-3xl rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold">Select Images</h2>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <label
            htmlFor="image-upload"
            className="mt-4 inline-block cursor-pointer rounded-lg bg-black px-5 py-2 text-white"
          >
            Select Images
          </label>

          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold">Selected Images</h3>
              <div className="mt-3 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="rounded-lg border p-3"
                  >
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-gray-500">
                      {formatSize(file.size)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleCompress}
            disabled={files.length === 0 || isCompressing}
            className="mt-6 rounded-lg bg-black px-5 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCompressing ? "Compressing..." : "Reduce Size"}
          </button>
          {error && <p className="mt-4 text-red-600">{error}</p>}
        </div>

        {results.length > 0 && (
          <div className="mt-8 max-w-3xl rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold">Results</h2>
            <div className="mt-4 space-y-4">
              {results.map(({ original, result }, index) => (
                <div
                  key={`${original.name}-${index}`}
                  className="rounded-lg border p-4"
                >
                  <div className="font-medium">{original.name}</div>
                  <div className="mt-2 text-sm text-gray-600">
                    {formatSize(original.size)} → {formatSize(result.blob.size)}
                    {result.changed && ` (${result.outputFormat.toUpperCase()})`}
                  </div>
                  <div className="mt-1 text-sm">
                    {result.changed
                      ? `Reduced by ${getReductionPercentage(original.size, result.blob.size)}%`
                      : result.reason}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownload({ original, result })}
                    className="mt-3 rounded-lg bg-black px-4 py-2 text-sm text-white"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
