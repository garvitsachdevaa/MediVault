import { useState } from 'react';
import toast from 'react-hot-toast';
import { useProfile } from '../../context/ProfileContext.jsx';
import { Logo } from '../brand/Logo.jsx';
import { Card } from '../ui/Card.jsx';
import { FormField } from '../ui/FormField.jsx';
import { Input } from '../ui/Input.jsx';
import { Select } from '../ui/Select.jsx';
import { Button } from '../ui/Button.jsx';
import { Footer } from '../layout/Footer.jsx';

const RELATIONS = ['self', 'mother', 'father', 'child', 'spouse', 'other'];

// First-run screen shown when the user has no profiles yet.
export function CreateProfileForm() {
  const { addProfile } = useProfile();
  const [form, setForm] = useState({ name: '', relation: 'self', dateOfBirth: '', bloodGroup: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Name is required');
    setSaving(true);
    setError('');
    try {
      await addProfile({ ...form, name: form.name.trim() });
      toast.success('Profile created');
    } catch (err) {
      setError(err.message || 'Could not create profile');
    } finally {
      setSaving(false);
    }
    return undefined;
  };

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md">
          <div className="mb-6 flex flex-col items-center text-center">
            <Logo size={30} />
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink-900">Create your profile</h1>
            <p className="mt-1.5 text-sm text-ink-500">
              This is your own health profile. You can add family members later.
            </p>
          </div>
          <form className="space-y-4" onSubmit={submit} noValidate>
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-status-danger-border bg-status-danger-bg/60 px-3.5 py-2.5 text-sm text-status-danger"
              >
                {error}
              </div>
            )}
            <FormField label="Full name" htmlFor="cp-name">
              <Input id="cp-name" name="name" value={form.name} onChange={update} placeholder="Your name" />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Relation" htmlFor="cp-rel">
                <Select id="cp-rel" name="relation" value={form.relation} onChange={update}>
                  {RELATIONS.map((r) => (
                    <option key={r} value={r} className="capitalize">
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Blood group" htmlFor="cp-bg">
                <Input id="cp-bg" name="bloodGroup" value={form.bloodGroup} onChange={update} placeholder="e.g. O+" />
              </FormField>
            </div>
            <FormField label="Date of birth" htmlFor="cp-dob">
              <Input id="cp-dob" type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={update} />
            </FormField>
            <Button type="submit" size="lg" className="w-full" loading={saving}>
              Create profile
            </Button>
          </form>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
