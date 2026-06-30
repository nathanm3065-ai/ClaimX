"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdjusterActions({
  claimId,
  hasAi,
  currentDecision,
}: {
  claimId: string;
  hasAi: boolean;
  currentDecision: string | null;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function decide(decision: "Approved" | "Denied" | "Investigating") {
    setBusy(decision);
    setError(null);
    try {
      const res = await fetch(`/api/claims/${claimId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, notes }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed.");
    } finally {
      setBusy(null);
    }
  }

  async function reanalyze() {
    setBusy("analyze");
    setError(null);
    try {
      const res = await fetch(`/api/claims/${claimId}/analyze`, {
        method: "POST",
      });
      if (!res.ok) throw new Error((await res.json()).error || "Analysis failed.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Adjuster decision
      </h2>
      {currentDecision && (
        <p className="mt-2 text-sm text-slate-600">
          Current: <span className="font-medium">{currentDecision}</span>
        </p>
      )}

      <textarea
        className="mt-3 min-h-[80px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        placeholder="Notes (optional)…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="mt-3 flex flex-wrap gap-3">
        <button
          onClick={() => decide("Approved")}
          disabled={!!busy}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
        >
          {busy === "Approved" ? "Saving…" : "Approve"}
        </button>
        <button
          onClick={() => decide("Investigating")}
          disabled={!!busy}
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-60"
        >
          {busy === "Investigating" ? "Saving…" : "Investigate"}
        </button>
        <button
          onClick={() => decide("Denied")}
          disabled={!!busy}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {busy === "Denied" ? "Saving…" : "Deny"}
        </button>
        {!hasAi && (
          <button
            onClick={reanalyze}
            disabled={!!busy}
            className="rounded-lg border border-brand-300 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 disabled:opacity-60"
          >
            {busy === "analyze" ? "Analyzing…" : "Run AI analysis"}
          </button>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
