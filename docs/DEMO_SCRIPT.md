# ClaimX — Showcase Demo Script

A ~5-minute click-path for the project showcase. Practiced order, with the line to
say at each step. The seeded claims let you demo the adjuster experience without
spending API tokens; one live submission shows the real Claude pipeline.

## Before you start (1 min)

```bash
cd /Users/nathan/ClaimX
# .env.local must contain ANTHROPIC_API_KEY=sk-ant-...
npm run seed     # loads 5 demo claims (only needed once / to reset)
npm run dev      # http://localhost:3000
```

Have a **car-damage photo** ready on your desktop for the live submission (any
photo of vehicle damage works — bumper dent, cracked windshield, etc.).

> Tip: keep two browser tabs open — one as the **Customer**, one as the **Adjuster** —
> so you can switch personas instantly.

---

## Part 1 — The problem & the landing page (30 sec)

1. Open **`/`** (home).
2. Say: *"Traditional claims handling is slow, manual, and inconsistent — which
   drives leakage and missed fraud. ClaimX puts AI on the front line: it reads the
   claim, assesses damage, scores fraud, and recommends a decision in seconds, with
   an adjuster making the final call."*
3. Point to the 5-step "How it works" strip.

---

## Part 2 — Customer files a claim (LIVE AI) (90 sec)

1. Click **File a claim** → **`/claim/new`**.
2. Fill it in (sample):
   - Name: *Jordan Lee* · Contact: *jordan@example.com* · Policy: *POL-900145*
   - Incident date: *yesterday* · Loss type: *collision*
   - Vehicle: *2020 Honda Accord* · Location: *Austin, TX*
   - Description: *"I was rear-ended at a stop sign. The rear bumper is dented and
     the tail light is cracked. No injuries. Photo attached."*
   - **Attach the damage photo.**
3. Click **Submit claim**. Say: *"On submit, the AI pipeline runs — four Claude
   steps: extract & validate, assess damage from the photo using vision, score
   fraud, and recommend a decision."*
4. The status page (**`/claim/[id]`**) appears. Walk through the **AI review summary**:
   - The **recommendation** banner (e.g. *Fast-Track Approve* + suggested settlement)
   - **Intake & validation** (summary, data-quality, any missing info)
   - **Damage & severity** (severity badge + repair estimate — *"this came from the
     photo"*)
   - **Fraud risk** meter (low, with reasoning)
5. Say: *"The customer gets an instant, transparent review and a live status tracker."*

---

## Part 3 — Adjuster triages the queue (60 sec)

1. Switch to the Adjuster tab → **`/adjuster`**.
2. Point to the header stats (**total / pending / high-risk**) and the table.
3. Say: *"The queue is AI-prioritized — riskiest and pending claims float to the top.
   Each row shows severity, a fraud dot, the AI recommendation, and a suggested
   settlement."*
4. Highlight **CLX-10000002 — Derek Malloy**, fraud **86 (red)**. Say: *"This is the
   fraud case the AI flagged."*

---

## Part 4 — Adjuster reviews the high-fraud claim & decides (60 sec)

1. Click **Review →** on the Derek Malloy claim → **`/adjuster/[id]`**.
2. Walk the AI panel:
   - **Recommendation: Investigate**, settlement **$0**
   - **Fraud 86 / High** with named red flags: *delayed reporting (~39 days), no
     police report, inflated $40k upgrades on a 2016 Civic, missing VIN*
   - **Intake** flagged the inconsistencies; **damage** is an unverifiable total loss
3. Say: *"The AI didn't just score it — it explains exactly why, with concrete red
   flags the adjuster can act on."*
4. In the **decision panel**, add a note (*"Refer to SIU; request police report"*)
   and click **Investigate**. The status updates live.
5. (Optional contrast) Go back, open **CLX-10000001 — Maria Gonzalez** (fraud 8) and
   show how a clean claim recommends **Fast-Track Approve** — *"the same engine
   fast-tracks the easy ones and stops the risky ones."*

---

## Part 5 — Close (30 sec)

Say: *"That's the full loop: instant AI triage at intake, a prioritized queue, and
evidence-based recommendations — with a human always making the final decision.
The result is faster outcomes, lower cost and leakage, and stronger fraud control."*

Point to the deliverables: working app, `docs/presentation.md` (5 slides),
`docs/ARCHITECTURE.md`, and `prompts/` (the exact AI prompts).

---

## If something goes wrong (fallbacks)

- **Live submission is slow / errors** (no internet, bad key): the claim is still
  created — open it from `/adjuster` and click **Run AI analysis** to retry, or just
  demo the seeded claims (no API needed).
- **Empty dashboard:** run `npm run seed` again.
- **Reset everything:** delete `data/claimx.db` and re-run `npm run seed`.
