# Prompt — Damage & Severity Assessment (Vision)

**Module:** `src/lib/ai/damage.ts`
**Tool (forced JSON output):** `record_damage_assessment` (`src/lib/ai/schemas.ts`)
**Model:** `CLAUDE_MODEL` (default `claude-opus-4-8`, vision-capable)

Uploaded damage photos are attached to the message as base64 image content blocks
(`src/lib/ai/images.ts`), so Claude assesses damage directly from the images.

## System prompt

> You are an experienced auto damage appraiser. Assess vehicle damage and assign a
> severity band (Minor, Moderate, Severe, Total) with a realistic USD repair cost
> range. When photos are provided, base your assessment primarily on what you can
> see. When no photos are available, estimate conservatively from the written
> description and say so. Do not overstate severity.

## User prompt (template)

Vehicle, normalized loss type, intake summary, and the claimant's description are
provided, followed by the attached photos. Claude is forced to call
`record_damage_assessment`, returning:

- `severity` — enum: Minor | Moderate | Severe | Total
- `damageDescription`, `affectedAreas[]`
- `repairEstimateLow`, `repairEstimateHigh` — USD
- `photosAnalyzed` — count
