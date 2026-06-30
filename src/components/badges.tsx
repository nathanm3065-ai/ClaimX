import type {
  ClaimStatus,
  Recommendation,
  Severity,
} from "@/lib/types";

const STATUS_STYLES: Record<ClaimStatus, string> = {
  Submitted: "bg-slate-100 text-slate-700",
  AI_Reviewed: "bg-brand-50 text-brand-700",
  Under_Review: "bg-amber-100 text-amber-800",
  Approved: "bg-green-100 text-green-800",
  Denied: "bg-red-100 text-red-800",
  Investigating: "bg-purple-100 text-purple-800",
};

export function StatusBadge({ status }: { status: ClaimStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

const SEVERITY_STYLES: Record<Severity, string> = {
  Minor: "bg-green-100 text-green-800",
  Moderate: "bg-yellow-100 text-yellow-800",
  Severe: "bg-orange-100 text-orange-800",
  Total: "bg-red-100 text-red-800",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${SEVERITY_STYLES[severity]}`}
    >
      {severity}
    </span>
  );
}

const REC_STYLES: Record<Recommendation, string> = {
  "Fast-Track Approve": "bg-green-100 text-green-800",
  "Manual Review": "bg-amber-100 text-amber-800",
  Investigate: "bg-purple-100 text-purple-800",
  Deny: "bg-red-100 text-red-800",
};

export function RecommendationBadge({
  recommendation,
}: {
  recommendation: Recommendation;
}) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${REC_STYLES[recommendation]}`}
    >
      {recommendation}
    </span>
  );
}

export function FraudMeter({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score));
  const color =
    pct >= 67 ? "bg-red-500" : pct >= 34 ? "bg-amber-500" : "bg-green-500";
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-600">
        <span>Fraud risk</span>
        <span>{pct}/100</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
