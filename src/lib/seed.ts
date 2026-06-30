// Seed the SQLite database with demo auto claims (including AI analysis) so the
// adjuster dashboard has data to show without making live API calls.
// Run with:  npm run seed
import { upsertSeedClaim } from "./db";
import type { AiAnalysis, Claim } from "./types";

function iso(daysAgo: number): string {
  return new Date(Date.now() - daysAgo * 86_400_000).toISOString();
}
function ymd(daysAgo: number): string {
  return iso(daysAgo).slice(0, 10);
}

interface Seed {
  id: string;
  num: string;
  policy: string;
  name: string;
  contact: string;
  incidentDaysAgo: number;
  reportedDaysAgo: number;
  lossType: Claim["lossType"];
  description: string;
  year: string;
  make: string;
  model: string;
  vin: string;
  location: string;
  ai: AiAnalysis;
  status: Claim["status"];
  decision?: string;
  notes?: string;
}

const MODEL = "claude-opus-4-8";

const seeds: Seed[] = [
  {
    id: "clm_seed_fasttrack",
    num: "CLX-10000001",
    policy: "POL-552310",
    name: "Maria Gonzalez",
    contact: "maria.g@example.com",
    incidentDaysAgo: 2,
    reportedDaysAgo: 1,
    lossType: "collision",
    description:
      "Someone rear-ended me at a red light on Lamar Blvd. Minor dent and scratches on the rear bumper. No injuries. I have the other driver's info and a photo.",
    year: "2021",
    make: "Toyota",
    model: "Corolla",
    vin: "2T1BURHE0JC000111",
    location: "Austin, TX",
    status: "AI_Reviewed",
    ai: {
      model: MODEL,
      analyzedAt: iso(1),
      extraction: {
        summary:
          "Insured was rear-ended at a red light; minor rear bumper damage, no injuries, third-party info available.",
        normalizedLossType: "collision",
        missingInfo: [],
        inconsistencies: [],
        dataQualityScore: 92,
      },
      damage: {
        severity: "Minor",
        damageDescription:
          "Cosmetic dent and paint scratches on the rear bumper consistent with a low-speed rear-end impact.",
        affectedAreas: ["Rear bumper"],
        repairEstimateLow: 600,
        repairEstimateHigh: 1200,
        photosAnalyzed: 1,
      },
      fraud: {
        fraudScore: 8,
        riskLevel: "Low",
        flags: [],
        reasoning:
          "Prompt reporting, consistent account, third-party details provided, damage matches described low-speed impact.",
      },
      recommendation: {
        recommendation: "Fast-Track Approve",
        suggestedSettlement: 900,
        confidence: 90,
        rationale:
          "Low fraud risk, high data quality, and minor well-documented damage. Settle near the midpoint of the repair estimate.",
      },
    },
  },
  {
    id: "clm_seed_fraud",
    num: "CLX-10000002",
    policy: "POL-118874",
    name: "Derek Malloy",
    contact: "555-0142",
    incidentDaysAgo: 41,
    reportedDaysAgo: 2,
    lossType: "theft",
    description:
      "My car was stolen from a parking lot. I don't remember exactly when, maybe a few weeks ago. No police report yet. The car was fully loaded with aftermarket upgrades worth about $40,000.",
    year: "2016",
    make: "Honda",
    model: "Civic",
    vin: "",
    location: "Unknown",
    status: "AI_Reviewed",
    ai: {
      model: MODEL,
      analyzedAt: iso(2),
      extraction: {
        summary:
          "Insured reports a vehicle theft ~39 days before reporting, no police report, vague timeline, and an unusually high claimed value for aftermarket upgrades.",
        normalizedLossType: "theft",
        missingInfo: [
          "Police report number",
          "Date/time of theft",
          "VIN",
          "Documentation of aftermarket upgrades",
        ],
        inconsistencies: [
          "Claimed $40k upgrades on a 2016 Civic",
          "Cannot recall when the theft occurred",
        ],
        dataQualityScore: 24,
      },
      damage: {
        severity: "Total",
        damageDescription:
          "Total loss claimed (vehicle not recovered). No photos or recovery evidence available.",
        affectedAreas: ["Entire vehicle (claimed total loss)"],
        repairEstimateLow: 0,
        repairEstimateHigh: 0,
        photosAnalyzed: 0,
      },
      fraud: {
        fraudScore: 86,
        riskLevel: "High",
        flags: [
          "Significant delay between incident and report (~39 days)",
          "No police report for a claimed theft",
          "Vague, unverifiable timeline",
          "Inflated value: $40k aftermarket upgrades on a 2016 Civic",
          "Missing VIN and supporting documentation",
        ],
        reasoning:
          "Multiple strong fraud indicators stack: late reporting without a police report, an implausibly high claimed value, and an inability to specify when the loss occurred.",
      },
      recommendation: {
        recommendation: "Investigate",
        suggestedSettlement: 0,
        confidence: 88,
        rationale:
          "High fraud score driven by delayed reporting, missing police report, and an inflated valuation. Refer to SIU; request a police report and proof of the claimed upgrades before any payment.",
      },
    },
  },
  {
    id: "clm_seed_total",
    num: "CLX-10000003",
    policy: "POL-770021",
    name: "Priya Nair",
    contact: "priya.nair@example.com",
    incidentDaysAgo: 3,
    reportedDaysAgo: 3,
    lossType: "collision",
    description:
      "I hydroplaned on the highway and hit the guardrail. The front of the car is badly crushed and the airbags deployed. Police report filed at the scene. Tow truck took it to the shop.",
    year: "2019",
    make: "Subaru",
    model: "Outback",
    vin: "4S4BSANC1K3000222",
    location: "Round Rock, TX",
    status: "Under_Review",
    ai: {
      model: MODEL,
      analyzedAt: iso(3),
      extraction: {
        summary:
          "Single-vehicle highway collision with the guardrail after hydroplaning; severe front-end damage with airbag deployment, police report on file.",
        normalizedLossType: "collision",
        missingInfo: ["Repair shop estimate"],
        inconsistencies: [],
        dataQualityScore: 84,
      },
      damage: {
        severity: "Severe",
        damageDescription:
          "Extensive front-end structural damage with deployed airbags, consistent with a high-speed guardrail impact. Likely frame damage.",
        affectedAreas: [
          "Front bumper",
          "Hood",
          "Radiator/engine bay",
          "Airbag system",
        ],
        repairEstimateLow: 11000,
        repairEstimateHigh: 18000,
        photosAnalyzed: 0,
      },
      fraud: {
        fraudScore: 14,
        riskLevel: "Low",
        flags: [],
        reasoning:
          "Same-day reporting, police report at the scene, and damage consistent with the described single-vehicle accident.",
      },
      recommendation: {
        recommendation: "Manual Review",
        suggestedSettlement: 14000,
        confidence: 72,
        rationale:
          "Low fraud risk but a large, complex loss with possible frame damage and potential total-loss threshold. Route to a senior adjuster and obtain the shop estimate before settling.",
      },
    },
  },
  {
    id: "clm_seed_glass",
    num: "CLX-10000004",
    policy: "POL-330918",
    name: "Tom Becker",
    contact: "tom.becker@example.com",
    incidentDaysAgo: 1,
    reportedDaysAgo: 1,
    lossType: "glass",
    description:
      "A rock flew up on the freeway and cracked my windshield. The crack is spreading across the driver's view. Everything else is fine.",
    year: "2022",
    make: "Ford",
    model: "F-150",
    vin: "1FTFW1E50NF000333",
    location: "San Antonio, TX",
    status: "Approved",
    decision: "Approved",
    notes: "Standard glass claim, approved for windshield replacement.",
    ai: {
      model: MODEL,
      analyzedAt: iso(1),
      extraction: {
        summary:
          "Windshield cracked by road debris on the freeway; spreading crack in the driver's line of sight, no other damage.",
        normalizedLossType: "glass",
        missingInfo: [],
        inconsistencies: [],
        dataQualityScore: 95,
      },
      damage: {
        severity: "Minor",
        damageDescription:
          "Single spreading crack across the windshield consistent with road-debris impact; requires full windshield replacement.",
        affectedAreas: ["Windshield"],
        repairEstimateLow: 350,
        repairEstimateHigh: 700,
        photosAnalyzed: 0,
      },
      fraud: {
        fraudScore: 5,
        riskLevel: "Low",
        flags: [],
        reasoning:
          "Routine, immediately reported glass claim with a common, low-value cause. No indicators of fraud.",
      },
      recommendation: {
        recommendation: "Fast-Track Approve",
        suggestedSettlement: 525,
        confidence: 93,
        rationale:
          "Textbook low-value glass claim with no fraud indicators. Fast-track approve for windshield replacement.",
      },
    },
  },
  {
    id: "clm_seed_vandalism",
    num: "CLX-10000005",
    policy: "POL-664102",
    name: "Aisha Rahman",
    contact: "aisha.r@example.com",
    incidentDaysAgo: 6,
    reportedDaysAgo: 5,
    lossType: "vandalism",
    description:
      "Someone keyed both sides of my car and slashed two tires overnight in my apartment lot. I filed a police report. There are scratches down both doors.",
    year: "2020",
    make: "Mazda",
    model: "CX-5",
    vin: "JM3KFBCM6L0000444",
    location: "Dallas, TX",
    status: "AI_Reviewed",
    ai: {
      model: MODEL,
      analyzedAt: iso(5),
      extraction: {
        summary:
          "Overnight vandalism in an apartment lot: keyed scratches along both sides and two slashed tires; police report filed.",
        normalizedLossType: "vandalism",
        missingInfo: ["Photos of the damage"],
        inconsistencies: [],
        dataQualityScore: 78,
      },
      damage: {
        severity: "Moderate",
        damageDescription:
          "Deep key scratches along both door panels requiring repaint, plus two tires needing replacement.",
        affectedAreas: [
          "Driver-side doors",
          "Passenger-side doors",
          "Two tires",
        ],
        repairEstimateLow: 1800,
        repairEstimateHigh: 3200,
        photosAnalyzed: 0,
      },
      fraud: {
        fraudScore: 22,
        riskLevel: "Low",
        flags: ["Photos of the damage not yet provided"],
        reasoning:
          "Plausible, promptly reported vandalism with a police report. Minor gap: no photos yet, but nothing indicating fraud.",
      },
      recommendation: {
        recommendation: "Manual Review",
        suggestedSettlement: 2500,
        confidence: 68,
        rationale:
          "Low fraud risk but moderate cost and no photos yet. Request damage photos to confirm scope, then approve.",
      },
    },
  },
];

function toClaim(s: Seed): Claim {
  return {
    id: s.id,
    claimNumber: s.num,
    policyNumber: s.policy,
    claimantName: s.name,
    claimantContact: s.contact,
    incidentDate: ymd(s.incidentDaysAgo),
    reportedDate: iso(s.reportedDaysAgo),
    lossType: s.lossType,
    description: s.description,
    vehicleMake: s.make,
    vehicleModel: s.model,
    vehicleYear: s.year,
    vehicleVin: s.vin,
    location: s.location,
    photoPaths: [],
    status: s.status,
    ai: s.ai,
    aiError: null,
    adjusterDecision: s.decision ?? null,
    adjusterNotes: s.notes ?? null,
    createdAt: iso(s.reportedDaysAgo),
    updatedAt: iso(s.reportedDaysAgo),
  };
}

for (const s of seeds) {
  upsertSeedClaim(toClaim(s));
}

console.log(`Seeded ${seeds.length} demo claims into data/claimx.db`);
