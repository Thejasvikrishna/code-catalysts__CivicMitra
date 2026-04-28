// Navbar.jsx — Member 4 | Shared component used in App.jsx
// Props: activeTab (string), onTabChange (function)

import React from "react";

const TABS = [
  { label: "Report Issue", icon: "📝" },
  { label: "Live Map",     icon: "🗺️" },
  { label: "Dashboard",    icon: "📊" },
];

export default function Navbar({ activeTab, onTabChange }) {
  return (
    <nav
      aria-label="Main navigation"
      style={{
        position:        "sticky",
        top:             0,
        zIndex:          1000,
        backgroundColor: "#01696f",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "space-between",
        padding:         "0 1.5rem",
        height:          "56px",
        boxShadow:       "0 2px 8px rgba(0,0,0,0.25)",
      }}
    >
      {/* Brand */}
      <span
        style={{
          color:       "#fff",
          fontWeight:  700,
          fontSize:    "1.15rem",
          letterSpacing: "0.4px",
          userSelect:  "none",
        }}
      >
        🏙️ CivicMitra
      </span>

      {/* Tab Buttons */}
      <div style={{ display: "flex", gap: "0.25rem" }}>
        {TABS.map(({ label, icon }) => {
          const isActive = activeTab === label;
          return (
            <button
              key={label}
              onClick={() => onTabChange(label)}
              aria-current={isActive ? "page" : undefined}
              style={{
                background:   "none",
                border:       "none",
                borderBottom: isActive
                  ? "2px solid #ffffff"
                  : "2px solid transparent",
                color:      isActive ? "#ffffff" : "rgba(255,255,255,0.60)",
                fontWeight:  isActive ? 600 : 400,
                fontSize:    "0.9rem",
                padding:     "0.55rem 0.85rem",
                cursor:      "pointer",
                transition:  "color 0.2s ease, border-color 0.2s ease",
                whiteSpace:  "nowrap",
              }}
            >
              {icon} {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}