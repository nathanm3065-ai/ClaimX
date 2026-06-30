import type { Claim, ExtractionResult } from "../types";
import { callToolJSON } from "./client";
import { EXTRACTION_TOOL } from "./schemas";

export const EXTRACTION_SYSTEM = `You are an intake specialist for an auto insurance carrier. \
You normalize and validate First Notice of Loss (FNOL) submissions. \
Be precise and skeptical: surface missing information and internal inconsistencies, \
but do not invent facts. Base the loss category strictly on the described incident.`;

export async function extractClaim(claim: Claim): Promise<ExtractionResult> {
  const prompt = `Review and normalize this auto claim submission.

Claimant: ${claim.claimantName} (${claim.claimantContact})
Policy #: ${claim.policyNumber}
Incident date: ${claim.incidentDate}
Reported: ${claim.reportedDate}
Stated loss type: ${claim.lossType}
Vehicle: ${claim.vehicleYear} ${claim.vehicleMake} ${claim.vehicleModel} (VIN ${claim.vehicleVin || "not provided"})
Location: ${claim.location}
Photos attached: ${claim.photoPaths.length}

Claimant's description:
"""
${claim.description}
"""

Produce a normalized summary, the best-fit loss category, any missing or \
inconsistent information, and an overall data-quality score.`;

  return callToolJSON<ExtractionResult>({
    system: EXTRACTION_SYSTEM,
    prompt,
    tool: EXTRACTION_TOOL,
  });
}
