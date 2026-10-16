import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import * as profilesApi from '../api/profiles.js';

const ProfileContext = createContext(null);
const STORAGE_KEY = 'currentProfileId';

export function ProfileProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [currentProfileId, setCurrentProfileId] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await profilesApi.listProfiles();
      setProfiles(list);
      setCurrentProfileId((prev) =>
        prev && list.some((p) => p._id === prev) ? prev : list[0]?._id || null
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      load();
    } else {
      setProfiles([]);
      setCurrentProfileId(null);
      setLoading(false);
    }
  }, [isAuthenticated, load]);

  useEffect(() => {
    if (currentProfileId) localStorage.setItem(STORAGE_KEY, currentProfileId);
    else localStorage.removeItem(STORAGE_KEY);
  }, [currentProfileId]);

  const selectProfile = useCallback((id) => setCurrentProfileId(id), []);

  const addProfile = useCallback(
    async (data) => {
      const profile = await profilesApi.createProfile(data);
      await load();
      setCurrentProfileId(profile._id);
      return profile;
    },
    [load]
  );

  const currentProfile = profiles.find((p) => p._id === currentProfileId) || null;

  const value = {
    profiles,
    currentProfile,
    currentProfileId,
    currentRole: currentProfile?.role || null,
    loading,
    refresh: load,
    selectProfile,
    addProfile,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider');
  return ctx;
}
