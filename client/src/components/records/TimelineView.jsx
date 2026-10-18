import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Pill, Activity, HeartPulse, CalendarDays, MessageSquare, Search } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext.jsx';
import { getTimeline } from '../../api/timeline.js';
import { Card } from '../ui/Card.jsx';
import { Input } from '../ui/Input.jsx';
import { Button } from '../ui/Button.jsx';
import { Skeleton } from '../ui/Skeleton.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';

const TYPES = [
  { v: '', l: 'All' },
  { v: 'prescription', l: 'Prescriptions' },
  { v: 'lab_result', l: 'Lab results' },
  { v: 'home_reading', l: 'Home readings' },
  { v: 'visit', l: 'Visits' },
  { v: 'doctor_note', l: 'Doctor notes' },
];

const ICON = {
  document: FileText,
  prescription: Pill,
  lab_result: Activity,
  home_reading: HeartPulse,
  visit: CalendarDays,
  doctor_note: MessageSquare,
};

const monthKey = (d) => new Date(d).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

export function TimelineView() {
  const { currentProfileId } = useProfile();
  const navigate = useNavigate();
  const [events, setEvents] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [type, setType] = useState('');
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(
    async (reset = true) => {
      if (!currentProfileId) return;
      const params = {};
      if (type) params.type = type;
      if (debouncedQ) params.q = debouncedQ;
      if (!reset && cursor) params.cursor = cursor;
      try {
        const data = await getTimeline(currentProfileId, params);
        setEvents((prev) => (reset || !prev ? data.events : [...prev, ...data.events]));
        setCursor(data.nextCursor);
      } catch {
        setEvents([]);
      }
    },
    [currentProfileId, type, debouncedQ, cursor]
  );

  // Reset + reload when filters change.
  useEffect(() => {
    setEvents(null);
    setCursor(null);
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProfileId, type, debouncedQ]);

  const more = async () => {
    setLoadingMore(true);
    await load(false);
    setLoadingMore(false);
  };

  const open = (e) => {
    if ((e.type === 'document' || e.type === 'lab_result') && e.refId) {
      navigate(`/app/records/documents/${e.refId}`);
    }
  };

  // Group by month preserving order.
  const groups = [];
  (events || []).forEach((e) => {
    const k = monthKey(e.occurredAt);
    let g = groups.find((x) => x.key === k);
    if (!g) {
      g = { key: k, items: [] };
      groups.push(g);
    }
    g.items.push(e);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search medicines, tests, doctors…" className="pl-9" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t.v}
            type="button"
            onClick={() => setType(t.v)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              type === t.v ? 'bg-accent-600 text-white' : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-50'
            }`}
          >
            {t.l}
          </button>
        ))}
      </div>

      {events === null ? (
        <Skeleton className="h-40 w-full rounded-2xl" />
      ) : events.length === 0 ? (
        <EmptyState icon={CalendarDays} title="Nothing here yet" message="Confirmed documents, readings and visits appear on this timeline." />
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g.key}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">{g.key}</p>
              <Card className="divide-y divide-ink-100 p-0">
                {g.items.map((e) => {
                  const Icon = ICON[e.type] || FileText;
                  const clickable = (e.type === 'document' || e.type === 'lab_result') && e.refId;
                  return (
                    <button
                      key={e._id}
                      type="button"
                      onClick={() => open(e)}
                      disabled={!clickable}
                      className={`flex w-full items-start gap-3 px-5 py-3.5 text-left ${clickable ? 'hover:bg-ink-50' : 'cursor-default'}`}
                    >
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink-900">{e.title}</p>
                        {e.subtitle && <p className="truncate text-sm text-ink-500">{e.subtitle}</p>}
                      </div>
                      <span className="shrink-0 text-xs text-ink-400">{new Date(e.occurredAt).toLocaleDateString()}</span>
                    </button>
                  );
                })}
              </Card>
            </div>
          ))}
          {cursor && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={more} loading={loadingMore}>Load more</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
