// Shared domain types for ClaimX — AI-powered auto claims handling.

export type LossType =
  | "collision"
  | "theft"
  | "vandalism"
  | "weather"
  | "glass"
  | "other";

export type ClaimStatus =
  | "Submitted" // created, AI pipeline not yet run / failed
  | "AI_Reviewed" // AI pipeline complete, awaiting adjuster
  | "Under_Review" // an adjuster has opened it
  | "Approved"
  | "Denied"
  | "Investigating";

export type Severity = "Minor" | "Moderate" | "Severe" | "Total";

export type Recommendation =
  | "Fast-Track Approve"
  | "Manual Review"
  | "Investigate"
  | "Deny";

export const LOSS_TYPES: LossType[] = [
  "collision",
  "theft",
  "vandalism",
  "weather",
  "glass",
  "other",
];

// Result of the AI extraction & validation step.
export interface ExtractionResult {
  summary: string;
  normalizedLossType: LossType;
  missingInfo: string[];
  inconsistencies: string[];
  dataQualityScore: number; // 0-100
}

// Result of the AI damage / severity assessment step (uses vision when photos exist).
export interface DamageResult {
  severity: Severity;
  damageDescription: string;
  affectedAreas: string[];
  repairEstimateLow: number;
  repairEstimateHigh: number;
  photosAnalyzed: number;
}

// Result of the AI fraud-scoring step.
export interface FraudResult {
  fraudScore: number; // 0-100, higher = riskier
  riskLevel: "Low" | "Medium" | "High";
  flags: string[];
  reasoning: string;
}

// Result of the AI decision-recommendation step.
export interface RecommendationResult {
  recommendation: Recommendation;
  suggestedSettlement: number;
  confidence: number; // 0-100
  rationale: string;
}

// The full bundle of AI outputs stored on a claim.
export interface AiAnalysis {
  extraction: ExtractionResult;
  damage: DamageResult;
  fraud: FraudResult;
  recommendation: RecommendationResult;
  model: string;
  analyzedAt: string; // ISO timestamp
}

export interface Claim {
  id: string;
  claimNumber: string;
  policyNumber: string;
  claimantName: string;
  claimantContact: string;
  incidentDate: string; // YYYY-MM-DD
  reportedDate: string; // ISO timestamp
  lossType: LossType;
  description: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleVin: string;
  location: string;
  photoPaths: string[];
  status: ClaimStatus;
  ai: AiAnalysis | null;
  aiError: string | null;
  adjusterDecision: string | null;
  adjusterNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

// Shape accepted by the create-claim endpoint (server fills the rest).
export interface NewClaimInput {
  policyNumber: string;
  claimantName: string;
  claimantContact: string;
  incidentDate: string;
  lossType: LossType;
  description: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleVin: string;
  location: string;
  photoPaths: string[];
}
