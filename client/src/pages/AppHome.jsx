import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Logo } from '../components/brand/Logo.jsx';
import { Footer } from '../components/layout/Footer.jsx';

// Temporary logged-in landing. Replaced by the full app shell in Step 7.
export default function AppHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <header className="border-b border-ink-200/70 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
          <Logo size={28} />
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900">
          Hello, {user?.name} 👋
        </h1>
        <p className="mt-2 text-ink-600">
          You are logged in. The full app shell (profiles, tabs, upload) arrives in Step 7.
        </p>
      </main>

      <Footer />
    </div>
  );
}
