"use client";

import { useState } from "react";
import UploadCard from "@/components/converter/UploadCard";
import ConversionCard from "@/components/converter/ConversionCard";


export default function ConverterPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFormat, setSelectedFormat] = useState("");

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">

        <h1 className="text-4xl font-bold">
          Universal Converter
        </h1>

        <p className="mt-2 text-gray-600">
          Convert files between different formats.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <UploadCard
            files={files}
            setFiles={setFiles}
          />

          <ConversionCard
            files={files}
            selectedFormat={selectedFormat}
            setSelectedFormat={setSelectedFormat}
          />
        </div>

      </div>
    </main>
  );
}