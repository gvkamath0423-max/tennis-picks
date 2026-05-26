# 🎾 TennisPicks — Deployment Guide
**Get your site live in ~20 minutes, for free.**

---

## Step 1 — Set up Supabase (your database + auth)

1. Go to **https://supabase.com** and click **Start your project**
2. Sign up with GitHub or email
3. Click **New project** → give it a name (e.g. "tennis-picks") → set a database password → choose a region close to you → **Create new project** (takes ~2 min)
4. Once created, go to the **SQL Editor** (left sidebar)
5. Click **New Query**, paste the entire contents of `schema.sql`, and click **Run**
6. You should see "Success" — your 3 tables are created
7. Go to **Project Settings → API**
8. Copy two values:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon / public key** (long string starting with `eyJ...`)

---

## Step 2 — Push your code to GitHub

1. Go to **https://github.com** → **New repository** → name it `tennis-picks` → **Create**
2. On your computer, open a terminal in the `tennis-picks` folder and run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/tennis-picks.git
   git push -u origin main
   ```

---

## Step 3 — Deploy to Vercel

1. Go to **https://vercel.com** → **Sign up with GitHub**
2. Click **Add New → Project**
3. Find and import your `tennis-picks` repository
4. Under **Environment Variables**, add these two:
   - `REACT_APP_SUPABASE_URL` → paste your Supabase Project URL
   - `REACT_APP_SUPABASE_ANON_KEY` → paste your anon key
5. Click **Deploy**
6. In ~2 minutes, Vercel gives you a live URL like `tennis-picks.vercel.app` 🎉

---

## Step 4 — Enable Email Auth in Supabase

1. In Supabase, go to **Authentication → Providers**
2. Make sure **Email** is enabled (it is by default)
3. Optional: under **Authentication → Email Templates**, customise the confirmation email

---

## Step 5 — (Optional) Add a custom domain

- In Vercel: **Settings → Domains → Add** — enter your domain (e.g. `tennispicks.com`)
- Domains cost ~$12/yr from Namecheap, Cloudflare, or similar

---

## Updating results during a tournament

When a match finishes:
1. Open `src/lib/draws.js`
2. Find the match in `FO2026_R1` (or the relevant draw array)
3. Change `status: "upcoming"` → `status: "complete"`
4. Add `winner: "Player Name"` — use the **exact same string** as `p1` or `p2`
5. Commit and push to GitHub — Vercel redeploys automatically in ~60 seconds

Example:
```js
// Before:
{ id: 1, p1: "J. Sinner [1]", p2: "C. Tabur (WC)", status: "upcoming", winner: null },

// After:
{ id: 1, p1: "J. Sinner [1]", p2: "C. Tabur (WC)", status: "complete", winner: "J. Sinner [1]" },
```

---

## Adding Wimbledon (or any future tournament)

1. The Wimbledon 2026 entry is already in `TOURNAMENTS` in `draws.js` with theme colours set
2. When the draw is released (Thursday before the tournament), send it to Claude
3. Claude updates `FO2026_R1` equivalent for Wimbledon, sets `status: "live"`, done
4. Push to GitHub — live in 60 seconds

---

## Cost summary

| Item | Cost |
|------|------|
| Vercel hosting | **Free** |
| Supabase (up to 50,000 rows) | **Free** |
| Custom domain (optional) | ~$12/yr |
| **Total to launch** | **$0** |

---

## File structure

```
tennis-picks/
├── public/
│   └── index.html
├── src/
│   ├── lib/
│   │   ├── supabase.js      ← Supabase client + all DB functions
│   │   ├── draws.js         ← ALL tournament draw data lives here
│   │   ├── AuthContext.js   ← React auth state
│   │   └── scoring.js       ← Points calculation logic
│   ├── components/
│   │   ├── AuthModal.js     ← Sign in / sign up modal
│   │   ├── Leaderboard.js   ← Leaderboard table
│   │   └── MatchCard.js     ← Individual match pick card
│   ├── pages/
│   │   └── BracketView.js   ← The main bracket + save picks
│   ├── App.js               ← Main shell, header, tournament selector
│   └── index.js             ← Entry point
├── schema.sql               ← Run this in Supabase SQL editor
├── .env.example             ← Copy to .env and fill in your keys
└── package.json
```
