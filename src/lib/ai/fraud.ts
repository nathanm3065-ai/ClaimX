import type {
  Claim,
  DamageResult,
  ExtractionResult,
  FraudResult,
} from "../types";
import { callToolJSON } from "./client";
import { FRAUD_TOOL } from "./schemas";

export const FRAUD_SYSTEM = `You are a fraud analyst at an auto insurance carrier. \
Assess the likelihood that a claim is fraudulent and produce a 0-100 risk score \
(higher = riskier). Consider common indicators: delayed reporting, inconsistent \
or vague accounts, damage inconsistent with the described incident, severity vs. \
reporting timeline mismatches, prior-damage signals, round-number or inflated \
losses, and missing documentation. Be fair: most claims are legitimate. Only \
raise the score when concrete indicators are present, and name each one.`;

export async function scoreFraud(
  claim: Claim,
  extraction: ExtractionResult,
  damage: DamageResult
): Promise<FraudResult> {
  const reportingGapDays = daysBetween(claim.incidentDate, claim.reportedDate);

  const prompt = `Assess fraud risk for this auto claim.

Loss type: ${extraction.normalizedLossType}
Incident date: ${claim.incidentDate}
Reported: ${claim.reportedDate} (~${reportingGapDays} day(s) after incident)
Location: ${claim.location}
Data quality score: ${extraction.dataQualityScore}/100
Missing info: ${extraction.missingInfo.join("; ") || "none"}
Inconsistencies noted at intake: ${extraction.inconsistencies.join("; ") || "none"}

Damage assessment: ${damage.severity} — ${damage.damageDescription}
Repair estimate: $${damage.repairEstimateLow}–$${damage.repairEstimateHigh}

Incident summary: ${extraction.summary}

Claimant's description:
"""
${claim.description}
"""

Produce a fraud score, risk level, named red flags, and concise reasoning.`;

  return callToolJSON<FraudResult>({
    system: FRAUD_SYSTEM,
    prompt,
    tool: FRAUD_TOOL,
  });
}

function daysBetween(incidentDate: string, reportedIso: string): number {
  const a = new Date(incidentDate).getTime();
  const b = new Date(reportedIso).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86_400_000));
}
