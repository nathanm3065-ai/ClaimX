# ClaimX — AI-Powered Auto Claims Handling

A capstone MVP that takes an auto/motor insurance claim from **First Notice of
Loss (FNOL)** through an AI pipeline — extraction, damage assessment, fraud
scoring, and a settlement recommendation — with a human adjuster making the final
decision.

Built for the **Quantum Shift AI Practitioner+** program (Batch #1).

- **In-app AI:** Anthropic **Claude API** (`claude-opus-4-8` by default; vision + forced tool-use for structured JSON).
- **Built with:** Claude Code / Cursor / GitHub Copilot.

> **Docs:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) (layered design + request flow) ·
> [`docs/presentation.md`](docs/presentation.md) (5-slide deck) ·
> [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) (showcase walkthrough) ·
> [`docs/AI_USAGE.md`](docs/AI_USAGE.md) (where AI was used).

---

## What it does

Two personas:

- **Customer** files a claim (guided FNOL form + photo upload) and tracks its status.
- **Adjuster** reviews an AI-prioritized queue, sees every AI finding, and decides.

The AI pipeline runs automatically on submission and produces structured output:

| Step | Module | Output |
|------|--------|--------|
| 1. Extract & validate | `src/lib/ai/extract.ts` | Normalized summary, loss type, missing/inconsistent info, data-quality score |
| 2. Damage & severity (vision) | `src/lib/ai/damage.ts` | Severity band, affected areas, repair-cost range |
| 3. Fraud risk | `src/lib/ai/fraud.ts` | 0–100 score, risk level, named red flags |
| 4. Recommendation | `src/lib/ai/recommend.ts` | Fast-Track Approve / Manual Review / Investigate / Deny + settlement + rationale |

Orchestrated by `src/lib/ai/pipeline.ts`. Every step uses **forced tool-use**
(`src/lib/ai/schemas.ts`) so Claude returns validated, typed JSON.

---

## Tech stack

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- **SQLite** via `better-sqlite3` (single file at `data/claimx.db`, created at runtime)
- **Anthropic Claude API** via `@anthropic-ai/sdk`

---

## Setup & run

> Requires **Node.js 18.17+** and npm.

```bash
# 1. Install dependencies
npm install

# 2. Configure your API key
cp .env.local.example .env.local
#   then edit .env.local and set ANTHROPIC_API_KEY=sk-ant-...
#   (optional) set CLAUDE_MODEL — defaults to claude-opus-4-8

# 3. Seed demo claims (recommended — populates the adjuster dashboard,
#    including a deliberately high-fraud case)
npm run seed

# 4. Start the app
npm run dev
#   open http://localhost:3000
```

Get an API key at <https://console.anthropic.com/>.

---

## Using the app

1. **Home** (`/`) — overview + role selection.
2. **File a claim** (`/claim/new`) — fill the FNOL form, optionally attach a
   damage photo, submit. The AI pipeline runs and you're taken to the status page.
3. **Customer status** (`/claim/[id]`) — status tracker + full AI review summary.
4. **Adjuster dashboard** (`/adjuster`) — prioritized queue (riskiest/pending first).
5. **Adjuster review** (`/adjuster/[id]`) — all AI analysis, claim details, photos,
   and the decision panel (Approve / Investigate / Deny). If AI analysis failed
   (e.g. no API key at submission), use **Run AI analysis** here to (re)run it.

---

## Project structure

```
src/
  app/
    page.tsx                      landing + role selector
    claim/new/page.tsx            FNOL intake form
    claim/[id]/page.tsx           customer status tracker
    adjuster/page.tsx             prioritized claims queue
    adjuster/[id]/page.tsx        claim review + decision
    api/
      claims/route.ts             POST create (+run pipeline), GET list
      claims/[id]/route.ts        GET one
      claims/[id]/analyze/route.ts  POST (re)run AI pipeline
      claims/[id]/decision/route.ts POST adjuster decision
      upload/route.ts             POST photo upload -> /public/uploads
  components/                     ClaimForm, AiPanel, badges, AdjusterActions
  lib/
    types.ts                      shared domain types
    db.ts                         SQLite schema + queries
    seed.ts                       demo claims (incl. high-fraud case)
    format.ts                     currency/date helpers
    ai/
      client.ts                   Anthropic client + forced-tool-use helper
      schemas.ts                  JSON tool schemas for each step
      extract.ts damage.ts fraud.ts recommend.ts pipeline.ts images.ts
prompts/                          exported AI prompts (deliverable)
docs/presentation.md              5-slide capstone deck (deliverable)
```

---

## How AI is used responsibly

- **Human-in-the-loop:** the AI only *recommends*; an adjuster makes every final decision.
- **Structured & auditable:** each claim stores the full AI analysis (model, timestamp,
  scores, rationale) as JSON.
- **Graceful failure:** if the API key is missing or a call fails, the claim is still
  created and the error is surfaced (not hidden); the pipeline can be re-run.

---

## Notes & scope

This is a **PoC/MVP**, intentionally focused on a clean end-to-end slice.
Out of scope: real auth, payments, customer chatbot, notifications, analytics,
and multi-line support — noted as future extensions in `docs/presentation.md`.
