import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClaimX — AI Claims Handling",
  description: "AI-powered auto claims intake, triage, fraud detection, and decision support.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 font-bold text-white">
                C
              </span>
              <span className="text-lg font-semibold tracking-tight">
                Claim<span className="text-brand-600">X</span>
              </span>
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
              <Link href="/claim/new" className="hover:text-brand-600">
                File a claim
              </Link>
              <Link href="/adjuster" className="hover:text-brand-600">
                Adjuster
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-slate-400">
          ClaimX — Capstone MVP · AI claims handling
        </footer>
      </body>
    </html>
  );
}
