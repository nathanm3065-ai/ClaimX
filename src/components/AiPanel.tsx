import type { AiAnalysis } from "@/lib/types";
import { usd } from "@/lib/format";
import {
  FraudMeter,
  RecommendationBadge,
  SeverityBadge,
} from "./badges";

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Chips({ items, tone }: { items: string[]; tone: "red" | "slate" }) {
  if (items.length === 0)
    return <p className="text-sm text-slate-400">None detected</p>;
  const cls =
    tone === "red"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-slate-50 text-slate-700 border-slate-200";
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((it, i) => (
        <li
          key={i}
          className={`rounded-md border px-2 py-1 text-xs font-medium ${cls}`}
        >
          {it}
        </li>
      ))}
    </ul>
  );
}

export function AiPanel({ ai }: { ai: AiAnalysis }) {
  const { extraction, damage, fraud, recommendation } = ai;
  return (
    <div className="grid gap-4">
      {/* Recommendation — headline */}
      <div className="rounded-xl border border-brand-100 bg-brand-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              AI Recommendation
            </p>
            <div className="mt-2 flex items-center gap-3">
              <RecommendationBadge recommendation={recommendation.recommendation} />
              <span className="text-sm text-slate-600">
                {recommendation.confidence}% confidence
              </span>
            </div>
          </div>
          {recommendation.suggestedSettlement > 0 && (
            <div className="text-right">
              <p className="text-xs font-medium text-slate-500">
                Suggested settlement
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {usd(recommendation.suggestedSettlement)}
              </p>
            </div>
          )}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">
          {recommendation.rationale}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Intake & Validation">
          <p className="text-sm text-slate-700">{extraction.summary}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-slate-500">Loss type</p>
              <p className="font-medium capitalize">
                {extraction.normalizedLossType}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Data quality</p>
              <p className="font-medium">{extraction.dataQualityScore}/100</p>
            </div>
          </div>
          <div className="mt-3">
            <p className="mb-1 text-xs text-slate-500">Missing info</p>
            <Chips items={extraction.missingInfo} tone="slate" />
          </div>
          <div className="mt-3">
            <p className="mb-1 text-xs text-slate-500">Inconsistencies</p>
            <Chips items={extraction.inconsistencies} tone="red" />
          </div>
        </Card>

        <Card title="Damage & Severity">
          <div className="mb-2 flex items-center gap-2">
            <SeverityBadge severity={damage.severity} />
            <span className="text-sm text-slate-600">
              {damage.photosAnalyzed} photo(s) analyzed
            </span>
          </div>
          <p className="text-sm text-slate-700">{damage.damageDescription}</p>
          <div className="mt-3">
            <p className="mb-1 text-xs text-slate-500">Affected areas</p>
            <Chips items={damage.affectedAreas} tone="slate" />
          </div>
          <div className="mt-3">
            <p className="text-xs text-slate-500">Repair estimate</p>
            <p className="font-semibold text-slate-900">
              {usd(damage.repairEstimateLow)} – {usd(damage.repairEstimateHigh)}
            </p>
          </div>
        </Card>

        <Card title="Fraud Risk">
          <FraudMeter score={fraud.fraudScore} />
          <p className="mt-3 text-sm text-slate-700">{fraud.reasoning}</p>
          <div className="mt-3">
            <p className="mb-1 text-xs text-slate-500">Red flags</p>
            <Chips items={fraud.flags} tone="red" />
          </div>
        </Card>

        <Card title="Analysis Details">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Model</dt>
              <dd className="font-mono text-xs text-slate-700">{ai.model}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Analyzed</dt>
              <dd className="text-slate-700">
                {new Date(ai.analyzedAt).toLocaleString()}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Fraud level</dt>
              <dd className="font-medium text-slate-700">{fraud.riskLevel}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
