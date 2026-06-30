import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

// Accepts multipart form-data with one or more "files" and returns their
// public paths (e.g. /uploads/abc.jpg).
export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data." },
      { status: 400 }
    );
  }

  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  const paths: string[] = [];

  for (const file of files) {
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      );
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const name = `${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 8)}${EXT[file.type]}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
    paths.push(`/uploads/${name}`);
  }

  return NextResponse.json({ paths });
}
