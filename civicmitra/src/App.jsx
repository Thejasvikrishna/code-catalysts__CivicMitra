// App.jsx — Member 4 | Integration Hub
// Wires auth, citizen flow, and authority flow together.

import "./i18n/i18n"; // ← Member 1's i18n side-effect import — MUST be first
import "./App.css";

import React, { useState } from "react";

// Auth
import { useAuth }    from "./hooks/useAuth";
import { logoutUser } from "./services/authService";
import LoginPage      from "./components/auth/LoginPage";

// Member 4 internals
import { useIssues }                        from "./hooks/useIssues";
import { addIssue, upvoteIssue }            from "./services/issueService";
import { uploadImage }                      from "./services/uploadImage";
import {
  detectCategory,
  suggestDescription,
  findSimilarIssues,
} from "./services/smartAssistant";
import Navbar from "./components/shared/Navbar";

// Member components
import ReportForm      from "./components/form/ReportForm";
import IssueMap        from "./components/map/IssueMap";
import Dashboard       from "./components/dashboard/Dashboard";
import AuthorityPanel  from "./components/authority/AuthorityPanel";

export default function App() {
  const { user, userRole, authLoading } = useAuth();
  const { issues, loading, error }      = useIssues();
  const [activeTab, setActiveTab]       = useState(null); // set after role known

  // ── Auth Loading ────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner} />
        <p style={{ color: "#01696f", marginTop: "1rem" }}>Loading CivicMitra…</p>
      </div>
    );
  }

  // ── Not logged in → Login Page ──────────────────────────────────────────
  if (!user) {
    return <LoginPage />;
  }

  // ── Determine tabs based on role ────────────────────────────────────────
  const isAuthority = userRole === "authority";

  const CITIZEN_TABS = [
    { label: "Report Issue", icon: "📝" },
    { label: "Live Map",     icon: "🗺️" },
    { label: "Dashboard",    icon: "📊" },
  ];

  const AUTHORITY_TABS = [
    { label: "Alerts",     icon: "🔔" },
    { label: "Live Map",   icon: "🗺️" },
    { label: "Dashboard",  icon: "📊" },
  ];

  const tabs = isAuthority ? AUTHORITY_TABS : CITIZEN_TABS;
  const defaultTab = isAuthority ? "Alerts" : "Report Issue";
  const currentTab = activeTab || defaultTab;

  // ── Handle issue submission (citizen) ───────────────────────────────────
  async function handleSubmit(issueData) {
    try {
      await addIssue({
        ...issueData,
        submittedBy: user?.displayName || user?.email || "Anonymous",
      });
      setActiveTab("Live Map");
    } catch (err) {
      console.error("Failed to submit issue:", err);
      alert(`Submission failed: ${err.message}`);
    }
  }

  // ── Handle logout ──────────────────────────────────────────────────────
  async function handleLogout() {
    try {
      await logoutUser();
      setActiveTab(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  // ── Data loading state ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
        <Navbar
          activeTab={currentTab}
          onTabChange={setActiveTab}
          tabs={tabs}
          user={user}
          onLogout={handleLogout}
        />
        <div style={styles.centered}>
          <div style={styles.spinner} />
          <p style={{ color: "#01696f", marginTop: "1rem" }}>Loading issues…</p>
        </div>
      </div>
    );
  }

  // ── Firebase error state ──────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
        <Navbar
          activeTab={currentTab}
          onTabChange={setActiveTab}
          tabs={tabs}
          user={user}
          onLogout={handleLogout}
        />
        <div style={styles.centered}>
          <p style={{ color: "#c0392b", fontSize: "1rem" }}>
            ❌ Firebase Error: {error}
          </p>
          <p style={{ color: "#555", fontSize: "0.85rem" }}>
            Check your firebaseConfig.js credentials and DB rules.
          </p>
        </div>
      </div>
    );
  }

  // ── Main App ──────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      <Navbar
        activeTab={currentTab}
        onTabChange={setActiveTab}
        tabs={tabs}
        user={user}
        onLogout={handleLogout}
      />

      <main style={{ padding: "1.25rem", maxWidth: "1100px", margin: "0 auto" }}>

        {/* ← Citizen: Report Form */}
        {!isAuthority && currentTab === "Report Issue" && (
          <ReportForm
            onSubmit={handleSubmit}
            uploadImage={uploadImage}
            detectCategory={detectCategory}
            suggestDescription={suggestDescription}
            findSimilarIssues={(lat, lng, cat) =>
              findSimilarIssues(issues, lat, lng, cat)
            }
            user={user}
          />
        )}

        {/* ← Authority: Alerts Panel */}
        {isAuthority && currentTab === "Alerts" && (
          <AuthorityPanel issues={issues} />
        )}

        {/* ← Shared: Live Map */}
        {currentTab === "Live Map" && (
          <IssueMap issues={issues} />
        )}

        {/* ← Shared: Dashboard */}
        {currentTab === "Dashboard" && (
          <Dashboard issues={issues} onUpvote={upvoteIssue} />
        )}

      </main>
    </div>
  );
}

// ── Inline styles ─────────────────────────────────────────────────────────
const styles = {
  centered: {
    display:         "flex",
    flexDirection:   "column",
    justifyContent:  "center",
    alignItems:      "center",
    height:          "80vh",
    backgroundColor: "#f4f6f8",
  },
  spinner: {
    width:        "40px",
    height:       "40px",
    border:       "4px solid #d0e8e9",
    borderTop:    "4px solid #01696f",
    borderRadius: "50%",
    animation:    "spin 0.8s linear infinite",
  },
};