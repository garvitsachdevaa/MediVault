import { EmptyState } from '../ui/EmptyState.jsx';

// Shared "coming soon" tab body. Each feature step replaces its page with the
// real implementation.
export function PlaceholderTab({ icon, title, message }) {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight text-ink-900">{title}</h1>
      <EmptyState icon={icon} title="Coming soon" message={message} />
    </div>
  );
}
