import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Copy, UserPlus, Trash2 } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext.jsx';
import { useCan } from '../../hooks/useCan.js';
import * as profilesApi from '../../api/profiles.js';
import { Card } from '../../components/ui/Card.jsx';
import { Avatar } from '../../components/ui/Avatar.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { FormField } from '../../components/ui/FormField.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';
import { RevealGroup, Reveal } from '../../components/ui/Reveal.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';

function RoleChip({ role }) {
  return (
    <span className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium capitalize text-ink-600">
      {role}
    </span>
  );
}

export default function Family() {
  const { currentProfile, currentProfileId } = useProfile();
  const canManage = useCan('manageMembers');

  const [members, setMembers] = useState(null);
  const [invite, setInvite] = useState({ email: '', role: 'viewer' });
  const [inviteLink, setInviteLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removing, setRemoving] = useState(false);

  const load = useCallback(async () => {
    if (!currentProfileId) return;
    try {
      setMembers(await profilesApi.listMembers(currentProfileId));
    } catch (e) {
      toast.error(e.message || 'Could not load members');
    }
  }, [currentProfileId]);

  useEffect(() => {
    setMembers(null);
    setInviteLink('');
    load();
  }, [load]);

  const changeRole = async (userId, role) => {
    try {
      await profilesApi.updateMemberRole(currentProfileId, userId, role);
      toast.success('Role updated');
      load();
    } catch (e) {
      toast.error(e.message || 'Could not update role');
    }
  };

  const doRemove = async () => {
    setRemoving(true);
    try {
      await profilesApi.removeMember(currentProfileId, removeTarget.user._id);
      toast.success('Member removed');
      setRemoveTarget(null);
      load();
    } catch (e) {
      toast.error(e.message || 'Could not remove member');
    } finally {
      setRemoving(false);
    }
  };

  const sendInvite = async (e) => {
    e.preventDefault();
    if (!invite.email.trim()) return;
    setBusy(true);
    setInviteLink('');
    try {
      const res = await profilesApi.createInvite(currentProfileId, {
        email: invite.email.trim(),
        role: invite.role,
      });
      setInviteLink(res.inviteLink);
      setInvite({ email: '', role: 'viewer' });
      toast.success('Invite created');
    } catch (err) {
      toast.error(err.message || 'Could not create invite');
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success('Link copied');
    } catch {
      toast.error('Could not copy — select and copy manually');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Access & sharing"
        title="Family"
        accent="& access"
        subtitle={
          <>
            Who can see and manage{' '}
            <span className="font-semibold text-ink-700">{currentProfile?.name}</span>&apos;s record.
          </>
        }
      />

      <Card className="space-y-4">
        <h3 className="font-semibold text-ink-900">Members</h3>
        {members === null ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <RevealGroup className="divide-y divide-ink-100">
          {members.map((m) => (
            <Reveal as="div" key={m._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <Avatar name={m.user?.name} src={m.user?.photoUrl} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-900">{m.user?.name}</p>
                <p className="truncate text-xs text-ink-500">{m.user?.email}</p>
              </div>
              {canManage ? (
                <div className="flex items-center gap-2">
                  <Select
                    value={m.role}
                    onChange={(e) => changeRole(m.user._id, e.target.value)}
                    className="w-32"
                    aria-label={`Role for ${m.user?.name}`}
                  >
                    <option value="owner">Owner</option>
                    <option value="caregiver">Caregiver</option>
                    <option value="viewer">Viewer</option>
                  </Select>
                  <button
                    type="button"
                    onClick={() => setRemoveTarget(m)}
                    className="rounded-lg p-2 text-ink-400 hover:bg-status-danger-bg hover:text-status-danger"
                    aria-label={`Remove ${m.user?.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <RoleChip role={m.role} />
              )}
            </Reveal>
          ))}
          </RevealGroup>
        )}
      </Card>

      {canManage && (
        <Card className="space-y-4">
          <div>
            <h3 className="font-semibold text-ink-900">Invite someone</h3>
            <p className="mt-0.5 text-sm text-ink-500">
              They must log in or register with the invited email to accept.
            </p>
          </div>
          <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={sendInvite}>
            <div className="flex-1">
              <FormField label="Email" htmlFor="inv-email">
                <Input
                  id="inv-email"
                  type="email"
                  value={invite.email}
                  onChange={(e) => setInvite((v) => ({ ...v, email: e.target.value }))}
                  placeholder="person@example.com"
                />
              </FormField>
            </div>
            <FormField label="Role" htmlFor="inv-role">
              <Select
                id="inv-role"
                value={invite.role}
                onChange={(e) => setInvite((v) => ({ ...v, role: e.target.value }))}
                className="sm:w-36"
              >
                <option value="viewer">Viewer</option>
                <option value="caregiver">Caregiver</option>
                <option value="owner">Owner</option>
              </Select>
            </FormField>
            <Button type="submit" loading={busy}>
              <UserPlus className="h-4 w-4" />
              Invite
            </Button>
          </form>

          {inviteLink && (
            <div className="rounded-xl border border-ink-200 bg-ink-50 p-3">
              <p className="text-xs font-medium text-ink-500">
                Share this one-time link with the person:
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 truncate rounded-lg bg-white px-2.5 py-1.5 text-xs text-ink-700 ring-1 ring-ink-200">
                  {inviteLink}
                </code>
                <Button variant="outline" size="sm" onClick={copyLink}>
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={doRemove}
        loading={removing}
        title="Remove member?"
        message={`Remove ${removeTarget?.user?.name} from this profile? They will lose all access.`}
        confirmLabel="Remove"
      />
    </div>
  );
}
