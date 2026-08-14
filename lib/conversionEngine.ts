import { formats } from "@/data/formats";
import { jsPDF } from "jspdf";

export function detectFormat(file: File) {
  const extension = file.name
    .substring(file.name.lastIndexOf("."))
    .toLowerCase();

  return formats.find(
    (format) => format.extension === extension
  );
}

export async function convertImage(
  file: File,
  targetFormat: "jpg" | "png" | "webp" | "bmp"
): Promise<Blob> {
  const image = new Image();

  const objectUrl = URL.createObjectURL(file);

  try {
    image.src = objectUrl;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () =>
        reject(new Error("Could not load image."));
    });

    const canvas = document.createElement("canvas");

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Could not create canvas context.");
    }

    context.drawImage(image, 0, 0);

    const mimeTypes = {
      jpg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      bmp: "image/bmp",
    };

  const mimeType = mimeTypes[targetFormat];

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(
              new Error("Could not convert image.")
            );
          }
        },
        mimeType,
        0.9
      );
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}



export async function convertImagesToPdf(
  files: File[]
): Promise<Blob> {
  if (files.length === 0) {
    throw new Error("No files provided.");
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    try {
      image.src = objectUrl;

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () =>
          reject(
            new Error(`Could not load ${file.name}.`)
          );
      });

      if (i > 0) {
        pdf.addPage("a4", "portrait");
      }

      const availableWidth =
        pageWidth - margin * 2;

      const availableHeight =
        pageHeight - margin * 2;

      const imageRatio =
        image.naturalWidth / image.naturalHeight;

      const pageRatio =
        availableWidth / availableHeight;

      let width: number;
      let height: number;

      if (imageRatio > pageRatio) {
        width = availableWidth;
        height = width / imageRatio;
      } else {
        height = availableHeight;
        width = height * imageRatio;
      }

      const x =
        (pageWidth - width) / 2;

      const y =
        (pageHeight - height) / 2;

      pdf.addImage(
        image,
        "JPEG",
        x,
        y,
        width,
        height,
        undefined,
        "MEDIUM"
      );
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  return pdf.output("blob");
}