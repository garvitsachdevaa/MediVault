import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card.jsx';
import { Footer } from '../components/layout/Footer.jsx';

// Placeholder — the working login form is built in Step 4.
export default function Login() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <Card className="w-full max-w-sm text-center">
          <Link to="/" className="text-lg font-bold text-accent">
            MediVault
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Log in</h1>
          <p className="mt-2 text-sm text-slate-500">The sign-in form arrives in the next step.</p>
          <p className="mt-6 text-sm text-slate-600">
            New here?{' '}
            <Link to="/register" className="font-medium text-accent hover:underline">
              Create an account
            </Link>
          </p>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
