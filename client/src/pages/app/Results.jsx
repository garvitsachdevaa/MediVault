import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, animate, useReducedMotion } from 'motion/react';
import { TrendingUp, TrendingDown, Minus, Activity, Plus } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  Legend,
} from 'recharts';
import { useProfile } from '../../context/ProfileContext.jsx';
import { useCan } from '../../hooks/useCan.js';
import * as resultsApi from '../../api/results.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { StatusChip } from '../../components/ui/StatusChip.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { LogReadingModal } from '../../components/results/LogReadingModal.jsx';
import { RevealGroup, Reveal } from '../../components/ui/Reveal.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';

const TrendIcon = ({ trend }) => {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-ink-400" />;
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-ink-400" />;
  return <Minus className="h-4 w-4 text-ink-400" />;
};

// Gentle count-up for a latest lab value. Falls back to the raw value when it's
// non-numeric (e.g. "—") or when the user prefers reduced motion.
function CountUpValue({ value }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const num = typeof value === 'number' ? value : Number(value);
  const isNum = value != null && value !== '' && !Number.isNaN(num);

  useEffect(() => {
    if (!isNum || reduce) return undefined;
    const el = ref.current;
    if (!el) return undefined;
    // Integers count as whole numbers; decimals keep one place.
    const decimals = Number.isInteger(num) ? 0 : 1;
    const controls = animate(0, num, {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = v.toFixed(decimals);
      },
    });
    return () => controls.stop();
  }, [num, isNum, reduce]);

  if (!isNum) return <>{value ?? '—'}</>;
  return <span ref={ref}>{reduce ? num : 0}</span>;
}

const fmtDate = (d) => new Date(d).toLocaleDateString();

// A calm, branded tooltip that matches the design system (card + hairline),
// instead of the default recharts chrome.
function ChartTooltip({ active, payload, label, unit, displayName }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl border border-ink-200/80 bg-white px-3 py-2 shadow-lift">
      <p className="text-2xs font-medium uppercase tracking-wide text-ink-400">{fmtDate(label)}</p>
      <p className="mt-0.5 text-sm font-semibold text-ink-900">
        <span className="tabular">{p.value}</span>{' '}
        <span className="font-normal text-ink-500">{unit}</span>
      </p>
      <p className="text-2xs capitalize text-ink-400">
        {displayName} · {p.source}
      </p>
    </div>
  );
}

// Filled dot for lab values, hollow for home readings; red if out of range.
function PointDot({ cx, cy, payload }, refLow, refHigh) {
  if (cx == null || cy == null) return null;
  const v = payload.value;
  const out = (refLow != null && v < refLow) || (refHigh != null && v > refHigh);
  const color = out ? '#b91c1c' : '#0d8378';
  return (
    <circle cx={cx} cy={cy} r={4} fill={payload.source === 'home' ? '#ffffff' : color} stroke={color} strokeWidth={2} />
  );
}

