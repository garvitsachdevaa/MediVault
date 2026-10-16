import { Link } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout.jsx';
import { FormField } from '../components/ui/FormField.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Button } from '../components/ui/Button.jsx';

// Placeholder — the working registration form (validation + auth) is built in
// Step 4. Visually complete so the sign-up experience feels real.
export default function Register() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start a private, patient-owned record for you and your family."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-accent-700 underline-offset-4 hover:text-accent-800 hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <FormField label="Full name" htmlFor="register-name">
          <div className="relative">
            <User
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
              aria-hidden="true"
            />
            <Input
              id="register-name"
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Jane Doe"
              className="pl-10"
            />
          </div>
        </FormField>

        <FormField label="Email address" htmlFor="register-email">
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
              aria-hidden="true"
            />
            <Input
              id="register-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="pl-10"
            />
          </div>
        </FormField>

        <FormField
          label="Password"
          htmlFor="register-password"
          hint="At least 8 characters."
        >
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
              aria-hidden="true"
            />
            <Input
              id="register-password"
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="Create a password"
              className="pl-10"
            />
          </div>
        </FormField>

        <Button type="submit" size="lg" className="w-full">
          Create account
        </Button>

        <p className="text-center text-xs leading-relaxed text-ink-400">
          By continuing you agree that MediVault is not medical advice. Account creation is wired up
          in the next build step.
        </p>
      </form>
    </AuthLayout>
  );
}
