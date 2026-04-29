// useIssues.js — Member 4 | Real-time Firebase subscription hook
// Contract: useIssues() → { issues: Array, loading: boolean, error: string|null }
// Used by App.jsx to feed live data to all member components.

import { useState, useEffect } from "react";
import { ref, onValue, off } from "firebase/database";
import { db } from "../services/firebaseConfig";

// ── Normalize a single Firebase issue record ─────────────────────────────────
// Firebase push() stores arrays as objects keyed by push IDs.
// This converts timeline back into a sorted array and fills in missing fields.
function normalizeIssue(id, value) {
  if (!value || typeof value !== "object") return null;

  // Convert timeline object → sorted array (may be undefined/null)
  let timeline = [];
  if (value.timeline && typeof value.timeline === "object") {
    timeline = Object.values(value.timeline)
      .filter(Boolean)
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  }

  return {
    id,
    title:       value.title       || "Untitled Issue",
    description: value.description || "",
    category:    value.category    || "Other",
    imageUrl:    value.imageUrl    || "",
    audioText:   value.audioText   || "",
    lat:         typeof value.lat === "number" ? value.lat : null,
    lng:         typeof value.lng === "number" ? value.lng : null,
    upvotes:     typeof value.upvotes === "number" ? value.upvotes : 0,
    status:      value.status      || "open",
    createdAt:   value.createdAt   || null,
    submittedBy: value.submittedBy || "Anonymous",
    timeline,
  };
}

export function useIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const issuesRef = ref(db, "issues");

    // Real-time listener — fires on every DB change
    const unsubscribe = onValue(
      issuesRef,
      (snapshot) => {
        const data = snapshot.val();

        if (!data) {
          setIssues([]);
          setLoading(false);
          return;
        }

        // Convert Firebase object → normalized array, sorted newest first
        const issueArray = Object.entries(data)
          .map(([id, value]) => normalizeIssue(id, value))
          .filter(Boolean) // drop null entries
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        setIssues(issueArray);
        setLoading(false);
      },
      (err) => {
        console.error("useIssues: Firebase read failed:", err);
        setError(err.message || "Failed to load issues.");
        setLoading(false);
      }
    );

    // Cleanup on unmount — prevents memory leaks
    return () => off(issuesRef, "value", unsubscribe);
  }, []);

  return { issues, loading, error };
}