# MediVault — Agentic Build Guide

> A step-by-step build plan for an AI coding agent (Claude Code, Cursor, etc.) working with you on the MediVault end-term MERN project.
> **Deadline:** 27 October 2026, 11:59 PM IST. **Start:** 16 October 2026.

---

## How to use this guide

1. Put this file in the root of your repository.
2. Open your coding agent in the repository and give it this instruction:

   > Read `MEDIVAULT_BUILD_GUIDE.md` fully. Follow the Agent Rules and the End-of-Step Protocol exactly. Start with Step 0. Do one step at a time and stop after each step.

3. After every step, the agent stops and gives you a report: what it built, how to test it, what you need to do, and a commit message.
4. You test, do your actions, commit, push, and reply **"pushed"** to move to the next step.

---

## Agent rules (the agent must follow these at all times)

1. **One step at a time.** Complete only the current step, then stop and report. Never start the next step until the user replies "pushed" or explicitly says to continue.
2. **Stay in scope.** Build only what the current step describes. If something seems missing or wrong in the plan, say so in the report and ask; do not silently add features.
3. **No GPU dependencies.** Never install or suggest torch, transformers, PaliGemma, Chandra, sentence-transformers, BERTopic, or any local ML model. Everything must run on a free CPU server with about 512 MB RAM.
4. **Ask before adding dependencies** that are not in the Tech Stack section. Explain why the new one is needed.
5. **Never handle secrets in chat.** Ask the user to put secret values in `.env` files themselves and reply "done". Never print, log, or commit secret values. Never commit any `.env` file.
6. **Never fake it.** No mock data presented as real, no hardcoded API responses, no disabled tests to make things pass. Seed and demo data must be clearly labelled as demo data.
7. **Make it actually work.** Before reporting a step as done, run the server and client, run the tests, and check the acceptance criteria. If something cannot be verified, say so plainly.
8. **Keep the user able to explain everything.** In each report, briefly explain any non-obvious design decision in plain words. The user must be able to defend every part in a viva.
9. **Update `STATUS.md`** at the end of every step (see below).
10. **Code conventions:** ES modules (`"type": "module"`) on the server, MVC folder structure, `async/await` everywhere, small functions, meaningful names, comments only where the "why" isn't obvious.
11. **Health-data safety:** never show health content to the admin role; files are private; every health-data route checks profile access; the "not medical advice" notice stays on every page.
12. **If blocked**, stop and ask a precise question instead of guessing.

---

## End-of-step protocol

At the end of **every** step, the agent must:

1. Run the app and the tests and confirm the acceptance checks pass.
2. Update `STATUS.md`.
3. Reply to the user using **exactly this template**:

```markdown
## ✅ Step <N> complete — <step title>

### What was done
- <plain-language summary of what was built and why>

### Files added or changed
- `path/to/file` — <one-line purpose>

### How to test it
1. <exact commands and clicks>
2. <what you should see>

### What I need from you
- <accounts to create, values to put in .env, sample files to add, decisions to make>
- <write "Nothing needed" if nothing>

### Commit and push
git add -A
git commit -m "<commit message from the guide>"
git push origin main

Reply **"pushed"** once done (and confirm any actions above) to start Step <N+1>: <next step title>.
```

---

## The status file (`STATUS.md`)

The agent creates `STATUS.md` in Step 0, adds it to `.gitignore`, and updates it after every step. It is your private progress tracker and is never pushed to GitHub.

Template:

```markdown
# MediVault — Build Status

**Last updated:** <date>
**Current step:** <N> — <title>
**Day:** <day number of 12> | **On schedule:** yes / behind by <n> steps

## Completed steps
| Step | Title | Date | Commit message | Notes |
|---|---|---|---|---|

## Waiting on you
- [ ] <action the user still has to do>

## Environment variables
| Variable | Where | Status |
|---|---|---|
| MONGO_URI | server/.env, Render | set / missing |
(never write the actual values here)

## Deployed URLs
- Client: <url or "not deployed">
- Server: <url or "not deployed">

## Known issues and blockers
- <issue> — <plan>

## Decisions made
- <decision> — <reason>

## Next step
<N+1> — <title>
```

---

## Product scope (the source of truth)

MediVault is a **patient-owned MyChart**: it turns a family's paper prescriptions and lab reports into an organised health portal. You upload a document, the app reads it, a person reviews and confirms it, and only confirmed data feeds medicines and reminders, lab trend charts, the health timeline, and doctor share links.

**Core rule:** nothing becomes health data until a person confirms it.

**Users and roles**
- Platform roles: `user`, `admin` (admin sees aggregate numbers only — stretch goal).
- Per-profile roles: `owner` (full control), `caregiver` (upload, review, edit, mark doses), `viewer` (read-only).
- Doctors: open a share link without an account, read-only, can leave a short note.

**Main tabs (per selected profile):** Home, Health Summary, Records (Timeline view + Documents view), Medicines (Active + Completed), Results (lab trends + home readings), Visits (Visits + Share links).

**Account pages:** Family & access, Notifications, Settings.
**Public pages:** Landing, Login, Register, Accept invite (`/invite/:token`), Doctor shared view (`/s/:token`).

**Deliberately not included:** diagnosis, dosage or drug-interaction advice, hospital or lab integrations, native mobile app, email or SMS, payments, any GPU or local ML model.

**Stretch goals (only after Step 25 is done):** source highlighting on the review screen, refill alert, duplicate generic-name warning, adherence streak, admin dashboard, semantic search, dark mode.

---

## Tech stack

**Server (`/server`):** Node.js 20+, Express 4 (as used in class), Mongoose 8, ES modules.

| Package | Purpose |
|---|---|
| express, cors, helmet, morgan | Web server, security headers, logging |
| express-rate-limit, express-mongo-sanitize | Rate limiting and NoSQL injection protection |
| bcryptjs, jsonwebtoken | Password hashing and JWT |
| zod | Validation of request bodies and AI output |
| multer | File uploads (memory storage) |
| cloudinary | Private file storage |
| file-type | MIME detection from file bytes |
| sharp | Image preprocessing before OCR |
| pdf-parse | Text extraction from PDFs that have a text layer |
| tesseract.js | CPU OCR with word confidence and boxes |
| @google/genai | Gemini API for structuring and handwriting |
| fuzzball | Fuzzy matching for test and medicine names |
| socket.io | Live progress, reminders, notifications |
| node-cron | Reminder and maintenance jobs |
| p-limit | Processing one document at a time |
| node-cache | Caching charts and summaries |
| dayjs (+ utc, timezone plugins) | Dates in Asia/Kolkata |
| vitest, supertest, mongodb-memory-server | Tests |

**Client (`/client`):** React 18 + Vite, React Router, Tailwind CSS.

| Package | Purpose |
|---|---|
| react-router-dom | Routing with lazy-loaded pages |
| axios | API calls with an auth interceptor |
| socket.io-client | Live updates |
| recharts | Trend charts with reference bands |
| react-hot-toast | Toast messages |
| lucide-react | Icons |
| qrcode.react | QR codes for share links |

**Hosting:** MongoDB Atlas (free M0), Cloudinary (free), Render (server, free web service), Vercel (client), cron-job.org or UptimeRobot (keep-alive ping).

**Auth decision:** JWT sent in the `Authorization: Bearer` header and stored in `localStorage`. Reason: the client (Vercel) and server (Render) are on different domains, and cross-site cookies are blocked by Safari and increasingly by Chrome, which would break the demo on a phone.

---

## Repository structure

