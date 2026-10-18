import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, ExternalLink } from 'lucide-react';
import * as docsApi from '../api/documents.js';
import { useCan } from '../hooks/useCan.js';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { StatusChip } from '../components/ui/StatusChip.jsx';
import { Tabs } from '../components/ui/Tabs.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { ErrorState } from '../components/ui/ErrorState.jsx';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx';
import { Footer } from '../components/layout/Footer.jsx';

const FLAG_CHIP = { low: 'low', high: 'high', normal: 'normal', unknown: 'unknown' };

// An editable field that shows its "needs checking" state. Editing clears the flag.
function Field({ label, field, onChange, readOnly, type = 'text' }) {
  const flagged = field?.flagged;
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-xs font-medium text-ink-600">
        {label}
        {flagged && (
          <span className="text-2xs font-semibold text-status-review">
            Check this · {Math.round((field.confidence || 0) * 100)}%
          </span>
        )}
      </span>
      <Input
        type={type}
        value={field?.value ?? ''}
        invalid={flagged}
        disabled={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className={flagged ? 'border-status-review focus:ring-status-review/30' : ''}
      />
      {field?.readAs && field.readAs !== String(field.value ?? '') && (
        <span className="mt-0.5 block text-2xs text-ink-400">read as: {field.readAs}</span>
      )}
    </label>
  );
}

