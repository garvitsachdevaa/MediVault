import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { Logo, LogoMark } from '../brand/Logo.jsx';
import { Footer } from './Footer.jsx';
import { EASE_OUT } from '../../lib/motion.js';

const assurances = [
  { Icon: Lock, title: 'Private by design', body: 'Your records are yours. We never sell or share them.' },
  { Icon: CheckCircle2, title: 'You confirm everything', body: 'Nothing enters your record until you approve it.' },
  { Icon: ShieldCheck, title: 'Clear, not clinical jargon', body: 'Every value is explained in plain language.' },
];

// Two-column auth shell: a reassuring branded panel on the left, the form card
// on the right. On small screens the panel collapses to a simple brand header.
export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <div className="grid flex-1 lg:grid-cols-2">
        {/* Brand / reassurance panel */}
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-accent-700 via-accent-800 to-accent-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.1]" />
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 animate-aurora-drift rounded-full bg-accent-500/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -right-10 h-80 w-80 animate-aurora-drift rounded-full bg-accent-400/25 blur-3xl [animation-delay:-8s]" />

          <Link
            to="/"
            className="relative inline-flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <LogoMark size={30} />
            <span className="text-lg font-bold tracking-tight text-white">
              Medi<span className="text-accent-200">Vault</span>
            </span>
          </Link>

          <div className="relative max-w-sm">
            <h2 className="font-display text-[1.75rem] font-bold leading-snug tracking-tight text-white">
              A calm, private home for your family&apos;s health records.
            </h2>
            <ul className="mt-8 space-y-5">
              {assurances.map(({ Icon, title: t, body }) => (
                <li key={t} className="flex gap-3.5">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                    <Icon className="h-4 w-4 text-accent-100" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{t}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-accent-100/90">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-xs text-accent-100/80">
            MediVault records your health information. It is not medical advice.
          </p>
        </aside>

        {/* Form column */}
        <main className="relative flex items-center justify-center px-6 py-12 sm:py-16">
          <div className="pointer-events-none absolute inset-0 bg-dots [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
          <motion.div
            className="relative w-full max-w-sm"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
          >
            {/* Mobile brand (panel is hidden on small screens) */}
            <div className="mb-8 flex justify-center lg:hidden">
              <Link
                to="/"
                className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50"
              >
                <Logo size={30} />
              </Link>
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">{title}</h1>
              {subtitle && (
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{subtitle}</p>
              )}
            </div>

            <div className="mt-8 rounded-2xl border border-ink-200/80 bg-white p-7 shadow-card">
              {children}
            </div>

            {footer && <div className="mt-6 text-center text-sm text-ink-600">{footer}</div>}
          </motion.div>
        </main>
      </div>

      {/* Footer only needed on small screens where the panel notice is hidden. */}
      <div className="lg:hidden">
        <Footer />
      </div>
    </div>
  );
}
