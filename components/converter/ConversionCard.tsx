import { useEffect } from "react";
import { formats } from "@/data/formats";
import {
  detectFormat,
  convertImage,
  convertImagesToPdf,
} from "@/lib/conversionEngine";
import { conversions } from "@/data/conversions";
import ConvertButton from "@/components/converter/ConvertButton";
import JSZip from "jszip";
import { convertWithFFmpeg } from "@/lib/ffmpegEngine";

interface ConversionCardProps {
  files: File[];
  selectedFormat: string;
  setSelectedFormat: React.Dispatch<
    React.SetStateAction<string>
  >;
}

export default function ConversionCard({
  files,
  selectedFormat,
  setSelectedFormat,
}: ConversionCardProps) {
  const detectedFormats = files.map((file) =>
    detectFormat(file)
  );

  const uniqueFormats = Array.from(
    new Set(
      detectedFormats
        .filter(Boolean)
        .map((format) => format!.id)
    )
  );

  let fromLabel = "Auto Detect";

  if (uniqueFormats.length === 1) {
    fromLabel = uniqueFormats[0].toUpperCase();
  } else if (uniqueFormats.length > 1) {
    fromLabel = "Multiple formats";
  }

  const availableConversions =
  uniqueFormats.length > 0
    ? formats
        .map((format) => format.id)
        .filter((targetFormat) =>
          uniqueFormats.every((sourceFormat) =>
            conversions[sourceFormat]?.includes(targetFormat)
          )
        )
    : [];

  const isValidConversion =
    files.length > 0 &&
    selectedFormat !== "" &&
    availableConversions.includes(selectedFormat);

  useEffect(() => {
    if (
      selectedFormat &&
      !availableConversions.includes(selectedFormat)
    ) {
      setSelectedFormat("");
    }
  }, [availableConversions, selectedFormat, setSelectedFormat]);

  const handleConvert = async () => {
  if (!isValidConversion) {
      return;
    }

    try {
      if (selectedFormat === "pdf") {
        const pdfBlob = await convertImagesToPdf(files);

        const url = URL.createObjectURL(pdfBlob);

        const link = document.createElement("a");

        link.href = url;
        link.download = "converted.pdf";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);

        return;
      }

      if (
        selectedFormat === "mp3" ||
        selectedFormat === "wav" ||
        selectedFormat === "m4a" ||
        selectedFormat === "ogg"
      ) {
  const convertedFiles = await Promise.all(
    files.map(async (file) => {
      const blob = await convertWithFFmpeg(
        file,
        selectedFormat
      );

      const baseName = file.name.substring(
        0,
        file.name.lastIndexOf(".")
      );

      return {
        blob,
        name: `${baseName}.${selectedFormat}`,
      };
    })
  );

    if (convertedFiles.length === 1) {
      const convertedFile = convertedFiles[0];

      const url = URL.createObjectURL(
        convertedFile.blob
      );

      const link = document.createElement("a");

      link.href = url;
      link.download = convertedFile.name;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      return;
    }

    const zip = new JSZip();

    convertedFiles.forEach((file) => {
      zip.file(file.name, file.blob);
    });

    const zipBlob = await zip.generateAsync({
      type: "blob",
    });

    const url = URL.createObjectURL(zipBlob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "converted-files.zip";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    return;
  }

      const convertedFiles = await Promise.all(
        files.map(async (file) => {
          const blob = await convertImage(
            file,
            selectedFormat as "jpg" | "png" | "webp" | "bmp"
          );

          const baseName = file.name.substring(
            0,
            file.name.lastIndexOf(".")
          );

          return {
            blob,
            name: `${baseName}.${selectedFormat}`,
          };
        })
      );

      if (convertedFiles.length === 1) {
        const convertedFile = convertedFiles[0];

        const url = URL.createObjectURL(
          convertedFile.blob
        );

        const link = document.createElement("a");

        link.href = url;
        link.download = convertedFile.name;

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);

        return;
      }

      const zip = new JSZip();

      convertedFiles.forEach((file) => {
        zip.file(file.name, file.blob);
      });

      const zipBlob = await zip.generateAsync({
        type: "blob",
      });

      const url = URL.createObjectURL(zipBlob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "converted-files.zip";

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Conversion failed:", error);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-semibold">
        Conversion
      </h2>

      <div className="mt-4">
        <label>From</label>

        <select className="mt-1 w-full rounded border p-2">
          <option value="">
            {fromLabel}
          </option>
        </select>
      </div>

      <div className="mt-4">
        <label>To</label>

        <select
          className="mt-1 w-full rounded border p-2"
          value={selectedFormat}
          onChange={(event) =>
            setSelectedFormat(event.target.value)
          }
        >
          <option value="">
            Select format
          </option>

          {formats
            .filter((format) =>
              availableConversions.includes(format.id)
            )
            .map((format) => (
              <option
                key={format.id}
                value={format.id}
              >
                {format.label}
              </option>
            ))}
        </select>
      </div>

      <ConvertButton
        onConvert={handleConvert}
        disabled={!isValidConversion}
      />
    </div>
  );
}
