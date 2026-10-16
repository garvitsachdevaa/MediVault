# MediVault

A patient-owned MyChart, built from your paper health records. Upload prescriptions
and lab reports, have the app read them, confirm the data yourself, and get organised
medicines, reminders, lab trend charts, a health timeline, and doctor share links.

**Work in progress.**

## Architecture

- **Client** (`/client`): React 18 + Vite + Tailwind, deployed to **Vercel**.
- **Server** (`/server`): Node + Express 4 + Mongoose, deployed to **Render** (free web service).
- **Database**: MongoDB Atlas (free M0). **Files**: Cloudinary (added later).
- **Auth**: JWT in the `Authorization: Bearer` header, stored in `localStorage` (client and
  server are on different domains, so cross-site cookies are avoided).

## Deployment

The client (Vercel) and server (Render) are deployed separately. Do the server first so
you have its URL for the client.

### 1. Server → Render
1. Push the repo to GitHub.
2. On [Render](https://render.com) → **New → Web Service** → connect the repo.
3. Settings: **Root Directory** `server`, **Build Command** `npm install`, **Start Command**
   `npm start`, **Runtime** Node 20. (A `server/render.yaml` blueprint is included.)
4. Add environment variables (from `server/.env.example`): `MONGO_URI`, `JWT_SECRET`,
   `JWT_EXPIRES_IN=7d`, `NODE_ENV=production`, and the Cloudinary / Gemini keys when those
   steps arrive. Leave `CLIENT_URL` for step 3 below.
5. Deploy. Visit `https://<your-render-app>.onrender.com/api/health` → should return
   `{"status":"ok", ...}`.

### 2. Client → Vercel
1. On [Vercel](https://vercel.com) → **Add New → Project** → import the repo.
2. **Root Directory** `client` (Framework preset: Vite).
3. Environment variables:
   - `VITE_API_URL = https://<your-render-app>.onrender.com/api`
   - `VITE_SOCKET_URL = https://<your-render-app>.onrender.com`
4. Deploy. (`client/vercel.json` rewrites all routes to `index.html`, so refreshing deep
   links like `/app` does not 404.)

### 3. Connect CORS
Set `CLIENT_URL` on **Render** to your Vercel URL (e.g. `https://medivault.vercel.app`).
Comma-separate multiple origins if needed. Render redeploys automatically.

### 4. Keep-alive ping
Render's free tier **sleeps after ~15 minutes without traffic**. A sleeping server stops
cron jobs (reminders) and makes the first request slow. Create a free job on
[cron-job.org](https://cron-job.org) or UptimeRobot that requests
`https://<your-render-app>.onrender.com/api/health` every **10 minutes** to keep it awake.

### Local development
```
# server/.env  → MONGO_URI, JWT_SECRET  (see server/.env.example)
# client/.env  → VITE_API_URL=http://localhost:5000/api, VITE_SOCKET_URL=http://localhost:5000
npm install           # root (installs concurrently)
npm install --prefix server
npm install --prefix client
npm run dev           # runs client + server together
```
