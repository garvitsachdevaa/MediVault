import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useProfile } from '../../context/ProfileContext.jsx';
import { Modal } from '../ui/Modal.jsx';
import { FormField } from '../ui/FormField.jsx';
import { Input } from '../ui/Input.jsx';
import { Select } from '../ui/Select.jsx';
import { Button } from '../ui/Button.jsx';

const RELATIONS = ['self', 'mother', 'father', 'child', 'spouse', 'other'];
const EMPTY = { name: '', relation: 'other', dateOfBirth: '', bloodGroup: '' };

export function AddProfileModal({ open, onClose }) {
  const { addProfile } = useProfile();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setError('');
    }
  }, [open]);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Name is required');
    setSaving(true);
    setError('');
    try {
      await addProfile({ ...form, name: form.name.trim() });
      toast.success('Profile added');
      onClose();
    } catch (err) {
      setError(err.message || 'Could not add profile');
    } finally {
      setSaving(false);
    }
    return undefined;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add a family profile"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} loading={saving}>
            Add profile
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={submit} noValidate>
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-status-danger-border bg-status-danger-bg/60 px-3.5 py-2.5 text-sm text-status-danger"
          >
            {error}
          </div>
        )}
        <FormField label="Full name" htmlFor="ap-name">
          <Input id="ap-name" name="name" value={form.name} onChange={update} placeholder="e.g. Mom" />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Relation" htmlFor="ap-rel">
            <Select id="ap-rel" name="relation" value={form.relation} onChange={update}>
              {RELATIONS.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Blood group" htmlFor="ap-bg">
            <Input id="ap-bg" name="bloodGroup" value={form.bloodGroup} onChange={update} placeholder="e.g. O+" />
          </FormField>
        </div>
        <FormField label="Date of birth" htmlFor="ap-dob">
          <Input id="ap-dob" type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={update} />
        </FormField>
      </form>
    </Modal>
  );
}
