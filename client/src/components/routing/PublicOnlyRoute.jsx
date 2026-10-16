import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { PageLoader } from '../layout/PageLoader.jsx';

// Keeps logged-in users out of login/register — sends them into the app.
export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/app" replace />;
  return children;
}
