import type {
  DamageResult,
  ExtractionResult,
  FraudResult,
  RecommendationResult,
} from "../types";
import { callToolJSON } from "./client";
import { RECOMMENDATION_TOOL } from "./schemas";

export const RECOMMENDATION_SYSTEM = `You are a senior claims decision-support \
system. Combine the intake, damage, and fraud signals into a single recommendation \
for the human adjuster: Fast-Track Approve, Manual Review, Investigate, or Deny. \
Guidance: low fraud + good data quality + modest, clear damage favors Fast-Track \
Approve with a settlement near the midpoint of the repair estimate. Elevated fraud \
risk favors Investigate. Material data gaps or large/complex losses favor Manual \
Review. Clear evidence of fraud or non-covered loss favors Deny (settlement 0). \
Always keep a human in the loop — your output is a recommendation, not a decision.`;

export async function recommendDecision(
  extraction: ExtractionResult,
  damage: DamageResult,
  fraud: FraudResult
): Promise<RecommendationResult> {
  const prompt = `Recommend a disposition for this auto claim.

INTAKE
- Summary: ${extraction.summary}
- Loss type: ${extraction.normalizedLossType}
- Data quality: ${extraction.dataQualityScore}/100
- Missing info: ${extraction.missingInfo.join("; ") || "none"}
- Inconsistencies: ${extraction.inconsistencies.join("; ") || "none"}

DAMAGE
- Severity: ${damage.severity}
- Description: ${damage.damageDescription}
- Repair estimate: $${damage.repairEstimateLow}–$${damage.repairEstimateHigh}

FRAUD
- Score: ${fraud.fraudScore}/100 (${fraud.riskLevel})
- Flags: ${fraud.flags.join("; ") || "none"}
- Reasoning: ${fraud.reasoning}

Produce a recommendation, a suggested settlement amount (USD), a confidence score, \
and a plain-language rationale the adjuster can act on.`;

  return callToolJSON<RecommendationResult>({
    system: RECOMMENDATION_SYSTEM,
    prompt,
    tool: RECOMMENDATION_TOOL,
  });
}
