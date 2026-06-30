# ClaimX — Capstone Presentation (5 Slides)

> AI-Powered Auto Claims Handling · Quantum Shift AI Practitioner+ (Batch #1)
> Built with Claude (in-app AI) + Claude Code / Cursor / GitHub Copilot (development)

---

## Slide 1 — Context and Why Now

**Challenges and Impact**
- *Business problem:* traditional claims handling is slow, labor-intensive, and inconsistent.
- *Challenges:* manual FNOL intake, triage, and adjudication create long cycle times; inconsistent decisions drive **claims leakage** (overpayment) and missed fraud.
- *Impact on org/team/users:* customers wait days/weeks → low satisfaction and churn; adjusters spend time on routine claims instead of complex/high-risk ones; leakage and fraud erode the carrier's loss ratio.

**Strategic Imperative — why now**
- Rising claim volumes and **severity inflation** strain capacity.
- Customers now expect **instant, digital-first** resolution.
- Carriers must scale lean and modernize core claims operations.

**Shift in operating model**
- AI moves from back-office analytics to the **front line of the claims workflow** —
  reading submissions, assessing damage, scoring fraud, and recommending decisions
  in seconds, with humans focused on exceptions.

---

## Slide 2 — Current Challenges and Gaps

**Existing process (manual)**
1. Customer calls / emails FNOL → rep keys data into a system.
2. Claim sits in a queue for manual triage.
3. Adjuster reads notes, requests photos, estimates damage by hand.
4. Fraud caught only if an adjuster happens to notice red flags.
5. Decision and settlement vary by individual adjuster.

**Pain points & gaps**
- **Manual activities:** re-keying data, reading free-text, hunting for missing info.
- **Productivity:** every claim — trivial or complex — competes for the same queue.
- **Inconsistency:** no standardized severity / fraud / settlement logic.
- **Fraud control:** reactive and person-dependent; subtle indicators missed.
- **Technology gap:** no AI in the intake-to-decision path; tools are systems of record, not systems of judgment.
- **Business limitation:** can't scale to higher volume without proportional headcount.

---

## Slide 3 — Vision and Future State

**What ClaimX enables**
- ⚡ **Faster outcomes:** instant AI triage and recommendation at submission.
- 🎯 **Faster, more consistent decisions:** every claim scored the same way.
- 😀 **Better customer experience:** real-time status and quick resolution.
- 💸 **Reduced effort & leakage:** evidence-based settlement guidance.

**Strategic outcomes**
- Lower cost-per-claim and reduced cycle time.
- Improved loss ratio via consistent settlements + stronger fraud control.
- Adjuster capacity redirected from routine to complex/high-value claims.

**Future-state operating model**
- **People:** adjusters become exception-handlers and decision-makers.
- **Process:** straight-through fast-tracking for clean, low-risk claims;
  auto-routing of risky/complex claims to the right specialist.
- **AI:** the always-on first reviewer — extract → assess → score → recommend,
  always with a **human-in-the-loop** for the final decision.

**Future extensions (out of MVP scope):** customer chatbot, automated
notifications, analytics dashboards, and multi-line support (home, health).

---

## Slide 4 — Solution Overview

**Architecture / workflow**
```
Customer ──> FNOL intake (Next.js form + photo upload)
                  │
                  ▼
        AI Pipeline (Claude API)            ┌─────────────────────────────┐
        1. Extract & validate   ───────────▶│  SQLite (claims + AI JSON)  │
        2. Damage & severity (vision)       └─────────────────────────────┘
        3. Fraud risk score (0–100)                    │
        4. Decision recommendation                     ▼
                  │                          Adjuster dashboard (prioritized queue)
                  ▼                                     │
        Customer status tracker             Adjuster review → Approve / Investigate / Deny
```

**Key features & capabilities**
- Guided FNOL intake with photo upload and instant AI review.
- 4-step Claude pipeline producing structured, typed JSON for every claim.
- Adjuster dashboard auto-prioritized by fraud risk and pending status.
- One-click human decision; full status tracking for the customer.

**AI tools used**
- **In the product:** **Claude API** (`@anthropic-ai/sdk`, model `claude-opus-4-8`,
  vision + forced tool-use for structured output) powers all four AI steps.
- **In development:** **Claude Code / Cursor / GitHub Copilot** used to scaffold,
  write, and refine the Next.js/TypeScript codebase.

**Capability descriptions**
- *Extraction* — normalizes free-text + form fields, flags missing/inconsistent data.
- *Damage assessment* — Claude vision over photos → severity band + repair cost range.
- *Fraud scoring* — 0–100 risk score with named red flags and reasoning.
- *Recommendation* — Fast-Track Approve / Manual Review / Investigate / Deny + settlement.

---

## Slide 5 — Business Flow and Role of AI

**End-to-end business workflow**
```
 Customer            ClaimX (AI)                         Adjuster
 ─────────           ──────────────────────────          ─────────────
 File FNOL  ───────▶ [AI 1] Extract & validate
 + photos            [AI 2] Assess damage (vision)
                     [AI 3] Score fraud risk
                     [AI 4] Recommend decision  ───────▶ Review AI analysis
 Track status ◀───── Status + recommendation              │
                                                          ▼
 Outcome    ◀──────────────────────────────────  Approve / Investigate / Deny
```

**User interactions**
- Customer: submit claim, upload photos, track status & outcome.
- Adjuster: triage the prioritized queue, review AI evidence, make the call.

**AI intervention points (4)**
1. Intake — extraction & validation.
2. Damage — severity & repair estimate (vision).
3. Fraud — risk scoring with red flags.
4. Decision — recommendation + suggested settlement.

**Decision-making support**
- AI delivers a recommendation, settlement estimate, confidence, and rationale —
  the adjuster decides. **AI advises; humans decide.**

**Automation opportunities**
- Straight-through processing for low-risk, low-value claims (e.g. glass).
- Auto-routing of high-fraud / complex claims to specialists.
- Future: auto-drafted customer communications and SIU referrals.
