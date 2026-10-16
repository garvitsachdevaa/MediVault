import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { SiteHeader } from '../components/layout/SiteHeader.jsx';
import { Footer } from '../components/layout/Footer.jsx';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <SiteHeader />

      <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
        <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,black,transparent)]" />
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-accent-100/60 blur-3xl" />

        <div className="relative max-w-md">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-accent-700 shadow-card ring-1 ring-ink-200/70">
            <Compass className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-accent-600">
            Error 404
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            This page took a detour
          </h1>
          <p className="mt-3 text-base leading-relaxed text-ink-600">
            The page you are looking for doesn&apos;t exist or has moved. Your records are safe —
            let&apos;s get you back.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/">
              <Button size="lg" className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
