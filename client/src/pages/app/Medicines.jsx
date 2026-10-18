import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Pill, Clock, StopCircle, Pencil } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext.jsx';
import { useCan } from '../../hooks/useCan.js';
import * as medsApi from '../../api/medicines.js';
import { TodayDoses } from '../../components/medicines/TodayDoses.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { FormField } from '../../components/ui/FormField.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';
import { StatusChip } from '../../components/ui/StatusChip.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';

const DOSE_CHIP = { pending: 'pending', taken: 'normal', skipped: 'review', missed: 'failed' };

function courseProgress(med) {
  if (!med.durationDays || !med.startDate) return null;
  const day = Math.floor((Date.now() - new Date(med.startDate).getTime()) / 86400000) + 1;
  return `Day ${Math.min(Math.max(day, 1), med.durationDays)} of ${med.durationDays}`;
}

function EditTimesModal({ open, med, onClose, onSaved }) {
  const [times, setTimes] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open && med) setTimes((med.timesOfDay || []).join(', '));
  }, [open, med]);
  const save = async () => {
    const parsed = times.split(',').map((t) => t.trim()).filter((t) => /^\d{1,2}:\d{2}$/.test(t));
    setSaving(true);
    try {
      await medsApi.updateMedication(med._id, { timesOfDay: parsed });
      toast.success('Reminder times updated');
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e.message || 'Could not update');
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit reminder times"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} loading={saving}>Save</Button>
        </>
      }
    >
      <FormField label="Times (24h, comma-separated)" htmlFor="times" hint="e.g. 09:00, 21:00">
        <Input id="times" value={times} onChange={(e) => setTimes(e.target.value)} placeholder="09:00, 21:00" />
      </FormField>
    </Modal>
  );
}

function HistoryDrawer({ open, med, onClose }) {
  const [doses, setDoses] = useState(null);
  useEffect(() => {
    if (!open || !med) return;
    setDoses(null);
    medsApi.getMedicationDoses(med._id).then(setDoses).catch(() => setDoses([]));
  }, [open, med]);
  const byDate = {};
  (doses || []).forEach((d) => {
    const k = new Date(d.scheduledAt).toLocaleDateString();
    (byDate[k] ||= []).push(d);
  });
  return (
    <Modal open={open} onClose={onClose} title={med ? `${med.name} — dose history` : ''}>
      {doses === null ? (
        <Skeleton className="h-24 w-full" />
      ) : doses.length === 0 ? (
        <p className="text-sm text-ink-500">No doses recorded yet.</p>
      ) : (
        <div className="max-h-[50vh] space-y-4 overflow-y-auto">
          {Object.entries(byDate).map(([date, list]) => (
            <div key={date}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">{date}</p>
              <ul className="space-y-1">
                {list.map((d) => (
                  <li key={d._id} className="flex items-center justify-between text-sm">
                    <span className="tabular text-ink-600">
                      {new Date(d.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <StatusChip status={DOSE_CHIP[d.status] || 'unknown'} label={d.status} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

export default function Medicines() {
  const { currentProfileId } = useProfile();
  const canManage = useCan('edit');
  const [tab, setTab] = useState('active');
  const [meds, setMeds] = useState(null);
  const [editMed, setEditMed] = useState(null);
  const [historyMed, setHistoryMed] = useState(null);
  const [stopMed, setStopMed] = useState(null);
  const [stopping, setStopping] = useState(false);

  const load = useCallback(async () => {
    if (!currentProfileId) return;
    try {
      setMeds(await medsApi.listMedications(currentProfileId, tab));
    } catch {
      setMeds([]);
    }
  }, [currentProfileId, tab]);

  useEffect(() => {
    setMeds(null);
    load();
  }, [load]);

  const stop = async () => {
    setStopping(true);
    try {
      await medsApi.updateMedication(stopMed._id, { status: 'stopped' });
      toast.success('Course stopped');
      setStopMed(null);
      load();
    } catch (e) {
      toast.error(e.message || 'Could not stop');
    } finally {
      setStopping(false);
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight text-ink-900">Medicines</h1>

      {tab === 'active' && <TodayDoses />}

      <Tabs
        tabs={[{ value: 'active', label: 'Active' }, { value: 'completed', label: 'Completed' }]}
        value={tab}
        onChange={setTab}
      />

      {meds === null ? (
        <Skeleton className="h-40 w-full rounded-2xl" />
      ) : meds.length === 0 ? (
        <EmptyState
          icon={Pill}
          title={tab === 'active' ? 'No active medicines' : 'No completed medicines'}
          message="Confirm a prescription to add medicines here."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {meds.map((m) => (
            <Card key={m._id} className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-ink-900">{m.name}</p>
                  <p className="text-sm text-ink-500">{[m.strength, m.dose].filter(Boolean).join(' · ')}</p>
                </div>
                {m.status !== 'active' && <StatusChip status="pending" label={m.status} />}
              </div>
              <p className="text-sm text-ink-600">{medsApi.FREQ_WORDS[m.frequencyCode] || m.frequencyCode}</p>
              {!m.asNeeded && m.timesOfDay?.length > 0 && (
                <p className="flex items-center gap-1.5 text-sm text-ink-500">
                  <Clock className="h-4 w-4" /> {m.timesOfDay.join(', ')}
                </p>
              )}
              {courseProgress(m) && <p className="text-xs font-medium text-accent-700">{courseProgress(m)}</p>}
              <div className="flex flex-wrap gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => setHistoryMed(m)}>History</Button>
                {canManage && m.status === 'active' && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setEditMed(m)}>
                      <Pencil className="h-4 w-4" /> Times
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setStopMed(m)}>
                      <StopCircle className="h-4 w-4" /> Stop
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <EditTimesModal open={!!editMed} med={editMed} onClose={() => setEditMed(null)} onSaved={load} />
      <HistoryDrawer open={!!historyMed} med={historyMed} onClose={() => setHistoryMed(null)} />
      <ConfirmDialog
        open={!!stopMed}
        onClose={() => setStopMed(null)}
        onConfirm={stop}
        loading={stopping}
        title="Stop this course?"
        message={stopMed ? `Stop ${stopMed.name}? No more reminders will be sent.` : ''}
        confirmLabel="Stop course"
      />
    </div>
  );
}
