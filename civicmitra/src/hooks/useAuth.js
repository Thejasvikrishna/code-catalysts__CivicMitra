// useAuth.js — Member 4 | Auth state listener hook
// Returns { user, userRole, authLoading }
// user is null when not logged in

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { getUserRole } from "../services/authService";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch role from DB
        const role = await getUserRole(firebaseUser.uid);
        setUserRole(role || "citizen"); // default fallback
      } else {
        setUser(null);
        setUserRole(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, userRole, authLoading };
}
