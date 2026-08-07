# Diet Tracker — Next Steps

## Step 4 complete ✅
All app files are created. Here's what to do next.

---

## Run it locally (do this first)

Open **Terminal** and run these commands one by one:

```bash
cd "/Users/ruonanyan/Claude/Projects/Diet tracker"
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser. The app should work and connect to Supabase.

---

## Step 5 — Push to GitHub

1. Go to **github.com** → click **New** (green button) → name it `diet-tracker` → Create repository
2. In Terminal (in the same folder):

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/diet-tracker.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## Step 6 — Deploy to Vercel

1. Go to **vercel.com** → Add New Project → Import `diet-tracker` from GitHub
2. Before clicking Deploy, go to **Environment Variables** and add:
   - `VITE_SUPABASE_URL` = `https://njvbkhhtpmsghggqmbsg.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (paste your anon key from `.env`)
3. Click **Deploy**

Vercel gives you a URL like `diet-tracker-xyz.vercel.app`. Open it on your phone and add to home screen.

---

## What's in the app

- **Date navigation** — tap ‹ › to move between days
- **Stats bar** — calories, remaining (vs burn − 300 deficit), protein, total burn
- **+ Add Food** — search frequent foods or enter custom
- **🥤 Smoothie** — calculator logs directly with one tap
- **🏋️ Workout** — Karvonen calculator + burn logger
- **× button** — delete any entry

---

## Step 7 (optional) — Supabase Row Level Security

Right now the app is public (anyone with the URL can read your data). To lock it down, enable RLS in Supabase and add Supabase Auth. Ask Claude when you're ready.
