import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authApi from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true); // initial /me check in progress

  // On first load, if a token exists, fetch the current user.
  useEffect(() => {
    let active = true;
    const init = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await authApi.getMe();
        if (active) setUser(data.user);
      } catch {
        localStorage.removeItem('token');
        if (active) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    init();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = useCallback((userData, tok) => {
    localStorage.setItem('token', tok);
    setToken(tok);
    setUser(userData);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const data = await authApi.login(credentials);
      persist(data.user, data.token);
      return data.user;
    },
    [persist]
  );

  const register = useCallback(
    async (payload) => {
      const data = await authApi.register(payload);
      persist(data.user, data.token);
      return data.user;
    },
    [persist]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    setUser, // used by later steps (profile edits, etc.)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
