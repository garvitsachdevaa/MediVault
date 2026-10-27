import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { Printer, ExternalLink, ShieldCheck } from 'lucide-react';
import * as sharesApi from '../api/shares.js';
import { Logo } from '../components/brand/Logo.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { StatusChip } from '../components/ui/StatusChip.jsx';

export default function DoctorView() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState({ name: '', text: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    sharesApi
      .getPublicShare(token)
      .then((d) => active && setData(d))
      .catch((e) => active && setError(e.message || 'This link is no longer available'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [token]);

  const openDoc = async (docId) => {
    try {
      const { url } = await sharesApi.getPublicShareDocUrl(token, docId);
      window.open(url, '_blank', 'noopener');
    } catch (e) {
      toast.error(e.message || 'Could not open document');
    }
  };

  const sendNote = async (e) => {
    e.preventDefault();
    if (!note.text.trim()) return;
    setSending(true);
    try {
      await sharesApi.addPublicNote(token, note);
      toast.success('Note sent');
      setNote({ name: '', text: '' });
    } catch (err) {
      toast.error(err.message || 'Could not send note');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-ink-500">Loading…</div>;
  }
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <Logo size={30} />
        <h1 className="mt-4 text-xl font-bold text-ink-900">This link is no longer available</h1>
        <p className="text-sm text-ink-500">It may have expired or been revoked by the family.</p>
      </div>
    );
  }

  const s = data.summary;

  return (
    <div className="relative min-h-screen bg-ink-50 py-8 print:bg-white print:py-0">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-brand-wash no-print" aria-hidden="true" />
      <style>{`@media print { .no-print { display: none !important; } @page { margin: 1.2cm; } body { background: #fff; } }`}</style>
      <motion.div
        className="relative mx-auto max-w-3xl space-y-5 px-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center justify-between">
          <Logo size={26} />
          <Button variant="outline" size="sm" onClick={() => window.print()} className="no-print">
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-accent-200 bg-accent-50 px-4 py-2.5 text-sm font-medium text-accent-800 no-print">
          <ShieldCheck className="h-4 w-4 shrink-0 text-accent-600" aria-hidden="true" />
          Shared read-only summary · expires {new Date(data.expiresAt).toLocaleDateString()}
        </div>

        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-accent-100/60 blur-3xl no-print" />
          <h1 className="relative font-display text-2xl font-bold text-ink-900">{s.patient.name}</h1>
          <p className="relative text-sm capitalize text-ink-500">
            {[s.patient.relation, s.patient.age != null ? `${s.patient.age} yrs` : null, s.patient.bloodGroup].filter(Boolean).join(' · ')}
          </p>
        </Card>

        {(s.allergies?.length > 0 || s.conditions?.length > 0) && (
          <Card className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="font-semibold text-ink-900">Allergies</h3>
              {s.allergies?.length ? (
                <ul className="mt-1 text-sm text-ink-600">{s.allergies.map((a, i) => <li key={i}>{a.name}{a.reaction ? ` — ${a.reaction}` : ''}</li>)}</ul>
              ) : <p className="mt-1 text-sm text-ink-400">None recorded</p>}
            </div>
            <div>
              <h3 className="font-semibold text-ink-900">Conditions</h3>
              {s.conditions?.length ? (
                <ul className="mt-1 text-sm text-ink-600">{s.conditions.map((c, i) => <li key={i}>{c.name}</li>)}</ul>
              ) : <p className="mt-1 text-sm text-ink-400">None recorded</p>}
            </div>
          </Card>
        )}

        {s.medicines?.length > 0 && (
          <Card>
            <h3 className="font-semibold text-ink-900">Current medicines</h3>
            <ul className="mt-1 divide-y divide-ink-100 text-sm">
              {s.medicines.map((m, i) => (
                <li key={i} className="py-1.5">
                  <span className="font-medium text-ink-900">{m.name}</span>{' '}
                  <span className="text-ink-500">{[m.dose, m.frequency].filter(Boolean).join(' · ')}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {s.results?.length > 0 && (
          <Card>
            <h3 className="font-semibold text-ink-900">Recent results</h3>
            <ul className="mt-1 divide-y divide-ink-100 text-sm">
              {s.results.map((r) => (
                <li key={r.testCode} className="flex items-center justify-between py-1.5">
                  <span className="text-ink-700">{r.displayName}</span>
                  <span className="text-ink-900">{r.value} {r.unit} <StatusChip status={r.flag} /></span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {s.prescriptions?.length > 0 && (
          <Card>
            <h3 className="font-semibold text-ink-900">Recent prescriptions</h3>
            <ul className="mt-1 text-sm text-ink-600">
              {s.prescriptions.map((p, i) => (
                <li key={i}>{[p.doctorName, p.date ? new Date(p.date).toLocaleDateString() : null].filter(Boolean).join(' · ')}</li>
              ))}
            </ul>
          </Card>
        )}

        {s.documentIds?.length > 0 && (
          <Card className="no-print">
            <h3 className="font-semibold text-ink-900">Shared documents</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {s.documentIds.map((id) => (
                <Button key={id} variant="outline" size="sm" onClick={() => openDoc(id)}>
                  <ExternalLink className="h-4 w-4" /> Open document
                </Button>
              ))}
            </div>
          </Card>
        )}

        <Card className="no-print">
          <h3 className="font-semibold text-ink-900">Leave a note for the family</h3>
          <form className="mt-2 space-y-2" onSubmit={sendNote}>
            <Input placeholder="Your name (optional)" value={note.name} onChange={(e) => setNote((n) => ({ ...n, name: e.target.value }))} />
            <Input placeholder="Your note…" value={note.text} onChange={(e) => setNote((n) => ({ ...n, text: e.target.value }))} />
            <Button type="submit" loading={sending} disabled={!note.text.trim()}>Send note</Button>
          </form>
        </Card>

        <p className="pb-6 text-center text-xs text-ink-400">
          {s.notMedicalAdvice} · Generated {new Date(s.generatedAt).toLocaleString()}
        </p>
      </motion.div>
    </div>
  );
}
