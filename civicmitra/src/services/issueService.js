// issueService.js — Member 4
// Contracts:
//   addIssue(issueData): Promise<string>  → returns Firebase issue key
//   upvoteIssue(issueId): Promise<void>   → atomic transaction
//   updateStatus(issueId, newStatus, note): Promise<void>

import { db } from "./firebaseConfig";
import {
  ref,
  push,
  set,
  update,
  runTransaction,
} from "firebase/database";

// ─── addIssue ────────────────────────────────────────────────────────────────
// Called by App.jsx handleSubmit, which receives issueData from Member 1's ReportForm
// issueData = { title, description, category, imageUrl, audioText, lat, lng, submittedBy }
export async function addIssue(issueData) {
  const issuesRef = ref(db, "issues");
  const newRef    = push(issuesRef); // Generates unique key

  const timestamp = Date.now();

  await set(newRef, {
    title:       issueData.title       || "",
    description: issueData.description || "",
    category:    issueData.category    || "Other",
    imageUrl:    issueData.imageUrl    || "",
    audioText:   issueData.audioText   || "",
    lat:         issueData.lat         || 12.9716, // Bengaluru default
    lng:         issueData.lng         || 77.5946,
    upvotes:     0,
    status:      "open",
    createdAt:   timestamp,
    // Submitter identity
    submittedBy: issueData.submittedBy || "Anonymous",
    // Initial timeline entry — Member 3's StatusTimeline reads this array
    timeline: [
      {
        status:    "open",
        note:      "Issue reported by citizen.",
        timestamp: timestamp,
      },
    ],
  });

  return newRef.key; // ← Contract return: string key like "-NxK2a..."
}

// ─── upvoteIssue ─────────────────────────────────────────────────────────────
// Called by App.jsx onUpvote prop → passed to Member 3's Dashboard/IssueCard
// runTransaction ensures no race conditions with concurrent upvotes
export async function upvoteIssue(issueId) {
  const upvoteRef = ref(db, `issues/${issueId}/upvotes`);

  await runTransaction(upvoteRef, (currentValue) => {
    // currentValue is null if field doesn't exist yet — default to 0
    return (currentValue ?? 0) + 1;
  });
}

// ─── updateStatus ─────────────────────────────────────────────────────────────
// Optional: Admin/demo use. Appends a timeline entry and updates status field.
// Member 3's StatusTimeline can display these entries.
// Extra fields: resolvedImageUrl (string URL), comment (string) for resolved entries.
export async function updateStatus(issueId, newStatus, note = "", resolvedImageUrl = "", comment = "") {
  const timelineRef    = ref(db, `issues/${issueId}/timeline`);
  const newEntryRef    = push(timelineRef); // Appends to timeline array in DB
  const timestamp      = Date.now();

  // Write new timeline entry (include resolvedImageUrl + comment if provided)
  await set(newEntryRef, {
    status: newStatus,
    note,
    timestamp,
    ...(resolvedImageUrl ? { resolvedImageUrl } : {}),
    ...(comment        ? { comment }          : {}),
  });

  // Update top-level status field (and store resolvedImageUrl at issue level for quick access)
  const issueRef = ref(db, `issues/${issueId}`);
  await update(issueRef, {
    status: newStatus,
    ...(resolvedImageUrl ? { resolvedImageUrl } : {}),
  });
}