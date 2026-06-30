import Link from "next/link";

const STEPS = [
  { n: 1, t: "Customer files a claim", d: "Guided FNOL intake with photo upload." },
  { n: 2, t: "AI extracts & validates", d: "Normalizes data, flags gaps." },
  { n: 3, t: "AI triages damage & fraud", d: "Vision severity + 0–100 fraud score." },
  { n: 4, t: "AI recommends a decision", d: "Settlement estimate + rationale." },
  { n: 5, t: "Adjuster decides", d: "Human-in-the-loop final call." },
];

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-500 px-8 py-14 text-white">
        <h1 className="max-w-2xl text-4xl font-bold leading-tight">
          Faster, fairer auto claims — powered by AI.
        </h1>
        <p className="mt-4 max-w-2xl text-brand-50">
          ClaimX takes an auto claim from first notice of loss through AI
          extraction, damage assessment, fraud scoring, and a settlement
          recommendation — keeping an adjuster in the loop for the final
          decision.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/claim/new"
            className="rounded-lg bg-white px-5 py-3 font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
          >
            File a claim (Customer)
          </Link>
          <Link
            href="/adjuster"
            className="rounded-lg border border-white/40 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Open adjuster dashboard
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-xl font-semibold">How it works</h2>
        <ol className="grid gap-4 md:grid-cols-5">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 font-bold text-white">
                {s.n}
              </span>
              <h3 className="mt-3 font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Faster outcomes", "Instant AI triage replaces slow manual review."],
          ["Lower cost & leakage", "Consistent, evidence-based settlement guidance."],
          ["Better fraud control", "Every claim scored 0–100 with named red flags."],
        ].map(([t, d]) => (
          <div key={t} className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-brand-700">{t}</h3>
            <p className="mt-1 text-sm text-slate-600">{d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
