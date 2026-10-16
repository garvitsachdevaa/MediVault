import { z } from 'zod';

const relation = z.enum(['self', 'mother', 'father', 'child', 'spouse', 'other']);
const role = z.enum(['owner', 'caregiver', 'viewer']);

// Treat '' / null as "not provided", otherwise coerce to a Date.
const optionalDate = z.preprocess(
  (v) => (v === '' || v == null ? undefined : v),
  z.coerce.date().optional()
);

export const createProfileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  relation: relation.default('self'),
  dateOfBirth: optionalDate,
  bloodGroup: z.string().trim().max(10).optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  relation: relation.optional(),
  dateOfBirth: optionalDate,
  bloodGroup: z.string().trim().max(10).optional(),
  photoUrl: z.string().url().optional(),
});

export const createInviteSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  role,
});

export const updateMemberRoleSchema = z.object({ role });
