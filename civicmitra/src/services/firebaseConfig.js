// firebaseConfig.js — Member 4 | Exported: db, auth
// All teammates who need Firebase import 'db' and 'auth' from here ONLY

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// 🔑 Firebase credentials
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

const app = initializeApp(firebaseConfig);

// Export db — used by issueService.js and useIssues.js
export const db = getDatabase(app);

// Export auth — used by authService.js and useAuth.js
export const auth = getAuth(app);