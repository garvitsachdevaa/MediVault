import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { Copy } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Select } from '../ui/Select.jsx';
import { FormField } from '../ui/FormField.jsx';
import { createShare } from '../../api/shares.js';
import { getTests } from '../../api/results.js';
import { listDocuments } from '../../api/documents.js';

export function ShareBuilder({ open, onClose, profileId, onCreated }) {
  const [summary, setSummary] = useState(true);
  const [medicines, setMedicines] = useState(true);
  const [tests, setTests] = useState([]);
  const [docs, setDocs] = useState([]);
  const [selTests, setSelTests] = useState([]);
  const [selDocs, setSelDocs] = useState([]);
  const [expiry, setExpiry] = useState('7d');
  const [link, setLink] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSummary(true);
    setMedicines(true);
    setSelTests([]);
    setSelDocs([]);
    setExpiry('7d');
    setLink('');
    getTests(profileId).then(setTests).catch(() => setTests([]));
    listDocuments(profileId, { status: 'verified' }).then((d) => setDocs(d.documents)).catch(() => setDocs([]));
  }, [open, profileId]);

  const toggle = (arr, set, val) =>
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const create = async () => {
    setSaving(true);
    try {
      const res = await createShare(profileId, {
        summary,
        medicines,
        testCodes: selTests,
        documentIds: selDocs,
        expiry,
      });
      setLink(res.shareLink);
      onCreated?.();
    } catch (e) {
      toast.error(e.message || 'Could not create link');
    } finally {
      setSaving(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copied');
    } catch {
      toast.error('Copy failed — select the link manually');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Prepare a doctor share link"
      footer={
        link ? (
          <Button onClick={onClose}>Done</Button>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={create} loading={saving}>Create link</Button>
          </>
        )
      }
    >
      {link ? (
        <div className="space-y-4 text-center">
          <div className="flex justify-center rounded-xl bg-white p-4">
            <QRCodeSVG value={link} size={160} />
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg bg-ink-50 px-2.5 py-1.5 text-xs text-ink-700 ring-1 ring-ink-200">{link}</code>
            <Button variant="outline" size="sm" onClick={copy}><Copy className="h-4 w-4" /> Copy</Button>
          </div>
          <p className="text-xs text-ink-500">Share this link or QR with the doctor. It expires automatically.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" checked={summary} onChange={(e) => setSummary(e.target.checked)} className="h-4 w-4 rounded border-ink-300 text-accent-600" />
            Health summary (allergies, conditions)
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" checked={medicines} onChange={(e) => setMedicines(e.target.checked)} className="h-4 w-4 rounded border-ink-300 text-accent-600" />
            Current medicines
          </label>

          {tests.length > 0 && (
            <div>
              <p className="mb-1.5 text-sm font-medium text-ink-700">Test results</p>
              <div className="flex flex-wrap gap-2">
                {tests.map((t) => (
                  <button
                    key={t.testCode}
                    type="button"
                    onClick={() => toggle(selTests, setSelTests, t.testCode)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                      selTests.includes(t.testCode) ? 'bg-accent-600 text-white ring-accent-600' : 'bg-white text-ink-600 ring-ink-200'
                    }`}
                  >
                    {t.displayName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {docs.length > 0 && (
            <div>
              <p className="mb-1.5 text-sm font-medium text-ink-700">Documents</p>
              <div className="space-y-1">
                {docs.map((d) => (
                  <label key={d._id} className="flex items-center gap-2 text-sm text-ink-700">
                    <input type="checkbox" checked={selDocs.includes(d._id)} onChange={() => toggle(selDocs, setSelDocs, d._id)} className="h-4 w-4 rounded border-ink-300 text-accent-600" />
                    <span className="capitalize">{d.kind.replace('_', ' ')}</span>
                    <span className="text-xs text-ink-400">{new Date(d.createdAt).toLocaleDateString()}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <FormField label="Expires in" htmlFor="exp">
            <Select id="exp" value={expiry} onChange={(e) => setExpiry(e.target.value)}>
              <option value="24h">24 hours</option>
              <option value="7d">7 days</option>
              <option value="30d">30 days</option>
            </Select>
          </FormField>
        </div>
      )}
    </Modal>
  );
}
