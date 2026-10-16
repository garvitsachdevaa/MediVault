import { useEffect, useState } from 'react';
import { Mail, Pill, FileCheck2 } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext.jsx';
import { pendingInvites } from '../../api/invites.js';
import { Card } from '../../components/ui/Card.jsx';
import { Avatar } from '../../components/ui/Avatar.jsx';

function ageFrom(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
}

export default function Home() {
  const { currentProfile } = useProfile();
  const [invites, setInvites] = useState([]);

  useEffect(() => {
    let active = true;
    pendingInvites()
      .then((list) => active && setInvites(list))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const age = ageFrom(currentProfile?.dateOfBirth);
  const subtitle = [
    currentProfile?.relation,
    age != null ? `${age} yrs` : null,
    currentProfile?.bloodGroup,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="space-y-6">
      {invites.length > 0 && (
        <Card className="border-accent-200 bg-accent-50">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-accent-700" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-accent-900">
                You have {invites.length} pending invite{invites.length > 1 ? 's' : ''}
              </p>
              <p className="mt-0.5 text-sm text-accent-800">
                {invites.map((i) => `${i.profileName} (${i.role})`).join(', ')}. Open the invite
                link shared with you to accept.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="flex items-center gap-4">
        <Avatar name={currentProfile?.name} src={currentProfile?.photoUrl} size={56} />
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight text-ink-900">
            {currentProfile?.name}
          </h1>
          {subtitle && <p className="text-sm capitalize text-ink-500">{subtitle}</p>}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2 text-ink-900">
            <Pill className="h-5 w-5 text-accent-600" aria-hidden="true" />
            <h3 className="font-semibold">Today&apos;s doses</h3>
          </div>
          <p className="mt-2 text-sm text-ink-500">
            Confirm a prescription and dose reminders will appear here.
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-ink-900">
            <FileCheck2 className="h-5 w-5 text-accent-600" aria-hidden="true" />
            <h3 className="font-semibold">Needs your review</h3>
          </div>
          <p className="mt-2 text-sm text-ink-500">
            Uploaded documents waiting for your review will show up here.
          </p>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-ink-900">Get started</h3>
        <p className="mt-1 text-sm text-ink-600">
          Upload a prescription or lab report to begin building {currentProfile?.name}&apos;s
          record. Uploading is enabled in a later build step.
        </p>
      </Card>
    </div>
  );
}
