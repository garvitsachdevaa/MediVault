import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, FileCheck2, Activity, CalendarDays } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext.jsx';
import { pendingInvites } from '../../api/invites.js';
import { getHome } from '../../api/home.js';
import { Card } from '../../components/ui/Card.jsx';
import { Avatar } from '../../components/ui/Avatar.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { StatusChip } from '../../components/ui/StatusChip.jsx';
import { TodayDoses } from '../../components/medicines/TodayDoses.jsx';

function ageFrom(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
}

export default function Home() {
  const { currentProfile, currentProfileId } = useProfile();
  const [invites, setInvites] = useState([]);
  const [home, setHome] = useState(null);

  useEffect(() => {
    let active = true;
    pendingInvites().then((l) => active && setInvites(l)).catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!currentProfileId) return;
    setHome(null);
    getHome(currentProfileId).then(setHome).catch(() => setHome({}));
  }, [currentProfileId]);

  const age = ageFrom(currentProfile?.dateOfBirth);
  const subtitle = [currentProfile?.relation, age != null ? `${age} yrs` : null, currentProfile?.bloodGroup]
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
                {invites.map((i) => `${i.profileName} (${i.role})`).join(', ')}. Open the invite link shared with you to accept.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="flex items-center gap-4">
        <Avatar name={currentProfile?.name} src={currentProfile?.photoUrl} size={56} />
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight text-ink-900">{currentProfile?.name}</h1>
          {subtitle && <p className="text-sm capitalize text-ink-500">{subtitle}</p>}
        </div>
      </div>

      <TodayDoses />

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2 text-ink-900">
            <FileCheck2 className="h-5 w-5 text-accent-600" aria-hidden="true" />
            <h3 className="font-semibold">Needs your review</h3>
          </div>
          {home?.needsReview > 0 ? (
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm text-ink-600">{home.needsReview} document(s) waiting.</p>
              <Link to="/app/records"><Button size="sm">Review</Button></Link>
            </div>
          ) : (
            <p className="mt-2 text-sm text-ink-500">Nothing waiting for review.</p>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-ink-900">
            <CalendarDays className="h-5 w-5 text-accent-600" aria-hidden="true" />
            <h3 className="font-semibold">Upcoming visit</h3>
          </div>
          {home?.nextVisit ? (
            <p className="mt-2 text-sm text-ink-600">
              {home.nextVisit.doctorName || 'Visit'} · {new Date(home.nextVisit.date).toLocaleDateString()}
            </p>
          ) : (
            <p className="mt-2 text-sm text-ink-500">No upcoming visits.</p>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 text-ink-900">
          <Activity className="h-5 w-5 text-accent-600" aria-hidden="true" />
          <h3 className="font-semibold">Latest results</h3>
        </div>
        {home?.keyResults?.length > 0 ? (
          <ul className="mt-2 divide-y divide-ink-100 text-sm">
            {home.keyResults.map((r) => (
              <li key={r.testCode} className="flex items-center justify-between py-1.5">
                <span className="text-ink-700">{r.displayName}</span>
                <span className="text-ink-900">{r.value} {r.unit} <StatusChip status={r.flag} /></span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink-500">Confirm a lab report or log a reading to see results.</p>
        )}
      </Card>

      {home?.recentActivity?.length > 0 && (
        <Card>
          <h3 className="font-semibold text-ink-900">Recent activity</h3>
          <ul className="mt-2 divide-y divide-ink-100 text-sm">
            {home.recentActivity.map((e) => (
              <li key={e._id} className="flex items-center justify-between py-1.5">
                <span className="text-ink-700">{e.title}</span>
                <span className="text-xs text-ink-400">{new Date(e.occurredAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
