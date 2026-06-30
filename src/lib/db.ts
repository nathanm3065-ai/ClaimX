import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import type { AiAnalysis, Claim, ClaimStatus, NewClaimInput } from "./types";

// Single SQLite file under /data. AI sub-objects are stored as JSON columns.
const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "claimx.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) return db;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS claims (
      id TEXT PRIMARY KEY,
      claimNumber TEXT NOT NULL,
      policyNumber TEXT NOT NULL,
      claimantName TEXT NOT NULL,
      claimantContact TEXT NOT NULL,
      incidentDate TEXT NOT NULL,
      reportedDate TEXT NOT NULL,
      lossType TEXT NOT NULL,
      description TEXT NOT NULL,
      vehicleMake TEXT NOT NULL,
      vehicleModel TEXT NOT NULL,
      vehicleYear TEXT NOT NULL,
      vehicleVin TEXT NOT NULL,
      location TEXT NOT NULL,
      photoPaths TEXT NOT NULL,
      status TEXT NOT NULL,
      ai TEXT,
      aiError TEXT,
      adjusterDecision TEXT,
      adjusterNotes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);
  return db;
}

interface ClaimRow {
  id: string;
  claimNumber: string;
  policyNumber: string;
  claimantName: string;
  claimantContact: string;
  incidentDate: string;
  reportedDate: string;
  lossType: string;
  description: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleVin: string;
  location: string;
  photoPaths: string;
  status: string;
  ai: string | null;
  aiError: string | null;
  adjusterDecision: string | null;
  adjusterNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

function rowToClaim(row: ClaimRow): Claim {
  return {
    ...row,
    lossType: row.lossType as Claim["lossType"],
    status: row.status as ClaimStatus,
    photoPaths: JSON.parse(row.photoPaths) as string[],
    ai: row.ai ? (JSON.parse(row.ai) as AiAnalysis) : null,
  };
}

function genId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function createClaim(input: NewClaimInput): Claim {
  const now = new Date().toISOString();
  const id = genId("clm");
  const claimNumber = `CLX-${Date.now().toString().slice(-8)}`;
  const claim: Claim = {
    id,
    claimNumber,
    ...input,
    reportedDate: now,
    status: "Submitted",
    ai: null,
    aiError: null,
    adjusterDecision: null,
    adjusterNotes: null,
    createdAt: now,
    updatedAt: now,
  };
  getDb()
    .prepare(
      `INSERT INTO claims (
        id, claimNumber, policyNumber, claimantName, claimantContact,
        incidentDate, reportedDate, lossType, description,
        vehicleMake, vehicleModel, vehicleYear, vehicleVin, location,
        photoPaths, status, ai, aiError, adjusterDecision, adjusterNotes,
        createdAt, updatedAt
      ) VALUES (
        @id, @claimNumber, @policyNumber, @claimantName, @claimantContact,
        @incidentDate, @reportedDate, @lossType, @description,
        @vehicleMake, @vehicleModel, @vehicleYear, @vehicleVin, @location,
        @photoPaths, @status, @ai, @aiError, @adjusterDecision, @adjusterNotes,
        @createdAt, @updatedAt
      )`
    )
    .run({
      ...claim,
      photoPaths: JSON.stringify(claim.photoPaths),
      ai: null,
    });
  return claim;
}

export function listClaims(): Claim[] {
  const rows = getDb()
    .prepare(`SELECT * FROM claims ORDER BY createdAt DESC`)
    .all() as ClaimRow[];
  return rows.map(rowToClaim);
}

export function getClaim(id: string): Claim | null {
  const row = getDb()
    .prepare(`SELECT * FROM claims WHERE id = ?`)
    .get(id) as ClaimRow | undefined;
  return row ? rowToClaim(row) : null;
}

export function saveAiAnalysis(id: string, ai: AiAnalysis): void {
  getDb()
    .prepare(
      `UPDATE claims SET ai = @ai, aiError = NULL, status = @status, updatedAt = @updatedAt WHERE id = @id`
    )
    .run({
      id,
      ai: JSON.stringify(ai),
      status: "AI_Reviewed" satisfies ClaimStatus,
      updatedAt: new Date().toISOString(),
    });
}

export function saveAiError(id: string, message: string): void {
  getDb()
    .prepare(
      `UPDATE claims SET aiError = @aiError, status = @status, updatedAt = @updatedAt WHERE id = @id`
    )
    .run({
      id,
      aiError: message,
      status: "Submitted" satisfies ClaimStatus,
      updatedAt: new Date().toISOString(),
    });
}

export function saveDecision(
  id: string,
  status: ClaimStatus,
  decision: string,
  notes: string
): Claim | null {
  getDb()
    .prepare(
      `UPDATE claims SET status = @status, adjusterDecision = @decision, adjusterNotes = @notes, updatedAt = @updatedAt WHERE id = @id`
    )
    .run({
      id,
      status,
      decision,
      notes,
      updatedAt: new Date().toISOString(),
    });
  return getClaim(id);
}

// Used by the seed script to insert a fully-formed claim (incl. AI results).
export function upsertSeedClaim(claim: Claim): void {
  getDb()
    .prepare(
      `INSERT OR REPLACE INTO claims (
        id, claimNumber, policyNumber, claimantName, claimantContact,
        incidentDate, reportedDate, lossType, description,
        vehicleMake, vehicleModel, vehicleYear, vehicleVin, location,
        photoPaths, status, ai, aiError, adjusterDecision, adjusterNotes,
        createdAt, updatedAt
      ) VALUES (
        @id, @claimNumber, @policyNumber, @claimantName, @claimantContact,
        @incidentDate, @reportedDate, @lossType, @description,
        @vehicleMake, @vehicleModel, @vehicleYear, @vehicleVin, @location,
        @photoPaths, @status, @ai, @aiError, @adjusterDecision, @adjusterNotes,
        @createdAt, @updatedAt
      )`
    )
    .run({
      ...claim,
      photoPaths: JSON.stringify(claim.photoPaths),
      ai: claim.ai ? JSON.stringify(claim.ai) : null,
    });
}
