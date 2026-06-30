import Link from "next/link";
import { listClaims } from "@/lib/db";
import {
  RecommendationBadge,
  SeverityBadge,
  StatusBadge,
} from "@/components/badges";
import { shortDate, usd } from "@/lib/format";
import type { Claim } from "@/lib/types";

export const dynamic = "force-dynamic";

const PENDING = new Set(["Submitted", "AI_Reviewed", "Under_Review"]);

// Pending claims first, then by fraud score (riskiest at the top).
function priority(c: Claim): number {
  const pending = PENDING.has(c.status) ? 1000 : 0;
  const fraud = c.ai?.fraud.fraudScore ?? 0;
  return pending + fraud;
}

function fraudDot(score: number) {
  const color =
    score >= 67 ? "bg-red-500" : score >= 34 ? "bg-amber-500" : "bg-green-500";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="text-sm font-medium">{score}</span>
    </span>
  );
}

export default function AdjusterDashboard() {
  const claims = listClaims().sort((a, b) => priority(b) - priority(a));
  const pendingCount = claims.filter((c) => PENDING.has(c.status)).length;
  const highRisk = claims.filter(
    (c) => (c.ai?.fraud.fraudScore ?? 0) >= 67
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Adjuster dashboard</h1>
          <p className="text-slate-600">
            AI-prioritized claims queue — riskiest and pending claims first.
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-2">
            <span className="font-bold">{claims.length}</span> total
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-2">
            <span className="font-bold text-amber-600">{pendingCount}</span>{" "}
            pending
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-2">
            <span className="font-bold text-red-600">{highRisk}</span> high-risk
          </div>
        </div>
      </div>

      {claims.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No claims yet.{" "}
          <Link href="/claim/new" className="text-brand-600 hover:underline">
            File one
          </Link>{" "}
          or run the seed script (<code>npm run seed</code>).
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Claim</th>
                <th className="px-4 py-3">Claimant</th>
                <th className="px-4 py-3">Loss</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Fraud</th>
                <th className="px-4 py-3">Recommendation</th>
                <th className="px-4 py-3">Settlement</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {claims.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{c.claimNumber}</div>
                    <div className="text-xs text-slate-400">
                      {shortDate(c.reportedDate)}
                    </div>
                  </td>
                  <td className="px-4 py-3">{c.claimantName}</td>
                  <td className="px-4 py-3 capitalize">{c.lossType}</td>
                  <td className="px-4 py-3">
                    {c.ai ? (
                      <SeverityBadge severity={c.ai.damage.severity} />
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {c.ai ? (
                      fraudDot(c.ai.fraud.fraudScore)
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {c.ai ? (
                      <RecommendationBadge
                        recommendation={c.ai.recommendation.recommendation}
                      />
                    ) : (
                      <span className="text-xs text-amber-600">
                        {c.aiError ? "AI failed" : "pending"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {c.ai && c.ai.recommendation.suggestedSettlement > 0
                      ? usd(c.ai.recommendation.suggestedSettlement)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/adjuster/${c.id}`}
                      className="font-medium text-brand-600 hover:underline"
                    >
                      Review →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
