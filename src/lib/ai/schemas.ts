import { LOSS_TYPES } from "../types";
import type { JsonTool } from "./client";

// JSON-schema tool definitions for each AI step. Forcing these tools guarantees
// well-formed, typed output from Claude.

export const EXTRACTION_TOOL: JsonTool = {
  name: "record_extraction",
  description:
    "Record the normalized, validated claim data extracted from the FNOL submission.",
  inputSchema: {
    type: "object",
    properties: {
      summary: {
        type: "string",
        description: "One-paragraph plain-language summary of what happened.",
      },
      normalizedLossType: {
        type: "string",
        enum: LOSS_TYPES,
        description: "Best-fit loss category based on the description.",
      },
      missingInfo: {
        type: "array",
        items: { type: "string" },
        description: "Important details missing from the submission, if any.",
      },
      inconsistencies: {
        type: "array",
        items: { type: "string" },
        description:
          "Internal contradictions or implausible details in the submission, if any.",
      },
      dataQualityScore: {
        type: "integer",
        description: "0-100 score for how complete and consistent the data is.",
      },
    },
    required: [
      "summary",
      "normalizedLossType",
      "missingInfo",
      "inconsistencies",
      "dataQualityScore",
    ],
  },
};

export const DAMAGE_TOOL: JsonTool = {
  name: "record_damage_assessment",
  description:
    "Record the vehicle damage and severity assessment, with a repair cost estimate range in USD.",
  inputSchema: {
    type: "object",
    properties: {
      severity: {
        type: "string",
        enum: ["Minor", "Moderate", "Severe", "Total"],
      },
      damageDescription: {
        type: "string",
        description: "What damage is visible/described and where.",
      },
      affectedAreas: {
        type: "array",
        items: { type: "string" },
        description: "Vehicle areas affected (e.g. front bumper, driver door).",
      },
      repairEstimateLow: {
        type: "integer",
        description: "Low end of the repair cost estimate in USD.",
      },
      repairEstimateHigh: {
        type: "integer",
        description: "High end of the repair cost estimate in USD.",
      },
      photosAnalyzed: {
        type: "integer",
        description: "Number of photos you were able to analyze (0 if none).",
      },
    },
    required: [
      "severity",
      "damageDescription",
      "affectedAreas",
      "repairEstimateLow",
      "repairEstimateHigh",
      "photosAnalyzed",
    ],
  },
};

export const FRAUD_TOOL: JsonTool = {
  name: "record_fraud_assessment",
  description:
    "Record the fraud-risk assessment for this claim, with a 0-100 score and named red flags.",
  inputSchema: {
    type: "object",
    properties: {
      fraudScore: {
        type: "integer",
        description: "0-100 fraud risk score; higher means riskier.",
      },
      riskLevel: {
        type: "string",
        enum: ["Low", "Medium", "High"],
      },
      flags: {
        type: "array",
        items: { type: "string" },
        description: "Specific fraud indicators detected, if any.",
      },
      reasoning: {
        type: "string",
        description: "Brief explanation of the score and flags.",
      },
    },
    required: ["fraudScore", "riskLevel", "flags", "reasoning"],
  },
};

export const RECOMMENDATION_TOOL: JsonTool = {
  name: "record_recommendation",
  description:
    "Record the settlement recommendation for the adjuster, combining extraction, damage, and fraud signals.",
  inputSchema: {
    type: "object",
    properties: {
      recommendation: {
        type: "string",
        enum: [
          "Fast-Track Approve",
          "Manual Review",
          "Investigate",
          "Deny",
        ],
      },
      suggestedSettlement: {
        type: "integer",
        description: "Suggested settlement amount in USD (0 if deny/investigate).",
      },
      confidence: {
        type: "integer",
        description: "0-100 confidence in this recommendation.",
      },
      rationale: {
        type: "string",
        description:
          "Plain-language rationale for the adjuster, citing the key signals.",
      },
    },
    required: ["recommendation", "suggestedSettlement", "confidence", "rationale"],
  },
};
