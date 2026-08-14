export type FileCategory =
  | "image"
  | "video"
  | "audio"
  | "document"
  | "archive";

export interface FileFormat {
  id: string;
  label: string;
  extension: string;
  category: FileCategory;
}

export interface Conversion {
  from: string;
  to: string;
}