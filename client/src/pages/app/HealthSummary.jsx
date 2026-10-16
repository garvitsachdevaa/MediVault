import { useEffect, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { ShieldAlert, Stethoscope, Syringe, Pill, Activity, Plus, Pencil, Trash2, Camera } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext.jsx';
import { useCan } from '../../hooks/useCan.js';
import * as profilesApi from '../../api/profiles.js';
import { Card } from '../../components/ui/Card.jsx';
import { Avatar } from '../../components/ui/Avatar.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { FormField } from '../../components/ui/FormField.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';

const SECTIONS = [
  {
    key: 'allergies',
    title: 'Allergies',
    icon: ShieldAlert,
    addLabel: 'Add allergy',
    fields: [
      { name: 'name', label: 'Allergen', required: true, placeholder: 'e.g. Penicillin' },
      { name: 'reaction', label: 'Reaction', placeholder: 'e.g. Rash' },
      { name: 'notes', label: 'Notes' },
    ],
    secondary: (it) => [it.reaction, it.notes].filter(Boolean).join(' · '),
  },
  {
    key: 'conditions',
    title: 'Conditions',
    icon: Stethoscope,
    addLabel: 'Add condition',
    fields: [
      { name: 'name', label: 'Condition', required: true, placeholder: 'e.g. Type 2 Diabetes' },
      { name: 'since', label: 'Since', placeholder: 'e.g. 2019' },
      { name: 'notes', label: 'Notes' },
    ],
    secondary: (it) => [it.since ? `Since ${it.since}` : '', it.notes].filter(Boolean).join(' · '),
  },
  {
    key: 'immunisations',
    title: 'Immunisations',
    icon: Syringe,
    addLabel: 'Add immunisation',
    fields: [
      { name: 'name', label: 'Vaccine', required: true, placeholder: 'e.g. Tetanus' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'notes', label: 'Notes' },
    ],
    secondary: (it) =>
      [it.date ? new Date(it.date).toLocaleDateString() : '', it.notes].filter(Boolean).join(' · '),
  },
];

function ageFrom(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
}

// Add/edit a single list item.
function ItemModal({ open, section, initial, onClose, onSave }) {
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !section) return;
    const base = {};
    section.fields.forEach((f) => {
      let v = initial?.[f.name] ?? '';
      if (f.type === 'date' && v) v = String(v).slice(0, 10);
      base[f.name] = v;
    });
    setDraft(base);
    setError('');
  }, [open, section, initial]);

  if (!section) return null;

  const update = (name, value) => setDraft((d) => ({ ...d, [name]: value }));

  const save = async () => {
    if (!draft.name?.trim()) return setError('Name is required');
    setSaving(true);
    try {
      await onSave(draft);
      onClose();
    } catch (e) {
      setError(e.message || 'Could not save');
    } finally {
      setSaving(false);
    }
    return undefined;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? `Edit ${section.title.toLowerCase().replace(/s$/, '')}` : section.addLabel}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div role="alert" className="rounded-xl border border-status-danger-border bg-status-danger-bg/60 px-3.5 py-2.5 text-sm text-status-danger">
            {error}
          </div>
        )}
        {section.fields.map((f) => (
          <FormField key={f.name} label={f.label} htmlFor={`fld-${f.name}`}>
            <Input
              id={`fld-${f.name}`}
              type={f.type || 'text'}
              value={draft[f.name] ?? ''}
              placeholder={f.placeholder}
              onChange={(e) => update(f.name, e.target.value)}
            />
          </FormField>
        ))}
      </div>
    </Modal>
  );
}

