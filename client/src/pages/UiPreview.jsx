import { useState } from 'react';
import toast from 'react-hot-toast';
import { FileQuestion } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { StatusChip } from '../components/ui/StatusChip.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { ErrorState } from '../components/ui/ErrorState.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx';
import { Tabs } from '../components/ui/Tabs.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { FormField } from '../components/ui/FormField.jsx';
import { Footer } from '../components/layout/Footer.jsx';

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      <Card className="flex flex-wrap items-center gap-3">{children}</Card>
    </section>
  );
}

// Dev-only gallery of every UI component. Removed before Step 25.
export default function UiPreview() {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [tab, setTab] = useState('active');

  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-4xl flex-1 space-y-8 p-6">
        <h1 className="text-2xl font-bold text-slate-900">UI preview (dev only)</h1>

        <Section title="Buttons">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </Section>

        <Section title="Status chips">
          <StatusChip status="verified" />
          <StatusChip status="normal" />
          <StatusChip status="review" />
          <StatusChip status="high" />
          <StatusChip status="low" />
          <StatusChip status="failed" />
          <StatusChip status="pending" />
          <StatusChip status="processing" />
          <StatusChip status="unknown" />
        </Section>

        <Section title="Skeletons">
          <div className="w-full space-y-2">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </Section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Empty & error states
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <EmptyState
              icon={FileQuestion}
              title="No documents yet"
              message="Upload a prescription or lab report to get started."
              action={<Button>Upload</Button>}
            />
            <ErrorState message="Could not load results." onRetry={() => toast('Retrying…')} />
          </div>
        </section>

        <Section title="Tabs">
          <Tabs
            tabs={[
              { value: 'active', label: 'Active' },
              { value: 'completed', label: 'Completed' },
            ]}
            value={tab}
            onChange={setTab}
          />
          <span className="text-sm text-slate-500">Selected: {tab}</span>
        </Section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Form fields
          </h2>
          <Card className="grid max-w-md gap-4">
            <FormField label="Full name" htmlFor="name" hint="As printed on your records">
              <Input id="name" placeholder="Jane Doe" />
            </FormField>
            <FormField label="Relation" htmlFor="relation">
              <Select id="relation" defaultValue="self">
                <option value="self">Self</option>
                <option value="mother">Mother</option>
                <option value="father">Father</option>
              </Select>
            </FormField>
            <FormField label="Email" htmlFor="email" error="That email is already in use">
              <Input id="email" invalid defaultValue="taken@example.com" />
            </FormField>
          </Card>
        </section>

        <Section title="Overlays & toasts">
          <Button onClick={() => setModalOpen(true)}>Open modal</Button>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            Delete (type-to-confirm)
          </Button>
          <Button variant="secondary" onClick={() => toast.success('Saved!')}>
            Success toast
          </Button>
          <Button variant="secondary" onClick={() => toast.error('Something failed')}>
            Error toast
          </Button>
        </Section>
      </main>

      <Footer />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Example modal"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>OK</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          This is a modal. Press Escape or click the backdrop to close.
        </p>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          toast.success('Confirmed');
          setConfirmOpen(false);
        }}
        title="Delete profile?"
        message="This cannot be undone. All records for this profile will be removed."
        confirmLabel="Delete"
        requireText="Demo"
      />
    </div>
  );
}