export default function Results() {
  const { currentProfileId } = useProfile();
  const canLog = useCan('edit');
  const [tests, setTests] = useState(null);
  const [selected, setSelected] = useState('');
  const [series, setSeries] = useState(null);
  const [logOpen, setLogOpen] = useState(false);

  const loadTests = useCallback(async () => {
    if (!currentProfileId) return;
    try {
      const t = await resultsApi.getTests(currentProfileId);
      setTests(t);
      setSelected((s) => s || t[0]?.testCode || '');
    } catch {
      setTests([]);
    }
  }, [currentProfileId]);

  useEffect(() => {
    setTests(null);
    loadTests();
  }, [loadTests]);

  const loadSeries = useCallback(async () => {
    if (!currentProfileId || !selected) {
      setSeries(null);
      return;
    }
    try {
      setSeries(await resultsApi.getSeries(currentProfileId, selected));
    } catch {
      setSeries(null);
    }
  }, [currentProfileId, selected]);

  useEffect(() => {
    loadSeries();
  }, [loadSeries]);

  const refresh = () => {
    loadTests();
    loadSeries();
  };

  if (tests === null) return <Skeleton className="h-64 w-full rounded-2xl" />;

  const chartData = (series?.points || []).map((p) => ({
    t: new Date(p.takenAt).getTime(),
    value: p.value,
    source: p.source,
    flag: p.flag,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Lab & home readings"
        title="Results"
        subtitle="Watch your key lab values and home readings trend over time — pick a test to see its chart."
        actions={
          canLog ? (
            <Button size="sm" onClick={() => setLogOpen(true)}>
              <Plus className="h-4 w-4" /> Log a reading
            </Button>
          ) : null
        }
      />

      {tests.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No results yet"
          message="Confirm a lab report or log a home reading to see trends here."
          action={canLog ? <Button onClick={() => setLogOpen(true)}><Plus className="h-4 w-4" /> Log a reading</Button> : null}
        />
      ) : (
        <>
          <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tests.map((t) => {
              const active = selected === t.testCode;
              return (
                <Reveal
                  as="button"
                  key={t.testCode}
                  type="button"
                  onClick={() => setSelected(t.testCode)}
                  whileTap={{ scale: 0.98 }}
                  aria-pressed={active}
                  className={`group relative overflow-hidden rounded-2xl border p-5 text-left shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50 ${
                    active
                      ? 'border-accent-300 bg-gradient-to-br from-accent-50 via-white to-white ring-1 ring-accent-200'
                      : 'border-ink-200/70 bg-gradient-to-br from-ink-50/70 via-white to-white'
                  }`}
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-accent-200/20 blur-2xl transition-opacity group-hover:opacity-90"
                  />
                  <div className="relative flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-ink-600">{t.displayName}</span>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs ring-1 ${active ? 'ring-accent-100' : 'ring-ink-200'}`}>
                      <TrendIcon trend={t.trend} />
                    </span>
                  </div>
                  <div className="relative mt-3 flex items-end gap-1.5">
                    <span className="tabular font-display text-3xl font-extrabold tracking-tight text-ink-900">
                      <CountUpValue value={t.latest.value} />
                    </span>
                    <span className="pb-1 text-sm font-medium text-ink-500">{t.unit}</span>
                  </div>
                  <StatusChip status={t.latest.flag} size="sm" className="relative mt-2" />
                </Reveal>
              );
            })}
          </RevealGroup>

          {series && (
            <Reveal as="div" standalone key={selected}>
            <Card className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-ink-900">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-50 text-accent-700 ring-1 ring-accent-100">
                    <Activity className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-semibold">{series.displayName} trend</h3>
                </div>
                <Select value={selected} onChange={(e) => setSelected(e.target.value)} className="w-48">
                  {tests.map((t) => (
                    <option key={t.testCode} value={t.testCode}>{t.displayName}</option>
                  ))}
                </Select>
              </div>

              {chartData.length === 0 ? (
                <p className="text-sm text-ink-500">No data points yet.</p>
              ) : (
                <div className="h-72 w-full rounded-2xl bg-gradient-to-b from-ink-50/60 to-transparent p-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 12, right: 12, bottom: 0, left: -10 }}>
                      <defs>
                        <linearGradient id="result-fill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#17a195" stopOpacity={0.24} />
                          <stop offset="100%" stopColor="#17a195" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef2f4" vertical={false} />
                      <XAxis
                        dataKey="t"
                        type="number"
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={fmtDate}
                        tick={{ fontSize: 11, fill: '#93a3ac' }}
                        tickLine={false}
                        axisLine={{ stroke: '#dde4e8' }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#93a3ac' }}
                        tickLine={false}
                        axisLine={false}
                        width={40}
                      />
                      <Tooltip
                        cursor={{ stroke: '#c3ced4', strokeDasharray: '4 4' }}
                        content={<ChartTooltip unit={series.unit} displayName={series.displayName} />}
                      />
                      {series.refLow != null && series.refHigh != null && (
                        <ReferenceArea
                          y1={series.refLow}
                          y2={series.refHigh}
                          fill="#15803d"
                          fillOpacity={0.06}
                          ifOverflow="extendDomain"
                        />
                      )}
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#0d8378"
                        strokeWidth={2.5}
                        fill="url(#result-fill)"
                        dot={(props) => PointDot(props, series.refLow, series.refHigh)}
                        activeDot={{ r: 5, fill: '#0d8378', stroke: '#fff', strokeWidth: 2 }}
                        isAnimationActive={false}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={24}
                        payload={[
                          { value: 'Lab (filled) · Home (hollow)', type: 'line', color: '#0d8378' },
                        ]}
                        wrapperStyle={{ fontSize: 12, color: '#687782' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-ink-400">
                      <th className="py-1.5">Date</th>
                      <th>Value</th>
                      <th>Flag</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {[...(series.points || [])].reverse().map((p) => (
                      <tr key={p._id}>
                        <td className="py-2 text-ink-600">{fmtDate(p.takenAt)}</td>
                        <td className="text-ink-900">{p.value} {series.unit}</td>
                        <td><StatusChip status={p.flag} /></td>
                        <td className="capitalize text-ink-500">{p.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            </Reveal>
          )}
        </>
      )}

      <LogReadingModal open={logOpen} onClose={() => setLogOpen(false)} profileId={currentProfileId} onLogged={refresh} />
    </div>
  );
}
