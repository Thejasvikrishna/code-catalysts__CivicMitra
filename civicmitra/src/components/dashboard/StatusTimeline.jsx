import React from "react";

function StatusTimeline({ timeline }) {
  if (!timeline || Object.values(timeline).length === 0) {
    return <p>No updates yet.</p>;
  }

  const data = Array.isArray(timeline) ? timeline : Object.values(timeline);

  const getColor = (status) => {
    if (status === "open") return "#e67e22";
    if (status === "in_progress") return "#2980b9";
    if (status === "resolved") return "#27ae60";
    return "#999";
  };

  return (
    <div>
      {data.map((item, index) => (
        <div key={index} style={{ marginBottom: "10px" }}>
          <div style={{ color: getColor(item.status), fontWeight: "bold" }}>
            ● {item.status}
          </div>
          <div>{item.note}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {new Date(item.timestamp).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatusTimeline;