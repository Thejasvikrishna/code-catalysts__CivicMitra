// AuthorityPanel.jsx — Authority/Admin issue management panel
// Receives alerts for new issues, can update status and add notes
import React, { useState, useMemo } from "react";
import { updateStatus } from "../../services/issueService";
import "./authority.css";

const STATUS_FLOW = ["open", "in_progress", "resolved"];
const STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};
const STATUS_COLORS = {
  open: "#e67e22",
  in_progress: "#2980b9",
  resolved: "#27ae60",
};
const CATEGORY_COLORS = {
  Roads: "#e67e22",
  Water: "#2980b9",
  Electricity: "#f1c40f",
  Sanitation: "#27ae60",
  Parks: "#16a085",
  Other: "#8e44ad",
};

export default function AuthorityPanel({ issues = [] }) {
  const [filter, setFilter] = useState("all"); // all | open | in_progress | resolved
  const [noteInputs, setNoteInputs] = useState({});    // {issueId: note}
  const [expanding, setExpanding] = useState({});       // {issueId: bool}
  const [updating, setUpdating] = useState({});         // {issueId: bool}

  // Count alerts (open issues needing attention)
  const alertCount = issues.filter((i) => i.status === "open").length;
  const inProgCount = issues.filter((i) => i.status === "in_progress").length;
  const resolvedCount = issues.filter((i) => i.status === "resolved").length;

  // Filtered list
  const filtered = useMemo(() => {
    if (filter === "all") return issues;
    return issues.filter((i) => i.status === filter);
  }, [issues, filter]);

  // Get next status in the flow
  const getNextStatus = (current) => {
    const idx = STATUS_FLOW.indexOf(current);
    return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  // Handle status update
  const handleStatusUpdate = async (issueId, newStatus) => {
    const note = noteInputs[issueId] || "";
    setUpdating((prev) => ({ ...prev, [issueId]: true }));
    try {
      await updateStatus(issueId, newStatus, note || `Status changed to ${newStatus}`);
      setNoteInputs((prev) => ({ ...prev, [issueId]: "" }));
      setExpanding((prev) => ({ ...prev, [issueId]: false }));
    } catch (err) {
      alert("Update failed: " + err.message);
    } finally {
      setUpdating((prev) => ({ ...prev, [issueId]: false }));
    }
  };

  // Time ago helper
  const timeAgo = (ts) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="authority-panel">
      {/* Alert Banner */}
      <div className="authority-alert-banner">
        <div className="alert-icon">🔔</div>
        <div className="alert-text">
          <strong>{alertCount} new alert{alertCount !== 1 ? "s" : ""}</strong>
          <span> require your attention</span>
        </div>
      </div>

      {/* Stats bar */}
      <div className="authority-stats">
        <div
          className={`stat-chip ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          📋 All <strong>{issues.length}</strong>
        </div>
        <div
          className={`stat-chip open ${filter === "open" ? "active" : ""}`}
          onClick={() => setFilter("open")}
        >
          🟠 Open <strong>{alertCount}</strong>
        </div>
        <div
          className={`stat-chip in-prog ${filter === "in_progress" ? "active" : ""}`}
          onClick={() => setFilter("in_progress")}
        >
          🔵 In Progress <strong>{inProgCount}</strong>
        </div>
        <div
          className={`stat-chip resolved ${filter === "resolved" ? "active" : ""}`}
          onClick={() => setFilter("resolved")}
        >
          🟢 Resolved <strong>{resolvedCount}</strong>
        </div>
      </div>

      {/* Issue List */}
      {filtered.length === 0 ? (
        <div className="authority-empty">
          <span className="empty-icon">✅</span>
          <p>No issues in this category</p>
        </div>
      ) : (
        <div className="authority-issue-list">
          {filtered.map((issue) => {
            const nextStatus = getNextStatus(issue.status);
            const isOpen = expanding[issue.id];

            return (
              <article key={issue.id} className="authority-issue-card">
                {/* Top Row */}
                <div className="issue-top-row">
                  <div className="issue-meta">
                    <span
                      className="cat-dot"
                      style={{ background: CATEGORY_COLORS[issue.category] || "#8e44ad" }}
                    />
                    <span className="issue-category">{issue.category}</span>
                    <span
                      className="issue-status-badge"
                      style={{ background: STATUS_COLORS[issue.status] }}
                    >
                      {STATUS_LABELS[issue.status]}
                    </span>
                  </div>
                  <span className="issue-time">{timeAgo(issue.createdAt)}</span>
                </div>

                {/* Title & Description */}
                <h3 className="issue-title">{issue.title}</h3>
                {issue.description && (
                  <p className="issue-desc">{issue.description}</p>
                )}

                {/* Image thumbnail */}
                {issue.imageUrl && (
                  <img
                    src={issue.imageUrl}
                    alt={`Photo of ${issue.title}`}
                    className="issue-thumb"
                  />
                )}

                {/* Upvotes & Location */}
                <div className="issue-info-row">
                  <span>👍 {issue.upvotes || 0} upvotes</span>
                  <span>📍 {issue.lat?.toFixed(4)}, {issue.lng?.toFixed(4)}</span>
                </div>

                {/* Action area */}
                {nextStatus ? (
                  <div className="issue-actions">
                    <button
                      className="action-toggle"
                      onClick={() =>
                        setExpanding((prev) => ({
                          ...prev,
                          [issue.id]: !prev[issue.id],
                        }))
                      }
                    >
                      {isOpen ? "Cancel" : `Move to ${STATUS_LABELS[nextStatus]}`}
                    </button>

                    {isOpen && (
                      <div className="action-expand">
                        <input
                          type="text"
                          placeholder="Add a note (optional)..."
                          value={noteInputs[issue.id] || ""}
                          onChange={(e) =>
                            setNoteInputs((prev) => ({
                              ...prev,
                              [issue.id]: e.target.value,
                            }))
                          }
                          className="action-note-input"
                        />
                        <button
                          className="action-confirm"
                          disabled={updating[issue.id]}
                          onClick={() => handleStatusUpdate(issue.id, nextStatus)}
                        >
                          {updating[issue.id]
                            ? "Updating…"
                            : `✓ Confirm ${STATUS_LABELS[nextStatus]}`}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="issue-resolved-badge">
                    ✅ This issue has been resolved
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
