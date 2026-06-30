import type { AiAnalysis, Claim } from "../types";
import { MODEL } from "./client";
import { extractClaim } from "./extract";
import { assessDamage } from "./damage";
import { scoreFraud } from "./fraud";
import { recommendDecision } from "./recommend";

/**
 * Run the full AI claims pipeline on a claim:
 *   1. extract & validate  ->  2. assess damage (vision)
 *   ->  3. score fraud      ->  4. recommend a decision
 * Steps are sequential because each feeds the next.
 */
export async function runPipeline(claim: Claim): Promise<AiAnalysis> {
  const extraction = await extractClaim(claim);
  const damage = await assessDamage(claim, extraction);
  const fraud = await scoreFraud(claim, extraction, damage);
  const recommendation = await recommendDecision(extraction, damage, fraud);

  return {
    extraction,
    damage,
    fraud,
    recommendation,
    model: MODEL,
    analyzedAt: new Date().toISOString(),
  };
}
