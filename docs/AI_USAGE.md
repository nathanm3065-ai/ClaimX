# AI Usage — Development & Product

This project uses AI in two distinct ways, both required by the capstone brief:
**(A)** AI tools used *to build* the solution, and **(B)** AI used *inside* the
product at runtime. This note documents both.

---

## A. AI tools used during development

The solution was built with AI-assisted development tools throughout the lifecycle.

| Tool | How it was used |
|------|-----------------|
| **Claude (Claude Code)** | **Primary build agent.** Scaffolded the Next.js + TypeScript project, wrote the data layer, the 4-step AI pipeline, API routes, and UI components; produced the documentation (`README.md`, `docs/`, `prompts/`); installed the toolchain and verified the app end-to-end (build + seed + server smoke test). |
| **Cursor / GitHub Copilot** | *(Optional — fill in if used.)* The program's approved AI dev tools for in-IDE editing/refactoring and inline autocompletion. Note here any portions you edited or completed with these tools so the attribution is accurate. |

**Where AI accelerated the lifecycle**
- *Design/planning:* drafting the architecture and pipeline breakdown.
- *Implementation:* generating typed modules, JSON tool schemas, and React/Tailwind UI.
- *Documentation:* README, architecture doc, 5-slide deck, and prompt exports.
- *Verification:* running `npm run build` / seed / a server smoke test and fixing issues.

**Responsible use during development**
- Generated code was reviewed and the production build was run to validate types and
  behavior (compiled successfully; all routes generated; API verified against seeded data).
- No secrets committed — the API key lives only in `.env.local` (git-ignored).

---

## B. AI used inside the product (runtime)

The product itself calls the **Anthropic Claude API** (`@anthropic-ai/sdk`) to power
its claims pipeline. Model: `claude-opus-4-8` by default (vision-capable),
configurable via `CLAUDE_MODEL`.

**Four AI intervention points** (`src/lib/ai/`, orchestrated by `pipeline.ts`):

1. **Intake extraction & validation** (`extract.ts`) — normalize the FNOL text +
   fields, flag missing/inconsistent data, score data quality.
2. **Damage & severity assessment** (`damage.ts`) — Claude **vision** over uploaded
   photos → severity band + USD repair-cost range.
3. **Fraud risk scoring** (`fraud.ts`) — 0–100 score with named red flags + reasoning.
4. **Decision recommendation** (`recommend.ts`) — Fast-Track Approve / Manual Review /
   Investigate / Deny + suggested settlement + rationale for the adjuster.

**Technique:** every step uses **forced tool-use** (`tool_choice` pinned to a JSON
tool schema in `schemas.ts`), so Claude returns validated, typed JSON — no fragile
text parsing. The exact system prompts are exported under [`../prompts/`](../prompts/).

**Responsible AI in the product**
- **Human-in-the-loop:** the AI only *recommends*; an adjuster makes every final decision.
- **Transparent & auditable:** each claim stores the full AI analysis (model,
  timestamp, scores, rationale) as JSON in SQLite.
- **Graceful failure:** if the key is missing or a call fails, the claim is still
  created, the error is surfaced (not hidden), and the pipeline can be re-run.

---

## Configuration files (AI-related)
- `.env.local.example` — `ANTHROPIC_API_KEY`, optional `CLAUDE_MODEL`.
- `src/lib/ai/schemas.ts` — the JSON tool schemas that constrain Claude's output.
- `prompts/extract.md`, `damage.md`, `fraud.md`, `recommend.md` — exported prompts.
