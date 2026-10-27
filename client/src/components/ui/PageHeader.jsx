import { motion } from 'motion/react';
import { cn } from '../../lib/cn.js';
import { EASE_OUT } from '../../lib/motion.js';

// A large, editorial page header shared across every logged-in screen.
//
// Renders a confident display-font H1 (optionally with a gradient accent on the
// trailing word via `accent`), a short muted subtitle, and an optional actions
// slot on the right. An optional `eyebrow` renders a small uppercase kicker
// above the title. Entrances are a calm fade + slide (reduced-motion safe via
// the global MotionConfig). Public surface is additive and self-contained.
export function PageHeader({
  title,
  accent,
  subtitle,
  eyebrow,
  icon: Icon,
  actions,
  className = '',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      className={cn('flex flex-wrap items-end justify-between gap-x-4 gap-y-3', className)}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-accent-600">
            {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-ink-900 sm:text-4xl">
          {title}
          {accent && (
            <>
              {' '}
              <span className="bg-gradient-to-br from-accent-500 to-accent-700 bg-clip-text text-transparent">
                {accent}
              </span>
            </>
          )}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-500">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </motion.div>
  );
}
