// firebaseConfig.js — Member 4 | Exported: db
// All teammates who need Firebase import 'db' from here ONLY

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// 🔑 Paste your Firebase credentials here
// Get these from: Firebase Console → Project Settings → Your Apps → SDK Setup
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL:       "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com", // ← Critical for Realtime DB
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);

// Export db — used by issueService.js and useIssues.js
export const db = getDatabase(app);