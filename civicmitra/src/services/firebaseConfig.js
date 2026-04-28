// firebaseConfig.js — Member 4 | Exported: db, auth
// All teammates who need Firebase import 'db' and 'auth' from here ONLY

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// 🔑 Firebase credentials
const firebaseConfig = {
  apiKey: "",
  authDomain: "civicmitra-b04d5.firebaseapp.com",
  databaseURL:       "",
  projectId: "civicmitra-b04d5",
  storageBucket: "",
  messagingSenderId: "164795109812",
  appId: "1:164795109812:web:32f14367fb5c676b94e2e1"
};

const app = initializeApp(firebaseConfig);

// Export db — used by issueService.js and useIssues.js
export const db = getDatabase(app);

// Export auth — used by authService.js and useAuth.js
export const auth = getAuth(app);