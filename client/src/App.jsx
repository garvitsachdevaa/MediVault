import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Skeleton } from './components/ui/Skeleton.jsx';

const Landing = lazy(() => import('./pages/Landing.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
// Dev-only component gallery. Removed before Step 25.
const UiPreview = lazy(() => import('./pages/UiPreview.jsx'));

function PageFallback() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {import.meta.env.DEV && <Route path="/ui-preview" element={<UiPreview />} />}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
