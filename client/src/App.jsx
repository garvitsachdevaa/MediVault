import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Skeleton } from './components/ui/Skeleton.jsx';
import { ProtectedRoute } from './components/routing/ProtectedRoute.jsx';
import { PublicOnlyRoute } from './components/routing/PublicOnlyRoute.jsx';
import { AppShell } from './components/layout/AppShell.jsx';

const Landing = lazy(() => import('./pages/Landing.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const AcceptInvite = lazy(() => import('./pages/AcceptInvite.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
// Dev-only component gallery. Removed before Step 25.
const UiPreview = lazy(() => import('./pages/UiPreview.jsx'));

// App (logged-in) tabs.
const Home = lazy(() => import('./pages/app/Home.jsx'));
const HealthSummary = lazy(() => import('./pages/app/HealthSummary.jsx'));
const Records = lazy(() => import('./pages/app/Records.jsx'));
const Medicines = lazy(() => import('./pages/app/Medicines.jsx'));
const Results = lazy(() => import('./pages/app/Results.jsx'));
const Visits = lazy(() => import('./pages/app/Visits.jsx'));
const Family = lazy(() => import('./pages/app/Family.jsx'));
const Notifications = lazy(() => import('./pages/app/Notifications.jsx'));
const Settings = lazy(() => import('./pages/app/Settings.jsx'));

function PageFallback() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6 pt-10">
      <Skeleton className="h-10 w-2/5" />
      <Skeleton className="h-6 w-3/5" />
      <div className="grid gap-5 md:grid-cols-3">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />
        <Route path="/invite/:token" element={<AcceptInvite />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="summary" element={<HealthSummary />} />
          <Route path="records" element={<Records />} />
          <Route path="medicines" element={<Medicines />} />
          <Route path="results" element={<Results />} />
          <Route path="visits" element={<Visits />} />
          <Route path="family" element={<Family />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {import.meta.env.DEV && <Route path="/ui-preview" element={<UiPreview />} />}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
