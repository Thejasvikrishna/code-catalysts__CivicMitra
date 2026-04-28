// IssueCard.jsx — Member 3 | Issue card with upvote, timeline, and status display
import React, { useState } from "react";
import StatusTimeline from "./StatusTimeline";

const STATUS_LABELS = {
  open:        "Open",
  in_progress: "In Progress",
  resolved:    "Resolved",
};

const STATUS_COLORS = {
  open:        "#e67e22",
  in_progress: "#2980b9",
  resolved:    "#27ae60",
};

const CAT_COLORS = {
  Roads:       "#e67e22",
  Water:       "#2980b9",
  Electricity: "#f1c40f",
  Sanitation:  "#27ae60",
  Parks:       "#16a085",
  Other:       "#8e44ad",
};

const RANK_EMOJI = ["🥇", "🥈", "🥉"];

// Format timestamp (handles Firebase server timestamp, unix ms, and Date objects)
function formatDate(ts) {
  if (!ts) return null;
  try {
    const d = new Date(typeof ts === "object" && ts.seconds ? ts.seconds * 1000 : ts);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch {
    return null;
  }
}

// Time ago string
function timeAgo(ts) {
  if (!ts) return null;
  try {
    const ms = typeof ts === "object" && ts.seconds ? ts.seconds * 1000 : ts;
    const diff = Date.now() - ms;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch {
    return null;
  }
}

export default function IssueCard({ issue, onUpvote, rank }) {
  const [showTimeline, setShowTimeline] = useState(false);
  const [upvoting, setUpvoting] = useState(false);

  const dateStr   = timeAgo(issue.createdAt) || formatDate(issue.createdAt);
  const statusKey = issue.status || "open";
  const catColor  = CAT_COLORS[issue.category] || "#8e44ad";
  const statusColor = STATUS_COLORS[statusKey] || "#6b7280";

  const handleUpvote = async () => {
    if (!onUpvote || upvoting) return;
    setUpvoting(true);
    try {
      await onUpvote(issue.id);
    } finally {
      setUpvoting(false);
    }
  };

  return (
    <article
      className="issue-card"
      style={rank !== undefined ? { borderLeft: `4px solid ${RANK_EMOJI[rank - 1] ? "#f1c40f" : catColor}` } : {}}
    >
      {/* Rank badge */}
      {rank !== undefined && rank <= 3 && (
        <div className="rank-badge">{RANK_EMOJI[rank - 1]}</div>
      )}

      {/* Top row: category + status + time */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {issue.category && (
            <span style={{
              background: catColor,
              color: "#fff",
              padding: "2px 10px",
              borderRadius: 10,
              fontSize: "0.72rem",
              fontWeight: 600,
            }}>
              {issue.category}
            </span>
          )}
          <span style={{
            background: statusColor,
            color: "#fff",
            padding: "2px 10px",
            borderRadius: 10,
            fontSize: "0.72rem",
            fontWeight: 600,
          }}>
            {STATUS_LABELS[statusKey] || statusKey}
          </span>
        </div>
        {dateStr && (
          <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{dateStr}</span>
        )}
      </div>

      {/* Title */}
      <h3 style={{ margin: "0 0 0.35rem", fontSize: "0.98rem", fontWeight: 600, color: "#111827" }}>
        {issue.title || "Untitled Issue"}
      </h3>

      {/* Description */}
      {issue.description && (
        <p style={{ margin: "0 0 0.6rem", fontSize: "0.84rem", color: "#6b7280", lineHeight: 1.5 }}>
          {issue.description.length > 120
            ? issue.description.slice(0, 120) + "…"
            : issue.description}
        </p>
      )}

      {/* Image */}
      {issue.imageUrl && (
        <img
          src={issue.imageUrl}
          alt={`Photo of ${issue.title || "issue"}`}
          style={{
            width: "100%",
            height: "150px",
            objectFit: "cover",
            borderRadius: 10,
            marginBottom: "0.75rem",
          }}
        />
      )}

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "0.5rem" }}>
        <button
          className="upvote-btn"
          onClick={handleUpvote}
          disabled={upvoting}
          aria-label={`Upvote ${issue.title}`}
        >
          👍 {issue.upvotes || 0}
        </button>

        {issue.timeline && issue.timeline.length > 0 && (
          <button
            className="toggle-btn"
            onClick={() => setShowTimeline(!showTimeline)}
          >
            {showTimeline ? "▲ Hide Timeline" : "▼ View Timeline"}
          </button>
        )}
      </div>

      {/* Timeline */}
      {showTimeline && issue.timeline && (
        <div style={{ marginTop: "0.75rem" }}>
          <StatusTimeline timeline={issue.timeline} />
        </div>
      )}
    </article>
  );
}