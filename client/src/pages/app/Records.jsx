import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FileText, Image as ImageIcon, Upload, FolderOpen, ExternalLink, RefreshCw } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext.jsx';
import { useCan } from '../../hooks/useCan.js';
import { useSocket } from '../../context/SocketContext.jsx';
import { listDocuments, getFileUrl, rerunDocument } from '../../api/documents.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { StatusChip } from '../../components/ui/StatusChip.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { UploadSheet } from '../../components/documents/UploadSheet.jsx';
import { TimelineView } from '../../components/records/TimelineView.jsx';

const CHIP = {
  uploaded: { status: 'pending', label: 'Uploaded' },
  processing: { status: 'processing', label: 'Processing' },
  needs_review: { status: 'review', label: 'Needs review' },
  verified: { status: 'verified', label: 'Verified' },
  failed: { status: 'failed', label: 'Failed' },
};

const FILTERS = [
  { v: '', l: 'All' },
  { v: 'uploaded', l: 'Uploaded' },
  { v: 'needs_review', l: 'Needs review' },
  { v: 'verified', l: 'Verified' },
  { v: 'failed', l: 'Failed' },
];

function DocCard({ doc, onView, onReview, onRetry, onOpen, canWrite }) {
  const isPdf = doc.mimeType === 'application/pdf';
  const Icon = isPdf ? FileText : ImageIcon;
  const chip = CHIP[doc.status] || { status: 'unknown', label: doc.status };
  const processing = doc.status === 'processing';

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <StatusChip status={chip.status} label={chip.label} />
      </div>
      <button type="button" onClick={() => onOpen(doc._id)} className="min-w-0 text-left">
        <p className="font-medium capitalize text-ink-900 hover:text-accent-700">{doc.kind.replace('_', ' ')}</p>
        <p className="truncate text-xs text-ink-500">
          {new Date(doc.createdAt).toLocaleDateString()}
          {doc.originalName ? ` · ${doc.originalName}` : ''}
        </p>
      </button>

      {processing ? (
        <div>
          <p className="mb-1 text-xs font-medium text-ink-500">{doc._label || 'Processing…'}</p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full bg-accent-500 transition-all"
              style={{ width: `${doc._percent || 10}%` }}
            />
          </div>
        </div>
      ) : doc.status === 'failed' ? (
        <div className="space-y-2">
          {doc.error && <p className="text-xs text-status-danger">{doc.error}</p>}
          {canWrite && (
            <Button variant="outline" size="sm" onClick={() => onRetry(doc._id)}>
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          {doc.status === 'needs_review' && canWrite && (
            <Button size="sm" onClick={() => onReview(doc._id)}>
              Review
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onView(doc._id)}>
            <ExternalLink className="h-4 w-4" />
            View file
          </Button>
        </div>
      )}
    </Card>
  );
}

export default function Records() {
  const { currentProfileId } = useProfile();
  const { socket } = useSocket();
  const canUpload = useCan('upload');
  const navigate = useNavigate();

  const [docs, setDocs] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [view, setView] = useState('timeline');

  const load = useCallback(async () => {
    if (!currentProfileId) return;
    setError('');
    try {
      const data = await listDocuments(currentProfileId, status ? { status } : {});
      setDocs(data.documents);
    } catch (e) {
      setError(e.message || 'Could not load documents');
    }
  }, [currentProfileId, status]);

  useEffect(() => {
    setDocs(null);
    load();
  }, [load]);

  // Live processing progress over the socket.
  useEffect(() => {
    if (!socket) return undefined;
    const onProgress = (p) => {
      setDocs((prev) =>
        prev
          ? prev.map((d) =>
              d._id === p.documentId
                ? { ...d, status: p.status || d.status, stage: p.stage, _label: p.label, _percent: p.percent }
                : d
            )
          : prev
      );
      if (p.stage === 'needs_review') toast.success('A document is ready for review');
      if (p.stage === 'failed') toast.error('A document failed to process');
    };
    socket.on('document:progress', onProgress);
    return () => socket.off('document:progress', onProgress);
  }, [socket]);

  const viewFile = async (id) => {
    try {
      const { url } = await getFileUrl(id);
      window.open(url, '_blank', 'noopener');
    } catch (e) {
      toast.error(e.message || 'Could not open file');
    }
  };

  const retry = async (id) => {
    try {
      await rerunDocument(id);
      toast('Re-processing…');
    } catch (e) {
      toast.error(e.message || 'Could not retry');
    }
  };

  const review = (id) => navigate(`/app/review/${id}`);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">Records</h1>
        {canUpload && (
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        )}
      </div>

      <div className="flex gap-1 rounded-xl bg-ink-100 p-1">
        {[{ v: 'timeline', l: 'Timeline' }, { v: 'documents', l: 'Documents' }].map((t) => (
          <button
            key={t.v}
            type="button"
            onClick={() => setView(t.v)}
            className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              view === t.v ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
            }`}
          >
            {t.l}
          </button>
        ))}
      </div>

      {view === 'timeline' && <TimelineView />}

      {view === 'documents' && (
      <>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.v}
            type="button"
            onClick={() => setStatus(f.v)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              status === f.v
                ? 'bg-accent-600 text-white'
                : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-50'
            }`}
          >
            {f.l}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : docs === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      ) : docs.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No documents yet"
          message="Upload a prescription or lab report to start building this record."
          action={
            canUpload ? (
              <Button onClick={() => setUploadOpen(true)}>
                <Upload className="h-4 w-4" />
                Upload a document
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc) => (
            <DocCard
              key={doc._id}
              doc={doc}
              onView={viewFile}
              onReview={review}
              onRetry={retry}
              onOpen={(docId) => navigate(`/app/records/documents/${docId}`)}
              canWrite={canUpload}
            />
          ))}
        </div>
      )}
      </>
      )}

      <UploadSheet
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        profileId={currentProfileId}
        onUploaded={() => {
          setUploadOpen(false);
          setStatus('');
          setView('documents');
          load();
        }}
      />
    </div>
  );
}
