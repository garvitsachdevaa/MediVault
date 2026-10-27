import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, FileCheck2, Activity, CalendarDays, ArrowRight } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext.jsx';
import { pendingInvites } from '../../api/invites.js';
import { getHome } from '../../api/home.js';
import { Card } from '../../components/ui/Card.jsx';
import { Avatar } from '../../components/ui/Avatar.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { StatusChip } from '../../components/ui/StatusChip.jsx';
import { StatTile } from '../../components/ui/StatTile.jsx';
import { TodayDoses } from '../../components/medicines/TodayDoses.jsx';
import { RevealGroup, Reveal } from '../../components/ui/Reveal.jsx';
import { EASE_OUT } from '../../lib/motion.js';

function ageFrom(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
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

  const needsReview = home?.needsReview || 0;
  const nextVisit = home?.nextVisit;
  const keyResults = home?.keyResults || [];

  return (
    <div className="space-y-6">
      {invites.length > 0 && (
        <Card variant="accent" className="border-accent-200/80">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-accent-700 shadow-xs ring-1 ring-accent-100">
              <Mail className="h-5 w-5" aria-hidden="true" />
            </span>
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

      {/* Editorial welcome hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE_OUT }}
        className="relative overflow-hidden rounded-3xl border border-ink-200/60 bg-white/80 p-6 shadow-card backdrop-blur-sm sm:p-8"
      >
        <div className="pointer-events-none absolute inset-0 bg-brand-mesh opacity-80" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 animate-aurora-drift rounded-full bg-accent-200/40 blur-3xl" aria-hidden="true" />
        <div className="relative flex items-center gap-4 sm:gap-5">
          <span className="rounded-full p-1 ring-2 ring-accent-200/70">
            <Avatar name={currentProfile?.name} src={currentProfile?.photoUrl} size={64} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent-600">
              {greeting()}
            </p>
            <h1 className="mt-1 truncate font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
              {currentProfile?.name}
            </h1>
            {subtitle && <p className="mt-1 text-sm capitalize text-ink-500">{subtitle}</p>}
          </div>
        </div>
      </motion.div>

      {/* Dashboard stat tiles */}
      <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Reveal as="div">
          <StatTile
            as={Link}
            to="/app/records"
            icon={FileCheck2}
            tone={needsReview > 0 ? 'warning' : 'accent'}
            interactive
            label="Needs your review"
            value={needsReview}
            hint={needsReview > 0 ? 'Document(s) waiting to confirm' : 'Nothing waiting — all caught up'}
          />
        </Reveal>
        <Reveal as="div">
          <StatTile
            as={Link}
            to="/app/visits"
            icon={CalendarDays}
            tone="accent"
            interactive
            label="Upcoming visit"
            value={nextVisit ? new Date(nextVisit.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : 'None'}
            hint={nextVisit ? nextVisit.doctorName || 'Scheduled visit' : 'No upcoming visits'}
          />
        </Reveal>
        <Reveal as="div">
          <StatTile
            as={Link}
            to="/app/results"
            icon={Activity}
            tone="accent"
            interactive
            label="Tracked results"
            value={keyResults.length}
            hint={keyResults.length > 0 ? 'Lab values on record' : 'Log a reading to start tracking'}
          />
        </Reveal>
      </RevealGroup>

      <TodayDoses />

      <RevealGroup className="grid gap-5 md:grid-cols-2">
        <Reveal as="div">
          <Card className="h-full" variant="default">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-ink-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-50 text-accent-700 ring-1 ring-accent-100">
                  <Activity className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="font-semibold">Latest results</h3>
              </div>
              {keyResults.length > 0 && (
                <Link to="/app/results" className="inline-flex items-center gap-1 text-sm font-semibold text-accent-700 hover:text-accent-800">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
            {keyResults.length > 0 ? (
              <ul className="mt-4 divide-y divide-ink-100 text-sm">
                {keyResults.map((r) => (
                  <li key={r.testCode} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="font-medium text-ink-700">{r.displayName}</span>
                    <span className="flex items-center gap-2 text-ink-900">
                      <span className="tabular font-semibold">{r.value}</span>
                      <span className="text-ink-500">{r.unit}</span>
                      <StatusChip status={r.flag} size="sm" />
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-ink-500">Confirm a lab report or log a reading to see results.</p>
            )}
          </Card>
        </Reveal>

        <Reveal as="div">
          <Card className="h-full" variant="default">
            <div className="flex items-center gap-2.5 text-ink-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-50 text-accent-700 ring-1 ring-accent-100">
                <CalendarDays className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="font-semibold">Recent activity</h3>
            </div>
            {home?.recentActivity?.length > 0 ? (
              <ul className="mt-4 divide-y divide-ink-100 text-sm">
                {home.recentActivity.map((e) => (
                  <li key={e._id} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="min-w-0 truncate font-medium text-ink-700">{e.title}</span>
                    <span className="shrink-0 text-xs text-ink-400">{new Date(e.occurredAt).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-ink-500">Your confirmed records and readings will appear here.</p>
            )}
          </Card>
        </Reveal>
      </RevealGroup>
    </div>
  );
}
