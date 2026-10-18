import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, Plus } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
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

const TrendIcon = ({ trend }) => {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-ink-400" />;
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-ink-400" />;
  return <Minus className="h-4 w-4 text-ink-400" />;
};

const fmtDate = (d) => new Date(d).toLocaleDateString();

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
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">Results</h1>
        {canLog && (
          <Button size="sm" onClick={() => setLogOpen(true)}>
            <Plus className="h-4 w-4" /> Log a reading
          </Button>
        )}
      </div>

      {tests.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No results yet"
          message="Confirm a lab report or log a home reading to see trends here."
          action={canLog ? <Button onClick={() => setLogOpen(true)}><Plus className="h-4 w-4" /> Log a reading</Button> : null}
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tests.map((t) => (
              <button
                key={t.testCode}
                type="button"
                onClick={() => setSelected(t.testCode)}
                className={`rounded-2xl border p-4 text-left transition ${
                  selected === t.testCode ? 'border-accent-400 bg-accent-50/50' : 'border-ink-200 bg-white hover:bg-ink-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink-700">{t.displayName}</span>
                  <TrendIcon trend={t.trend} />
                </div>
                <div className="mt-1 flex items-end gap-2">
                  <span className="text-2xl font-bold text-ink-900">{t.latest.value ?? '—'}</span>
                  <span className="pb-1 text-xs text-ink-500">{t.unit}</span>
                </div>
                <StatusChip status={t.latest.flag} className="mt-1" />
              </button>
            ))}
          </div>

          {series && (
            <Card className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-ink-900">{series.displayName} trend</h3>
                <Select value={selected} onChange={(e) => setSelected(e.target.value)} className="w-48">
                  {tests.map((t) => (
                    <option key={t.testCode} value={t.testCode}>{t.displayName}</option>
                  ))}
                </Select>
              </div>

              {chartData.length === 0 ? (
                <p className="text-sm text-ink-500">No data points yet.</p>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef2f4" />
                      <XAxis
                        dataKey="t"
                        type="number"
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={fmtDate}
                        tick={{ fontSize: 11, fill: '#687782' }}
                      />
                      <YAxis tick={{ fontSize: 11, fill: '#687782' }} width={40} />
                      <Tooltip labelFormatter={fmtDate} formatter={(v) => [`${v} ${series.unit || ''}`, series.displayName]} />
                      {series.refLow != null && series.refHigh != null && (
                        <ReferenceArea y1={series.refLow} y2={series.refHigh} fill="#15803d" fillOpacity={0.07} />
                      )}
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#0d8378"
                        strokeWidth={2}
                        dot={(props) => PointDot(props, series.refLow, series.refHigh)}
                        isAnimationActive={false}
                      />
                      <Legend payload={[{ value: 'Lab (filled) · Home (hollow)', type: 'line', color: '#0d8378' }]} />
                    </LineChart>
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
          )}
        </>
      )}

      <LogReadingModal open={logOpen} onClose={() => setLogOpen(false)} profileId={currentProfileId} onLogged={refresh} />
    </div>
  );
}