export default function ReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const canEdit = useCan('confirm');

  const [doc, setDoc] = useState(null);
  const [draft, setDraft] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('details');
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await docsApi.getReview(id);
      setDoc(data.document);
      setDraft(data.draft || { kind: data.document.kind, fields: {}, medicines: [], tests: [], notes: '' });
      setFileUrl(data.fileUrl);
    } catch (e) {
      setError(e.message || 'Could not load the document');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Any edit marks the field confident (1) and clears the flag.
  const edit = (updater) =>
    setDraft((d) => {
      const next = structuredClone(d);
      updater(next);
      return next;
    });
  const setField = (fieldObj, value) => {
    fieldObj.value = value;
    fieldObj.confidence = 1;
    fieldObj.flagged = false;
  };

  const flaggedCount = draft
    ? [
        ...Object.values(draft.fields || {}),
        ...(draft.medicines || []).flatMap((m) => [m.name, m.strength, m.dose, m.frequency, m.durationDays, m.instructions]),
        ...(draft.tests || []).flatMap((t) => [t.displayName, t.value, t.unit, t.refLow, t.refHigh]),
      ].filter((f) => f?.flagged).length
    : 0;

  const saveDraft = async () => {
    setSaving(true);
    try {
      await docsApi.saveDraft(id, draft);
      toast.success('Draft saved');
    } catch (e) {
      toast.error(e.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const confirm = async () => {
    setBusy(true);
    try {
      await docsApi.saveDraft(id, draft);
      const { redirect } = await docsApi.confirmDocument(id);
      toast.success('Confirmed');
      navigate(redirect || '/app/records');
    } catch (e) {
      toast.error(e.message || 'Could not confirm');
      setBusy(false);
      setConfirmOpen(false);
    }
  };

  const discard = async () => {
    setBusy(true);
    try {
      await docsApi.discardDocument(id);
      toast.success('Document discarded');
      navigate('/app/records');
    } catch (e) {
      toast.error(e.message || 'Could not discard');
      setBusy(false);
      setDiscardOpen(false);
    }
  };

  const rerun = async () => {
    try {
      await docsApi.rerunDocument(id);
      toast('Re-processing… check Records');
      navigate('/app/records');
    } catch (e) {
      toast.error(e.message || 'Could not re-run');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }
  if (error) return <div className="p-6"><ErrorState message={error} onRetry={load} /></div>;

  const isLab = draft?.kind === 'lab_report';

  const Preview = (
    <Card className="h-full min-h-[400px] p-0 overflow-hidden">
      {fileUrl ? (
        doc.mimeType === 'application/pdf' ? (
          <iframe title="Document" src={fileUrl} className="h-[60vh] w-full lg:h-full" />
        ) : (
          <img src={fileUrl} alt="Document" className="max-h-[70vh] w-full object-contain" />
        )
      ) : (
        <div className="flex h-full items-center justify-center p-10 text-sm text-ink-500">
          Preview unavailable
        </div>
      )}
      {fileUrl && (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 border-t border-ink-200 py-2 text-sm font-medium text-accent-700 hover:bg-ink-50"
        >
          <ExternalLink className="h-4 w-4" /> Open file in new tab
        </a>
      )}
    </Card>
  );

  const Details = (
    <div className="space-y-4">
      {flaggedCount > 0 && (
        <div className="rounded-xl border border-status-review-border bg-status-review-bg/60 px-4 py-2.5 text-sm font-medium text-status-review">
          {flaggedCount} field{flaggedCount > 1 ? 's' : ''} need checking
        </div>
      )}

      {isLab ? (
        <>
          <Card className="grid gap-3 sm:grid-cols-2">
            <Field label="Lab name" field={draft.fields?.labName} readOnly={!canEdit} onChange={(v) => edit((d) => setField((d.fields.labName ||= {}), v))} />
            <Field label="Date" type="date" field={draft.fields?.date} readOnly={!canEdit} onChange={(v) => edit((d) => setField((d.fields.date ||= {}), v))} />
          </Card>
          {(draft.tests || []).map((t, i) => (
            <Card key={i} className="space-y-3">
              <div className="flex items-center justify-between">
                <StatusChip status={FLAG_CHIP[t.flag] || 'unknown'} />
                {canEdit && (
                  <button type="button" onClick={() => edit((d) => d.tests.splice(i, 1))} className="rounded-lg p-1.5 text-ink-400 hover:bg-status-danger-bg hover:text-status-danger" aria-label="Remove test">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Field label="Test" field={t.displayName} readOnly={!canEdit} onChange={(v) => edit((d) => setField(d.tests[i].displayName, v))} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Value" field={t.value} readOnly={!canEdit} onChange={(v) => edit((d) => setField(d.tests[i].value, v))} />
                <Field label="Unit" field={t.unit} readOnly={!canEdit} onChange={(v) => edit((d) => setField(d.tests[i].unit, v))} />
                <Field label="Ref low" field={t.refLow} readOnly={!canEdit} onChange={(v) => edit((d) => setField(d.tests[i].refLow, v))} />
                <Field label="Ref high" field={t.refHigh} readOnly={!canEdit} onChange={(v) => edit((d) => setField(d.tests[i].refHigh, v))} />
              </div>
            </Card>
          ))}
          {canEdit && (
            <Button variant="outline" onClick={() => edit((d) => d.tests.push({ testCode: 'UNKNOWN', displayName: { value: '', confidence: 1, flagged: false }, value: { value: '', confidence: 1, flagged: false }, unit: { value: '', confidence: 1, flagged: false }, refLow: { value: '', confidence: 1, flagged: false }, refHigh: { value: '', confidence: 1, flagged: false }, flag: 'unknown' }))}>
              <Plus className="h-4 w-4" /> Add test
            </Button>
          )}
        </>
      ) : (
        <>
          <Card className="grid gap-3 sm:grid-cols-3">
            <Field label="Doctor" field={draft.fields?.doctorName} readOnly={!canEdit} onChange={(v) => edit((d) => setField((d.fields.doctorName ||= {}), v))} />
            <Field label="Clinic" field={draft.fields?.clinic} readOnly={!canEdit} onChange={(v) => edit((d) => setField((d.fields.clinic ||= {}), v))} />
            <Field label="Date" type="date" field={draft.fields?.date} readOnly={!canEdit} onChange={(v) => edit((d) => setField((d.fields.date ||= {}), v))} />
          </Card>
          {(draft.medicines || []).map((m, i) => (
            <Card key={i} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink-700">Medicine {i + 1}</span>
                {canEdit && (
                  <button type="button" onClick={() => edit((d) => d.medicines.splice(i, 1))} className="rounded-lg p-1.5 text-ink-400 hover:bg-status-danger-bg hover:text-status-danger" aria-label="Remove medicine">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Field label="Name" field={m.name} readOnly={!canEdit} onChange={(v) => edit((d) => setField(d.medicines[i].name, v))} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Strength" field={m.strength} readOnly={!canEdit} onChange={(v) => edit((d) => setField(d.medicines[i].strength, v))} />
                <Field label="Dose" field={m.dose} readOnly={!canEdit} onChange={(v) => edit((d) => setField(d.medicines[i].dose, v))} />
                <Field label="Frequency" field={m.frequency} readOnly={!canEdit} onChange={(v) => edit((d) => setField(d.medicines[i].frequency, v))} />
                <Field label="Duration (days)" field={m.durationDays} readOnly={!canEdit} onChange={(v) => edit((d) => setField(d.medicines[i].durationDays, v))} />
              </div>
              <Field label="Instructions" field={m.instructions} readOnly={!canEdit} onChange={(v) => edit((d) => setField(d.medicines[i].instructions, v))} />
            </Card>
          ))}
          {canEdit && (
            <Button variant="outline" onClick={() => edit((d) => d.medicines.push({ name: { value: '', confidence: 1, flagged: false }, strength: { value: '', confidence: 1, flagged: false }, dose: { value: '', confidence: 1, flagged: false }, frequency: { value: '', confidence: 1, flagged: false }, durationDays: { value: '', confidence: 1, flagged: false }, instructions: { value: '', confidence: 1, flagged: false }, frequencyParsed: { code: 'OD', timesOfDay: ['09:00'], asNeeded: false } }))}>
              <Plus className="h-4 w-4" /> Add medicine
            </Button>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-ink-200/70 bg-white/90 px-4 py-3 backdrop-blur md:px-6">
        <button type="button" onClick={() => navigate('/app/records')} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-ink-900">
          <ArrowLeft className="h-4 w-4" /> Records
        </button>
        <h1 className="text-sm font-semibold text-ink-900 capitalize">Review {doc.kind.replace('_', ' ')}</h1>
        <div className="w-16" />
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-6">
        {/* Mobile tabs */}
        <div className="mb-4 lg:hidden">
          <Tabs tabs={[{ value: 'details', label: 'Details' }, { value: 'document', label: 'Document' }]} value={tab} onChange={setTab} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className={tab === 'document' ? 'block' : 'hidden lg:block'}>{Preview}</div>
          <div className={tab === 'details' ? 'block' : 'hidden lg:block'}>{Details}</div>
        </div>
      </main>

      {canEdit && (
        <div className="sticky bottom-0 z-30 flex flex-wrap items-center justify-end gap-2 border-t border-ink-200 bg-white px-4 py-3 md:px-6">
          <Button variant="ghost" onClick={() => setDiscardOpen(true)}>Discard</Button>
          <Button variant="outline" onClick={rerun}>Re-run</Button>
          <Button variant="outline" onClick={saveDraft} loading={saving}>Save draft</Button>
          <Button onClick={() => setConfirmOpen(true)}>Confirm</Button>
        </div>
      )}

      <div className="lg:hidden"><Footer /></div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirm}
        loading={busy}
        title="Confirm this document?"
        message={isLab ? `This will save ${(draft.tests || []).length} lab result(s) to the record.` : `This will save ${(draft.medicines || []).length} medicine(s) to the record.`}
        confirmLabel="Confirm"
        confirmVariant="primary"
      />
      <ConfirmDialog
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        onConfirm={discard}
        loading={busy}
        title="Discard this document?"
        message="The document and its file will be permanently deleted. This cannot be undone."
        confirmLabel="Discard"
      />
    </div>
  );
}
