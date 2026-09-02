"use client";

interface DocumentUploadCardProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export default function DocumentUploadCard({
  onFileSelect,
  isLoading = false,
}: DocumentUploadCardProps) {
  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      // Validate file type
      const validTypes = [
        "application/pdf",
        "text/plain",
        "text/markdown",
      ];
      
      if (
        !validTypes.includes(file.type) &&
        !file.name.endsWith(".txt") &&
        !file.name.endsWith(".md")
      ) {
        alert(
          "Please select a valid file (PDF, TXT, or MD)"
        );
        return;
      }

      onFileSelect(file);
      event.target.value = "";
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-semibold">
        Upload Document
      </h2>

      <p className="mt-2 text-gray-600">
        Select a PDF, TXT, or MD file to analyze.
      </p>

      <input
        id="doc-file-upload"
        type="file"
        accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
        className="hidden"
        onChange={handleFileChange}
        disabled={isLoading}
      />

      <label
        htmlFor="doc-file-upload"
        className={`mt-6 inline-block cursor-pointer rounded-lg bg-black px-4 py-2 text-white ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? "Processing..." : "Select File"}
      </label>
    </div>
  );
}
