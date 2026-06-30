import { ClaimForm } from "@/components/ClaimForm";

export default function NewClaimPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">File a new auto claim</h1>
      <p className="mt-1 text-slate-600">
        Tell us what happened. Our AI will review your claim instantly and an
        adjuster will follow up.
      </p>
      <div className="mt-8">
        <ClaimForm />
      </div>
    </div>
  );
}
