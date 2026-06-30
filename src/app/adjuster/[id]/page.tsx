import Link from "next/link";
import { notFound } from "next/navigation";
import { getClaim } from "@/lib/db";
import { StatusBadge } from "@/components/badges";
import { AiPanel } from "@/components/AiPanel";
import { AdjusterActions } from "@/components/AdjusterActions";
import { shortDate } from "@/lib/format";

export const dynamic = "force-dynamic";

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-800">{value || "—"}</dd>
    </div>
  );
}

export default function AdjusterReviewPage({
  params,
}: {
  params: { id: string };
}) {
  const claim = getClaim(params.id);
  if (!claim) notFound();

  return (
    <div className="space-y-6">
      <Link href="/adjuster" className="text-sm text-brand-600 hover:underline">
        ← Back to dashboard
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Claim {claim.claimNumber}</h1>
          <p className="text-slate-600">
            {claim.claimantName} · filed {shortDate(claim.reportedDate)}
          </p>
        </div>
        <StatusBadge status={claim.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {claim.ai ? (
            <AiPanel ai={claim.ai} />
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
              AI analysis has not completed for this claim.
              {claim.aiError && (
                <span className="mt-1 block font-mono text-xs text-amber-700">
                  {claim.aiError}
                </span>
              )}
              <span className="mt-2 block">
                Use “Run AI analysis” in the actions panel to (re)run the
                pipeline.
              </span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <AdjusterActions
            claimId={claim.id}
            hasAi={!!claim.ai}
            currentDecision={claim.adjusterDecision}
          />

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Claim details
            </h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Detail label="Policy #" value={claim.policyNumber} />
              <Detail label="Loss type" value={claim.lossType} />
              <Detail label="Incident date" value={claim.incidentDate} />
              <Detail label="Contact" value={claim.claimantContact} />
              <Detail
                label="Vehicle"
                value={`${claim.vehicleYear} ${claim.vehicleMake} ${claim.vehicleModel}`.trim()}
              />
              <Detail label="VIN" value={claim.vehicleVin} />
              <Detail label="Location" value={claim.location} />
            </dl>
            <div className="mt-3">
              <p className="text-xs text-slate-500">Description</p>
              <p className="mt-1 text-sm text-slate-700">{claim.description}</p>
            </div>
          </div>

          {claim.photoPaths.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Photos
              </h2>
              <div className="flex flex-wrap gap-3">
                {claim.photoPaths.map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={p}
                    src={p}
                    alt="Damage"
                    className="h-24 w-24 rounded-lg border border-slate-200 object-cover"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
