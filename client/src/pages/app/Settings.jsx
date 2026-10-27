import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Camera, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useProfile } from '../../context/ProfileContext.jsx';
import { useCan } from '../../hooks/useCan.js';
import * as authApi from '../../api/auth.js';
import * as profilesApi from '../../api/profiles.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { FormField } from '../../components/ui/FormField.jsx';
import { Avatar } from '../../components/ui/Avatar.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { RevealGroup, Reveal } from '../../components/ui/Reveal.jsx';

export default function Settings() {
  const { user, setUser } = useAuth();
  const { currentProfile, refresh, selectProfile } = useProfile();
  const canDelete = useCan('deleteProfile');
  const navigate = useNavigate();
  const photoRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const saveName = async (e) => {
    e.preventDefault();
    setSavingName(true);
    try {
      const { user: u } = await authApi.updateMe({ name: name.trim() });
      setUser(u);
      toast.success('Name updated');
    } catch (err) {
      toast.error(err.message || 'Could not update');
    } finally {
      setSavingName(false);
    }
  };

  const onPhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const { user: u } = await authApi.uploadMyPhoto(file);
      setUser(u);
      toast.success('Photo updated');
    } catch (err) {
      toast.error(err.message || 'Could not upload photo');
    }
  };

  const savePw = async (e) => {
    e.preventDefault();
    if (pw.newPassword.length < 8) return toast.error('New password must be at least 8 characters');
    setSavingPw(true);
    try {
      await authApi.changePassword(pw);
      setPw({ currentPassword: '', newPassword: '' });
      toast.success('Password changed');
    } catch (err) {
      toast.error(err.message || 'Could not change password');
    } finally {
      setSavingPw(false);
    }
    return undefined;
  };

  const del = async () => {
    setDeleting(true);
    try {
      await profilesApi.deleteProfile(currentProfile._id);
      toast.success('Profile deleted');
      selectProfile(null);
      await refresh();
      navigate('/app');
    } catch (err) {
      toast.error(err.message || 'Could not delete');
      setDeleting(false);
      setDelOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Profile & security"
        icon={SlidersHorizontal}
        title="Account"
        accent="settings"
        subtitle="Update your name and photo, change your password, and manage this profile's data."
      />

      <RevealGroup className="space-y-6">
      <Reveal>
      <Card className="space-y-4">
        <h3 className="font-semibold text-ink-900">Account</h3>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar name={user?.name} src={user?.photoUrl} size={56} />
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
            <button
              type="button"
              onClick={() => photoRef.current?.click()}
              aria-label="Change photo"
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-600 shadow-sm hover:bg-ink-50"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-sm text-ink-500">{user?.email}</p>
        </div>
        <form className="flex items-end gap-2" onSubmit={saveName}>
          <div className="flex-1">
            <FormField label="Name" htmlFor="s-name"><Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} /></FormField>
          </div>
          <Button type="submit" loading={savingName}>Save</Button>
        </form>
      </Card>
      </Reveal>

      <Reveal>
      <Card className="space-y-4">
        <h3 className="font-semibold text-ink-900">Change password</h3>
        <form className="space-y-3" onSubmit={savePw}>
          <FormField label="Current password" htmlFor="s-cp">
            <Input id="s-cp" type="password" value={pw.currentPassword} onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))} />
          </FormField>
          <FormField label="New password" htmlFor="s-np" hint="At least 8 characters, with a letter and a number.">
            <Input id="s-np" type="password" value={pw.newPassword} onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))} />
          </FormField>
          <Button type="submit" loading={savingPw}>Change password</Button>
        </form>
      </Card>
      </Reveal>

      {canDelete && (
        <Reveal>
        <Card className="space-y-3 border-status-danger-border">
          <h3 className="font-semibold text-status-danger">Danger zone</h3>
          <p className="text-sm text-ink-600">
            Deleting <span className="font-medium">{currentProfile?.name}</span> permanently removes all its documents,
            medicines, results, and files. This cannot be undone.
          </p>
          <Button variant="danger" onClick={() => setDelOpen(true)}>Delete this profile</Button>
        </Card>
        </Reveal>
      )}
      </RevealGroup>

      <ConfirmDialog
        open={delOpen}
        onClose={() => setDelOpen(false)}
        onConfirm={del}
        loading={deleting}
        title="Delete this profile?"
        message="All data and files for this profile will be permanently deleted."
        confirmLabel="Delete profile"
        requireText={currentProfile?.name}
      />
    </div>
  );
}
