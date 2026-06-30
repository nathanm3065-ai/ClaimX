import fs from "node:fs";
import path from "node:path";
import type { ImageInput } from "./client";

const MEDIA_BY_EXT: Record<string, ImageInput["mediaType"]> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

// Load photos referenced by a claim (public paths like "/uploads/x.jpg") into
// base64 image inputs for Claude vision. Skips anything missing or unreadable.
export function loadClaimImages(photoPaths: string[], max = 4): ImageInput[] {
  const images: ImageInput[] = [];
  for (const p of photoPaths.slice(0, max)) {
    const ext = path.extname(p).toLowerCase();
    const mediaType = MEDIA_BY_EXT[ext];
    if (!mediaType) continue;
    const abs = path.join(process.cwd(), "public", p.replace(/^\//, ""));
    try {
      const data = fs.readFileSync(abs).toString("base64");
      images.push({ mediaType, data });
    } catch {
      // Missing file (e.g. seeded placeholder path) — skip silently.
    }
  }
  return images;
}
