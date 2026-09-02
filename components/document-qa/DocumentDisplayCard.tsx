"use client";

interface DocumentDisplayCardProps {
  file: File | null;
  isLoading: boolean;
  error: string | null;
  content: string;
  onClear: () => void;
}

export default function DocumentDisplayCard({
  file,
  isLoading,
  error,
  content,
  onClear,
}: DocumentDisplayCardProps) {
  if (!file && !content) {
    return null;
  }

  return (
    <div className="rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Document Content
          </h2>

          {file && (
            <p className="mt-1 text-sm text-gray-600">
              File: {file.name}
            </p>
          )}
        </div>

        <button
          onClick={onClear}
          className="text-sm text-red-600 hover:underline"
        >
          Clear
        </button>
      </div>

      {isLoading && (
        <div className="mt-6 flex items-center justify-center space-x-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
          <p className="text-gray-600">
            Processing document...
          </p>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-800">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {content && !isLoading && !error && (
        <div className="mt-6">
          <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="whitespace-pre-wrap text-sm text-gray-800">
              {content}
            </p>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Content length: {content.length} characters
          </p>
        </div>
      )}
    </div>
  );
}
