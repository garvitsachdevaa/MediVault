import * as RadixAvatar from '@radix-ui/react-avatar';
import { cn } from '../../lib/cn.js';

// Circular avatar built on Radix Avatar: shows the photo if it loads, otherwise
// falls back to coloured initials (also while the image is loading or on error,
// which the previous plain <img> couldn't do). Public API unchanged:
// { name, src, size, className }.
export function Avatar({ name = '', src, size = 36, className = '' }) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?';

  return (
    <RadixAvatar.Root
      style={{ width: size, height: size }}
      className={cn(
        'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full align-middle',
        className
      )}
    >
      {src && (
        <RadixAvatar.Image
          src={src}
          alt={name}
          className="h-full w-full rounded-full object-cover"
        />
      )}
      <RadixAvatar.Fallback
        delayMs={src ? 200 : 0}
        className="flex h-full w-full items-center justify-center rounded-full bg-accent-100 font-semibold text-accent-800"
      >
        <span style={{ fontSize: size * 0.4 }}>{initials}</span>
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}
