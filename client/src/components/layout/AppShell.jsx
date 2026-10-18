import { Suspense, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Upload,
  Bell,
  LogOut,
  Users,
  Settings as SettingsIcon,
  ChevronDown,
  Plus,
  Check,
  Menu as MenuIcon,
  HeartPulse,
  CalendarDays,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useProfile } from '../../context/ProfileContext.jsx';
import { Logo, LogoMark } from '../brand/Logo.jsx';
import { Avatar } from '../ui/Avatar.jsx';
import { Button } from '../ui/Button.jsx';
import { Skeleton } from '../ui/Skeleton.jsx';
import { Dropdown, DropdownItem } from '../ui/Dropdown.jsx';
import { PageLoader } from './PageLoader.jsx';
import { Footer } from './Footer.jsx';
import { NAV, MOBILE_PRIMARY } from './nav.js';
import { CreateProfileForm } from '../profiles/CreateProfileForm.jsx';
import { AddProfileModal } from '../profiles/AddProfileModal.jsx';
import { UploadSheet } from '../documents/UploadSheet.jsx';
import { NotificationBell } from '../notifications/NotificationBell.jsx';

function ContentFallback() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-1/3" />
      <div className="grid gap-5 md:grid-cols-2">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    </div>
  );
}

function ProfileSwitcher() {
  const { profiles, currentProfile, selectProfile } = useProfile();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <Dropdown
        align="left"
        trigger={
          <span className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-2.5 py-1.5 hover:bg-ink-50">
            <Avatar name={currentProfile?.name} src={currentProfile?.photoUrl} size={26} />
            <span className="max-w-[9rem] truncate text-sm font-semibold text-ink-800">
              {currentProfile?.name || 'Select profile'}
            </span>
            <ChevronDown className="h-4 w-4 text-ink-400" aria-hidden="true" />
          </span>
        }
      >
        {profiles.map((p) => (
          <DropdownItem key={p._id} onClick={() => selectProfile(p._id)}>
            <Avatar name={p.name} src={p.photoUrl} size={22} />
            <span className="flex-1 truncate">{p.name}</span>
            {p._id === currentProfile?._id && <Check className="h-4 w-4 text-accent-600" />}
          </DropdownItem>
        ))}
        <div className="my-1 h-px bg-ink-100" />
        <DropdownItem icon={Plus} onClick={() => setAddOpen(true)}>
          Add profile
        </DropdownItem>
      </Dropdown>
      <AddProfileModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}

function AccountMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <Dropdown
      trigger={
        <span className="block rounded-full ring-2 ring-transparent hover:ring-ink-200">
          <Avatar name={user?.name} src={user?.photoUrl} size={34} />
        </span>
      }
    >
      <div className="px-3 py-2">
        <p className="truncate text-sm font-semibold text-ink-900">{user?.name}</p>
        <p className="truncate text-xs text-ink-500">{user?.email}</p>
      </div>
      <div className="my-1 h-px bg-ink-100" />
      <DropdownItem icon={Users} onClick={() => navigate('/app/family')}>
        Family &amp; access
      </DropdownItem>
      <DropdownItem icon={Bell} onClick={() => navigate('/app/notifications')}>
        Notifications
      </DropdownItem>
      <DropdownItem icon={SettingsIcon} onClick={() => navigate('/app/settings')}>
        Settings
      </DropdownItem>
      <div className="my-1 h-px bg-ink-100" />
      <DropdownItem icon={LogOut} onClick={handleLogout}>
        Log out
      </DropdownItem>
    </Dropdown>
  );
}

function TopBar({ onUpload }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-ink-200/70 bg-white/90 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <span className="md:hidden">
          <LogoMark size={28} />
        </span>
        <ProfileSwitcher />
      </div>
      <div className="flex items-center gap-1.5">
        <Button variant="subtle" size="sm" onClick={onUpload}>
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Upload</span>
        </Button>
        <NotificationBell />
        <AccountMenu />
      </div>
    </header>
  );
}

function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-200/70 bg-white md:flex">
      <div className="flex h-16 items-center px-6">
        <Logo size={28} />
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map(({ to, end, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-accent-50 text-accent-800'
                  : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
              }`
            }
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

const MORE_ITEMS = [
  { to: '/app/summary', label: 'Health Summary', Icon: HeartPulse },
  { to: '/app/visits', label: 'Visits', Icon: CalendarDays },
  { to: '/app/family', label: 'Family & access', Icon: Users },
  { to: '/app/settings', label: 'Settings', Icon: SettingsIcon },
];

function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const navigate = useNavigate();
  const items = NAV.filter((n) => MOBILE_PRIMARY.includes(n.to));

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-ink-200 bg-white md:hidden">
        {items.map(({ to, end, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2 text-[0.7rem] font-medium ${
                isActive ? 'text-accent-700' : 'text-ink-500'
              }`
            }
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[0.7rem] font-medium text-ink-500"
        >
          <MenuIcon className="h-5 w-5" aria-hidden="true" />
          More
        </button>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMoreOpen(false)} aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white p-4 pb-6">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink-200" />
            <div className="grid grid-cols-2 gap-2">
              {MORE_ITEMS.map(({ to, label, Icon }) => (
                <button
                  key={to}
                  type="button"
                  onClick={() => {
                    navigate(to);
                    setMoreOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-ink-200 px-3 py-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
                >
                  <Icon className="h-5 w-5 text-ink-400" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function AppShell() {
  const { loading, profiles, currentProfileId } = useProfile();
  const navigate = useNavigate();
  const [uploadOpen, setUploadOpen] = useState(false);

  if (loading) return <PageLoader />;
  if (profiles.length === 0) return <CreateProfileForm />;

  return (
    <div className="flex min-h-screen bg-ink-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onUpload={() => setUploadOpen(true)} />
        <main className="flex-1 px-4 pb-24 pt-5 md:px-8 md:pb-10">
          <div className="mx-auto w-full max-w-5xl">
            <Suspense fallback={<ContentFallback />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
        <div className="hidden md:block">
          <Footer />
        </div>
      </div>
      <BottomNav />
      <UploadSheet
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        profileId={currentProfileId}
        onUploaded={() => {
          setUploadOpen(false);
          navigate('/app/records');
        }}
      />
    </div>
  );
}
