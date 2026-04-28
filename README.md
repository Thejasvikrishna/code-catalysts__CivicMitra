# 🏙️ CivicMitra — Hyperlocal Civic Issue Tracker

<div align="center">








**Citizens have no accessible, transparent way to report local civic issues, track resolution, or participate in community decision-making without visiting a physical office.**

CivicMitra solves this.

[Report Issue](#) · [Live Map](#) · [Dashboard](#)

</div>

***

## 📌 What is CivicMitra?

CivicMitra is a **multilingual, accessible Progressive Web App (PWA)** that empowers urban and semi-urban residents to:

- 📸 **Report** civic problems (potholes, broken lights, water leaks) using photo + voice — no typing needed
- 🗺️ **See** all issues on a live interactive map with a heatmap of unresolved problem clusters
- 📊 **Track** real-time resolution progress through a public dashboard with charts
- 👍 **Upvote** community issues to surface the most urgent problems
- 🕐 **Follow** per-issue status timelines (Reported → In Progress → Resolved)
- 🌐 **Use it in their language** — English, Hindi, Kannada supported out of the box

No app download required. No office visit needed. Works on any mobile browser.

***

## 🎬 How It Works

```
Citizen spots an issue
        ↓
Opens CivicMitra on mobile browser (PWA — installable)
        ↓
Fills report form → selects category → attaches photo (camera) → speaks description (voice)
        ↓
App gets GPS coordinates automatically via browser geolocation
        ↓
Photo uploads to Cloudinary → Issue saves to Firebase Realtime DB
        ↓
Pin appears on the Live Map instantly (real-time)
        ↓
Other citizens see it → upvote if they have the same problem
        ↓
Authorities update status → citizen sees timeline update live
        ↓
Issue marked Resolved → heatmap density drops
```

***

## ✨ Features

### 🗂️ Issue Submission
- **Photo capture** — uses device camera directly via `<input capture="environment">`
- **Voice input** — Web Speech API transcribes spoken complaints in EN / HI / KN
- **Auto GPS** — coordinates captured silently via `navigator.geolocation`
- **6 categories** — Roads, Water, Electricity, Sanitation, Parks, Other
- **Accessible form** — WCAG 2.1 AA: proper labels, keyboard navigation, 44px touch targets, visible focus rings

### 🗺️ Live Issues Map
- **Interactive Leaflet map** — OpenStreetMap tiles, no API key needed
- **Category-coded pins** — each category has a unique colored SVG marker
- **Heatmap overlay** — density visualization of unresolved issues using `leaflet.heat`
- **Filter bar** — filter pins by category and/or status
- **Locate Me** — flies map to user's current location
- **Rich popups** — title, category, status, upvote count, thumbnail image

### 📊 Public Dashboard
- **3 KPI cards** — Total Issues, Open, Resolved — update in real time
- **Donut chart** — issue distribution across 6 categories
- **Bar chart** — open vs resolved count per category
- **Issue feed** — scrollable list of all community reports, newest first
- **Upvote button** — atomic Firebase transaction prevents race conditions

### 🕐 Status Timeline (per issue)
```
🟠 Reported       → Jan 15, 2025, 10:30 AM — "Issue reported by citizen"
🔵 In Progress    → Jan 17, 2025,  2:15 PM — "Municipal team dispatched"
🟢 Resolved       → Jan 19, 2025,  4:00 PM — "Repair completed"
```

### 🌐 Multilingual Support
| Language | Code | Voice Input Lang |
|---|---|---|
| English | `en` | `en-IN` |
| Hindi | `hi` | `hi-IN` |
| Kannada | `kn` | `kn-IN` |

### 📱 PWA Features
- Installable on Android and iOS home screen
- Offline support via Cache-First service worker
- Works on 2G/3G — critical for semi-urban areas

***

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 18 + Vite | Component-based UI, fast HMR dev server |
| **Database** | Firebase Realtime DB | Real-time data sync across all clients instantly |
| **Image Storage** | Cloudinary | Cloud image hosting via unsigned REST upload |
| **Maps** | Leaflet.js + react-leaflet | Interactive map rendering |
| **Heatmap** | leaflet.heat | Issue density visualization |
| **Charts** | Chart.js + react-chartjs-2 | Dashboard analytics (Donut + Bar charts) |
| **Multilingual** | react-i18next + i18next | EN / HI / KN runtime language switching |
| **Lang Detection** | i18next-browser-languagedetector | Auto-detects user's browser language |
| **Voice Input** | Web Speech API (browser native) | Zero-dependency voice transcription |
| **Geolocation** | HTML5 Geolocation API (browser native) | Automatic coordinate capture |
| **PWA** | manifest.json + Service Worker | Installability + offline caching |
| **Styling** | Plain CSS with CSS Variables | No framework bloat, fast load |

***

## 📁 Project Structure

```
civicmitra/
│
├── public/
│   ├── manifest.json              # PWA manifest (name, icons, theme color)
│   └── index.html
│
├── src/
│   ├── components/
│   │   ├── form/
│   │   │   └── ReportForm.jsx     # Issue submission form (photo+voice+multilingual)
│   │   │
│   │   ├── map/
│   │   │   ├── IssueMap.jsx       # Leaflet map + heatmap + filters + locate me
│   │   │   ├── markerIcons.js     # SVG pin icons per category
│   │   │   └── FilterBar.jsx      # Category + status filter dropdowns
│   │   │
│   │   ├── dashboard/
│   │   │   ├── Dashboard.jsx      # KPI cards + charts + issue feed
│   │   │   ├── IssueCard.jsx      # Individual issue card with upvote + timeline expand
│   │   │   ├── StatusTimeline.jsx # Step-by-step issue progress tracker
│   │   │   └── dashboard.css      # Dashboard styles
│   │   │
│   │   └── shared/
│   │       └── Navbar.jsx         # Top navigation tabs
│   │
│   ├── hooks/
│   │   ├── useVoiceInput.js       # Web Speech API hook (start/stop/transcript)
│   │   └── useIssues.js           # Firebase real-time subscription hook
│   │
│   ├── services/
│   │   ├── firebaseConfig.js      # Firebase app initialization + db export
│   │   ├── issueService.js        # addIssue(), upvoteIssue(), updateStatus()
│   │   └── uploadImage.js         # Cloudinary image upload via fetch()
│   │
│   ├── i18n/
│   │   ├── i18n.js                # i18next initialization
│   │   └── locales/
│   │       ├── en.json            # English translations
│   │       ├── hi.json            # Hindi translations
│   │       └── kn.json            # Kannada translations
│   │
│   ├── App.jsx                    # Root: tab routing + data wiring
│   └── main.jsx                   # React DOM entry point
│
└── service-worker.js              # Cache-First PWA service worker
```

***

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- A free [Firebase](https://firebase.google.com/) account
- A free [Cloudinary](https://cloudinary.com/) account

### Step 1 — Clone the repository

```bash
git clone https://github.com/your-team/civicmitra.git
cd civicmitra
```

### Step 2 — Install dependencies

```bash
npm install
npm install firebase react-leaflet leaflet leaflet.heat \
  react-chartjs-2 chart.js react-i18next i18next \
  i18next-browser-languagedetector
```

### Step 3 — Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/) → **Add project**
2. Navigate to **Build → Realtime Database → Create database** → Start in test mode
3. Go to **Project Settings → Your apps → SDK setup** → Copy config
4. Paste into `src/services/firebaseConfig.js`:

```js
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL:       "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};
```

5. In Firebase Console → **Realtime Database → Rules**, set:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### Step 4 — Configure Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com/) (free tier is enough)
2. Go to **Settings → Upload → Upload Presets → Add upload preset**
3. Set **Signing Mode** to `Unsigned` → Save
4. Paste into `src/services/uploadImage.js`:

```js
const CLOUD_NAME    = "your_cloud_name";     // from Cloudinary Dashboard
const UPLOAD_PRESET = "your_preset_name";    // the unsigned preset you created
```

### Step 5 — Run

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

***

## 🗄️ Database Schema

All issues are stored under the `issues/` node in Firebase Realtime DB:

```
issues/
  {auto-generated-id}/
    title:        "Broken streetlight on MG Road"
    description:  "The streetlight near bus stop 12 has been out for 3 days"
    category:     "Roads" | "Water" | "Electricity" | "Sanitation" | "Parks" | "Other"
    imageUrl:     "https://res.cloudinary.com/..."
    audioText:    "Broken streetlight near the bus stop"   ← from voice input
    lat:          12.9716
    lng:          77.5946
    upvotes:      7
    status:       "open" | "in_progress" | "resolved"
    createdAt:    1714285200000                            ← Date.now() timestamp
    timeline: [
      { status: "open",        note: "Issue reported by citizen",  timestamp: 1714285200000 },
      { status: "in_progress", note: "Municipal team dispatched",  timestamp: 1714458000000 },
      { status: "resolved",    note: "Repair completed",           timestamp: 1714630800000 }
    ]
```

***

## 🔌 API & Integration Reference

### Shared Service Functions

```js
// Upload an image file to Cloudinary
// Returns: Promise<string> — the Cloudinary secure_url
uploadImage(file: File)

// Create a new issue in Firebase
// issueData: { title, description, category, imageUrl, audioText, lat, lng }
// Returns: Promise<string> — the new Firebase issue key
addIssue(issueData: Object)

// Atomically increment upvote count (safe for concurrent users)
// Returns: Promise<void>
upvoteIssue(issueId: string)

// Update issue status and append to timeline
// Returns: Promise<void>
updateStatus(issueId: string, newStatus: string, note: string)
```

### React Hooks

```js
// Real-time Firebase subscription
// Returns: { issues: Array, loading: boolean, error: string|null }
// issues are sorted newest-first, auto-updates on any DB change
useIssues()

// Web Speech API voice input
// Returns: { transcript, isListening, error, startListening, stopListening, clearTranscript }
useVoiceInput(lang?: string)
```

***

## 🗺️ Issue Category Reference

| Category | Map Pin Color | Hex |
|---|---|---|
| 🟠 Roads | Orange | `#e67e22` |
| 🔵 Water | Blue | `#2980b9` |
| 🟡 Electricity | Yellow | `#f1c40f` |
| 🟢 Sanitation | Green | `#27ae60` |
| 🩵 Parks | Teal | `#16a085` |
| 🟣 Other | Purple | `#8e44ad` |

***

## ♿ Accessibility

CivicMitra is built to be usable by everyone, including low-vision users and those unfamiliar with smartphones:

- All form inputs have associated `<label>` elements
- `aria-required`, `aria-describedby`, `aria-live` used throughout
- Minimum touch target size of **44×44px** on all interactive elements
- Keyboard-navigable — full Tab / Enter / Space / Escape support
- Visible focus rings on all interactive elements
- `prefers-reduced-motion` respected — no forced animations
- Images have descriptive `alt` text
- Color is never the only way information is conveyed (badges use text + color)

***

## 👥 Team

| Member | Role |
|---|---|
| Member 1 | Submission & Accessibility Lead — Form, Voice Input, PWA, Multilingual |
| Member 2 | Geospatial & Mapping Lead — Leaflet Map, Heatmap, Filters |
| Member 3 | Dashboard & Analytics Lead — Charts, Issue Feed, Status Timeline |
| Member 4 | Backend & State Lead — Firebase, Cloudinary, Hooks, App wiring |

***

## 📄 License

MIT License — Built for hackathon purposes.

***

<div align="center">
  Built with ❤️ for citizens, by citizens.
</div>
