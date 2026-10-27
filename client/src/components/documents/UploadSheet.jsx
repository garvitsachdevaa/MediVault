import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { UploadCloud, FileText } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Select } from '../ui/Select.jsx';
import { FormField } from '../ui/FormField.jsx';
import { uploadDocument } from '../../api/documents.js';

export function UploadSheet({ open, onClose, profileId, onUploaded }) {
  const [kind, setKind] = useState('prescription');
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const reset = () => {
    setKind('prescription');
    setFile(null);
    setProgress(0);
    setError('');
    setUploading(false);
  };

  const close = () => {
    if (uploading) return;
    reset();
    onClose();
  };

  const submit = async () => {
    if (!file) return setError('Choose a file first');
    setUploading(true);
    setError('');
    setProgress(0);
    try {
      const doc = await uploadDocument(profileId, file, kind, setProgress);
      toast.success('Document uploaded');
      onUploaded?.(doc);
      reset();
      onClose();
    } catch (e) {
      setError(e.message || 'Upload failed');
      setUploading(false);
    }
    return undefined;
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Upload a document"
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={submit} loading={uploading} disabled={!file}>
            Upload
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div role="alert" className="rounded-xl border border-status-danger-border bg-status-danger-bg/60 px-3.5 py-2.5 text-sm text-status-danger">
            {error}
          </div>
        )}

        <FormField label="Document type" htmlFor="up-kind">
          <Select id="up-kind" value={kind} onChange={(e) => setKind(e.target.value)} disabled={uploading}>
            <option value="prescription">Prescription</option>
            <option value="lab_report">Lab report</option>
          </Select>
        </FormField>

        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setError('');
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-300 bg-ink-50 px-4 py-8 text-center hover:bg-ink-100 disabled:opacity-60"
        >
          {file ? (
            <>
              <FileText className="h-6 w-6 text-accent-600" aria-hidden="true" />
              <span className="max-w-full truncate text-sm font-medium text-ink-800">{file.name}</span>
              <span className="text-xs text-ink-500">Tap to choose a different file</span>
            </>
          ) : (
            <>
              <UploadCloud className="h-7 w-7 text-ink-400" aria-hidden="true" />
              <span className="text-sm font-medium text-ink-700">Choose or capture a file</span>
              <span className="text-xs text-ink-500">PDF, JPG, PNG or WEBP · up to 10 MB</span>
            </>
          )}
        </button>

        {uploading && (
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-ink-100">
            <motion.div
              className="h-full rounded-full bg-accent-500"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
            <motion.div
              className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent"
              animate={{ x: ['-120%', '420%'] }}
              transition={{ duration: 1.3, ease: 'easeInOut', repeat: Infinity }}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
