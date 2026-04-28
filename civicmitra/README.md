# 🏙️ CivicMitra — Citizen Issue Reporting Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-10-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Cloudinary-Image_CDN-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" />
  <img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" />
</p>

> **CivicMitra** ("Civic Friend" in Sanskrit) is a Progressive Web App that bridges the gap between citizens and local authorities. Citizens can report infrastructure issues (roads, water, electricity, sanitation, and more) with photos, voice, and GPS — and authorities can track, manage, and resolve them in real time.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration — API Keys & URLs](#-configuration--api-keys--urls)
- [User Roles](#-user-roles)
- [Citizen Flow](#-citizen-flow)
- [Authority Flow](#-authority-flow)
- [Database Schema](#-database-schema)
- [PWA Support](#-pwa-support)
- [Scripts](#-scripts)
- [Contributing](#-contributing)
- [Team](#-team)

---

## ✨ Features

### Citizen
| Feature | Description |
|---|---|
| 📝 **Issue Reporting** | Submit issues with title, description, category, photo, and GPS location |
| 🎤 **Voice Input** | Dictate issue descriptions using the Web Speech API |
| 🗺️ **Live Map** | See all reported issues on an interactive Leaflet heat-map |
| 📊 **Dashboard** | Real-time KPI cards, doughnut & bar charts, top-upvoted issues |
| 👍 **Upvoting** | Upvote issues to signal community priority |
| 📅 **Status Timeline** | Track the full history of every status change, authority comments, and resolution photos |
| 🔍 **Similar Issues** | Smart assistant warns if a nearby issue in the same category already exists |
| 🌐 **i18n** | Multi-language support (i18next + browser language detection) |

### Authority
| Feature | Description |
|---|---|
| 🔔 **Alert Dashboard** | Real-time notification of new open issues |
| ✅ **Status Management** | Move issues through `Open → In Progress → Resolved` |
| 💬 **Authority Comments** | Add a public-facing comment visible to citizens in the timeline |
| 📷 **Resolution Image Upload** | Upload a photo proving the issue has been fixed (via Cloudinary) |
| 👤 **Submitter Identity** | See which citizen submitted each issue |
| 🖼️ **Image Lightbox** | Click any image (report photo, resolution proof) for a fullscreen enlarge view |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 5, Vanilla CSS |
| **Database** | Firebase Realtime Database |
| **Authentication** | Firebase Authentication (Email/Password) |
| **Image CDN** | Cloudinary (unsigned upload preset) |
| **Maps** | React-Leaflet + Leaflet.heat |
| **Charts** | Chart.js 4 + react-chartjs-2 |
| **i18n** | i18next + i18next-browser-languagedetector |
| **PWA** | Vite + custom Service Worker |

---

## 📁 Project Structure

```
civicmitra/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── LoginPage.jsx          # Login & registration page
│   │   ├── authority/
│   │   │   ├── AuthorityPanel.jsx     # Authority alerts & issue management
│   │   │   └── authority.css
│   │   ├── dashboard/
│   │   │   ├── Dashboard.jsx          # KPI cards, charts, issue feed
│   │   │   ├── IssueCard.jsx          # Single issue card with timeline toggle
│   │   │   ├── StatusTimeline.jsx     # Vertical status + comment + image timeline
│   │   │   └── dashboard.css
│   │   ├── form/
│   │   │   ├── ReportForm.jsx         # Citizen issue submission form
│   │   │   └── ReportForm.css
│   │   ├── map/
│   │   │   └── IssueMap.jsx           # Leaflet heat-map of all issues
│   │   └── shared/
│   │       ├── Navbar.jsx             # Top navigation with role-aware tabs
│   │       ├── ImageLightbox.jsx      # Fullscreen image overlay component
│   │       └── lightbox.css
│   ├── hooks/
│   │   ├── useAuth.js                 # Firebase Auth state listener
│   │   ├── useIssues.js               # Real-time issues listener (Firebase)
│   │   └── useVoiceInput.js           # Web Speech API hook
│   ├── i18n/
│   │   └── i18n.js                    # i18next configuration
│   ├── services/
│   │   ├── authService.js             # register / login / logout / getUserRole
│   │   ├── firebaseConfig.js          # ⚠️ Firebase credentials — see config section
│   │   ├── issueService.js            # addIssue / upvoteIssue / updateStatus
│   │   ├── smartAssistant.js          # Category detection, description suggest, similar issues
│   │   └── uploadImage.js             # ⚠️ Cloudinary upload — see config section
│   ├── App.jsx                        # Root component — auth, routing, tab management
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── service-worker.js                  # PWA offline caching
├── index.html
├── vite.config.js
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- A **Firebase** project (free Spark plan works)
- A **Cloudinary** account (free tier works)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-org>/code-catalysts__CivicMitra.git
cd code-catalysts__CivicMitra/civicmitra

# 2. Install dependencies
npm install

# 3. Configure API keys (see section below)

# 4. Start the development server
npm run dev
```

The app will be live at **http://localhost:5173**.

---

## 🔑 Configuration — API Keys & URLs

There are **two files** you must edit with your own credentials before running the app.

---

### 1. Firebase — `src/services/firebaseConfig.js`

Go to [Firebase Console](https://console.firebase.google.com/) → your project → ⚙️ Project Settings → **Your apps** → **SDK setup and configuration** and copy the config object.

```js
// src/services/firebaseConfig.js

const firebaseConfig = {
  apiKey:            "YOUR_FIREBASE_API_KEY",            // ← replace
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",  // ← replace
  databaseURL:       "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com/", // ← replace
  projectId:         "YOUR_PROJECT_ID",                  // ← replace
  storageBucket:     "YOUR_PROJECT_ID.firebasestorage.app", // ← replace
  messagingSenderId: "YOUR_SENDER_ID",                   // ← replace
  appId:             "YOUR_APP_ID",                      // ← replace
};
```

> **Firebase setup checklist:**
> - Enable **Email/Password** authentication: Authentication → Sign-in method → Email/Password → Enable
> - Create a **Realtime Database**: Build → Realtime Database → Create database
> - Set database rules (development):
>   ```json
>   {
>     "rules": {
>       ".read": "auth != null",
>       ".write": "auth != null"
>     }
>   }
>   ```
> - **User roles** are stored under `users/{uid}/role` — valid values are `"citizen"` or `"authority"`. Register a user and then manually set their role to `"authority"` in the Firebase console if needed.

---

### 2. Cloudinary — `src/services/uploadImage.js`

Go to [Cloudinary Console](https://cloudinary.com/console) → Settings → Upload → **Upload Presets** → Add upload preset (set it to **Unsigned**).

```js
// src/services/uploadImage.js

const CLOUD_NAME    = "YOUR_CLOUDINARY_CLOUD_NAME";   // ← replace (visible on dashboard)
const UPLOAD_PRESET = "YOUR_UNSIGNED_UPLOAD_PRESET";  // ← replace (e.g. "civicmitra_unsigned")
```

> **Cloudinary setup checklist:**
> - Cloud name is visible on your [Cloudinary dashboard](https://cloudinary.com/console)
> - Create an **Unsigned** upload preset: Settings → Upload → Upload Presets → Add
> - Note the preset name and paste it above

---

## 👥 User Roles

CivicMitra has two user roles managed via Firebase Realtime Database.

| Role | Access |
|---|---|
| `citizen` | Report issues, upvote, view map & dashboard, track timeline |
| `authority` | Everything above + manage issue status, add comments, upload resolution images |

**How to create an authority account:**
1. Register normally through the app.
2. Open Firebase Console → Realtime Database → `users/{uid}` → change `role` from `"citizen"` to `"authority"`.

---

## 🧑‍💻 Citizen Flow

```
Register / Login
      ↓
Report Issue (title, description, category, photo, GPS)
      ↓
View on Live Map (heat-map clusters)
      ↓
Track on Dashboard (status timeline, authority comments, resolution image)
      ↓
Upvote other issues
```

---

## 🏛️ Authority Flow

```
Login (role = "authority")
      ↓
Alerts Panel — see all open issues with submitter name
      ↓
Expand issue → Add note + authority comment
      ↓
Move to "In Progress" → Upload resolution image → Move to "Resolved"
      ↓
Citizens see the update in their timeline instantly
```

---

## 🗄️ Database Schema

```
/issues
  /{issueId}
    title:            string
    description:      string
    category:         "Roads" | "Water" | "Electricity" | "Sanitation" | "Parks" | "Other"
    imageUrl:         string (Cloudinary URL of report photo)
    resolvedImageUrl: string (Cloudinary URL of resolution proof)
    audioText:        string (voice-to-text transcript)
    lat:              number
    lng:              number
    upvotes:          number
    status:           "open" | "in_progress" | "resolved"
    submittedBy:      string (display name or email of submitter)
    createdAt:        number (Unix ms timestamp)
    timeline:
      /{entryId}
        status:           string
        note:             string
        comment:          string (authority public comment)
        resolvedImageUrl: string (proof image URL, on resolved entry)
        timestamp:        number

/users
  /{uid}
    email:       string
    displayName: string
    role:        "citizen" | "authority"
    createdAt:   number
```

---

## 📱 PWA Support

CivicMitra is a **Progressive Web App**:
- Installable on Android and desktop via browser prompt
- Custom `service-worker.js` for offline caching of the app shell
- Responsive design for all screen sizes

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (HMR, localhost:5173) |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Serve the production build locally |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a Pull Request

Please follow the existing code style. Each service file has a documented contract at the top — keep that pattern.

---

## 👨‍👩‍👧‍👦 Team

**Code Catalysts** — Built for Hackathon 2026

| Role | Responsibility |
|---|---|
| Member 1 | ReportForm, Voice Input, i18n |
| Member 2 | IssueMap (Leaflet heat-map) |
| Member 3 | Dashboard, IssueCard, StatusTimeline |
| Member 4 | Auth, Firebase services, Cloudinary, App integration |

---

## 📄 License

This project is licensed under the **MIT License**.

---

<p align="center">Made with ❤️ for smarter, more connected cities.</p>
