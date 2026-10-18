# MediVault — Demo Script

## Pre-demo checks (do these ~10 min before)
- [ ] Warm up the server: open `https://<render>/api/health` (first hit wakes it from sleep).
- [ ] Confirm the keep-alive cron is running (so it stays awake).
- [ ] Have 2 known-good sample documents ready (a clear printed lab-report photo/PDF and a
      printed prescription photo) in `demo-documents/`.
- [ ] Log in on **two devices/windows** as two members of the same profile (for live reminders
      and the doctor-note alert).
- [ ] Optionally seed demo data: `npm run seed:demo --prefix server -- --confirm`
      (login `demo@medivault.app` / `Demo@12345`).
- [ ] Record a **backup screen recording** of the full demo in case of live network issues.

## The story (≈6–8 minutes)
1. **The problem** — a family's paper prescriptions and lab reports are scattered. MediVault turns
   them into an organised, patient-owned portal.
2. **Profiles & roles** — show the profile switcher ("Me" + "Mom"); open *Family & access* and
   explain owner / caregiver / viewer and the invite link.
3. **Upload & live processing** — photograph/upload a prescription. Watch the live progress
   stepper (Reading → Understanding → Checking) update on the card in real time.
4. **Review (human-in-the-loop)** — open the review screen. Point out flagged fields ("Check
   this · N%"), fix one, then **Confirm**. Emphasise: nothing was health data until now.
5. **Medicines & reminders** — the confirmed prescription is now an active course with reminder
   times. Set a reminder a minute ahead (or trigger a due dose) and show the live notification +
   toast arriving on the **second device**. Mark a dose "Taken".
6. **Lab trends** — upload/confirm a lab report (or use the seeded HbA1c series). Show the trend
   chart with the reference band and out-of-range points; log a **home reading** and see it appear
   on the same chart (hollow dot).
7. **Timeline & search** — open Records → Timeline; search a medicine or test name.
8. **Prepare for a visit → doctor share link** — from Visits, "Prepare for visit": pick sections +
   expiry, get a link + **QR code**. Open the QR on a phone (private window, no login) → the
   read-only doctor summary. Leave a **doctor note** → show the live notification back in the app.
   Show **Revoke** making the link stop working.
9. **Privacy** — mention private file storage, signed links, roles, and that admin never sees
   health content.

## Fallbacks
- If OCR/Gemini is slow or a document reads poorly, use a known-good sample or the seeded data.
- If the live notification is delayed, show it on the Notifications page (it still arrives).
- If anything fails live, switch to the backup recording.
