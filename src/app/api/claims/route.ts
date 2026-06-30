import { NextResponse } from "next/server";
import { createClaim, listClaims, saveAiAnalysis, saveAiError } from "@/lib/db";
import { runPipeline } from "@/lib/ai/pipeline";
import { LOSS_TYPES, type NewClaimInput } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ claims: listClaims() });
}

export async function POST(req: Request) {
  let body: Partial<NewClaimInput>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const required: (keyof NewClaimInput)[] = [
    "policyNumber",
    "claimantName",
    "claimantContact",
    "incidentDate",
    "lossType",
    "description",
  ];
  for (const f of required) {
    if (!body[f] || String(body[f]).trim() === "") {
      return NextResponse.json(
        { error: `Missing required field: ${f}` },
        { status: 400 }
      );
    }
  }
  if (!LOSS_TYPES.includes(body.lossType as NewClaimInput["lossType"])) {
    return NextResponse.json({ error: "Invalid lossType." }, { status: 400 });
  }

  const input: NewClaimInput = {
    policyNumber: body.policyNumber!,
    claimantName: body.claimantName!,
    claimantContact: body.claimantContact!,
    incidentDate: body.incidentDate!,
    lossType: body.lossType as NewClaimInput["lossType"],
    description: body.description!,
    vehicleMake: body.vehicleMake ?? "",
    vehicleModel: body.vehicleModel ?? "",
    vehicleYear: body.vehicleYear ?? "",
    vehicleVin: body.vehicleVin ?? "",
    location: body.location ?? "",
    photoPaths: Array.isArray(body.photoPaths) ? body.photoPaths : [],
  };

  const claim = createClaim(input);

  // Run the AI pipeline synchronously so the customer sees results immediately.
  try {
    const ai = await runPipeline(claim);
    saveAiAnalysis(claim.id, ai);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI analysis failed.";
    saveAiError(claim.id, message);
    // Claim is still created; surface the error but return success for the claim.
    return NextResponse.json(
      { id: claim.id, claimNumber: claim.claimNumber, aiError: message },
      { status: 201 }
    );
  }

  return NextResponse.json(
    { id: claim.id, claimNumber: claim.claimNumber },
    { status: 201 }
  );
}
