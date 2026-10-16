import { ShieldCheck } from 'lucide-react';
import { Logo } from '../brand/Logo.jsx';

export function Footer() {
  return (
    <footer className="border-t border-ink-200/80 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-6 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <Logo size={22} />
        <p className="inline-flex items-center gap-1.5 text-xs leading-relaxed text-ink-500">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-accent-600" aria-hidden="true" />
          {/* Required notice — do not change this text. */}
          MediVault records your health information. It is not medical advice.
        </p>
      </div>
    </footer>
  );
}
