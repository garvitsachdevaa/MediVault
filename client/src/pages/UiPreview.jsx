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
import { Logo } from '../components/brand/Logo.jsx';
import { Footer } from '../components/layout/Footer.jsx';

function Section({ title, description, children }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
      </div>
      <Card className="flex flex-wrap items-center gap-3">{children}</Card>
    </section>
  );
}

const ACCENT_SWATCHES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const INK_SWATCHES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

// Dev-only gallery of every UI component. Removed before Step 25.
export default function UiPreview() {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [tab, setTab] = useState('active');

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-ink-50/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
          <Logo size={28} />
          <span className="rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700 ring-1 ring-accent-100">
            Design system · dev only
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-10 p-6 py-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink-900">MediVault UI kit</h1>
          <p className="mt-2 max-w-2xl text-ink-600">
            The refined &ldquo;clinical &amp; trustworthy&rdquo; component system — calm palette,
            considered type, soft depth, and accessible states.
          </p>
        </div>

        {/* Palette */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">Palette</h2>
          <Card className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-medium text-ink-500">Accent (teal)</p>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                {ACCENT_SWATCHES.map((n) => (
                  <div key={n} className="space-y-1">
                    <div
                      className={`h-12 rounded-lg ring-1 ring-inset ring-ink-900/5 bg-accent-${n}`}
                    />
                    <p className="text-center text-2xs text-ink-500">{n}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-ink-500">Ink (neutral)</p>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                {INK_SWATCHES.map((n) => (
                  <div key={n} className="space-y-1">
                    <div
                      className={`h-12 rounded-lg ring-1 ring-inset ring-ink-900/5 bg-ink-${n}`}
                    />
                    <p className="text-center text-2xs text-ink-500">{n}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>

        {/* Typography */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
            Typography
          </h2>
          <Card className="space-y-3">
            <p className="text-4xl font-extrabold tracking-tight text-ink-900">
              Display — Your health, organised
            </p>
            <p className="text-2xl font-bold tracking-tight text-ink-900">
              Heading 2 — Lab results &amp; trends
            </p>
            <p className="text-lg font-semibold text-ink-900">Heading 3 — Current medicines</p>
            <p className="text-base text-ink-700">
              Body — MediVault reads your documents and turns them into structured data you confirm.
            </p>
            <p className="text-sm text-ink-500">Caption — Reviewed 12 Oct 2026 · Self</p>
          </Card>
        </section>

        <Section title="Buttons" description="Variants, sizes, and states.">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="subtle">Subtle</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="link">Link</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </Section>

        <Section title="Status chips" description="Icon + text + colour — never colour alone.">
          <StatusChip status="verified" />
          <StatusChip status="normal" />
          <StatusChip status="review" />
          <StatusChip status="borderline" />
          <StatusChip status="high" />
          <StatusChip status="low" />
          <StatusChip status="failed" />
          <StatusChip status="pending" />
          <StatusChip status="processing" />
          <StatusChip status="unknown" />
        </Section>

        <Section title="Cards">
          <Card className="w-56">
            <p className="font-semibold text-ink-900">Standard card</p>
            <p className="mt-1 text-sm text-ink-600">Hairline border, soft layered shadow.</p>
          </Card>
          <Card interactive className="w-56">
            <p className="font-semibold text-ink-900">Interactive card</p>
            <p className="mt-1 text-sm text-ink-600">Lifts gently on hover.</p>
          </Card>
        </Section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
            Skeletons
          </h2>
          <Card className="w-full space-y-2.5">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
            Empty &amp; error states
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <EmptyState
              icon={FileQuestion}
              title="No documents yet"
              message="Upload a prescription or lab report to get started."
              action={<Button>Upload a document</Button>}
            />
            <ErrorState message="Could not load your results." onRetry={() => toast('Retrying…')} />
          </div>
        </section>

        <Section title="Tabs">
          <Tabs
            tabs={[
              { value: 'active', label: 'Active' },
              { value: 'completed', label: 'Completed' },
              { value: 'archived', label: 'Archived' },
            ]}
            value={tab}
            onChange={setTab}
          />
          <span className="text-sm text-ink-500">Selected: {tab}</span>
        </Section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
            Form fields
          </h2>
          <Card className="grid max-w-md gap-4">
            <FormField label="Full name" htmlFor="name" hint="As printed on your records" required>
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

        <Section title="Overlays &amp; toasts">
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
        <p>This is a modal. Press Escape or click the backdrop to close.</p>
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
