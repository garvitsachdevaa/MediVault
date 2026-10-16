// A calm surface with a hairline border and a soft, layered shadow. `as` lets
// callers render it as a section/article; `interactive` adds a gentle lift on
// hover for clickable cards. All additive — existing usage (className, spread
// props, children) is unchanged.
export function Card({
  as: Tag = 'div',
  className = '',
  interactive = false,
  padded = true,
  children,
  ...props
}) {
  return (
    <Tag
      className={`rounded-2xl border border-ink-200/80 bg-white shadow-card ${
        padded ? 'p-6' : ''
      } ${
        interactive
          ? 'cursor-pointer transition duration-200 ease-out hover:-translate-y-0.5 hover:border-ink-300/80 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
