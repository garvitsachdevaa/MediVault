// Circular avatar: shows the photo if given, otherwise coloured initials.
export function Avatar({ name = '', src, size = 36, className = '' }) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?';
  const style = { width: size, height: size };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={style}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <span
      style={style}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-accent-100 font-semibold text-accent-800 ${className}`}
    >
      <span style={{ fontSize: size * 0.4 }}>{initials}</span>
    </span>
  );
}
