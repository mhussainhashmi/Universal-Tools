export interface Service {
  id: string;
  title: string;
  description: string;
  route: string;
  enabled: boolean;
}

export const services: Service[] = [
  {
    id: "converter",
    title: "Universal Converter",
    description: "Convert files between formats.",
    route: "/converter",
    enabled: true,
  },
  {
    id: "downloader",
    title: "Universal Downloader",
    description: "Download media from supported platforms.",
    route: "/downloader",
    enabled: true,
  },

  {
    id: "image-size-reducer",
    title: "Image Size Reducer",
    description: "Reduce image file sizes while preserving the original format.",
    route: "/image-size-reducer",
    enabled: true,
  },
];