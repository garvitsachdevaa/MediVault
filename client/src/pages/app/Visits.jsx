import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Share2, Link as LinkIcon, Eye } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext.jsx';
import { useCan } from '../../hooks/useCan.js';
import * as visitsApi from '../../api/visits.js';
import * as sharesApi from '../../api/shares.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { FormField } from '../../components/ui/FormField.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { StatusChip } from '../../components/ui/StatusChip.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';
import { ShareBuilder } from '../../components/shares/ShareBuilder.jsx';

function VisitModal({ open, visit, profileId, onClose, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) {
      setForm(
        visit
          ? {
              doctorName: visit.doctorName || '',
              speciality: visit.speciality || '',
              date: visit.date ? visit.date.slice(0, 10) : '',
              reason: visit.reason || '',
              notes: visit.notes || '',
            }
          : { doctorName: '', speciality: '', date: '', reason: '', notes: '' }
      );
    }
  }, [open, visit]);
  const up = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const save = async () => {
    if (!form.date) return toast.error('A date is required');
    setSaving(true);
    try {
      if (visit) await visitsApi.updateVisit(visit._id, form);
      else await visitsApi.createVisit(profileId, form);
      toast.success('Saved');
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e.message || 'Could not save');
    } finally {
      setSaving(false);
    }
    return undefined;
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={visit ? 'Edit visit' : 'Add a visit'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} loading={saving}>Save</Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Doctor" htmlFor="v-doc"><Input id="v-doc" name="doctorName" value={form.doctorName || ''} onChange={up} /></FormField>
          <FormField label="Speciality" htmlFor="v-spec"><Input id="v-spec" name="speciality" value={form.speciality || ''} onChange={up} /></FormField>
        </div>
        <FormField label="Date" htmlFor="v-date"><Input id="v-date" type="date" name="date" value={form.date || ''} onChange={up} /></FormField>
        <FormField label="Reason" htmlFor="v-reason"><Input id="v-reason" name="reason" value={form.reason || ''} onChange={up} /></FormField>
        <FormField label="Notes" htmlFor="v-notes"><Input id="v-notes" name="notes" value={form.notes || ''} onChange={up} /></FormField>
      </div>
    </Modal>
  );
}

function VisitsTab({ onPrepare }) {
  const { currentProfileId } = useProfile();
  const canEdit = useCan('edit');
  const [visits, setVisits] = useState(null);
  const [edit, setEdit] = useState(undefined); // undefined=closed, null=new, obj=edit
  const [del, setDel] = useState(null);

  const load = useCallback(async () => {
    if (!currentProfileId) return;
    try {
      setVisits(await visitsApi.listVisits(currentProfileId));
    } catch {
      setVisits([]);
    }
  }, [currentProfileId]);
  useEffect(() => {
    setVisits(null);
    load();
  }, [load]);

  if (visits === null) return <Skeleton className="h-40 w-full rounded-2xl" />;

  const now = Date.now();
  const upcoming = visits.filter((v) => new Date(v.date).getTime() >= now);
  const past = visits.filter((v) => new Date(v.date).getTime() < now);

  const VisitCard = (v) => (
    <Card key={v._id} className="space-y-1.5">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-ink-900">{v.doctorName || 'Doctor visit'}</p>
          <p className="text-sm text-ink-500">{[v.speciality, new Date(v.date).toLocaleDateString()].filter(Boolean).join(' · ')}</p>
        </div>
        {canEdit && (
          <div className="flex gap-1">
            <button type="button" onClick={() => setEdit(v)} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
            <button type="button" onClick={() => setDel(v)} className="rounded-lg p-1.5 text-ink-400 hover:bg-status-danger-bg hover:text-status-danger" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
          </div>
        )}
      </div>
      {v.reason && <p className="text-sm text-ink-600">{v.reason}</p>}
      {canEdit && (
        <Button variant="outline" size="sm" className="mt-1" onClick={() => onPrepare()}>
          <Share2 className="h-4 w-4" /> Prepare for visit
        </Button>
      )}
    </Card>
  );

  return (
    <div className="space-y-5">
      {canEdit && (
        <Button size="sm" onClick={() => setEdit(null)}>
          <Plus className="h-4 w-4" /> Add visit
        </Button>
      )}
      {visits.length === 0 ? (
        <EmptyState icon={Share2} title="No visits yet" message="Add an appointment to track it and prepare a doctor summary." />
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Upcoming</p>
              <div className="grid gap-4 md:grid-cols-2">{upcoming.map(VisitCard)}</div>
            </div>
          )}
          {past.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Past</p>
              <div className="grid gap-4 md:grid-cols-2">{past.map(VisitCard)}</div>
            </div>
          )}
        </>
      )}

      <VisitModal open={edit !== undefined} visit={edit || null} profileId={currentProfileId} onClose={() => setEdit(undefined)} onSaved={load} />
      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={async () => {
          await visitsApi.deleteVisit(del._id);
          setDel(null);
          load();
        }}
        title="Delete visit?"
        message="This appointment will be removed."
        confirmLabel="Delete"
      />
    </div>
  );
}

function SharesTab({ onCreate }) {
  const { currentProfileId } = useProfile();
  const [shares, setShares] = useState(null);
  const load = useCallback(async () => {
    if (!currentProfileId) return;
    try {
      setShares(await sharesApi.listShares(currentProfileId));
    } catch {
      setShares([]);
    }
  }, [currentProfileId]);
  useEffect(() => {
    setShares(null);
    load();
  }, [load]);

  const revoke = async (id) => {
    try {
      await sharesApi.revokeShare(id);
      toast.success('Link revoked');
      load();
    } catch (e) {
      toast.error(e.message || 'Could not revoke');
    }
  };

  const chip = { active: 'verified', expired: 'pending', revoked: 'failed' };

  if (shares === null) return <Skeleton className="h-40 w-full rounded-2xl" />;
  return (
    <div className="space-y-4">
      <Button size="sm" onClick={onCreate}>
        <LinkIcon className="h-4 w-4" /> Create share link
      </Button>
      {shares.length === 0 ? (
        <EmptyState icon={Share2} title="No share links" message="Create an expiring, read-only link for a doctor." />
      ) : (
        <div className="space-y-3">
          {shares.map((s) => (
            <Card key={s._id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <StatusChip status={chip[s.status]} label={s.status} />
                  <span className="flex items-center gap-1 text-sm text-ink-500"><Eye className="h-3.5 w-3.5" /> {s.viewCount}</span>
                </div>
                <p className="mt-1 text-xs text-ink-500">
                  Expires {new Date(s.expiresAt).toLocaleDateString()} · {s.notes?.length || 0} note(s)
                </p>
              </div>
              {s.status === 'active' && (
                <Button variant="outline" size="sm" onClick={() => revoke(s._id)}>Revoke</Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Visits() {
  const { currentProfileId } = useProfile();
  const [tab, setTab] = useState('visits');
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderKey, setBuilderKey] = useState(0);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight text-ink-900">Visits</h1>
      <Tabs
        tabs={[{ value: 'visits', label: 'Visits' }, { value: 'shares', label: 'Share links' }]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'visits' ? (
        <VisitsTab onPrepare={() => setBuilderOpen(true)} />
      ) : (
        <SharesTab key={builderKey} onCreate={() => setBuilderOpen(true)} />
      )}

      <ShareBuilder
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        profileId={currentProfileId}
        onCreated={() => setBuilderKey((k) => k + 1)}
      />
    </div>
  );
}
