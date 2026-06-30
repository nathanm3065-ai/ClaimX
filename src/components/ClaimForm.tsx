"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LOSS_TYPES, type LossType } from "@/lib/types";

const initial = {
  claimantName: "",
  claimantContact: "",
  policyNumber: "",
  incidentDate: "",
  lossType: "collision" as LossType,
  vehicleYear: "",
  vehicleMake: "",
  vehicleModel: "",
  vehicleVin: "",
  location: "",
  description: "",
};

export function ClaimForm() {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // 1. Upload photos (if any)
      let photoPaths: string[] = [];
      if (files.length > 0) {
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        const up = await fetch("/api/upload", { method: "POST", body: fd });
        if (!up.ok) throw new Error("Photo upload failed.");
        photoPaths = (await up.json()).paths as string[];
      }

      // 2. Create the claim — server runs the AI pipeline synchronously.
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, photoPaths }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create claim.");

      router.push(`/claim/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  const field =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";
  const label = "mb-1 block text-sm font-medium text-slate-700";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <fieldset className="rounded-xl border border-slate-200 bg-white p-5">
        <legend className="px-2 text-sm font-semibold text-slate-500">
          Claimant & policy
        </legend>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={label}>Full name *</label>
            <input
              className={field}
              required
              value={form.claimantName}
              onChange={(e) => update("claimantName", e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Email or phone *</label>
            <input
              className={field}
              required
              value={form.claimantContact}
              onChange={(e) => update("claimantContact", e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Policy number *</label>
            <input
              className={field}
              required
              value={form.policyNumber}
              onChange={(e) => update("policyNumber", e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Incident date *</label>
            <input
              type="date"
              className={field}
              required
              value={form.incidentDate}
              onChange={(e) => update("incidentDate", e.target.value)}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-slate-200 bg-white p-5">
        <legend className="px-2 text-sm font-semibold text-slate-500">
          Incident & vehicle
        </legend>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={label}>Loss type *</label>
            <select
              className={field}
              value={form.lossType}
              onChange={(e) => update("lossType", e.target.value as LossType)}
            >
              {LOSS_TYPES.map((t) => (
                <option key={t} value={t} className="capitalize">
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Location</label>
            <input
              className={field}
              placeholder="e.g. Austin, TX"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Vehicle year</label>
            <input
              className={field}
              value={form.vehicleYear}
              onChange={(e) => update("vehicleYear", e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Make</label>
            <input
              className={field}
              value={form.vehicleMake}
              onChange={(e) => update("vehicleMake", e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Model</label>
            <input
              className={field}
              value={form.vehicleModel}
              onChange={(e) => update("vehicleModel", e.target.value)}
            />
          </div>
          <div>
            <label className={label}>VIN</label>
            <input
              className={field}
              value={form.vehicleVin}
              onChange={(e) => update("vehicleVin", e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4">
          <label className={label}>What happened? *</label>
          <textarea
            className={`${field} min-h-[120px]`}
            required
            placeholder="Describe the incident in your own words…"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>
        <div className="mt-4">
          <label className={label}>Damage photos</label>
          <input
            type="file"
            accept="image/*"
            multiple
            className="text-sm"
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          />
          {files.length > 0 && (
            <p className="mt-1 text-xs text-slate-500">
              {files.length} photo(s) selected
            </p>
          )}
        </div>
      </fieldset>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
      >
        {submitting ? "Submitting & analyzing…" : "Submit claim"}
      </button>
      {submitting && (
        <p className="text-sm text-slate-500">
          The AI is extracting your claim, assessing damage, scoring fraud risk,
          and preparing a recommendation. This can take a few moments…
        </p>
      )}
    </form>
  );
}
