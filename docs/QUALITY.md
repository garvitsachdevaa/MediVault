# MediVault — Quality, Accessibility & Security

## Accessibility
- Every form input has an associated `<label>` (via `FormField` / `htmlFor`).
- Interactive elements are real `<button>`/`<a>` and keyboard-reachable with a visible
  `focus-visible` ring (accent-coloured).
- Status is never conveyed by colour alone — `StatusChip` always pairs an icon + text label.
- Colour palette ("ink" + accent) chosen for readable contrast (AA) on white surfaces.
- `prefers-reduced-motion` is respected (animations disabled).
- Responsive at 375 / 768 / 1280 px: sidebar collapses to a bottom nav; grids stack.

## Loading / empty / error states
- Lists and pages show a `Skeleton` while loading, an `EmptyState` (with an action) when
  empty, and an `ErrorState` (with retry) on failure.

## Performance
- All pages are lazy-loaded (`React.lazy` + `Suspense`); heavy deps (recharts) load only on
  their tab.
- Documents are processed one at a time (`p-limit(1)`) to stay within the free server's memory.
- MongoDB indexes: Document `(profileId, createdAt)` + `status`; LabResult
  `(profileId, testCode, takenAt)`; DoseLog `(status, scheduledAt)` + unique `(medicationId, scheduledAt)`;
  TimelineEvent `(profileId, occurredAt)` + text index; Notification `(userId, read, createdAt)`;
  Membership unique `(profileId, userId)`; ShareLink unique `tokenHash`.
- Computed results / home / visit-summary are cached 60s per profile (`node-cache`), invalidated
  on confirm / home reading / delete.

## Security & privacy
- Every `/api/profiles/:profileId/...` route is guarded by `requireProfileAccess(minRole)`;
  document/medication/dose/visit/share routes derive the profile from the record and re-check
  membership. Non-members get **404** (ids are not discoverable); low roles get **403**.
- All request bodies are validated with zod.
- Rate limits: general limiter on all `/api`, stricter on auth, upload, and public doctor notes.
- Passwords hashed with bcrypt (cost 10); `passwordHash` is `select:false` and stripped in `toJSON`.
- JWT auth in the `Authorization: Bearer` header (no cross-site cookies).
- Files are stored **private** (Cloudinary `type: authenticated`); only short-lived (5 min) signed
  URLs work. Invite and share tokens are random 32-byte values; only their SHA-256 hash is stored.
- Share links are expiring + revocable; the public doctor view returns **410** when expired/revoked.
- Admin (platform role) sees aggregate numbers only — never health content.
- Error responses use one shape `{ error: { code, message } }`; stack traces are hidden in
  production and only unexpected (non-operational) 5xx errors are logged.
- Dev-only helpers (`/api/dev/*`, `/ui-preview`) were removed before release.
- Secrets live only in `.env` (gitignored) and the host dashboards — never committed.

## Testing
- Server: `npm test` (vitest + supertest + mongodb-memory-server replica set).
- 53 tests cover auth, profiles/roles/invites, health summary, document ingestion
  (MIME detection + validation), the extraction post-processing (OCR noise, frequency parsing,
  test normalisation, flag computation, confidence, rule-based parser), review/confirm
  transactions, notifications, and dose scheduling / missed-dose detection.
