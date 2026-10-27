import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Check, X, Clock } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import { useCan } from '../../hooks/useCan.js';
import { getTodayDoses, updateDose } from '../../api/medicines.js';
import { Card } from '../ui/Card.jsx';
import { StatusChip } from '../ui/StatusChip.jsx';
import { Skeleton } from '../ui/Skeleton.jsx';
import { RevealGroup, Reveal } from '../ui/Reveal.jsx';

const DOSE_CHIP = { pending: 'pending', taken: 'normal', skipped: 'review', missed: 'failed' };
const time = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export function TodayDoses() {
  const { currentProfileId } = useProfile();
  const { socket } = useSocket();
  const canAct = useCan('logDose');
  const [doses, setDoses] = useState(null);

  const load = useCallback(async () => {
    if (!currentProfileId) return;
    try {
      setDoses(await getTodayDoses(currentProfileId));
    } catch {
      setDoses([]);
    }
  }, [currentProfileId]);

  useEffect(() => {
    setDoses(null);
    load();
  }, [load]);

  useEffect(() => {
    if (!socket) return undefined;
    const onUpdate = (d) =>
      setDoses((prev) => (prev ? prev.map((x) => (x._id === d._id ? { ...x, status: d.status } : x)) : prev));
    socket.on('dose:update', onUpdate);
    return () => socket.off('dose:update', onUpdate);
  }, [socket]);

  const act = async (id, status) => {
    try {
      const updated = await updateDose(id, status);
      setDoses((prev) => prev.map((x) => (x._id === id ? { ...x, status: updated.status } : x)));
    } catch (e) {
      toast.error(e.message || 'Could not update dose');
    }
  };

  if (doses === null) return <Skeleton className="h-28 w-full rounded-2xl" />;

  const takenCount = doses.filter((d) => d.status === 'taken').length;

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-ink-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-50 text-accent-700 ring-1 ring-accent-100">
            <Clock className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="font-semibold">Today&apos;s doses</h3>
        </div>
        {doses.length > 0 && (
          <span className="tabular rounded-full bg-ink-50 px-2.5 py-1 text-xs font-semibold text-ink-500 ring-1 ring-inset ring-ink-200/70">
            {takenCount} / {doses.length} taken
          </span>
        )}
      </div>
      {doses.length === 0 ? (
        <p className="text-sm text-ink-500">No doses scheduled for today.</p>
      ) : (
        <RevealGroup as="ul" className="-my-1 divide-y divide-ink-100">
          {doses.map((d) => (
            <Reveal as="li" key={d._id} className="flex items-center gap-3 py-2.5">
              <span className="tabular flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-sm font-semibold text-ink-700 ring-1 ring-inset ring-ink-100">
                {time(d.scheduledAt)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-900">{d.medicationId?.name || 'Medicine'}</p>
                {d.medicationId?.dose && <p className="text-xs text-ink-500">{d.medicationId.dose}</p>}
              </div>
              {d.status === 'pending' && canAct ? (
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => act(d._id, 'taken')} aria-label="Mark taken" className="rounded-lg bg-status-normal-bg p-2 text-status-normal ring-1 ring-inset ring-status-normal-border transition hover:brightness-95">
                    <Check className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => act(d._id, 'skipped')} aria-label="Skip" className="rounded-lg bg-ink-100 p-2 text-ink-500 transition hover:bg-ink-200">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <StatusChip status={DOSE_CHIP[d.status] || 'unknown'} label={d.status} />
              )}
            </Reveal>
          ))}
        </RevealGroup>
      )}
    </Card>
  );
}
