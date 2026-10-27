import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn.js';

// A calm surface with a hairline border and a soft, layered shadow.
//
// Public API is additive: `as` renders a different tag, `interactive` adds a
// gentle lift on hover for clickable cards, `padded` toggles the default
// padding, and `className` + spread props pass through — all unchanged. New
// optional `variant` + `elevation` props let callers reach for a glass or
// accent surface without hand-rolling classes.
export const cardVariants = cva(
  'rounded-2xl border transition-shadow',
  {
    variants: {
      variant: {
        default: 'border-ink-200/80 bg-white',
        glass: 'border-white/60 bg-white/70 backdrop-blur-xl',
        accent: 'border-accent-200/70 bg-accent-50/60',
        muted: 'border-ink-200/70 bg-ink-50/70',
      },
      elevation: {
        flat: 'shadow-none',
        sm: 'shadow-sm',
        card: 'shadow-card',
        lift: 'shadow-lift',
      },
    },
    defaultVariants: { variant: 'default', elevation: 'card' },
  }
);

export const Card = forwardRef(function Card(
  {
    as: Tag = 'div',
    className = '',
    interactive = false,
    padded = true,
    variant = 'default',
    elevation = 'card',
    children,
    ...props
  },
  ref
) {
  return (
    <Tag
      ref={ref}
      className={cn(
        cardVariants({ variant, elevation }),
        padded && 'p-6',
        interactive &&
          'cursor-pointer duration-200 ease-out hover:-translate-y-0.5 hover:border-ink-300/80 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
});
