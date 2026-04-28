// Navbar.jsx — Member 4 | Shared navigation with dynamic tabs, user info, logout
// Props: activeTab, onTabChange, tabs (array), user (firebase user), onLogout

import React from "react";

export default function Navbar({ activeTab, onTabChange, tabs = [], user, onLogout }) {
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
        padding:         "0 1rem",
        height:          "56px",
        boxShadow:       "0 2px 8px rgba(0,0,0,0.25)",
        gap:             "0.5rem",
      }}
    >
      {/* Brand */}
      <span
        style={{
          color:         "#fff",
          fontWeight:    700,
          fontSize:      "1.1rem",
          letterSpacing: "0.4px",
          userSelect:    "none",
          whiteSpace:    "nowrap",
          flexShrink:    0,
        }}
      >
        🏙️ CivicMitra
      </span>

      {/* Tab Buttons */}
      <div style={{ display: "flex", gap: "0.15rem", overflow: "auto" }}>
        {tabs.map(({ label, icon }) => {
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
                color:       isActive ? "#ffffff" : "rgba(255,255,255,0.60)",
                fontWeight:  isActive ? 600 : 400,
                fontSize:    "0.85rem",
                padding:     "0.5rem 0.7rem",
                cursor:      "pointer",
                transition:  "color 0.2s ease, border-color 0.2s ease",
                whiteSpace:  "nowrap",
                minHeight:   "44px",
              }}
            >
              {icon} {label}
            </button>
          );
        })}
      </div>

      {/* User + Logout */}
      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 }}>
          <span
            style={{
              color:      "rgba(255,255,255,0.85)",
              fontSize:   "0.78rem",
              maxWidth:   "120px",
              overflow:   "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={user.email}
          >
            {user.displayName || user.email}
          </span>
          <button
            onClick={onLogout}
            style={{
              background:   "rgba(255,255,255,0.15)",
              border:       "1px solid rgba(255,255,255,0.25)",
              color:        "#fff",
              borderRadius: "8px",
              padding:      "0.35rem 0.75rem",
              fontSize:     "0.8rem",
              cursor:       "pointer",
              minHeight:    "36px",
              transition:   "background 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "rgba(255,255,255,0.25)")}
            onMouseLeave={(e) => (e.target.style.background = "rgba(255,255,255,0.15)")}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}