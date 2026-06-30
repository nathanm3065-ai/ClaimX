import { NextResponse } from "next/server";
import { getClaim, saveDecision } from "@/lib/db";
import type { ClaimStatus } from "@/lib/types";

export const runtime = "nodejs";

// Maps an adjuster action to the resulting claim status.
const ACTION_STATUS: Record<string, ClaimStatus> = {
  Approved: "Approved",
  Denied: "Denied",
  Investigating: "Investigating",
};

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const claim = getClaim(params.id);
  if (!claim) {
    return NextResponse.json({ error: "Claim not found." }, { status: 404 });
  }

  let body: { decision?: string; notes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const decision = body.decision ?? "";
  const status = ACTION_STATUS[decision];
  if (!status) {
    return NextResponse.json(
      { error: "decision must be one of: Approved, Denied, Investigating." },
      { status: 400 }
    );
  }

  const updated = saveDecision(params.id, status, decision, body.notes ?? "");
  return NextResponse.json({ claim: updated });
}
