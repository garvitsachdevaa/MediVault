import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { PageLoader } from '../layout/PageLoader.jsx';

// Guards authenticated areas. Sends guests to /login, remembering where they
// were headed so we can return there after a successful login.
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
