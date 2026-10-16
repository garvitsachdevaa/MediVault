import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { useProfile } from '../context/ProfileContext.jsx';
import * as invitesApi from '../api/invites.js';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Logo } from '../components/brand/Logo.jsx';
import { Footer } from '../components/layout/Footer.jsx';

export default function AcceptInvite() {
  const { token } = useParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { refresh, selectProfile } = useProfile();
  const navigate = useNavigate();

  const [invite, setInvite] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    let active = true;
    invitesApi
      .getInvite(token)
      .then((i) => active && setInvite(i))
      .catch((e) => active && setError(e.message || 'This invite is invalid or has expired'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [token]);

  const accept = async () => {
    setAccepting(true);
    try {
      const res = await invitesApi.acceptInvite(token);
      await refresh();
      if (res.profileId) selectProfile(res.profileId);
      toast.success('Invite accepted');
      navigate('/app');
    } catch (e) {
      setError(e.message || 'Could not accept this invite');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md text-center">
          <div className="flex justify-center">
            <Logo size={30} />
          </div>

          {loading || authLoading ? (
            <p className="mt-6 text-sm text-ink-500">Loading invite…</p>
          ) : error ? (
            <>
              <h1 className="mt-5 text-xl font-bold text-ink-900">Invite unavailable</h1>
              <p className="mt-2 text-sm text-ink-500">{error}</p>
              <Link to="/" className="mt-6 inline-block">
                <Button variant="outline">Go home</Button>
              </Link>
            </>
          ) : (
            <>
              <h1 className="mt-5 text-xl font-bold text-ink-900">You&apos;re invited</h1>
              <p className="mt-2 text-sm text-ink-600">
                <span className="font-semibold">{invite.inviterName}</span> invited you to access{' '}
                <span className="font-semibold">{invite.profileName}</span>&apos;s health record as{' '}
                <span className="font-semibold capitalize">{invite.role}</span>.
              </p>
              <p className="mt-2 text-xs text-ink-400">Invite sent to {invite.email}</p>

              {isAuthenticated ? (
                <Button className="mt-6 w-full" size="lg" loading={accepting} onClick={accept}>
                  Accept invite
                </Button>
              ) : (
                <div className="mt-6 space-y-2">
                  <p className="text-sm text-ink-500">
                    Log in or create an account with{' '}
                    <span className="font-medium">{invite.email}</span> to accept.
                  </p>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => navigate('/login', { state: { from: `/invite/${token}` } })}
                  >
                    Log in
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/register', { state: { from: `/invite/${token}` } })}
                  >
                    Create account
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
      <Footer />
    </div>
  );
}
