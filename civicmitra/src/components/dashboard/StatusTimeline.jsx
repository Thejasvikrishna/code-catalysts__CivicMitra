import React, { useState } from "react";

const STATUS_META = {
  open:        { color: "#e67e22", icon: "🟠", label: "Open" },
  in_progress: { color: "#2980b9", icon: "🔵", label: "In Progress" },
  resolved:    { color: "#27ae60", icon: "✅", label: "Resolved" },
};

function formatDate(ts) {
  if (!ts) return "";
  try {
    const d = new Date(typeof ts === "object" && ts.seconds ? ts.seconds * 1000 : ts);
    return d.toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
}

// onImageClick(src, alt) — provided by parent to open lightbox
function TimelineEntry({ item, index, onImageClick }) {
  const [imgExpanded, setImgExpanded] = useState(false);
  const meta = STATUS_META[item.status] || { color: "#999", icon: "●", label: item.status };

  return (
    <div className="tl-entry">
      {/* Connector line (not on first item) */}
      {index !== 0 && <div className="tl-line" style={{ borderColor: meta.color }} />}

      {/* Dot */}
      <div className="tl-dot" style={{ background: meta.color }}>
        <span>{meta.icon}</span>
      </div>

      <div className="tl-body">
        {/* Status label */}
        <span className="tl-status-label" style={{ color: meta.color }}>
          {meta.label}
        </span>

        {/* Note */}
        {item.note && <p className="tl-note">{item.note}</p>}

        {/* Authority comment */}
        {item.comment && (
          <div className="tl-authority-comment">
            <span className="tl-comment-icon">💬</span>
            <span className="tl-comment-text"><em>Authority:</em> {item.comment}</span>
          </div>
        )}

        {/* Resolved image — collapsed by default, expand on click */}
        {item.resolvedImageUrl && (
          <div className="tl-resolved-image-section">
            <button
              className="tl-image-toggle"
              onClick={() => setImgExpanded((v) => !v)}
            >
              {imgExpanded ? "▲ Hide Resolution Image" : "📷 View Resolution Image"}
            </button>
            {imgExpanded && (
              <div className="tl-resolved-image-wrap">
                <img
                  src={item.resolvedImageUrl}
                  alt="Resolution proof"
                  className="tl-resolved-img"
                  style={{ cursor: "zoom-in" }}
                  title="Click to enlarge"
                  onClick={() =>
                    onImageClick &&
                    onImageClick(item.resolvedImageUrl, "Resolution proof")
                  }
                />
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <span className="tl-time">{formatDate(item.timestamp)}</span>
      </div>
    </div>
  );
}

function StatusTimeline({ timeline, resolvedImageUrl, onImageClick }) {
  if (!timeline || Object.values(timeline).length === 0) {
    return <p className="tl-empty">No updates yet.</p>;
  }

  const data = Array.isArray(timeline) ? timeline : Object.values(timeline);

  // Sort by timestamp ascending
  const sorted = [...data].sort((a, b) => {
    const ta = typeof a.timestamp === "object" && a.timestamp?.seconds
      ? a.timestamp.seconds * 1000
      : a.timestamp || 0;
    const tb = typeof b.timestamp === "object" && b.timestamp?.seconds
      ? b.timestamp.seconds * 1000
      : b.timestamp || 0;
    return ta - tb;
  });

  // Inject top-level resolvedImageUrl into the resolved entry if not already there
  const enriched = sorted.map((item) => {
    if (item.status === "resolved" && !item.resolvedImageUrl && resolvedImageUrl) {
      return { ...item, resolvedImageUrl };
    }
    return item;
  });

  return (
    <div className="tl-container">
      {enriched.map((item, idx) => (
        <TimelineEntry
          key={idx}
          item={item}
          index={idx}
          onImageClick={onImageClick}
        />
      ))}
    </div>
  );
}

export default StatusTimeline;