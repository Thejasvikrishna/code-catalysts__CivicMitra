// authService.js — Member 4 | Firebase Auth + User Roles
// Contracts:
//   registerUser(email, password, displayName, role): Promise<object>
//   loginUser(email, password): Promise<object>
//   logoutUser(): Promise<void>
//   getUserRole(uid): Promise<string|null>

import { auth, db } from "./firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { ref, set, get } from "firebase/database";

// ─── DB Schema: users/{uid} ────────────────────────────────────────────────
// { email, displayName, role: "citizen"|"authority", createdAt }

export async function registerUser(email, password, displayName, role = "citizen") {
  // 1. Create Firebase Auth user
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  // 2. Set display name on auth profile
  await updateProfile(cred.user, { displayName });

  // 3. Save user data + role in Realtime DB
  await set(ref(db, `users/${cred.user.uid}`), {
    email,
    displayName,
    role,
    createdAt: Date.now(),
  });

  return { uid: cred.user.uid, email, displayName, role };
}

export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logoutUser() {
  await signOut(auth);
}

export async function getUserRole(uid) {
  const snapshot = await get(ref(db, `users/${uid}/role`));
  return snapshot.exists() ? snapshot.val() : null;
}
