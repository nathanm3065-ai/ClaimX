import { NextResponse } from "next/server";
import { getClaim } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const claim = getClaim(params.id);
  if (!claim) {
    return NextResponse.json({ error: "Claim not found." }, { status: 404 });
  }
  return NextResponse.json({ claim });
}
