# ParentGuard server — deploy on a free host

This is the server from the childsafe repo (FamilyShield), made
deploy-ready: **one service, one URL**. The backend (Node + Socket.IO,
WebRTC signalling, REST API) also serves the parent dashboard (React),
so the parent just opens the server URL in a browser — no second
service, no extra setup.

Verified 2026-11-20: backend compiles (`tsc`), dashboard builds
(`vite build`), and the running server answers `/` (dashboard),
`/health`, `/api/devices`, and the Socket.IO handshake.

## What you need

- A free GitHub account (to hold this code)
- A free Render account (render.com — sign up with GitHub, **no
  credit card needed** for the free plan)

## Step 1 — Put this code on GitHub

1. On github.com, create a new repository (any name, e.g.
   `parentguard-server`). Leave it public or private, either works.
2. On the repo page, click **"uploading an existing file"** and drag
   in everything from this zip (the `backend` folder, the
   `parent-dashboard` folder, `Dockerfile`, `.dockerignore`,
   `render.yaml`). Commit.

## Step 2 — Deploy on Render (free)

1. Go to dashboard.render.com → **New +** → **Web Service**.
2. Connect your GitHub account and pick the repo you just made.
3. Render detects `render.yaml` automatically — the settings are
   already filled in (Docker, health check `/health`). Click
   **Create Web Service**.
4. Wait 3–5 minutes for the first build. When it says **Live**, you
   get a URL like `https://parentguard-server.onrender.com`.
5. Open that URL: the parent dashboard should load. Open
   `https://<your-url>/health` — it should show `{"status":"ok"}`.

## Step 3 — Keep it awake (free, 2 minutes)

Render's free plan puts the service to sleep after 15 minutes with
no traffic, and it takes ~30 seconds to wake up. A free monitor
fixes that:

1. Create a free account at uptimerobot.com.
2. Add Monitor → Monitor Type **HTTP(s)** → Friendly Name
   `ParentGuard` → URL `https://<your-url>/health` → interval
   **5 minutes** → Create. The ping every 5 minutes keeps it awake.

## Step 4 — Test it (optional, no phone needed)

The repo includes a fake child phone simulator:

```
cd backend
BACKEND_URL=https://<your-url> npx tsx src/mock-child.ts
```

It pretends to be a child device: battery draining, GPS moving,
screenshots. Open the dashboard and you should see it live.

## Know the limits

- **No login on the dashboard.** This server has no password — anyone
  who has the URL can open the dashboard. Keep the URL private and
  don't share it. (A password can be added later if you want one.)
- **Free Render has no permanent storage.** Paired devices and
  settings live in a file inside the service; if Render restarts or
  redeploys it, that file resets and you pair the phone again. That
  is the price of free.
- **Always-on alternative:** Oracle Cloud's "Always Free" tier gives
  a small virtual machine that never sleeps and keeps its disk, but
  it asks for a credit card (for verification) and about 30 minutes
  of setup. If the Render sleep bothers you, that is the next step.

## Next step — connect the ParentGuard app

The server alone does nothing until a phone connects to it. Once
your server URL is live, send it to me and I will build
**ParentGuard v5.0**: the app on the child's phone connects to your
server, and the dashboard gets live screen mirror, live location,
remote screenshots and the lock commands — the full live version of
what Telegram does today.
