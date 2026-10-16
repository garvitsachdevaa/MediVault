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

// Health Summary lists. Each item needs a name; the rest are optional.
const text = z.string().trim().max(200).optional().or(z.literal(''));
const allergyItem = z.object({ name: z.string().trim().min(1).max(120), reaction: text, notes: text });
const conditionItem = z.object({ name: z.string().trim().min(1).max(120), since: text, notes: text });
const immunisationItem = z.object({
  name: z.string().trim().min(1).max(120),
  date: optionalDate,
  notes: text,
});

export const updateSummarySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  relation: relation.optional(),
  dateOfBirth: optionalDate,
  bloodGroup: z.string().trim().max(10).optional(),
  allergies: z.array(allergyItem).optional(),
  conditions: z.array(conditionItem).optional(),
  immunisations: z.array(immunisationItem).optional(),
});
