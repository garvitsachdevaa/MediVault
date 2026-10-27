import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
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
import { RevealGroup, Reveal } from '../../components/ui/Reveal.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';

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
    <Card className="flex h-full flex-col gap-3 transition duration-200 hover:-translate-y-0.5 hover:border-ink-300/80 hover:shadow-lift">
      <div className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent-100 to-accent-50 text-accent-700 ring-1 ring-accent-100">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <StatusChip status={chip.status} label={chip.label} size="sm" />
      </div>
      <button type="button" onClick={() => onOpen(doc._id)} className="focus-ring min-w-0 rounded-lg text-left">
        <p className="font-semibold capitalize text-ink-900 transition-colors hover:text-accent-700">{doc.kind.replace('_', ' ')}</p>
        <p className="truncate text-xs text-ink-500">
          {new Date(doc.createdAt).toLocaleDateString()}
          {doc.originalName ? ` · ${doc.originalName}` : ''}
        </p>
      </button>

      {processing ? (
        <div>
          <p className="mb-1 text-xs font-medium text-ink-500">{doc._label || 'Processing…'}</p>
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
            <motion.div
              className="h-full rounded-full bg-accent-500"
              initial={false}
              animate={{ width: `${doc._percent || 10}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
            {/* Shimmer sweep communicates "working" even when % is static */}
            <motion.div
              className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent"
              animate={{ x: ['-120%', '420%'] }}
              transition={{ duration: 1.3, ease: 'easeInOut', repeat: Infinity }}
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
          {doc.storage?.publicId && (
            <Button variant="outline" size="sm" onClick={() => onView(doc._id)}>
              <ExternalLink className="h-4 w-4" />
              View file
            </Button>
          )}
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
    <div className="space-y-6">
      <PageHeader
        eyebrow="Your history"
        title="Records"
        subtitle="Every prescription and lab report, read and confirmed by you — laid out as a clear timeline."
        actions={
          canUpload ? (
            <Button size="sm" onClick={() => setUploadOpen(true)}>
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          ) : null
        }
      />

      <div className="flex gap-1 rounded-xl border border-ink-200/70 bg-white/70 p-1 backdrop-blur-sm">
        {[{ v: 'timeline', l: 'Timeline' }, { v: 'documents', l: 'Documents' }].map((t) => (
          <button
            key={t.v}
            type="button"
            onClick={() => setView(t.v)}
            className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              view === t.v ? 'bg-accent-grad text-white shadow-sm' : 'text-ink-500 hover:text-ink-800'
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
        <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc) => (
            <Reveal as="div" key={doc._id}>
              <DocCard
                doc={doc}
                onView={viewFile}
                onReview={review}
                onRetry={retry}
                onOpen={(docId) => navigate(`/app/records/documents/${docId}`)}
                canWrite={canUpload}
              />
            </Reveal>
          ))}
        </RevealGroup>
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