```
medivault/
├── MEDIVAULT_BUILD_GUIDE.md
├── STATUS.md                  (gitignored)
├── README.md
├── .gitignore
├── docs/
│   └── GUIDELINES.md          (official class guidelines, pasted by you)
├── demo-documents/            (sample prescription and lab report files for testing)
├── client/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx, App.jsx
│       ├── api/               (axios instance + per-resource API functions)
│       ├── context/           (AuthContext, ProfileContext, SocketContext)
│       ├── hooks/
│       ├── components/
│       │   ├── layout/        (AppShell, Sidebar, BottomNav, TopBar, Footer)
│       │   ├── ui/            (Button, Card, StatusChip, Skeleton, EmptyState, Modal, ...)
│       │   └── <feature>/     (documents, review, medicines, results, ...)
│       ├── pages/
│       └── styles/
└── server/
    ├── package.json
    ├── .env.example
    └── src/
        ├── app.js, server.js
        ├── config/            (env, db, cloudinary, gemini)
        ├── models/
        ├── controllers/
        ├── routes/
        ├── middleware/        (auth, profileAccess, validate, errorHandler, rateLimits, upload)
        ├── services/          (business logic: notifications, reminders, sharing, cache)
        ├── pipeline/
        │   ├── ingestion/     (detector, validator, router)
        │   ├── extractors/    (pdfText, preprocess, tesseract, gemini, ruleBased)
        │   ├── postprocess/   (ocrNoise, medicineSpell, testNormaliser, flags, confidence)
        │   ├── schemas/       (zod schemas for extraction output)
        │   ├── queue.js
        │   └── orchestrator.js
        ├── jobs/              (cron jobs)
        ├── sockets/
        ├── data/              (testAliases.json, medicines.json)
        ├── utils/             (AppError classes, asyncHandler, tokens, dates)
        ├── scripts/           (seedDemo.js)
        └── tests/
```

---

## Environment variables

**`server/.env`**

