import React, { useState } from "react";
import StatusTimeline from "./StatusTimeline";

function IssueCard({ issue, onUpvote, rank }) {
  const [open, setOpen] = useState(false);

  // Medal icons for top issues
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <article
      className="issue-card"
      style={rank !== undefined ? { borderLeft: "4px solid #f1c40f" } : {}}
    >
      {/* Rank badge (top-left) */}
      {rank !== undefined && (
        <div className="rank-badge">{medals[rank]}</div>
      )}

      {/* Title */}
      <h3 className="issue-title">{issue.title}</h3>

      {/* Category + Status */}
      <div className="badges">
        <span className="badge category">{issue.category}</span>
        <span className={`badge status ${issue.status}`}>
          {issue.status}
        </span>
      </div>

      {/* Image */}
      {issue.imageUrl && (
        <img
          src={issue.imageUrl}
          alt="issue"
          className="issue-img"
          loading="lazy"
        />
      )}

      {/* Date */}
      <p className="date">
        {new Date(issue.createdAt).toLocaleDateString()}
      </p>

      {/* Upvote */}
      <button
        className="upvote-btn"
        onClick={() => onUpvote(issue.id)}
        aria-label="Upvote issue"
      >
        ▲ {issue.upvotes || 0}
      </button>

      {/* Toggle timeline */}
      <button
        className="toggle-btn"
        onClick={() => setOpen(!open)}
      >
        {open ? "▲ Hide Timeline" : "▼ View Timeline"}
      </button>

      {/* Timeline */}
      {open && <StatusTimeline timeline={issue.timeline} />}
    </article>
  );
}

export default IssueCard;