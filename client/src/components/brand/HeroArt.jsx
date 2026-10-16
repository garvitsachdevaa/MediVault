import { Activity, FileText, ShieldCheck } from 'lucide-react';
import { StatusChip } from '../ui/StatusChip.jsx';

// An abstract, on-brand health visual built entirely from SVG + divs (no
// images): a soft gradient field, a floating record card with a lab trend
// sparkline, and a small "verified" confirmation chip. It suggests organised,
// patient-owned records without looking like stock art.
export function HeroArt() {
  return (
    <div className="relative mx-auto w-full max-w-md select-none" aria-hidden="true">
      {/* Soft ambient blobs */}
      <div className="absolute -left-10 -top-8 h-56 w-56 rounded-full bg-accent-200/50 blur-3xl" />
      <div className="absolute -bottom-10 -right-6 h-52 w-52 rounded-full bg-accent-100/70 blur-3xl" />

      {/* Primary record card */}
      <div className="relative rounded-3xl border border-ink-200/70 bg-white p-6 shadow-float">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-700 ring-1 ring-accent-100">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink-900">Lipid panel</p>
              <p className="text-xs text-ink-500">Reviewed 12 Oct 2026</p>
            </div>
          </div>
          <StatusChip status="verified" size="sm" />
        </div>

        {/* Lab trend sparkline */}
        <div className="mt-5 rounded-2xl bg-ink-50 p-4 ring-1 ring-ink-100">
          <div className="flex items-center justify-between">
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-600">
              <Activity className="h-3.5 w-3.5 text-accent-600" /> Total cholesterol
            </p>
            <p className="tabular text-xs font-semibold text-ink-900">182 mg/dL</p>
          </div>
          <svg viewBox="0 0 260 64" className="mt-3 h-16 w-full" fill="none">
            <defs>
              <linearGradient id="hero-fill" x1="0" y1="0" x2="0" y2="64">
                <stop offset="0" stopColor="#17a195" stopOpacity="0.22" />
                <stop offset="1" stopColor="#17a195" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M4 44 L44 36 L84 46 L124 28 L164 34 L204 18 L256 24"
              stroke="#0d8378"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 44 L44 36 L84 46 L124 28 L164 34 L204 18 L256 24 L256 64 L4 64 Z"
              fill="url(#hero-fill)"
            />
            <circle cx="204" cy="18" r="4" fill="#0d8378" />
            <circle cx="204" cy="18" r="7" fill="#0d8378" fillOpacity="0.18" />
          </svg>
        </div>

        {/* Medicine rows */}
        <div className="mt-4 space-y-2.5">
          {[
            { name: 'Atorvastatin', dose: '10 mg · nightly' },
            { name: 'Vitamin D3', dose: '1000 IU · daily' },
          ].map((m) => (
            <div
              key={m.name}
              className="flex items-center justify-between rounded-xl border border-ink-100 px-3.5 py-2.5"
            >
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-accent-500" />
                <span className="text-sm font-medium text-ink-800">{m.name}</span>
              </div>
              <span className="tabular text-xs text-ink-500">{m.dose}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating confirmation badge */}
      <div className="absolute -bottom-5 -left-5 flex items-center gap-2.5 rounded-2xl border border-ink-200/70 bg-white px-3.5 py-2.5 shadow-lift animate-float">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-status-normal-bg text-status-normal ring-1 ring-status-normal-border">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div className="leading-tight">
          <p className="text-xs font-semibold text-ink-900">You confirmed this</p>
          <p className="text-2xs text-ink-500">Nothing is saved without you</p>
        </div>
      </div>
    </div>
  );
}
