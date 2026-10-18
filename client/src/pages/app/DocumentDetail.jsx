import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, ExternalLink, Trash2, RefreshCw, Send } from 'lucide-react';
import * as docsApi from '../../api/documents.js';
import * as commentsApi from '../../api/comments.js';
import { useProfile } from '../../context/ProfileContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import { useCan } from '../../hooks/useCan.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { StatusChip } from '../../components/ui/StatusChip.jsx';
import { Avatar } from '../../components/ui/Avatar.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';

const CHIP = {
  uploaded: 'pending',
  processing: 'processing',
  needs_review: 'review',
  verified: 'verified',
  failed: 'failed',
};

function Comments({ profileId, targetId }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await commentsApi.listComments(profileId, 'document', targetId));
    } catch {
      /* ignore */
    }
  }, [profileId, targetId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!socket) return undefined;
    const onNew = (c) => {
      if (String(c.targetId) === String(targetId)) setItems((prev) => (prev.some((x) => x._id === c._id) ? prev : [...prev, c]));
    };
    socket.on('comment:new', onNew);
    return () => socket.off('comment:new', onNew);
  }, [socket, targetId]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const c = await commentsApi.addComment(profileId, { targetType: 'document', targetId, text });
      setItems((prev) => (prev.some((x) => x._id === c._id) ? prev : [...prev, c]));
      setText('');
    } catch (err) {
      toast.error(err.message || 'Could not post');
    } finally {
      setSending(false);
    }
  };

  const remove = async (id) => {
    try {
      await commentsApi.removeComment(id);
      setItems((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      toast.error(err.message || 'Could not delete');
    }
  };

  return (
    <Card className="space-y-4">
      <h3 className="font-semibold text-ink-900">Comments</h3>
      {items.length === 0 ? (
        <p className="text-sm text-ink-500">No comments yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((c) => (
            <li key={c._id} className="flex gap-3">
              <Avatar name={c.authorId?.name} src={c.authorId?.photoUrl} size={32} />
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-semibold text-ink-900">{c.authorId?.name}</span>{' '}
                  <span className="text-xs text-ink-400">{new Date(c.createdAt).toLocaleString()}</span>
                </p>
                <p className="text-sm text-ink-700">{c.text}</p>
              </div>
              {String(c.authorId?._id) === String(user?._id) && (
                <button type="button" onClick={() => remove(c._id)} className="text-ink-400 hover:text-status-danger" aria-label="Delete comment">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <form className="flex gap-2" onSubmit={send}>
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment…" />
        <Button type="submit" loading={sending} disabled={!text.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProfileId } = useProfile();
  const canWrite = useCan('upload');

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [delOpen, setDelOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      setData(await docsApi.getDetail(id));
    } catch (e) {
      setError(e.message || 'Could not load document');
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const del = async () => {
    setBusy(true);
    try {
      await docsApi.removeDocument(id);
      toast.success('Document deleted');
      navigate('/app/records');
    } catch (e) {
      toast.error(e.message || 'Could not delete');
      setBusy(false);
      setDelOpen(false);
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <Skeleton className="h-96 w-full rounded-2xl" />;

  const { document: doc, prescription, medications, labResults, fileUrl } = data;
  const timings = doc.extraction?.timings || {};

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link to="/app/records" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-ink-900">
          <ArrowLeft className="h-4 w-4" /> Records
        </Link>
        <StatusChip status={CHIP[doc.status] || 'unknown'} label={doc.status.replace('_', ' ')} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-2xl font-bold capitalize tracking-tight text-ink-900">
          {doc.kind.replace('_', ' ')}
        </h1>
        {doc.status === 'needs_review' && canWrite && (
          <Button size="sm" onClick={() => navigate(`/app/review/${doc._id}`)}>Review</Button>
        )}
        {canWrite && doc.status !== 'processing' && (
          <Button variant="outline" size="sm" onClick={() => docsApi.rerunDocument(doc._id).then(() => toast('Re-processing…'))}>
            <RefreshCw className="h-4 w-4" /> Re-run
          </Button>
        )}
        {canWrite && (
          <Button variant="outline" size="sm" onClick={() => setDelOpen(true)}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        )}
      </div>

      {fileUrl && (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-700 hover:underline">
          <ExternalLink className="h-4 w-4" /> Open file
        </a>
      )}

      {/* Confirmed data */}
      {doc.kind === 'prescription' && medications?.length > 0 && (
        <Card className="space-y-2">
          <h3 className="font-semibold text-ink-900">Medicines</h3>
          {prescription?.doctorName && <p className="text-sm text-ink-500">{prescription.doctorName}</p>}
          <ul className="divide-y divide-ink-100">
            {medications.map((m) => (
              <li key={m._id} className="py-2 text-sm">
                <span className="font-medium text-ink-900">{m.name}</span>{' '}
                <span className="text-ink-500">{[m.strength, m.dose, m.frequencyCode].filter(Boolean).join(' · ')}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
      {doc.kind === 'lab_report' && labResults?.length > 0 && (
        <Card className="space-y-2">
          <h3 className="font-semibold text-ink-900">Results</h3>
          <ul className="divide-y divide-ink-100">
            {labResults.map((r) => (
              <li key={r._id} className="flex items-center justify-between py-2 text-sm">
                <span className="font-medium text-ink-900">{r.displayName}</span>
                <span className="text-ink-600">{r.value} {r.unit} <StatusChip status={r.flag} /></span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* How this was read (viva-friendly) */}
      {doc.extraction?.method && (
        <Card className="space-y-1 text-sm text-ink-600">
          <h3 className="font-semibold text-ink-900">How this was read</h3>
          <p>Method: <span className="font-medium">{doc.extraction.method}</span>
            {doc.extraction.ocrMeanConfidence != null && ` · OCR confidence ${Math.round(doc.extraction.ocrMeanConfidence)}%`}</p>
          {timings.totalMs != null && <p>Processing time: {(timings.totalMs / 1000).toFixed(1)}s</p>}
        </Card>
      )}

      <Comments profileId={currentProfileId} targetId={doc._id} />

      <ConfirmDialog
        open={delOpen}
        onClose={() => setDelOpen(false)}
        onConfirm={del}
        loading={busy}
        title="Delete this document?"
        message="The file and any medicines or results created from it will be permanently removed."
        confirmLabel="Delete"
      />
    </div>
  );
}