function ListSection({ section, items, canEdit, onAdd, onEdit, onDelete }) {
  const { icon: Icon } = section;
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-ink-900">
          <Icon className="h-5 w-5 text-accent-600" aria-hidden="true" />
          <h3 className="font-semibold">{section.title}</h3>
        </div>
        {canEdit && (
          <Button variant="subtle" size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-ink-500">None recorded.</p>
      ) : (
        <ul className="divide-y divide-ink-100">
          {items.map((it, i) => {
            const secondary = section.secondary(it);
            return (
              <li key={it._id || i} className="flex items-start gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink-900">{it.name}</p>
                  {secondary && <p className="text-sm text-ink-500">{secondary}</p>}
                </div>
                {canEdit && (
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(i)}
                      className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                      aria-label={`Edit ${it.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(i)}
                      className="rounded-lg p-1.5 text-ink-400 hover:bg-status-danger-bg hover:text-status-danger"
                      aria-label={`Delete ${it.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

export default function HealthSummary() {
  const { currentProfileId, refresh } = useProfile();
  const canEdit = useCan('edit');

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editor, setEditor] = useState(null); // { section, index }
  const [deleting, setDeleting] = useState(null); // { section, index }
  const [removing, setRemoving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef(null);

  const load = useCallback(async () => {
    if (!currentProfileId) return;
    setLoading(true);
    setError('');
    try {
      const data = await profilesApi.getSummary(currentProfileId);
      setProfile(data.profile);
    } catch (e) {
      setError(e.message || 'Could not load the summary');
    } finally {
      setLoading(false);
    }
  }, [currentProfileId]);

  useEffect(() => {
    setProfile(null);
    load();
  }, [load]);

  const saveItem = async (sectionKey, index, item) => {
    const list = [...(profile[sectionKey] || [])];
    if (index == null) list.push(item);
    else list[index] = { ...list[index], ...item };
    const updated = await profilesApi.updateSummary(currentProfileId, { [sectionKey]: list });
    setProfile(updated);
    toast.success('Saved');
  };

  const onPhotoPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const updated = await profilesApi.uploadProfilePhoto(currentProfileId, file);
      setProfile(updated);
      refresh(); // update the avatar in the profile switcher too
      toast.success('Photo updated');
    } catch (err) {
      toast.error(err.message || 'Could not upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const deleteItem = async () => {
    const { section, index } = deleting;
    setRemoving(true);
    try {
      const list = (profile[section.key] || []).filter((_, i) => i !== index);
      const updated = await profilesApi.updateSummary(currentProfileId, { [section.key]: list });
      setProfile(updated);
      toast.success('Removed');
      setDeleting(null);
    } catch (e) {
      toast.error(e.message || 'Could not remove');
    } finally {
      setRemoving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!profile) return null;

  const age = ageFrom(profile.dateOfBirth);
  const headerLine = [
    profile.relation,
    age != null ? `${age} yrs` : null,
    profile.bloodGroup ? `Blood group ${profile.bloodGroup}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-ink-900">Health Summary</h1>

      <Card className="flex items-center gap-4">
        <div className="relative shrink-0">
          <Avatar name={profile.name} src={profile.photoUrl} size={64} />
          {canEdit && (
            <>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={onPhotoPick}
              />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                aria-label="Change photo"
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-600 shadow-sm hover:bg-ink-50 disabled:opacity-60"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold text-ink-900">{profile.name}</h2>
          {headerLine && <p className="text-sm capitalize text-ink-500">{headerLine}</p>}
        </div>
      </Card>

      {SECTIONS.map((section) => (
        <ListSection
          key={section.key}
          section={section}
          items={profile[section.key] || []}
          canEdit={canEdit}
          onAdd={() => setEditor({ section, index: null })}
          onEdit={(i) => setEditor({ section, index: i })}
          onDelete={(i) => setDeleting({ section, index: i })}
        />
      ))}

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2 text-ink-900">
            <Pill className="h-5 w-5 text-accent-600" aria-hidden="true" />
            <h3 className="font-semibold">Current medicines</h3>
          </div>
          <EmptyState title="Nothing yet" message="Appear after you confirm a prescription." />
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-ink-900">
            <Activity className="h-5 w-5 text-accent-600" aria-hidden="true" />
            <h3 className="font-semibold">Key results</h3>
          </div>
          <EmptyState title="Nothing yet" message="Appear after you confirm a lab report." />
        </Card>
      </div>

      <ItemModal
        open={!!editor}
        section={editor?.section}
        initial={editor?.index != null ? profile[editor.section.key][editor.index] : null}
        onClose={() => setEditor(null)}
        onSave={(item) => saveItem(editor.section.key, editor.index, item)}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={deleteItem}
        loading={removing}
        title="Remove entry?"
        message={deleting ? `Remove "${profile[deleting.section.key][deleting.index]?.name}"?` : ''}
        confirmLabel="Remove"
      />
    </div>
  );
}
