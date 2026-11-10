# 🏋️‍♂️ IronTrack — Personal Gym & Daily Streaks Tracker

A mobile-first gym exercise and streak tracking application built for your iPhone, with a **GitHub Pages** hosted web app, an **iOS `.ipa` wrapper for sideloading via iLoader**, and **Supabase** cloud database sync.

---

## 📱 Features

- **Daily Gym Exercise Tracking**:
  - Live active workout session with elapsed stopwatch and total volume lifted (kg/lbs).
  - Searchable exercise library with 30+ default exercises (Chest, Back, Legs, Shoulders, Arms, Core) plus custom exercise creator.
  - Set categorization: **Normal (N)**, **Warmup (W)**, **Drop set (D)**, and **Failure (F)**.
  - Previous performance hints (e.g. `Last: 85kg × 8`) so you always know what to beat.
  - Plate calculator for Olympic barbells (instantly calculates 25kg, 20kg, 15kg, 10kg, 5kg, 2.5kg, 1.25kg plates per side).
  - One-tap set completion with visual feedback and haptic vibration.
- **Automated Rest Timer**:
  - Auto-triggers countdown as soon as you check off a set.
  - Synthesized Web Audio tick count on 3, 2, 1 and completion fanfare chime.
  - Native iOS haptic feedback (`UIImpactFeedbackGenerator`).
  - Floating minimized pill & expanded view with `+30s`, `+15s`, `-15s`, and quick skip.
- **Gym Streaks & Consistency**:
  - Daily streak calculator (Current streak, Longest streak, Total workouts, Workouts this week).
  - 12-Week Activity Heatmap (GitHub-style contributions grid) tracking your active days.
  - Milestone achievement badges: *Iron Spark (1d)*, *Habit Builder (3d)*, *Weekly Warrior (7d)*, *Iron Discipline (14d)*, *Gym Beast (30d)*, *Century Titan (100d)*.
- **Database (Supabase + Offline-First)**:
  - Works 100% offline out-of-the-box using local storage.
  - Seamlessly syncs workouts, sets, and streaks to your Supabase PostgreSQL database once credentials are provided.
  - Full SQL migration script with Row Level Security (RLS) included in `supabase/schema.sql`.
- **iOS iLoader Sideloading**:
  - Ready-to-build Xcode project (`ios/IronTrack`) with WKWebView native bridge for haptics, timer notifications, and edge-to-edge display.
  - Shell build script (`scripts/build_ipa.sh`) to package the unsigned `.ipa` for `iloader`.
  - GitHub Actions workflow (`.github/workflows/build-ipa.yml`) that builds `IronTrack.ipa` automatically in the cloud.

---

## 🚀 Quick Setup & Architecture

```
┌────────────────────────────────────────────────────────┐
│                      iPhone UI                         │
│  ┌───────────────────────┐   ┌──────────────────────┐  │
│  │   iLoader iOS App     │   │   Safari PWA WebApp  │  │
│  │ (Native WKWebView/IPA)│   │ (Add to Home Screen) │  │
│  └───────────┬───────────┘   └──────────┬───────────┘  │
└──────────────┼──────────────────────────┼──────────────┘
               │                          │
               ▼                          ▼
┌────────────────────────────────────────────────────────┐
│           GitHub Pages Hosted Frontend (Vite)          │
│               https://<user>.github.io/<repo>/         │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│           Supabase Cloud Database (PostgreSQL)         │
│          Workouts • Sets • Streaks • Exercises         │
└────────────────────────────────────────────────────────┘
```

---

## 1. Deploy Frontend to GitHub Pages

1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit of IronTrack"
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. In your GitHub repository:
   - Go to **Settings > Pages**.
   - Under **Build and deployment > Source**, select **GitHub Actions**.
3. The included GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically build and publish your frontend to `https://<your-username>.github.io/<your-repo-name>/`.

---

## 2. Set Up Supabase Database

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/schema.sql` from this repository, copy its contents, paste them into the SQL Editor, and click **Run**.
   - This creates tables: `workouts`, `workout_sets`, `exercises`, `profiles`, `user_streaks`, with RLS policies and standard gym exercises seeded.
4. Go to **Project Settings > API** and copy:
   - **Project URL**
   - **anon / public key**
5. In IronTrack on your phone, open the **Settings** tab, paste the URL and Anon Key, and tap **Save Supabase Credentials**.

---

## 3. Sideload the iOS App with iLoader

### Option A: Automatic Cloud Build via GitHub Actions (Recommended)
1. In your GitHub repo, go to **Actions** and select **Build iOS IPA for iLoader**.
2. Click **Run workflow**.
3. Once completed, download the `IronTrack-IPA` artifact (`IronTrack.ipa`).
4. Connect your iPhone to your Mac/PC and open **[iLoader](https://github.com/nab138/iloader)** (or AltStore / SideStore / Sideloadly).
5. Drag and drop `IronTrack.ipa` into iLoader to sideload it to your device!
6. On your iPhone:
   - Go to **Settings > General > VPN & Device Management**.
   - Tap your Apple ID and tap **Trust**.
   - If iOS 16+, enable **Developer Mode** in **Settings > Privacy & Security > Developer Mode**.

### Option B: Local Build with Xcode / Script
If you have Xcode installed on your Mac:
```bash
./scripts/build_ipa.sh
```
Or open `ios/IronTrack/IronTrack.xcodeproj` in Xcode and click **Product > Archive**, or run directly on your connected iPhone.

### Option C: Instant PWA (No Sideloading Required)
If you ever want instant zero-install access:
1. Open your GitHub Pages URL in **Safari** on your iPhone.
2. Tap the **Share** button (box with up arrow).
3. Scroll down and tap **Add to Home Screen**.
4. IronTrack will appear on your home screen and run full-screen just like a native app.

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Build production bundle
npm run build
```

---

## 📁 Repository Structure

```
├── .github/workflows/
│   ├── deploy.yml            # Automated GitHub Pages deployment
│   └── build-ipa.yml         # Cloud Xcode IPA builder for iLoader
├── ios/
│   └── IronTrack/            # iOS Xcode native project
│       ├── IronTrack.xcodeproj
│       └── IronTrack/
│           ├── App/          # AppDelegate & SceneDelegate
│           ├── ViewControllers/WebViewController.swift # WKWebView + Haptics bridge
│           └── Info.plist
├── public/                   # App icons and PWA manifest
├── scripts/
│   └── build_ipa.sh          # Packaging script for iLoader IPA
├── src/
│   ├── components/           # Workout, Streaks, History, Exercises, Settings, Timer
│   ├── data/                 # Exercise catalog and workout routines
│   ├── services/             # Storage service & Supabase client
│   ├── utils/                # Audio synthesizer, haptics, streak algorithms
│   └── types/                # TypeScript interfaces
└── supabase/
    └── schema.sql            # Supabase PostgreSQL tables & RLS policies
```
