// firebaseConfig.js — Member 4 | Exported: db
// All teammates who need Firebase import 'db' from here ONLY

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// 🔑 Paste your Firebase credentials here
// Get these from: Firebase Console → Project Settings → Your Apps → SDK Setup
const firebaseConfig = {
  apiKey: "",
  authDomain: "civicmitra-b04d5.firebaseapp.com",
  databaseURL:       "",
  projectId: "civicmitra-b04d5",
  storageBucket: "civicmitra-b04d5.firebasestorage.app",
  messagingSenderId: "164795109812",
  appId: "1:164795109812:web:32f14367fb5c676b94e2e1"
};

const app = initializeApp(firebaseConfig);

// Export db — used by issueService.js and useIssues.js
export const db = getDatabase(app);