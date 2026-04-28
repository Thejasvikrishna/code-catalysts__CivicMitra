import React, { useState } from "react";

function FeaturePage() {
  const [issueText, setIssueText] = useState("");
  const [category, setCategory] = useState("Pothole");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!issueText.trim()) {
      setMessage("⚠️ Please enter an issue description");
      return;
    }

    setMessage("✅ Issue submitted successfully!");
    setIssueText("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>CivicMitra </h1>

      <h2>Report an Issue</h2>

      {/* Issue Input */}
      <input
        type="text"
        placeholder="Enter issue (e.g., Pothole on road)"
        value={issueText}
        onChange={(e) => setIssueText(e.target.value)}
        style={{ padding: "8px", width: "300px", marginBottom: "10px" }}
      />

      <br />

      {/* Category Dropdown */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{ padding: "8px", marginBottom: "10px" }}
      >
        <option>Pothole</option>
        <option>Garbage</option>
        <option>Streetlight</option>
        <option>Water Leakage</option>
      </select>

      <br />

      {/* File Upload */}
      <input type="file" style={{ marginBottom: "10px" }} />

      <br />

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        style={{
          padding: "10px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Submit Issue
      </button>

      {/* Message */}
      {message && (
        <p style={{ marginTop: "15px", fontWeight: "bold" }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default FeaturePage;