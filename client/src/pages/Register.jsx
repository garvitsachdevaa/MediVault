import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthLayout } from '../components/layout/AuthLayout.jsx';
import { FormField } from '../components/ui/FormField.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// Mirror the server rules so the user gets instant feedback before submitting.
function validate({ name, email, password }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Name is required';
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = 'Enter a valid email';
  if (password.length < 8) errors.password = 'At least 8 characters';
  else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    errors.password = 'Include a letter and a number';
  }
  return errors;
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/app';

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      toast.success('Account created!');
      navigate(from, { replace: true });
    } catch (err) {
      if (err.code === 'DUPLICATE') {
        setErrors({ email: 'That email is already in use' });
      } else if (err.code === 'VALIDATION_ERROR' && Array.isArray(err.details)) {
        const map = {};
        err.details.forEach((d) => {
          if (d.path) map[d.path] = d.message;
        });
        setErrors(map);
      } else {
        toast.error(err.message || 'Could not create your account.');
      }
    } finally {
      setSubmitting(false);
    }
  };

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
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <FormField label="Full name" htmlFor="register-name" error={errors.name}>
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
              value={form.name}
              onChange={update}
              invalid={!!errors.name}
            />
          </div>
        </FormField>

        <FormField label="Email address" htmlFor="register-email" error={errors.email}>
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
              value={form.email}
              onChange={update}
              invalid={!!errors.email}
            />
          </div>
        </FormField>

        <FormField
          label="Password"
          htmlFor="register-password"
          error={errors.password}
          hint={!errors.password ? 'At least 8 characters, with a letter and a number.' : undefined}
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
              value={form.password}
              onChange={update}
              invalid={!!errors.password}
            />
          </div>
        </FormField>

        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          Create account
        </Button>

        <p className="text-center text-xs leading-relaxed text-ink-400">
          By continuing you agree that MediVault is not medical advice.
        </p>
      </form>
    </AuthLayout>
  );
}
