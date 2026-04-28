import React, { useState } from "react";
import StatusTimeline from "./StatusTimeline";
import "./dashboard.css";

function IssueCard({ issue, onUpvote, rank }) {
  const [showTimeline, setShowTimeline] = useState(false);

  const rankEmoji = ["🥇", "🥈", "🥉"];

  return (
    <article
      className="issue-card"
      style={rank !== undefined ? { borderLeft: "4px solid #f1c40f" } : {}}
    >
      {rank !== undefined && (
        <div className="rank-badge">{rankEmoji[rank]}</div>
      )}

      <h3>{issue.title}</h3>

      <div style={{ marginBottom: "8px" }}>
        <span className="badge">{issue.category}</span>
        <span className={`badge ${issue.status}`}>{issue.status}</span>
      </div>

      <p style={{ fontSize: "12px", color: "#777" }}>
        {new Date(issue.createdAt).toLocaleDateString()}
      </p>

      {issue.imageUrl && (
        <img
          src={issue.imageUrl}
          alt="issue"
          style={{
            width: "100%",
            height: "160px",
            objectFit: "cover",
            borderRadius: "10px",
            marginTop: "10px",
          }}
        />
      )}

      <div style={{ marginTop: "12px" }}>
        <button
          className="upvote-btn"
          onClick={() => onUpvote && onUpvote(issue.id)}
        >
          👍 {issue.upvotes || 0}
        </button>

        <button
          className="toggle-btn"
          onClick={() => setShowTimeline(!showTimeline)}
        >
          {showTimeline ? "▲ Hide Timeline" : "▼ View Timeline"}
        </button>
      </div>

      {showTimeline && (
        <div style={{ marginTop: "10px" }}>
          <StatusTimeline timeline={issue.timeline} />
        </div>
      )}
    </article>
  );
}

export default IssueCard;