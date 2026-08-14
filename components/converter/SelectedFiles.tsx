interface SelectedFilesProps {
  files: File[];
  onRemove: (index: number) => void;
}

export default function SelectedFiles({
  files,
  onRemove,
}: SelectedFilesProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="font-medium">
        Selected files
      </h3>

      <div className="mt-3 space-y-2">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
          >
            <div>
              <p className="font-medium">
                {file.name}
              </p>

              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-sm text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}