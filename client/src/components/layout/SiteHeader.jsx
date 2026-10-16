import { Link } from 'react-router-dom';
import { Button } from '../ui/Button.jsx';
import { Logo } from '../brand/Logo.jsx';

// Marketing / top-level header. Sticky, translucent, with a hairline base so it
// reads as a quiet frame rather than a heavy bar.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-ink-50/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link to="/" className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50">
          <Logo size={28} />
        </Link>
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm">Get started</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
