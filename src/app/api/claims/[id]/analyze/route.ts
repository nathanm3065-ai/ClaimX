import { NextResponse } from "next/server";
import { getClaim, saveAiAnalysis, saveAiError } from "@/lib/db";
import { runPipeline } from "@/lib/ai/pipeline";

export const runtime = "nodejs";

// Re-run (or run) the AI pipeline for an existing claim.
export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const claim = getClaim(params.id);
  if (!claim) {
    return NextResponse.json({ error: "Claim not found." }, { status: 404 });
  }

  try {
    const ai = await runPipeline(claim);
    saveAiAnalysis(claim.id, ai);
    return NextResponse.json({ ok: true, ai });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI analysis failed.";
    saveAiError(claim.id, message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
