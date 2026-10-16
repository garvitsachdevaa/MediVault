import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import { Footer } from '../components/layout/Footer.jsx';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <p className="text-5xl font-bold text-accent">404</p>
        <h1 className="mt-4 text-xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          The page you are looking for does not exist.
        </p>
        <Link to="/" className="mt-6">
          <Button>Go home</Button>
        </Link>
      </main>
      <Footer />
    </div>
  );
}
