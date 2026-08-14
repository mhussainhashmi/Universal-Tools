import { Conversion } from "@/types/conversion";


export const conversions: Record<string, string[]> = {
  png: ["jpg", "webp", "bmp", "pdf"],
  jpg: ["png", "webp", "bmp", "pdf"],
  webp: ["png", "jpg", "bmp", "pdf"],
  bmp: ["png", "jpg", "webp", "pdf"],
  mp4: ["mp3", "wav", "m4a", "ogg"],
  mp3: ["wav", "m4a", "ogg"],
  wav: ["mp3", "m4a", "ogg"],
  m4a: ["mp3", "wav", "ogg"],
  ogg: ["mp3", "wav", "m4a"],
  // webm: ["mp3","wav","m4a","ogg","mp4","mov","mkv"],
};
