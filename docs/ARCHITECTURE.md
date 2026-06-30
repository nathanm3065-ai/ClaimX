# ClaimX — Architecture

A single **Next.js 14 (App Router) full-stack TypeScript app** — UI, API, AI, and
database in one project. Two personas (Customer, Adjuster) share one codebase. The
AI pipeline (Claude) runs automatically when a claim is submitted, and an adjuster
makes the final decision (human-in-the-loop).

## System overview

```
                         ┌─────────────────────────── ClaimX (Next.js) ───────────────────────────┐
  Customer ──FNOL form──▶│  UI (React/Tailwind)        API routes            AI pipeline (Claude)  │
                         │  /claim/new          ──▶    POST /api/claims  ──▶  1 extract & validate  │
  Adjuster ──reviews────▶│  /adjuster                  GET  /api/claims       2 damage (vision)     │
                         │  /adjuster/[id]      ──▶    POST .../decision      3 fraud score         │
  Customer ──tracks─────▶│  /claim/[id]                POST .../analyze       4 recommendation      │
                         │  /api/upload (photos)                  │                    │            │
                         └────────────────────────────────────────┼────────────────────┼───────────┘
                                                                   ▼                    ▼
                                                         SQLite (better-sqlite3)   Anthropic API
                                                         data/claimx.db            claude-opus-4-8
```

## The four layers

### 1. UI layer — `src/app/` + `src/components/`
- `page.tsx` — landing + role selector
- `claim/new/page.tsx` — FNOL intake form (client; handles photo upload)
- `claim/[id]/page.tsx` — customer status tracker
- `adjuster/page.tsx` — AI-prioritized claims queue (riskiest/pending first)
- `adjuster/[id]/page.tsx` — full AI analysis + decision panel
- Server pages read the database **directly** via `src/lib/db.ts` (no internal
  fetch round-trip). Only interactive components are `"use client"`:
  `ClaimForm.tsx`, `AdjusterActions.tsx`. Display components (`AiPanel.tsx`,
  `badges.tsx`) are pure/server-safe.

### 2. API layer — `src/app/api/`
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/claims` | `POST` | Create a claim → **runs the AI pipeline** synchronously |
| `/api/claims` | `GET` | List all claims |
| `/api/claims/[id]` | `GET` | Fetch one claim |
| `/api/claims/[id]/analyze` | `POST` | (Re)run the AI pipeline |
| `/api/claims/[id]/decision` | `POST` | Record the adjuster's decision |
| `/api/upload` | `POST` | Save damage photos to `public/uploads/` |

All handlers set `runtime = "nodejs"` (required for SQLite + filesystem access).

### 3. AI layer — `src/lib/ai/` (the core)
- `client.ts` — Anthropic client + `callToolJSON()` helper using **forced
  tool-use**, so Claude always returns validated, typed JSON (no text parsing).
- `schemas.ts` — one JSON tool schema per step (the contract for the output).
- `images.ts` — loads claim photos as base64 image blocks for vision.
- Four sequential step modules, orchestrated by `pipeline.ts` (each step feeds the next):

| Step | Module | Output |
|------|--------|--------|
| 1. Extract & validate | `extract.ts` | Summary, normalized loss type, missing/inconsistent info, data-quality score |
| 2. Damage & severity (vision) | `damage.ts` | Severity band, affected areas, repair-cost range |
| 3. Fraud risk | `fraud.ts` | 0–100 score, risk level, named red flags |
| 4. Recommendation | `recommend.ts` | Fast-Track Approve / Manual Review / Investigate / Deny + settlement + rationale |

Model is `claude-opus-4-8` by default (vision-capable), configurable via
`CLAUDE_MODEL`. The exported system prompts are documented in `prompts/`.

### 4. Data layer — `src/lib/`
- `db.ts` — SQLite via `better-sqlite3`; single `claims` table with AI results
  stored as a JSON column. DB file at `data/claimx.db` (created at runtime).
- `types.ts` — shared domain types · `seed.ts` — demo claims (incl. the
  high-fraud case) · `format.ts` — currency/date helpers.

## Request flow — filing a new claim

```
1. Customer fills the FNOL form (/claim/new)
2. Photos → POST /api/upload → saved to public/uploads/, paths returned
3. POST /api/claims → createClaim() inserts the row (status: Submitted)
4. runPipeline(claim):  extract → damage(vision) → fraud → recommend
5. saveAiAnalysis() stores the result (status: AI_Reviewed)
6. Customer is redirected to /claim/[id] (status + AI summary)
   …the same claim now appears in the adjuster queue (/adjuster)
7. Adjuster opens /adjuster/[id], reviews AI evidence, and
   POST /api/claims/[id]/decision → Approved / Investigating / Denied
```

## Key design decisions
- **Human-in-the-loop** — AI only *recommends*; the adjuster makes every final call.
- **Structured output** — forced tool-use guarantees schema-typed JSON; no fragile
  text parsing of model responses.
- **Graceful failure** — if the API key is missing or a call fails, the claim is
  still created and re-analyzable (`/analyze`); the app never crashes on AI errors.
- **One process, zero external services** — SQLite file + Next.js, trivial to run
  and demo.

## Tech stack
Next.js 14 (App Router) · TypeScript · Tailwind CSS · better-sqlite3 (SQLite) ·
`@anthropic-ai/sdk` (Claude API).