| Variable | Example / note |
|---|---|
| NODE_ENV | development |
| PORT | 5000 |
| CLIENT_URL | http://localhost:5173 (comma-separated list allowed for CORS) |
| MONGO_URI | from MongoDB Atlas |
| JWT_SECRET | long random string |
| JWT_EXPIRES_IN | 7d |
| CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET | from Cloudinary dashboard |
| GEMINI_API_KEY | from Google AI Studio |
| GEMINI_MODEL | current Gemini Flash model name (check Google's docs) |
| OCR_CONFIDENCE_THRESHOLD | 65 (below this, an image is treated as handwritten or low quality) |
| REVIEW_CONFIDENCE_THRESHOLD | 0.7 (fields below this are flagged for review) |
| MAX_UPLOAD_MB | 10 |
| APP_TIMEZONE | Asia/Kolkata |

**`client/.env`**

| Variable | Example |
|---|---|
| VITE_API_URL | http://localhost:5000/api |
| VITE_SOCKET_URL | http://localhost:5000 |

The agent keeps `server/.env.example` and `client/.env.example` up to date with every variable (no real values).

---

## Data models (reference for all steps)

- **User:** name, email (unique, lowercase), passwordHash, photoUrl, role (`user` | `admin`), timestamps.
- **HealthProfile:** name, relation (`self`, `mother`, `father`, `child`, `spouse`, `other`), dateOfBirth, bloodGroup, photoUrl, allergies [{ name, reaction, notes }], conditions [{ name, since, notes }], immunisations [{ name, date, notes }], createdBy.
- **Membership:** profileId, userId, role (`owner` | `caregiver` | `viewer`). Unique on (profileId, userId).
- **Invite:** profileId, email, role, tokenHash, invitedBy, status (`pending` | `accepted` | `revoked`), expiresAt.
- **Document:** profileId, uploadedBy, kind (`prescription` | `lab_report`), originalName, mimeType, sizeBytes, storage { publicId, resourceType, format, pages }, status (`uploaded` | `processing` | `needs_review` | `verified` | `failed`), stage, error, extraction { method (`pdf_text` | `ocr` | `vision` | `rule_fallback`), ocrMeanConfidence, rawText, draft, timings { ingestMs, ocrMs, llmMs, totalMs }, attempts }, confirmedBy, confirmedAt.
  - Every field in `draft` has the shape `{ value, confidence, flagged, readAs }`.
- **Prescription:** profileId, documentId, doctorName, clinic, date.
- **Medication:** profileId, prescriptionId, documentId, name, strength, form, dose, frequencyCode, timesOfDay ["09:00", "21:00"], asNeeded, instructions, startDate, endDate, durationDays, status (`active` | `completed` | `stopped`).
- **DoseLog:** medicationId, profileId, scheduledAt, status (`pending` | `taken` | `skipped` | `missed`), actedBy, actedAt, notifiedAt. Unique on (medicationId, scheduledAt).
- **LabResult:** profileId, documentId (optional), source (`lab` | `home`), testCode, displayName, value, unit, refLow, refHigh, flag (`low` | `normal` | `high` | `unknown`), takenAt, readAs.
- **TimelineEvent:** profileId, type (`document` | `prescription` | `lab_result` | `home_reading` | `visit` | `doctor_note`), refId, title, subtitle, doctorName, testCodes [], occurredAt, searchText (text index).
- **Visit:** profileId, doctorName, speciality, date, reason, notes, reminderSentAt.
- **ShareLink:** profileId, createdBy, tokenHash, include { summary, medicines, testCodes [], documentIds [] }, expiresAt, revokedAt, viewCount, lastViewedAt, notes [{ text, authorName, createdAt }].
- **Comment:** profileId, targetType (`document` | `lab_result`), targetId, authorId, text.
- **Notification:** userId, profileId, type, title, body, link, read, timestamps.

---

## Day-by-day plan

| Day | Date | Steps | Focus |
|---|---|---|---|
| 1 | 16 Oct | 0, 1, 2 | Repository, server and client foundations |
| 2 | 17 Oct | 3, 4, 5 | Authentication and first deployment |
| 3 | 18 Oct | 6, 7, 8 | Profiles, roles, family invites, Health Summary |
| 4 | 19 Oct | 9, 10 | File storage, uploads, Socket.io, notifications |
| 5 | 20 Oct | 11, 12 | Ingestion layer, live progress, text and OCR extraction |
| 6 | 21 Oct | 13, 14 | Gemini structuring, post-processing, confidence, tests |
| 7 | 22 Oct | 15, 16 | Review screen, confirmation, document detail, comments |
| 8 | 23 Oct | 17, 18 | Medicines and the reminder engine |
| 9 | 24 Oct | 19, 20 | Results charts, home readings, timeline and search |
| 10 | 25 Oct | 21, 22 | Visits, share links, doctor view |
| 11 | 26 Oct | 23, 24 | Home dashboard, settings, deletion, polish and security |
| 12 | 27 Oct | 25 | Final deployment, demo data, README, demo prep, submission |

**If you fall behind,** cut in this order (last item cut first): comments → Visits (keep only "Prepare for visit" inside Share links) → home readings → timeline filters (keep search) → immunisations and conditions (keep allergies). Never cut: upload, extraction, review, medicines with reminders, lab trend chart, share link with doctor view, deployment.

---

# The steps

Each step lists: **Goal**, **Tasks**, **Acceptance checks**, **What the user must do**, and the **Commit message**. The agent follows the End-of-Step Protocol after every step.

---

## Step 0 — Repository setup and status tracking

**Goal:** a clean monorepo with the guide, the private status file, and the class guidelines in place.

**Tasks**
1. Create the folder structure from "Repository structure" (empty `client/` and `server/` for now, plus `docs/` and `demo-documents/`).
2. Create `.gitignore` with: `node_modules/`, `.env`, `.env.*` (but not `.env.example`), `dist/`, `build/`, `coverage/`, `.DS_Store`, `*.log`, `STATUS.md`, and `demo-documents/private/`.
3. Create `STATUS.md` from the template in this guide and fill in Step 0. Confirm it is ignored by running `git check-ignore STATUS.md` (it must print the filename).
4. Create `docs/GUIDELINES.md` with a placeholder heading asking the user to paste the official class guidelines.
5. Create a short `README.md` with the project name, a one-line description, and "Work in progress".
6. Add a root `package.json` with scripts: `dev` (runs client and server together with `concurrently`), `dev:server`, `dev:client`, `test`.
7. Initialise git if needed and set the default branch to `main`.

**Acceptance checks**
- `git status` does not show `STATUS.md`.
- `git check-ignore STATUS.md` prints `STATUS.md`.

**What the user must do**
- Create an empty GitHub repository named `medivault` and connect it: `git remote add origin <url>`.
- Paste the official guidelines, evaluation criteria, and submission requirements from the class repository into `docs/GUIDELINES.md`.
- Reply with anything in the guidelines that conflicts with this plan (the agent will re-check scope against `docs/GUIDELINES.md` at the start of Step 1).

**Commit message:** `chore: initialise monorepo, gitignore and build guide`

---

## Step 1 — Server foundation

**Goal:** a running Express server in MVC structure, connected to MongoDB, with security middleware and central error handling.

**Tasks**
1. First, read `docs/GUIDELINES.md`. If anything conflicts with this guide, list it in the report.
2. In `server/`, initialise `package.json` with `"type": "module"`, scripts `dev` (nodemon), `start`, `test` (vitest).
3. `src/config/env.js`: load and validate environment variables with zod at startup; crash with a clear message if one is missing.
4. `src/config/db.js`: connect with Mongoose; log success; exit on failure.
5. `src/utils/AppError.js`: base `AppError(statusCode, code, message)` and subclasses `ValidationError`, `AuthError`, `ForbiddenError`, `NotFoundError`, `UnsupportedFormatError`, `ExtractionError`.
6. `src/utils/asyncHandler.js`: wraps async controllers so errors reach the error handler.
7. `src/middleware/errorHandler.js`: one JSON error shape `{ error: { code, message, details? } }`; hide stack traces in production; handle zod, Mongoose validation, duplicate-key, and JWT errors.
8. `src/middleware/validate.js`: validates `req.body`, `req.query`, `req.params` against zod schemas.
9. `src/middleware/rateLimits.js`: a general limiter, plus stricter `authLimiter`, `uploadLimiter`, and `publicNoteLimiter` for later steps.
10. `src/app.js`: helmet, CORS (origins from `CLIENT_URL`), `express.json({ limit: '1mb' })`, mongo-sanitize, morgan (dev only), general limiter, routes under `/api`, 404 handler, error handler.
11. `GET /api/health` returns `{ status: 'ok', time }` (used later by the keep-alive ping).
12. `src/server.js`: create the HTTP server (Socket.io attaches here in Step 10), connect to the database, then listen.
13. Set up vitest with mongodb-memory-server; write one test for `/api/health` and one for the error handler shape.
14. Create `server/.env.example`.

**Acceptance checks**
- `npm run dev` in `server/` starts without errors and logs the database connection.
- `GET http://localhost:5000/api/health` returns `ok`.
- `npm test` passes.

**What the user must do**
- Create a free MongoDB Atlas M0 cluster, a database user, and allow network access from anywhere (`0.0.0.0/0`, needed for Render).
- Put `MONGO_URI` and a long random `JWT_SECRET` into `server/.env`. Reply "done" (do not paste the values).

**Commit message:** `feat(server): express foundation with mvc structure, db connection and error handling`

---

## Step 2 — Client foundation and design system

**Goal:** a Vite React app with routing, the visual system, and reusable UI pieces every later screen uses.

**Tasks**
1. Create the client with Vite (React). Install Tailwind and configure it.
2. Design tokens in the Tailwind config: one accent colour; status colours — green (normal, verified), amber (needs review, borderline), red (out of range, failed), grey (pending, unknown). Readable font stack and spacing scale.
3. `src/api/client.js`: axios instance using `VITE_API_URL`; request interceptor adds the Bearer token; response interceptor turns errors into `{ code, message }` and logs the user out on 401.
4. Reusable components in `components/ui/`: `Button` (variants, loading state), `Card`, `StatusChip` (icon + text label + colour, never colour alone), `Skeleton`, `EmptyState` (icon, message, action button), `ErrorState` (message + retry), `Modal`, `ConfirmDialog` (supports "type the name to confirm"), `Tabs`, `Input`, `Select`, `FormField` (label + error text).
5. `components/layout/Footer.jsx` with the notice: "MediVault records your health information. It is not medical advice."
6. React Router with lazy-loaded pages and a `Suspense` fallback of skeletons. Placeholder pages for: Landing, Login, Register, NotFound.
7. Toasts with react-hot-toast.
8. Create `client/.env.example`.

**Acceptance checks**
- `npm run dev` at the repository root runs both apps.
- Landing, Login, Register, and a 404 page render; the footer notice appears on each.
- A temporary `/ui-preview` route (dev only) shows every UI component; remove it before Step 25.

**What the user must do**
- Put `VITE_API_URL` and `VITE_SOCKET_URL` in `client/.env`. Reply "done".
- Optional: tell the agent a preferred accent colour.

**Commit message:** `feat(client): vite react setup with routing, tailwind design system and ui components`

---

## Step 3 — Authentication backend

**Goal:** secure registration, login, and an auth middleware for every protected route.

**Tasks**
1. `User` model as in "Data models". Hash passwords with bcryptjs (cost 10). Never return `passwordHash` in JSON (`toJSON` transform).
2. zod schemas: register (name, email, password ≥ 8 characters with a letter and a number), login.
3. Controllers and routes under `/api/auth`:
   - `POST /register` → creates the user, returns `{ user, token }`.
   - `POST /login` → returns `{ user, token }`; same error message for wrong email or wrong password.
   - `GET /me` → current user.
   - `PATCH /me` → update name.
   - `PATCH /me/password` → requires the current password.
4. `middleware/auth.js`: `requireAuth` reads the Bearer token, verifies it, loads the user, sets `req.user`. `requireAdmin` checks the platform role.
5. Apply `authLimiter` to register and login.
6. Tests: register, duplicate email, login success and failure, `/me` with and without a token.

**Acceptance checks**
- All auth tests pass.
- Passwords are hashed in the database; responses never include the hash.

**What the user must do**
- Nothing needed (test with the provided tests or an API client if you want).

**Commit message:** `feat(auth): jwt registration, login and protected route middleware`

---

## Step 4 — Authentication frontend

**Goal:** working register, login, and logout, with protected routes.

**Tasks**
1. `AuthContext`: holds the user and token; on load, calls `/auth/me` if a token exists; exposes `login`, `register`, `logout`.
2. `ProtectedRoute` and `PublicOnlyRoute` wrappers.
3. Register and Login pages: labelled fields, inline validation errors, loading state on submit, server errors shown clearly.
4. A simple Landing page: the pitch ("A patient-owned MyChart, built from your paper records"), three feature highlights, Register and Log in buttons, and the footer notice.
5. A temporary logged-in page at `/app` showing "Hello, <name>" and a Log out button (replaced in Step 7).

**Acceptance checks**
- Register → lands on `/app`. Refresh keeps you logged in. Log out → back to Landing.
- Visiting `/app` while logged out redirects to `/login`.

**What the user must do**
- Register a test account in the browser and confirm the flow works. Reply with any issues.

**Commit message:** `feat(client): login, register, auth context and protected routes`

---

## Step 5 — First deployment

**Goal:** deploy now, not on the last day, so hosting problems (CORS, environment variables, memory, sleeping servers) surface early.

**Tasks**
1. Server: add a `render.yaml` or document the Render settings — root directory `server`, build `npm install`, start `npm start`, Node 20.
2. Client: add `vercel.json` with a rewrite of all routes to `index.html` (so refreshing deep links works).
3. Make CORS accept the deployed client URL through `CLIENT_URL`.
4. Write a "Deployment" section in `README.md` with the exact steps and the environment variables for each platform.
5. Explain in the report that Render's free tier sleeps after about 15 minutes without traffic, which would stop reminder jobs, and that the keep-alive ping fixes this.

**Acceptance checks**
- The deployed client can register and log in against the deployed server.
- Refreshing `/app` on the deployed client does not give a 404.

**What the user must do**
- Create a Render web service from the repository and add all server environment variables.
- Create a Vercel project from the repository (root directory `client`) and add `VITE_API_URL` and `VITE_SOCKET_URL` pointing to Render.
- Set `CLIENT_URL` on Render to your Vercel URL.
- Create a free cron-job.org (or UptimeRobot) job that requests `https://<render-url>/api/health` every 10 minutes.
- Reply with the two deployed URLs (these are not secrets).

**Commit message:** `chore(deploy): render and vercel configuration with deployment docs`

---

## Step 6 — Health profiles and access control (backend)

**Goal:** profiles for self and family, per-profile roles, and invitations — the security backbone for all health data.

**Tasks**
1. Models: `HealthProfile`, `Membership`, `Invite` as in "Data models".
2. `middleware/profileAccess.js`: `requireProfileAccess(minRole)` reads `profileId` from the route, finds the membership, compares role rank (`viewer` < `caregiver` < `owner`), returns 404 if not a member (so profile IDs are not discoverable) and 403 if the role is too low, and sets `req.profile` and `req.membership`.
3. Routes:
   - `GET /api/profiles` → profiles the user belongs to, with the user's role on each.
   - `POST /api/profiles` → create a profile; creator becomes owner.
   - `GET /api/profiles/:profileId` (viewer), `PATCH` (caregiver), `DELETE` (owner — actual cascade is built in Step 23; for now return 501 with a clear message).
   - `GET /api/profiles/:profileId/members` (viewer), `PATCH /members/:userId` (owner, change role), `DELETE /members/:userId` (owner; an owner cannot remove themselves if they are the only owner).
   - `POST /api/profiles/:profileId/invites` (owner) → creates an invite; token is `crypto.randomBytes(32).toString('base64url')`; only its SHA-256 hash is stored; returns the invite link `CLIENT_URL/invite/<token>`. Expires in 7 days.
   - `GET /api/invites/:token` (public) → profile name, inviter name, role, validity.
   - `POST /api/invites/:token/accept` (auth) → creates the membership; the logged-in email must match the invite email.
   - `GET /api/invites/pending` (auth) → pending invites for the current user's email (shown in-app because email sending is out of scope).
4. Tests: role middleware (all role combinations), invite accept with matching and non-matching email, expired invite.

**Acceptance checks**
- A viewer cannot edit a profile (403); a non-member gets 404.
- Invite flow works end to end in tests.

**What the user must do**
- Nothing needed.

**Commit message:** `feat(profiles): health profiles, role-based profile access and family invites`

---

## Step 7 — App shell, profile switcher, family and invites (frontend)

**Goal:** the logged-in layout every tab lives in, plus the ability to add family and invite people.

**Tasks**
1. `ProfileContext`: loads the user's profiles, remembers the selected one in `localStorage`, exposes `currentProfile` and `currentRole`.
2. `AppShell`:
   - Top bar: profile switcher (avatar chips + "Add profile"), Upload button (opens a placeholder until Step 11), notification bell (placeholder until Step 10), account menu (Family & access, Notifications, Settings, Log out).
   - Desktop: left sidebar with Home, Health Summary, Records, Medicines, Results, Visits.
   - Mobile (below `md`): bottom bar with Home, Records, Medicines, Results, More (More opens Health Summary and Visits).
   - Footer notice.
3. Routes: `/app/home`, `/app/summary`, `/app/records`, `/app/medicines`, `/app/results`, `/app/visits`, `/app/family`, `/app/notifications`, `/app/settings`. Unbuilt tabs show an `EmptyState` saying "Coming soon".
4. First-run flow: if the user has no profiles, show a "Create your profile" form (name, date of birth, blood group, relation preset to Self).
5. "Add profile" modal (name, relation, date of birth, blood group).
6. Family & access page: for each profile, list members with role chips; owners can change roles, remove members, and create invites (email + role) — the invite link is shown with a Copy button and a note that the person must register or log in with that email.
7. `/invite/:token` page: shows who invited you to which profile and the role; Accept button (prompts login/register first if needed, then returns here).
8. Pending invites banner on Home if `/api/invites/pending` returns anything.
9. `useCan(action)` hook based on `currentRole`, so viewers never see upload, edit, or confirm buttons.

**Acceptance checks**
- Create "Me" and "Mom"; switching changes the selected profile everywhere.
- Invite a second test account as viewer; it can see Mom's profile but no edit buttons.
- Layout works at phone width (test in browser dev tools).

**What the user must do**
- Create a second test account (a different email) to test invites. Reply with any issues.

**Commit message:** `feat(client): app shell, profile switcher, family access page and invite flow`

---

## Step 8 — Health Summary

**Goal:** the MyChart-style summary page with manually entered allergies, conditions, and immunisations.

**Tasks**
1. Backend: `PATCH /api/profiles/:profileId/summary` (caregiver) accepting allergies, conditions, immunisations, with zod validation. Also allow editing name, date of birth, blood group, relation.
2. `GET /api/profiles/:profileId/summary` (viewer) returns the profile, those lists, plus placeholders for current medicines and key results (filled in Steps 17 and 19).
3. Page sections:
   - Header card: photo or initials, name, age (calculated), relation, blood group.
   - Allergies, Conditions, Immunisations: list cards with add, edit, delete (hidden for viewers); empty states.
   - Current medicines and Key results: empty states ("Appear after you confirm a prescription / lab report").
4. Profile photo upload is wired in Step 9; show initials until then.

**Acceptance checks**
- Add, edit, and delete an allergy; refresh shows the saved data.
- A viewer sees the lists without edit controls.

**What the user must do**
- Nothing needed.

**Commit message:** `feat(summary): health summary page with allergies, conditions and immunisations`

---

## Step 9 — Private file storage and document upload

**Goal:** secure upload of prescriptions and lab reports to private storage, with short-lived viewing links.

**Tasks**
1. `config/cloudinary.js`: configure from environment variables.
2. `middleware/upload.js`: multer memory storage, limit `MAX_UPLOAD_MB`, single file field `file`.
3. `pipeline/ingestion/detector.js`: detect real MIME type from bytes with `file-type`; allow only `application/pdf`, `image/jpeg`, `image/png`, `image/webp`. Reject anything else with `UnsupportedFormatError`, even if the extension looks right.
4. `pipeline/ingestion/validator.js`: size check, PDF page count (max 5 pages), image decodable by sharp, minimum image dimensions.
5. Upload to Cloudinary with `type: 'authenticated'` (not public) under the folder `medivault/<profileId>/documents/`. Store the public ID, resource type, format, and page count.
6. `Document` model as in "Data models". `POST /api/profiles/:profileId/documents` (caregiver, uploadLimiter) with body field `kind`. Saves status `uploaded`.
7. `GET /api/profiles/:profileId/documents` (viewer) with status filter and pagination; `GET /documents/:id` (viewer).
8. `GET /api/profiles/:profileId/documents/:id/file-url` (viewer): returns a short-lived URL (5 minutes) using Cloudinary's expiring private download URL. The agent must check the current Cloudinary docs for the right method for authenticated assets. If expiring URLs cannot be made to work, fall back to a server route that checks access and streams the file — and explain the choice in the report.
9. Profile and account photos: a separate upload helper storing public images under `medivault/avatars/`; wire the photo into Settings (account) and the Health Summary header (profile).
10. Frontend: an Upload sheet (choose kind, choose or capture a file — `accept="image/*,application/pdf"` and `capture` on mobile), progress bar for the upload itself, and the Records → Documents view: a grid of cards with thumbnail or file icon, kind, date, and `StatusChip`; filter by status.

**Acceptance checks**
- Uploading a renamed `.exe` as `.pdf` is rejected.
- The uploaded file is not reachable through a public Cloudinary URL; the signed URL works and expires.
- Documents appear in the grid as "Uploaded".

**What the user must do**
- Create a free Cloudinary account and put `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in `server/.env` and on Render. Reply "done".
- Put 4–6 test files in `demo-documents/`: a printed lab report PDF with a text layer, a scanned lab report, a phone photo of a printed prescription, and a photo of a handwritten prescription. Use sample documents or blur names and personal details; real patient data should go in `demo-documents/private/` (gitignored), never in the repository.

**Commit message:** `feat(documents): private cloudinary uploads with mime detection, validation and signed links`

---

## Step 10 — Socket.io and notifications

**Goal:** the real-time layer used by extraction progress, reminders, and family notifications.

**Tasks**
1. `sockets/index.js`: attach Socket.io to the HTTP server with the same CORS origins. Authenticate the handshake with the JWT (`auth.token`); reject invalid tokens.
2. Rooms: each socket joins `user:<userId>`. A client can `join-profile` / `leave-profile`; the server checks membership before joining `profile:<profileId>`.
3. `services/notificationService.js`: `notifyUsers(userIds, payload)` saves `Notification` documents and emits `notification:new` to each user room; `notifyProfileMembers(profileId, payload, { minRole, excludeUserId })`.
4. Routes: `GET /api/notifications` (paginated, unread filter), `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`, `GET /api/notifications/unread-count`.
5. Frontend `SocketContext`: connects after login with the token, disconnects on logout, joins the current profile room when the profile changes, reconnects automatically.
6. Notification bell: unread badge, dropdown of the latest 5, "See all" link. Notifications page with read/unread styling and "Mark all as read". New notifications also show a toast.
7. Add a dev-only route `POST /api/dev/test-notification` to verify the flow; remove it in Step 24.

**Acceptance checks**
- Triggering a test notification shows a toast and increments the badge without a page refresh, on two different browsers logged in as two members of the same profile.

**What the user must do**
- Test with two browsers (or one normal and one private window). Reply with any issues.

**Commit message:** `feat(realtime): socket.io with authenticated rooms and notification centre`

---

## Step 11 — Ingestion layer, processing queue and live progress

**Goal:** the pipeline skeleton: route documents, process them one at a time, and stream each stage to the browser.

**Tasks**
1. `pipeline/queue.js`: an in-memory queue using `p-limit(1)` (one document at a time, to protect memory on the free server). On server start, re-queue any documents stuck in `processing` or `uploaded`.
2. `pipeline/ingestion/router.js`: decides the path for each document:
   - PDF with a usable text layer (enough extractable characters per page) → `pdf_text` path.
   - Scanned PDF or image → `image` path (OCR decides later whether it is printed or handwritten).
3. `pipeline/orchestrator.js`: runs stages in order, updates `Document.status` and `stage`, records timings, and emits `document:progress` `{ documentId, stage, label, percent }` to `profile:<profileId>`. Stages: `queued` → `reading_file` → `extracting_text` → `understanding` → `checking` → `needs_review` (or `failed` with a readable error).
4. For this step, use stub extractors that return an empty draft, so the flow can be tested before real extraction exists. Mark them clearly as temporary.
5. `POST /documents/:id/rerun` (caregiver): resets and re-queues.
6. Upload now starts processing automatically.
7. Frontend: after upload, show a live progress stepper (the stages above with friendly labels such as "Reading your document", "Understanding it", "Checking the results"); document cards update their status chip live; when a document reaches "needs review", show a toast with a "Review now" button. Failed cards show the error and a Retry button.

**Acceptance checks**
- Uploading two documents quickly processes them one after another, with live progress on both cards.
- Restarting the server mid-processing re-queues the document.

**What the user must do**
- Nothing needed.

**Commit message:** `feat(pipeline): ingestion router, processing queue and live progress over sockets`

---

## Step 12 — Text and OCR extraction

**Goal:** real text extraction: direct PDF text where possible, OCR with image cleanup where not, and printed-versus-handwritten routing.

**Tasks**
1. `extractors/pdfText.js`: extract text with `pdf-parse` (check the installed version's import path and API; older versions run a debug test when imported from the package root).
2. Scanned PDFs: get page images. Preferred: request page images from Cloudinary server-side with a page transformation (`pg_<n>`, PNG) on the authenticated asset via a signed URL. If that does not work, use a Node PDF-to-image library that does not need system packages. Explain the choice in the report.
3. `extractors/preprocess.js` (sharp): auto-rotate from EXIF, convert to greyscale, normalise contrast, resize so the long side is about 2000 px, mild sharpen. Keep the processed buffer in memory only.
4. `extractors/tesseract.js`: create one shared Tesseract worker (English) at first use and reuse it; return text, mean confidence, and words with their confidence and bounding boxes. Release large buffers after use.
5. Routing rule in the orchestrator: if the mean OCR confidence is at or above `OCR_CONFIDENCE_THRESHOLD`, set method `ocr` (printed); otherwise set method `vision` (handwritten or poor quality — Gemini will read the image directly in Step 13).
6. Store `rawText`, `ocrMeanConfidence`, `method`, and timings on the document. Words and boxes are kept in the extraction record (needed for the source-highlighting stretch goal).
7. Log memory usage after each OCR job in development, and report peak memory.
8. Tests: router decision for text PDF vs scanned PDF vs image; threshold routing.

**Acceptance checks**
- The text-layer PDF uses `pdf_text` and skips OCR.
- The printed photo routes to `ocr`; the handwritten photo routes to `vision` (or report honestly if it does not, with the confidence values seen).
- Peak memory stays well under 512 MB.

**What the user must do**
- Run the test files from `demo-documents/` through the pipeline and reply with the reported OCR confidence for each, so the threshold can be tuned.

**Commit message:** `feat(pipeline): pdf text extraction, image preprocessing and tesseract ocr routing`

---

## Step 13 — Gemini structuring

**Goal:** turn raw text and images into structured, validated prescription and lab report data.

**Tasks**
1. `config/gemini.js`: client from `@google/genai` using `GEMINI_API_KEY` and `GEMINI_MODEL`. The agent checks Google's current docs for the SDK call and structured JSON output (response schema) before writing code.
2. `pipeline/schemas/`: zod schemas, and matching Gemini response schemas:
   - **Prescription:** `{ doctorName, clinic, date (YYYY-MM-DD or null), medicines: [{ name, strength, form, dose, frequency, durationDays, instructions, readAs }], notes }`
   - **Lab report:** `{ labName, date, tests: [{ readAs, name, value (number or null), valueText, unit, refLow, refHigh, refText }] }`
   - `readAs` is the exact text as written on the document.
3. Prompts (stored as constants in `extractors/gemini.js`):
   - Extract only what is written; return null for anything unreadable; never guess, infer, or add medical advice.
   - Keep medicine and test names as written in `readAs`, and give a cleaned name in `name`.
   - Keep frequency notation as written (OD, BD, TDS, 1-0-1, SOS).
4. Input by method:
   - `pdf_text` and `ocr`: send the text only.
   - `vision`: send the preprocessed image (or page images) and the OCR text, labelled as "possibly inaccurate OCR text for cross-checking".
   - If `ocr` output fails validation, retry once using `vision`.
5. Validate the response with zod. On invalid JSON, retry once with the validation error included. On a second failure, an API error, or a quota error, fall back to the rule-based parser (built in Step 14) instead of failing the document.
6. Record `llmMs`, the model name, and the attempt count.

**Acceptance checks**
- Each test document produces a draft that matches the zod schema.
- Turning off the network to Gemini (or using an invalid key) does not crash processing.

**What the user must do**
- Create a Gemini API key in Google AI Studio; put `GEMINI_API_KEY` and `GEMINI_MODEL` in `server/.env` and on Render. Reply "done".

**Commit message:** `feat(pipeline): gemini structured extraction with schema validation and retries`

---

## Step 14 — Post-processing, confidence scoring and the rule-based fallback

**Goal:** the part that makes extraction trustworthy and explainable: cleaning, normalising, computing flags in our own code, and scoring confidence from real signals.

**Tasks**
1. `postprocess/ocrNoise.js`: fix common OCR errors in numeric and dose contexts only — `O`/`o` → `0`, `l`/`I` → `1`, `S` → `5`, `B` → `8` inside numbers; `rng`, `mq` → `mg`; `m1` → `ml`; `1-O-1` → `1-0-1`. Never change letters inside ordinary words.
2. `data/medicines.json`: about 150 common generic and brand medicine names used in India (the agent compiles it and marks it as a spelling aid, not a medical reference). `postprocess/medicineSpell.js`: if a name has no exact match, fuzzy-match with fuzzball; if the score is high, suggest the match and keep the original in `readAs`.
3. `data/testAliases.json`: about 30 common tests (haemoglobin, HbA1c, fasting and post-prandial glucose, total cholesterol, LDL, HDL, triglycerides, TSH, T3, T4, creatinine, urea, vitamin D, vitamin B12, platelets, WBC, RBC, SGPT, SGOT, uric acid, and so on), each with a `testCode`, display name, aliases, and usual unit.
4. `postprocess/testNormaliser.js`: exact alias match first, then fuzzball `token_set_ratio` with threshold 88 (same idea as the deduplication threshold in the earlier ETL pipeline). Unmatched tests keep their name with `testCode` derived from the name and are flagged.
5. `postprocess/flags.js`: compute `low` / `normal` / `high` / `unknown` from value and reference range in code. Never use a flag from the AI.
6. `postprocess/frequency.js`: parse frequency into `{ code, timesPerDay, timesOfDay, asNeeded }`:

   | Written | Code | Default times |
   |---|---|---|
   | OD, QD, once daily, 1-0-0 | OD | 09:00 |
   | BD, BID, twice daily, 1-0-1 | BD | 09:00, 21:00 |
   | TDS, TID, thrice daily, 1-1-1 | TDS | 08:00, 14:00, 20:00 |
   | QID, four times daily | QID | 08:00, 12:00, 16:00, 20:00 |
   | HS, at bedtime, 0-0-1 | HS | 22:00 |
   | SOS, PRN, as needed | SOS | none (no reminders) |

   Other `x-y-z` patterns map to morning 09:00, afternoon 14:00, night 21:00.
7. `postprocess/confidence.js` — each field gets a score from 0 to 1:
   - Base by method: `pdf_text` 0.95; `ocr` = mean OCR confidence ÷ 100; `vision` 0.75; `rule_fallback` 0.4.
   - Cross-check: if the value cannot be found in the OCR text (fuzzball `partial_ratio` below 80), multiply by 0.6. (Skip for `pdf_text`.)
   - Validation: missing unit, unparseable dose or frequency, impossible date, or value outside a broad plausible range → multiply by 0.5.
   - Medicine name not in the dictionary, or test not matched → multiply by 0.7.
   - `flagged = confidence < REVIEW_CONFIDENCE_THRESHOLD`.
   Document this formula in a comment and in the README; the user must be able to explain it.
8. `extractors/ruleBased.js` (fallback when Gemini is unavailable): regex extraction of medicine lines (Tab/Cap/Syp + name + strength), doses (`\d+(\.\d+)? ?(mg|ml|mcg|g|iu)`), frequencies (the table above), durations (`x 5 days`, `for 1 week`), and lab lines (name, number, unit, range `a - b`).
9. Save the final `draft` with every field as `{ value, confidence, flagged, readAs }`; set status `needs_review` and notify caregivers and the owner ("Document ready for review").
10. Tests (these matter for marks): OCR noise rules, frequency parsing table, test normalisation including Hb / HGB / Haemoglobin → one code, flag computation at boundaries, confidence formula, rule-based parser on sample text.

**Acceptance checks**
- All post-processing tests pass.
- The demo documents produce drafts where obviously wrong or unreadable fields are flagged and clean fields are not.

**What the user must do**
- Run all demo documents and reply with how many fields were flagged on each and whether any obviously correct field was flagged (or wrong field not flagged), so thresholds can be tuned.

**Commit message:** `feat(pipeline): normalisation, computed flags, confidence scoring and rule-based fallback`

---

## Step 15 — Review screen and confirmation

**Goal:** the human-in-the-loop screen where extracted data becomes real health data.

**Tasks**
1. Models: `Prescription`, `Medication`, `LabResult`, `TimelineEvent` as in "Data models".
2. Routes:
   - `GET /documents/:id/review` (viewer) → document, draft, signed file URL.
   - `PATCH /documents/:id/draft` (caregiver) → save edits (edited fields get confidence 1 and `flagged: false`).
   - `POST /documents/:id/confirm` (caregiver) → in a MongoDB transaction (Atlas supports it): create the `Prescription` and `Medication`s, or the `LabResult`s with `source: 'lab'`; create `TimelineEvent`s; set the document to `verified`; record who confirmed and when. Medication `startDate` = prescription date or today; `endDate` = start + duration. Dose schedules are created in Step 17.
   - `POST /documents/:id/discard` (caregiver) → deletes the document and its stored file.
3. Review page `/app/review/:id`:
   - Split layout: left — document preview (image with zoom and rotate; PDF in an `<iframe>` or page images); right — the form.
   - Prescription form: doctor, clinic, date, and a row per medicine (name, strength, dose, frequency, duration in days, instructions) with add and remove.
   - Lab form: a row per test (name, value, unit, reference low and high, computed flag chip). Under each normalised name, show "read as <original>" in grey.
   - Flagged fields: amber border plus a "Check this · <confidence>%" tag. A banner at the top: "<n> fields need checking".
   - Buttons: Confirm (with a dialog summarising what will be saved), Save draft, Re-run extraction, Discard.
   - Mobile: two tabs, "Document" and "Details", instead of the split.
   - Viewers see the review read-only.
4. After confirming, redirect to the relevant tab (Medicines or Results) with a success toast.

**Acceptance checks**
- Confirming a prescription creates active medicines; confirming a lab report creates results; both create timeline events.
- Unconfirmed drafts never appear in medicines, results, or the timeline.

**What the user must do**
- Review and confirm one prescription and one lab report end to end. Reply with any UX issues.

**Commit message:** `feat(review): side-by-side review screen with flagged fields and transactional confirmation`

---

## Step 16 — Document detail and comments

**Goal:** a page per document with its confirmed data and a family comment thread.

**Tasks**
1. `Comment` model; routes `GET/POST /api/profiles/:profileId/comments?targetType=&targetId=` (viewer can read, caregiver and owner can post; viewers can post too if you want — decide and note it), `DELETE /comments/:id` (author or owner).
2. Posting a comment notifies other circle members.
3. Document detail page `/app/records/documents/:id`: preview, status, extraction method and timings (small "How this was read" section — useful in the viva), confirmed data, comment thread, actions (Review if `needs_review`, Re-run, Delete with confirmation).
4. Deleting a document also deletes its Cloudinary file, its derived records, and timeline events — after a confirmation dialog warning that linked medicines and results will be removed.

**Acceptance checks**
- A comment from one account appears live for another member and creates a notification.
- Deleting a document removes the file from Cloudinary and its derived data.

**What the user must do**
- Nothing needed.

**Commit message:** `feat(documents): document detail page, family comments and cascading delete`

---

## Step 17 — Medicines and the reminder engine (backend)

**Goal:** dose schedules, live reminders, missed-dose detection, and automatic course completion.

**Tasks**
1. `services/doseScheduler.js`: for each active, non-SOS medication, create `DoseLog`s for today's remaining times (in `APP_TIMEZONE`, stored as UTC). Upsert on (medicationId, scheduledAt) so it can run repeatedly without duplicates. Call it on confirm and on reminder-time edits.
2. Cron jobs in `jobs/` (all idempotent):
   - Daily at 00:05 IST: create the day's dose logs for all active medicines; mark medicines whose `endDate` has passed as `completed`.
   - Every minute: find `pending` doses due now with no `notifiedAt` → notify profile members (`Dose due: <medicine> <dose>`), set `notifiedAt`.
   - Every 10 minutes: `pending` doses more than 2 hours overdue → `missed`; notify caregivers and the owner.
3. Routes:
   - `GET /api/profiles/:profileId/medications?status=active|completed` (viewer).
   - `PATCH /medications/:id` (caregiver): edit `timesOfDay`, stop early (`status: 'stopped'`).
   - `GET /medications/:id/doses?from=&to=` (viewer): dose history.
   - `GET /api/profiles/:profileId/doses/today` (viewer).
   - `PATCH /doses/:id` (caregiver): `taken` or `skipped`, records who and when.
4. Explain in the report that reminders only run while the server is awake (keep-alive ping) and only reach people with the app open.
5. Tests: dose generation for each frequency code, no duplicates on re-run, missed detection, course completion, timezone correctness.

**Acceptance checks**
- Set a medicine's reminder time to two minutes from now: the notification arrives live.
- An ignored dose becomes "missed" after the window (for testing, allow overriding the window with an environment variable).

**What the user must do**
- Nothing needed.

**Commit message:** `feat(medicines): dose scheduling, cron reminders, missed-dose detection and course completion`

---

## Step 18 — Medicines UI and today's doses

**Goal:** the Medicines tab and dose actions people actually use.

**Tasks**
1. Medicines tab with Active and Completed sub-tabs.
2. Medicine card: name, strength, dose, frequency in plain words ("Twice a day"), reminder times, course progress bar ("Day 4 of 7"), link to the source prescription, and actions (edit times, stop course) for caregivers.
3. Medicine detail drawer: dose history grouped by date with taken / skipped / missed chips.
4. `TodayDoses` component (reused on Home in Step 23): list of today's doses with time, status, and Taken / Skip buttons; updates live through the socket.
5. Browser notifications: ask for permission once (with an explanation first); when a "dose due" notification arrives and the tab is hidden, show a browser notification.
6. Empty state: "No medicines yet — confirm a prescription to add them."

**Acceptance checks**
- Marking a dose taken on one device updates it live on another.
- A browser notification appears when the tab is in the background.

**What the user must do**
- Test on your phone with the deployed app (redeploy happens automatically on push). Reply with any issues.

**Commit message:** `feat(client): medicines tab, dose actions and browser notifications`

---

## Step 19 — Results: lab trends and home readings

**Goal:** the trend charts that make lab data meaningful, plus MyChart-style home readings.

**Tasks**
1. Routes:
   - `GET /api/profiles/:profileId/results/tests` (viewer): every test this profile has, with latest value, unit, flag, date, and trend (`up` / `down` / `stable`; stable if the change from the previous value is under 5%).
   - `GET /results/series?testCode=` (viewer): all values (lab and home) sorted by date, with reference range.
   - `POST /results/home` (caregiver): log a home reading — blood pressure (saves two results, `BP_SYS` and `BP_DIA`), blood sugar (fasting or random), or weight. Creates a timeline event.
   - `DELETE /results/home/:id` (caregiver).
2. `services/cache.js` with node-cache (60-second TTL, keyed by profile); invalidate a profile's keys on confirm, home reading, or delete.
3. Results tab:
   - Latest values grid with flag chips and trend arrows.
   - Test picker (searchable).
   - Recharts line chart: reference range as a shaded band (`ReferenceArea`), out-of-range points in red with a warning icon in the tooltip, lab values as solid dots, home readings as hollow dots, legend explaining both. Blood pressure shows two lines.
   - Table under the chart: date, value, unit, flag, source (link to the document for lab values).
   - "Log a reading" modal.
4. Fill the "Key results" and "Current medicines" sections of the Health Summary.

**Acceptance checks**
- With at least three HbA1c values, the chart shows the band and highlights out-of-range points.
- Home glucose readings appear on the same chart, visually distinct.

**What the user must do**
- Confirm a few lab reports (or add test values through the review screen) so charts have data. Reply with any chart issues.

**Commit message:** `feat(results): lab trend charts with reference bands, home readings and caching`

---

## Step 20 — Records: timeline, filters and search

**Goal:** one chronological feed of everything, with filters and search.

**Tasks**
1. `GET /api/profiles/:profileId/timeline` (viewer) with filters: `type`, `from`, `to`, `doctor`, `testCode`, `q` (text search using the text index on `searchText`), and cursor pagination (`occurredAt` + `_id`, 20 per page).
2. Make sure every earlier step writes timeline events with good `searchText` (medicine names, test names, doctor names).
3. Records tab: toggle between Timeline and Documents views (Documents view already exists from Step 9).
4. Timeline UI: items grouped by month; an icon per type; title and subtitle; click opens the related document, medicine, or result. Filter bar (type chips, date range, doctor, test) and a search box with debounce. "Load more" button. Skeletons while loading; empty state for no results.

**Acceptance checks**
- Searching a medicine name finds its prescription; filtering by a test shows only that test's results.
- Pagination loads further items without duplicates.

**What the user must do**
- Nothing needed.

**Commit message:** `feat(records): health timeline with filters, text search and cursor pagination`

---

## Step 21 — Visits

**Goal:** a simple appointment log with reminders, which ties into sharing.

**Tasks**
1. `Visit` model and routes: list (upcoming and past), create, update, delete (caregiver for writes).
2. Cron: daily at 09:00 IST, notify members about visits happening tomorrow (`reminderSentAt` prevents repeats).
3. Visits tab with two sub-tabs: Visits and Share links (the second is built in Step 22).
4. Visit cards: doctor, speciality, date, reason, notes; "Prepare for visit" button (opens the share builder from Step 22, pre-filled with an expiry of 7 days).
5. Visits create timeline events.

**Acceptance checks**
- A visit dated tomorrow triggers a reminder when the job runs (test by calling the job function directly).

**What the user must do**
- Nothing needed.

**Commit message:** `feat(visits): appointment log with day-before reminders`

---

## Step 22 — Share links and the doctor view

**Goal:** the expiring, revocable doctor share link with a one-page visit summary — the end of the demo.

**Tasks**
1. `ShareLink` model. Token: `crypto.randomBytes(32).toString('base64url')`; store only the SHA-256 hash; the plain token is shown once.
2. Owner and caregiver routes:
   - `POST /api/profiles/:profileId/shares`: choose sections (summary, medicines, selected tests, selected documents) and expiry (24 hours, 7 days, 30 days).
   - `GET /shares`: list with view count, last viewed, expiry, status, doctor notes.
   - `POST /shares/:id/revoke`.
3. Public routes (no auth):
   - `GET /api/public/shares/:token`: returns 410 if expired or revoked; increments `viewCount`; returns only the selected data, built by `services/visitSummary.js` (cached).
   - `GET /api/public/shares/:token/documents/:docId/file-url`: only for documents included in the link.
   - `POST /api/public/shares/:token/notes` (`publicNoteLimiter`, max 500 characters, name optional): saves the note, notifies profile members, creates a timeline event.
4. Visit summary content: patient name, age, blood group; allergies and conditions; current medicines with dose and frequency; recent results for selected tests with latest value, flag, and trend; recent prescriptions (doctor and date); the not-medical-advice notice; generated date.
5. Share builder modal: checkboxes for sections, test multi-select, document multi-select, expiry choice; result shows the link, a Copy button, and a QR code.
6. Share links sub-tab: list with status chips (active, expired, revoked), views, notes, Revoke button with confirmation.
7. Doctor page `/s/:token` (outside the app shell, no login): clean read-only layout, banner "Shared by <name> · expires <date>", the one-page summary, selected documents (opened through short-lived links), a note box, and a Print button. Print CSS: hide buttons and the note box, fit on one A4 page where possible, black-and-white friendly. Expired or revoked links show a friendly "This link is no longer available" page.

**Acceptance checks**
- Open the link on a phone in a private window (no login): the summary shows only the selected sections.
- Revoking makes the link stop working immediately; the view count increases on each open.
- A doctor note arrives as a live notification.
- Print preview fits on one page for a typical profile.

**What the user must do**
- Test the full flow on the deployed app with your phone. Reply with any issues.

**Commit message:** `feat(sharing): expiring doctor share links, qr codes, visit summary and doctor notes`

---

## Step 23 — Home dashboard, settings and profile deletion

**Goal:** the daily home screen and the remaining account features.

**Tasks**
1. `GET /api/profiles/:profileId/home` (viewer, cached): today's doses, documents needing review, latest key results with trends, the next visit, recent timeline activity.
2. Home page cards: Today's doses (reuse `TodayDoses`), Needs your review (count + Review button), Latest results, Upcoming visit (with Prepare for visit), Recent activity. New profiles see a single empty state with the Upload button.
3. Settings page: change name and photo, change password, and a "Danger zone".
4. Profile deletion (owner only): a dialog where the user types the profile name to confirm. Backend deletes, in order: Cloudinary assets under `medivault/<profileId>/` (by prefix, for the authenticated type), then all documents, prescriptions, medications, dose logs, lab results, timeline events, visits, share links, comments, notifications, invites, memberships, and the profile. Notify other members that the profile was deleted.
5. Test: deleting a profile leaves no records with that `profileId` in any collection.

**Acceptance checks**
- Home shows real data for a profile with confirmed documents.
- After deleting a test profile, no data remains in MongoDB or Cloudinary.

**What the user must do**
- Check Cloudinary's media library after deleting a test profile. Reply with the result.

**Commit message:** `feat(home): dashboard cards, account settings and full profile deletion`

---

## Step 24 — Polish, performance and security pass

**Goal:** make every screen feel finished and close security gaps before the final deployment.

**Tasks**
1. Every page: skeleton loading state, empty state with an action, error state with retry.
2. Role-based UI: verify viewers never see write controls on any page.
3. Responsive pass at 375 px, 768 px, and 1280 px widths; tables become stacked cards on mobile.
4. Accessibility: every input has a label, buttons are keyboard-reachable with visible focus, status is never shown by colour alone, contrast is readable.
5. Performance: confirm every page is lazy-loaded; add MongoDB indexes — Document (profileId, createdAt), LabResult (profileId, testCode, takenAt), DoseLog (status, scheduledAt), TimelineEvent (profileId, occurredAt) + text index, Notification (userId, read, createdAt), Membership (profileId, userId) unique, ShareLink (tokenHash) unique; check caching works.
6. Security checklist: every `/api/profiles/:profileId/...` route uses `requireProfileAccess`; every body is validated with zod; rate limits are on auth, upload, and public notes; no stack traces in production; remove `/api/dev/*` routes and `/ui-preview`; no secrets in the repository (search the git history for keys).
7. Write the accessibility and security checks into a short `docs/QUALITY.md` (useful evidence for evaluation).
8. Run all tests; fix failures.

**Acceptance checks**
- All tests pass.
- Browser Lighthouse scores are reasonable on Home and the doctor view (report the numbers honestly).

**What the user must do**
- Click through every tab on your phone and laptop and reply with anything that looks broken or unfinished.

**Commit message:** `chore: polish ui states, responsiveness, accessibility, indexes and security hardening`

---

## Step 25 — Final deployment, demo data, README and submission

**Goal:** a stable deployed app, a reliable demo, and documentation that earns marks.

**Tasks**
1. `scripts/seedDemo.js` (`npm run seed:demo`): creates a demo account with clearly labelled demo profiles ("Demo – Mom"), including several months of HbA1c and fasting glucose values (so trend charts look meaningful), one active medicine course, one upcoming visit. It must never run against production unless a `--confirm` flag is passed.
2. Final deploy check: all environment variables set on Render and Vercel; CORS correct; keep-alive ping working; the Gemini quota is sufficient for the demo.
3. `README.md` (evaluators read this first):
   - Problem and pitch (patient-owned MyChart for paper records).
   - Live links and demo credentials.
   - Features by tab with screenshots.
   - Architecture diagram (Mermaid) and the extraction pipeline diagram.
   - How extraction works: routing, OCR threshold, Gemini, post-processing, the confidence formula, the fallback, and why a human confirms everything.
   - Security and privacy (private files, signed links, roles, admin cannot see health data).
   - Tech stack and how it maps to the course modules.
   - Local setup and environment variables.
   - Testing (how to run, what is covered).
   - Limitations (reminders need the app open; free-tier server sleeps without the ping; handwriting accuracy varies) and the disclaimer.
   - Future work (the stretch goals, plus the pluggable open-source OCR adapter idea).
4. `docs/DEMO_SCRIPT.md`: the demo story step by step — photograph a prescription, watch live processing, fix a flagged field, confirm, receive a dose reminder on a second phone, show the HbA1c trend with home readings, prepare for a visit, open the doctor's summary from the QR code, leave a doctor note — plus pre-demo checks (warm up the server, pick known-good documents, log in on both phones).
5. Remind the user to record a backup screen recording of the full demo.
6. Final check against `docs/GUIDELINES.md` — list every requirement and whether it is met.

**Acceptance checks**
- A fresh visitor can follow the README to understand, run, and use the app.
- The full demo script runs end to end on the deployed app.

**What the user must do**
- Run `npm run seed:demo --confirm` against production only if you want demo data there.
- Take screenshots for the README and record the backup demo video.
- Submit the repository link and deployed link through the submission form before **27 October 2026, 11:59 PM IST** — aim to submit by the evening, not at the last minute.

**Commit message:** `docs: readme, demo script, seed data and final submission checks`

---

# Stretch goals (only after Step 25 is pushed)

Do these one at a time, each as its own step with the same protocol.

| Goal | Summary | Commit message |
|---|---|---|
| Source highlighting | On the review screen, clicking a field highlights where it was read on the document, using Tesseract word boxes (OCR path only) | `feat(review): highlight source location of extracted fields` |
| Refill alert | Notify 3 days before a course ends | `feat(medicines): refill alerts before course end` |
| Duplicate generic warning | Warn when two active medicines share a generic name (informational only, not advice) | `feat(medicines): duplicate generic name warning` |
| Adherence | Streak and weekly adherence percentage from dose logs | `feat(medicines): adherence streak and weekly percentage` |
| Admin dashboard | `/admin`: users, documents processed, failures, success rate, average processing time — aggregate numbers only, no health content | `feat(admin): aggregate platform dashboard` |
| Dark mode | Theme toggle using the existing design tokens | `feat(client): dark mode` |

---

# Quick reference: viva talking points

- **Why a pipeline instead of one AI call:** printed and handwritten documents need different primary readers; text PDFs need no OCR at all; routing saves cost and improves accuracy.
- **Why OCR first for printed, vision first for handwriting:** Tesseract is accurate and free on print but poor on cursive; the OCR confidence score decides automatically.
- **Why no open-source handwriting model:** good ones need a GPU; CPU-sized ones are weak on doctor handwriting; the adapter design allows adding one later.
- **Why flags are computed in code:** the reference range is data, the comparison is arithmetic; it should be deterministic, not an AI opinion.
- **Where confidence comes from:** OCR confidence, OCR–AI agreement, validation, dictionary matches — not the model rating itself.
- **What happens if Gemini fails:** rule-based fallback; everything is flagged low-confidence; the human review still catches errors.
- **Why nothing counts until confirmed:** the app records health information, so a person is always the final check.
- **Privacy:** private storage, five-minute signed links, hashed share and invite tokens, per-profile roles, admin sees aggregates only.
