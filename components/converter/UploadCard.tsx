"use client";

import SelectedFiles from "./SelectedFiles";

interface UploadCardProps {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

export default function UploadCard({
  files,
  setFiles,
}: UploadCardProps) {

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);

      setFiles((currentFiles) => [
  ...currentFiles,
  ...newFiles,
]);
      event.target.value = "";
    }
  }

  function handleRemoveFile(indexToRemove: number) {
    setFiles((currentFiles) =>
      currentFiles.filter(
        (_, index) => index !== indexToRemove
      )
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-semibold">
        Upload Files
      </h2>

      <p className="mt-2 text-gray-600">
        Select the files you want to convert.
      </p>

      <input
        id="file-upload"
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <label
        htmlFor="file-upload"
        className="mt-6 inline-block cursor-pointer rounded-lg bg-black px-4 py-2 text-white"
      >
        Select Files
      </label>

      <SelectedFiles
        files={files}
        onRemove={handleRemoveFile}
      />
    </div>
  );
}