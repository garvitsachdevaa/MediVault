import { useState, useEffect, useId } from 'react';
import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';
import { Input } from './Input.jsx';

// Confirmation dialog. Pass `requireText` to force the user to type a value
// (e.g. the profile name) before the confirm button enables.
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
  requireText,
  loading = false,
}) {
  const [typed, setTyped] = useState('');
  const inputId = useId();

  // Reset the typed value each time the dialog opens.
  useEffect(() => {
    if (open) setTyped('');
  }, [open]);

  const canConfirm = requireText ? typed.trim() === requireText : true;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={!canConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {message && <p className="text-sm leading-relaxed text-ink-600">{message}</p>}
      {requireText && (
        <div className="mt-4 space-y-1.5">
          <label htmlFor={inputId} className="block text-sm text-ink-600">
            Type <span className="font-semibold text-ink-900">{requireText}</span> to confirm.
          </label>
          <Input
            id={inputId}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={requireText}
            autoComplete="off"
            aria-label="Confirmation text"
          />
        </div>
      )}
    </Modal>
  );
}
