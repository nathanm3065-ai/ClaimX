import type { Claim, DamageResult, ExtractionResult } from "../types";
import { callToolJSON } from "./client";
import { loadClaimImages } from "./images";
import { DAMAGE_TOOL } from "./schemas";

export const DAMAGE_SYSTEM = `You are an experienced auto damage appraiser. \
Assess vehicle damage and assign a severity band (Minor, Moderate, Severe, Total) \
with a realistic USD repair cost range. When photos are provided, base your \
assessment primarily on what you can see. When no photos are available, estimate \
conservatively from the written description and say so. Do not overstate severity.`;

export async function assessDamage(
  claim: Claim,
  extraction: ExtractionResult
): Promise<DamageResult> {
  const images = loadClaimImages(claim.photoPaths);

  const prompt = `Assess the vehicle damage for this auto claim.

Vehicle: ${claim.vehicleYear} ${claim.vehicleMake} ${claim.vehicleModel}
Loss type: ${extraction.normalizedLossType}
Incident summary: ${extraction.summary}

Claimant's description:
"""
${claim.description}
"""

${images.length > 0 ? `${images.length} photo(s) of the damage are attached above.` : "No usable photos were attached — estimate from the description."}

Provide a severity band, a description of the damage and affected areas, and a \
USD repair cost estimate range.`;

  return callToolJSON<DamageResult>({
    system: DAMAGE_SYSTEM,
    prompt,
    tool: DAMAGE_TOOL,
    images,
  });
}
