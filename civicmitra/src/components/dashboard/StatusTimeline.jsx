import React from "react";

const getColor = (status) => {
  if (status === "open") return "#e67e22";
  if (status === "in_progress") return "#2980b9";
  if (status === "resolved") return "#27ae60";
  return "#999";
};

function StatusTimeline({ timeline }) {
  // Handle empty timeline
  if (!timeline || Object.keys(timeline).length === 0) {
    return <p className="empty">No updates yet.</p>;
  }

  // Handle both array & Firebase object
  const data = Array.isArray(timeline)
    ? timeline
    : Object.values(timeline);

  return (
    <div className="timeline">
      {data.map((item, index) => (
        <div key={index} className="timeline-item">
          
          {/* Colored dot */}
          <span
            className="dot"
            style={{ background: getColor(item.status) }}
          ></span>

          {/* Content */}
          <div className="timeline-content">
            <strong>{item.status}</strong>
            <p>{item.note}</p>
            <small>
              {new Date(item.timestamp).toLocaleString()}
            </small>
          </div>

        </div>
      ))}
    </div>
  );
}

export default StatusTimeline;