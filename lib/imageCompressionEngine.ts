import imageCompression from "browser-image-compression";
import LibImageQuant from "@fe-daily/libimagequant-wasm";
import * as wasmModule from "@fe-daily/libimagequant-wasm/wasm/libimagequant_wasm.js";

export type CompressionOutputFormat =
  | "jpeg"
  | "png"
  | "webp"
  | "original";

export interface CompressionOptions {
  quality: number;
  smallestOutput: boolean;
}

export interface CompressionResult {
  blob: Blob;
  outputFormat: CompressionOutputFormat;
  changed: boolean;
  reason?: string;
}

const IMAGE_TYPES: Record<string, CompressionOutputFormat> = {
  "image/jpeg": "jpeg",
  "image/jpg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
};

function formatFromFile(file: File): CompressionOutputFormat | null {
  if (IMAGE_TYPES[file.type]) {
    return IMAGE_TYPES[file.type];
  }

  const extension = file.name
    .slice(file.name.lastIndexOf(".") + 1)
    .toLowerCase();

  if (["jpg", "jpeg"].includes(extension)) return "jpeg";
  if (extension === "png") return "png";
  if (extension === "webp") return "webp";
  return null;
}

function originalResult(file: File, reason: string): CompressionResult {
  return {
    blob: file,
    outputFormat: "original",
    changed: false,
    reason,
  };
}

function isSmaller(candidate: Blob, original: File) {
  return candidate.size < original.size;
}

async function compressRasterImage(
  file: File,
  format: "jpeg" | "webp",
  options: CompressionOptions
): Promise<CompressionResult> {
  const qualities = [options.quality, options.quality - 0.1, options.quality - 0.2]
    .map((value) => Math.max(0.4, Math.min(1, value)))
    .filter((value, index, values) => values.indexOf(value) === index);

  const candidates: Blob[] = [];

  for (const quality of qualities) {
    candidates.push(
      await imageCompression(file, {
        maxSizeMB: Infinity,
        useWebWorker: true,
        initialQuality: quality,
        fileType: format === "jpeg" ? "image/jpeg" : "image/webp",
      })
    );
  }

  const smallest = candidates.reduce((current, candidate) =>
    candidate.size < current.size ? candidate : current
  );

  if (!isSmaller(smallest, file)) {
    return originalResult(file, "The encoded image was not smaller than the original.");
  }

  return {
    blob: smallest,
    outputFormat: format,
    changed: true,
  };
}

async function compressPng(
  file: File,
  options: CompressionOptions
): Promise<CompressionResult> {
  const quantizer = new LibImageQuant({ wasmModule });

  const colorCounts =
    options.quality >= 0.9
      ? [256, 128]
      : [256, 128, 64];

  try {
    const candidates: Blob[] = [];

    for (const maxColors of colorCounts) {
      try {
        const result = await quantizer.quantizePng(file, {
          maxColors,
          speed: 3,
          quality: {
            min: Math.max(0, Math.round(options.quality * 100)),
            target: Math.max(
              Math.round(options.quality * 100),
              90
            ),
          },
          dithering: 1,
        });

        const pngBytes = new Uint8Array(
          result.pngBytes.byteLength
        );

        pngBytes.set(result.pngBytes);

        const blob = new Blob(
          [pngBytes.buffer],
          {
            type: "image/png",
          }
        );

        if (isSmaller(blob, file)) {
          candidates.push(blob);
        }
      } catch (error) {
        // A palette/quality combination may be impossible.
        // Ignore that candidate and continue trying others.
        console.warn(
          `PNG quantization failed at ${maxColors} colors:`,
          error
        );
      }
    }

    if (candidates.length === 0) {
      return originalResult(
        file,
        "The PNG could not be compressed to a smaller file without sacrificing too much quality."
      );
    }

    const smallest = candidates.reduce(
      (current, candidate) =>
        candidate.size < current.size
          ? candidate
          : current
    );

    return {
      blob: smallest,
      outputFormat: "png",
      changed: true,
    };
  } finally {
    quantizer.dispose();
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not decode ${file.name}.`));
    };
    image.src = url;
  });
}

async function convertLegacyImage(file: File): Promise<CompressionResult> {
  if (file.type === "image/gif" && (await isAnimatedGif(file))) {
    return originalResult(file, "Animated GIFs require an animation-aware encoder and were kept unchanged.");
  }

  const image = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    return originalResult(file, "The browser could not create a canvas context.");
  }

  context.drawImage(image, 0, 0);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.85)
  );

  if (!blob || !isSmaller(blob, file)) {
    return originalResult(file, "The WebP conversion was not smaller than the original.");
  }

  return { blob, outputFormat: "webp", changed: true };
}

async function isAnimatedGif(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let imageDescriptorCount = 0;

  for (const byte of bytes) {
    if (byte === 0x2c) imageDescriptorCount += 1;
    if (imageDescriptorCount > 1) return true;
  }

  return false;
}

export async function compressImage(
  file: File,
  options: CompressionOptions
): Promise<CompressionResult> {
  const format = formatFromFile(file);

  if (format === "jpeg" || format === "webp") {
    return compressRasterImage(file, format, options);
  }

  if (format === "png") {
    return compressPng(file, options);
  }

  if (file.type === "image/bmp" || file.type === "image/gif") {
    return convertLegacyImage(file);
  }

  return originalResult(
    file,
    "This format requires a dedicated codec and was kept unchanged."
  );
}
