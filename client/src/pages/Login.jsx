import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthLayout } from '../components/layout/AuthLayout.jsx';
import { FormField } from '../components/ui/FormField.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/app';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Could not log in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-status-danger-border bg-status-danger-bg/60 px-3.5 py-2.5 text-sm text-status-danger"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

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
              value={form.email}
              onChange={update}
              required
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
              value={form.password}
              onChange={update}
              required
            />
          </div>
        </FormField>

        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
}
