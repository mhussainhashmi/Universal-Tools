// Client-side document extraction utilities  

                  // DOCUMENT Q&A
import * as pdfjsLib from "pdfjs-dist";

// Set up the worker for PDF.js using local file
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
}

export async function extractTextFromPDF(
  file: File
): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer })
      .promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter((item) => "str" in item)
        .map((item) => (item as { str: string }).str)
        .join(" ");

      fullText += pageText + "\n\n";
    }

    return fullText.trim();
  } catch (error) {
    throw new Error(
      `Failed to extract text from PDF: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function extractTextFromTxt(
  file: File
): Promise<string> {
  try {
    const text = await file.text();
    return text.trim();
  } catch (error) {
    throw new Error(
      `Failed to read text file: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function extractTextFromMarkdown(
  file: File
): Promise<string> {
  try {
    const text = await file.text();
    return text.trim();
  } catch (error) {
    throw new Error(
      `Failed to read markdown file: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function extractTextFromDocument(
  file: File
): Promise<string> {
  const fileExtension = file.name
    .split(".")
    .pop()
    ?.toLowerCase();

  switch (fileExtension) {
    case "pdf":
      return extractTextFromPDF(file);
    case "txt":
      return extractTextFromTxt(file);
    case "md":
      return extractTextFromMarkdown(file);
    default:
      throw new Error(
        `Unsupported file type: ${fileExtension}`
      );
  }
}
