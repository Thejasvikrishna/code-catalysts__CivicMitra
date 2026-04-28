// App.jsx — Member 4 | Integration Hub
// Wires all 4 members' components together.
// Owns: state (activeTab), data (useIssues), service calls (addIssue, upvoteIssue)
// Props flow DOWN — no component imports Firebase directly except Member 4's files.

import "./i18n/i18n"; // ← Member 1's i18n side-effect import — MUST be first

import React, { useState } from "react";

// Member 4 internals
import { useIssues }    from "./hooks/useIssues";
import { addIssue, upvoteIssue } from "./services/issueService";
import { uploadImage }  from "./services/uploadImage";
import Navbar           from "./components/shared/Navbar";

// ← Member 1's component
import ReportForm from "./components/form/ReportForm";
// ← Member 2's component
import IssueMap   from "./components/map/IssueMap";
// ← Member 3's component
import Dashboard  from "./components/dashboard/Dashboard";

export default function App() {
  const { issues, loading, error } = useIssues();
  const [activeTab, setActiveTab]  = useState("Report Issue");

  // Called by Member 1's ReportForm via onSubmit prop
  async function handleSubmit(issueData) {
    try {
      await addIssue(issueData);
      setActiveTab("Live Map"); // Navigate to map after successful report
    } catch (err) {
      console.error("Failed to submit issue:", err);
      alert(`Submission failed: ${err.message}`);
    }
  }

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner} />
        <p style={{ color: "#01696f", marginTop: "1rem" }}>Loading CivicMitra…</p>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={styles.centered}>
        <p style={{ color: "#c0392b", fontSize: "1rem" }}>
          ❌ Firebase Error: {error}
        </p>
        <p style={{ color: "#555", fontSize: "0.85rem" }}>
          Check your firebaseConfig.js credentials and DB rules.
        </p>
      </div>
    );
  }

  // ── Main App ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      {/* Member 4's Navbar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main style={{ padding: "1.25rem", maxWidth: "1100px", margin: "0 auto" }}>

        {/* ← Member 1's component — receives onSubmit and uploadImage as props */}
        {activeTab === "Report Issue" && (
          <ReportForm
            onSubmit={handleSubmit}
            uploadImage={uploadImage}
          />
        )}

        {/* ← Member 2's component — receives live issues array as prop */}
        {activeTab === "Live Map" && (
          <IssueMap issues={issues} />
        )}

        {/* ← Member 3's component — receives live issues array and upvote handler */}
        {activeTab === "Dashboard" && (
          <Dashboard
            issues={issues}
            onUpvote={upvoteIssue}
          />
        )}

      </main>
    </div>
  );
}

// ── Inline styles (App-level only) ──────────────────────────────────────────
const styles = {
  centered: {
    display:        "flex",
    flexDirection:  "column",
    justifyContent: "center",
    alignItems:     "center",
    height:         "100vh",
    backgroundColor:"#f4f6f8",
  },
  spinner: {
    width:       "40px",
    height:      "40px",
    border:      "4px solid #d0e8e9",
    borderTop:   "4px solid #01696f",
    borderRadius:"50%",
    animation:   "spin 0.8s linear infinite",
  },
};