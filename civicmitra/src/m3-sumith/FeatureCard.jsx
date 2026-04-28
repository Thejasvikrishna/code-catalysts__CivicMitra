import React from "react";

function FeatureCard({ title, description }) {
  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: "10px",
      padding: "15px",
      marginBottom: "15px",
      backgroundColor: "white",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
    }}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default FeatureCard;