// A calm loading placeholder: a soft tinted block with a gentle moving sheen.
// `className` sets the shape/size (width, height, rounding) as before.
export function Skeleton({ className = '' }) {
  return (
    <div
      className={`skeleton-shimmer rounded-lg bg-ink-100 ${className}`}
      aria-hidden="true"
    />
  );
}
