import React, { useMemo } from "react";
import IssueCard from "./IssueCard";
import "./dashboard.css";

function Dashboard({ issues = [], onUpvote }) {

  // 🧪 MOCK DATA (for testing if empty)
  if (issues.length === 0) {
    issues = [
      {
        id: "1",
        title: "Pothole near MG Road",
        category: "Roads",
        status: "open",
        upvotes: 5,
        createdAt: Date.now(),
        timeline: [],
      },
      {
        id: "2",
        title: "Streetlight not working",
        category: "Electricity",
        status: "resolved",
        upvotes: 2,
        createdAt: Date.now(),
        timeline: [],
      },
      {
        id: "3",
        title: "Garbage overflow",
        category: "Sanitation",
        status: "in_progress",
        upvotes: 8,
        createdAt: Date.now(),
        timeline: [],
      },
    ];
  }

  // 📊 KPI CALCULATIONS
  const total = issues.length;
  const open = issues.filter(i => i.status === "open").length;
  const resolved = issues.filter(i => i.status === "resolved").length;

  // 🔥 MOST UPVOTED (EXTRA TASK)
  const topIssues = useMemo(() => {
    const sorted = [...issues]
      .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
      .slice(0, 3);

    // hide if all upvotes are 0
    if (sorted.every(i => (i.upvotes || 0) === 0)) {
      return [];
    }

    return sorted;
  }, [issues]);

  return (
    <div className="dashboard">

      <h2>Dashboard</h2>

      {/* KPI SECTION */}
      <div className="kpi">
        <div className="kpi-card">Total Issues: {total}</div>
        <div className="kpi-card">Open: {open}</div>
        <div className="kpi-card">Resolved: {resolved}</div>
      </div>

      {/* 🔥 MOST UPVOTED SECTION */}
      {topIssues.length > 0 && (
        <div className="top-section">
          <h3>Most Upvoted Issues</h3>

          {topIssues.map((issue, index) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onUpvote={onUpvote}
              rank={index}
            />
          ))}
        </div>
      )}

      {/* ALL ISSUES */}
      <div className="issue-list">
        {issues.length === 0 ? (
          <p>No issues reported yet.</p>
        ) : (
          issues.map(issue => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onUpvote={onUpvote}
            />
          ))
        )}
      </div>

    </div>
  );
}

export default Dashboard;