import { Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout.jsx';
import { FormField } from '../components/ui/FormField.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Button } from '../components/ui/Button.jsx';

// Placeholder — the working login form (validation + auth) is built in Step 4.
// Visually complete so the auth experience feels real.
export default function Login() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to your MediVault to pick up where you left off."
      footer={
        <>
          New to MediVault?{' '}
          <Link
            to="/register"
            className="font-semibold text-accent-700 underline-offset-4 hover:text-accent-800 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <FormField label="Email address" htmlFor="login-email">
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
              aria-hidden="true"
            />
            <Input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="pl-10"
            />
          </div>
        </FormField>

        <FormField label="Password" htmlFor="login-password">
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
              aria-hidden="true"
            />
            <Input
              id="login-password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="pl-10"
            />
          </div>
        </FormField>

        <div className="flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-sm text-ink-600">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-ink-300 text-accent-600 focus:ring-accent-500/40"
            />
            Remember me
          </label>
          <span className="text-sm font-medium text-accent-700">Forgot password?</span>
        </div>

        <Button type="submit" size="lg" className="w-full">
          Log in
        </Button>

        <p className="text-center text-xs leading-relaxed text-ink-400">
          Sign-in is wired up in the next build step.
        </p>
      </form>
    </AuthLayout>
  );
}
