import Link from "next/link";
import { notFound } from "next/navigation";
import { getClaim } from "@/lib/db";
import { StatusBadge } from "@/components/badges";
import { AiPanel } from "@/components/AiPanel";
import { shortDate } from "@/lib/format";
import type { ClaimStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const TRACK: ClaimStatus[] = ["Submitted", "AI_Reviewed", "Under_Review"];
const RESOLVED: ClaimStatus[] = ["Approved", "Denied", "Investigating"];

function Tracker({ status }: { status: ClaimStatus }) {
  const resolved = RESOLVED.includes(status);
  const steps = [...TRACK, resolved ? status : "Decision"];
  const activeIdx = resolved
    ? steps.length - 1
    : Math.max(0, TRACK.indexOf(status));
  return (
    <ol className="flex items-center gap-2">
      {steps.map((s, i) => {
        const done = i <= activeIdx;
        return (
          <li key={i} className="flex flex-1 items-center gap-2">
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                done ? "bg-brand-600 text-white" : "bg-slate-200 text-slate-500"
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`text-xs font-medium ${
                done ? "text-slate-900" : "text-slate-400"
              }`}
            >
              {String(s).replace(/_/g, " ")}
            </span>
            {i < steps.length - 1 && (
              <span className="h-px flex-1 bg-slate-200" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function CustomerClaimPage({
  params,
}: {
  params: { id: string };
}) {
  const claim = getClaim(params.id);
  if (!claim) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <Link href="/claim/new" className="text-sm text-brand-600 hover:underline">
          ← File another claim
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Claim {claim.claimNumber}</h1>
            <p className="text-slate-600">
              {claim.vehicleYear} {claim.vehicleMake} {claim.vehicleModel} ·
              filed {shortDate(claim.reportedDate)}
            </p>
          </div>
          <StatusBadge status={claim.status} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <Tracker status={claim.status} />
      </div>

      {claim.adjusterDecision && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Adjuster decision
          </h2>
          <p className="mt-2 font-medium">{claim.adjusterDecision}</p>
          {claim.adjusterNotes && (
            <p className="mt-1 text-sm text-slate-600">{claim.adjusterNotes}</p>
          )}
        </div>
      )}

      {claim.photoPaths.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {claim.photoPaths.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={p}
              src={p}
              alt="Damage photo"
              className="h-28 w-28 rounded-lg border border-slate-200 object-cover"
            />
          ))}
        </div>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">AI review summary</h2>
        {claim.ai ? (
          <AiPanel ai={claim.ai} />
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            Your claim has been received and is queued for review.
            {claim.aiError && (
              <span className="mt-1 block text-amber-700">
                (Automated analysis is temporarily unavailable; an adjuster will
                review it manually.)
              </span>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
