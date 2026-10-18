import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { Select } from '../ui/Select.jsx';
import { FormField } from '../ui/FormField.jsx';
import { logHome } from '../../api/results.js';

export function LogReadingModal({ open, onClose, profileId, onLogged }) {
  const [type, setType] = useState('bp');
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setType('bp');
      setForm({});
    }
  }, [open]);

  const submit = async () => {
    setSaving(true);
    try {
      const payload = { type, ...form };
      if (type === 'sugar') payload.fasting = form.fasting === 'fasting';
      await logHome(profileId, payload);
      toast.success('Reading saved');
      onLogged();
      onClose();
    } catch (e) {
      toast.error(e.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log a reading"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={submit} loading={saving}>Save</Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField label="Type" htmlFor="rt">
          <Select id="rt" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="bp">Blood pressure</option>
            <option value="sugar">Blood sugar</option>
            <option value="weight">Weight</option>
          </Select>
        </FormField>

        {type === 'bp' && (
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Systolic (mmHg)" htmlFor="sys">
              <Input id="sys" type="number" onChange={(e) => setForm((f) => ({ ...f, systolic: e.target.value }))} />
            </FormField>
            <FormField label="Diastolic (mmHg)" htmlFor="dia">
              <Input id="dia" type="number" onChange={(e) => setForm((f) => ({ ...f, diastolic: e.target.value }))} />
            </FormField>
          </div>
        )}
        {type === 'sugar' && (
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Value (mg/dL)" htmlFor="sv">
              <Input id="sv" type="number" onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} />
            </FormField>
            <FormField label="When" htmlFor="sf">
              <Select id="sf" defaultValue="random" onChange={(e) => setForm((f) => ({ ...f, fasting: e.target.value }))}>
                <option value="random">Random</option>
                <option value="fasting">Fasting</option>
              </Select>
            </FormField>
          </div>
        )}
        {type === 'weight' && (
          <FormField label="Weight (kg)" htmlFor="wv">
            <Input id="wv" type="number" onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} />
          </FormField>
        )}
      </div>
    </Modal>
  );
}
