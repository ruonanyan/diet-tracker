# Diet Tracker Rebuild Plan
## Stack: React + Supabase + Vercel + GitHub

---

## Overview

Right now the app lives in a single JSX file with all data hardcoded. The goal is to move it to a proper web app where:
- Data lives in a real database (Supabase)
- The app is hosted publicly (Vercel) so you can open it on your phone
- You log food directly from the app — no Claude middleman
- Code is version-controlled (GitHub) so changes are tracked and auto-deployed

---

## Step 1 — Set up your tools (one-time)

1. Create a free account at **github.com** if you don't have one
2. Create a free account at **supabase.com**
3. Create a free account at **vercel.com** (sign in with GitHub)
4. Install **Node.js** on your computer (nodejs.org) — needed to run the app locally
5. Install **Git** on your computer (git-scm.com)

---

## Step 2 — Create the Supabase database

In Supabase, create a new project, then create these tables:

### `food_log` table
| Column | Type | Notes |
|--------|------|-------|
| id | int8 (primary key) | auto-increment |
| date | date | e.g. 2026-08-07 |
| time | text | morning / lunch / afternoon / dinner / evening / night |
| item | text | food description |
| calories | int4 | |
| protein | int4 | grams |
| carbs | int4 | grams |
| fat | int4 | grams |
| created_at | timestamptz | auto-set |

### `workouts` table
| Column | Type | Notes |
|--------|------|-------|
| id | int8 (primary key) | auto-increment |
| date | date | |
| burn_value | int4 | the avg of Karvonen + MET before EPOC |
| notes | text | HR zones, exercise description |
| created_at | timestamptz | auto-set |

### `frequent_foods` table
| Column | Type | Notes |
|--------|------|-------|
| id | int8 (primary key) | auto-increment |
| name | text | |
| serving | text | e.g. "170g" |
| serving_grams | int4 | gram weight per serving |
| calories | int4 | per serving |
| protein | int4 | per serving |
| carbs | int4 | per serving |
| fat | int4 | per serving |

---

## Step 3 — Migrate your existing data

Export everything from the current JSX file into Supabase. Two ways to do this:

**Option A (easy):** Use Supabase's table editor UI — copy-paste rows manually. Fine for a small dataset.

**Option B (faster):** Write a small script that reads the INITIAL_LOG and INITIAL_WORKOUTS constants and inserts them into Supabase via the API. Claude can write this script for you — just run it once and you're done.

---

## Step 4 — Create the new app

### Set up the project
1. Run `npx create-react-app diet-tracker` in your terminal (or use Vite: `npm create vite@latest diet-tracker -- --template react`)
2. Install Supabase client: `npm install @supabase/supabase-js`
3. Create a `.env` file with your Supabase URL and anon key (found in Supabase project settings)

### Connect to Supabase
Create a file `src/supabase.js`:
```js
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
)
```

### Replace data fetching
Instead of reading from INITIAL_LOG, fetch from Supabase:
```js
const { data } = await supabase
  .from('food_log')
  .select('*')
  .order('date', { ascending: false })
```

### Replace food logging
Instead of hardcoding entries, insert into Supabase:
```js
await supabase.from('food_log').insert({
  date: '2026-08-07',
  time: 'lunch',
  item: 'Grilled salmon...',
  calories: 364,
  protein: 49,
  carbs: 10,
  fat: 16
})
```

The UI (layout, calculations, smoothie calculator, etc.) stays mostly the same — you're just swapping where data comes from and goes to.

---

## Step 5 — Push to GitHub

1. Create a new repository on github.com (call it `diet-tracker`)
2. In your terminal, inside the project folder:
   ```
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/diet-tracker.git
   git push -u origin main
   ```

---

## Step 6 — Deploy to Vercel

1. Go to vercel.com → "Add New Project" → import your GitHub repo
2. Add your environment variables (Supabase URL and key) in Vercel's project settings
3. Click Deploy

Vercel gives you a URL like `diet-tracker-xyz.vercel.app`. Open it on your phone and bookmark it — that's your app. Every time you push to GitHub, Vercel auto-redeploys.

---

## Step 7 — Optional but recommended

- **Add a simple login** so the app is private. Supabase has built-in auth — you can add email/password login in a few lines. Then use Row Level Security (RLS) in Supabase so only your account can read/write your data.
- **Make it a PWA** (Progressive Web App) so you can "install" it on your phone's home screen like a native app. Just add a manifest.json and a service worker — Create React App does most of this automatically.
- **Ask Claude to help with each step** — the migration script, the Supabase queries, the UI wiring. You don't need to do it from scratch; the current app's logic can be lifted almost as-is.

---

## Summary of effort

| Step | Time estimate |
|------|--------------|
| Set up accounts + Supabase tables | 1–2 hours |
| Migrate existing data | 1–2 hours |
| Rebuild app with Supabase | 1 weekend |
| Deploy to Vercel | 30 minutes |
| Add login + PWA | 2–3 hours |

Total: **1–2 weekends** if you work through it with Claude's help step by step.
