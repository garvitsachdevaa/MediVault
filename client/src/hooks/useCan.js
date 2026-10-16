import { useProfile } from '../context/ProfileContext.jsx';

// Which per-profile roles may perform each action. Viewers can only read.
const CAN = {
  edit: ['caregiver', 'owner'],
  upload: ['caregiver', 'owner'],
  confirm: ['caregiver', 'owner'],
  logDose: ['caregiver', 'owner'],
  comment: ['viewer', 'caregiver', 'owner'],
  manageMembers: ['owner'],
  invite: ['owner'],
  deleteProfile: ['owner'],
};

export function useCan(action) {
  const { currentRole } = useProfile();
  return !!currentRole && (CAN[action]?.includes(currentRole) ?? false);
}
