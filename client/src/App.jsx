import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Skeleton } from './components/ui/Skeleton.jsx';
import { ProtectedRoute } from './components/routing/ProtectedRoute.jsx';
import { PublicOnlyRoute } from './components/routing/PublicOnlyRoute.jsx';

const Landing = lazy(() => import('./pages/Landing.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const AppHome = lazy(() => import('./pages/AppHome.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
// Dev-only component gallery. Removed before Step 25.
const UiPreview = lazy(() => import('./pages/UiPreview.jsx'));

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
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppHome />
            </ProtectedRoute>
          }
        />
        {import.meta.env.DEV && <Route path="/ui-preview" element={<UiPreview />} />}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
