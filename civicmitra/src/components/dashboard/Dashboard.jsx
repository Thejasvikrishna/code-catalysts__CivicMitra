// Dashboard.jsx — Member 3 | KPI cards, charts, issue feed
// Props: issues (Array from useIssues), onUpvote (function from App.jsx)

import React, { useMemo } from "react";
import IssueCard from "./IssueCard";
import "./dashboard.css";

import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// ── Category config (matches spec colors) ────────────────────────────────
const CATEGORIES = ["Roads", "Water", "Electricity", "Sanitation", "Parks", "Other"];
const CAT_COLORS = {
  Roads:       "#e67e22",
  Water:       "#2980b9",
  Electricity: "#f1c40f",
  Sanitation:  "#27ae60",
  Parks:       "#16a085",
  Other:       "#8e44ad",
};

// ── Chart options ─────────────────────────────────────────────────────────
const DOUGHNUT_OPTS = {
  maintainAspectRatio: true,
  plugins: { legend: { position: "bottom", labels: { font: { size: 11 }, padding: 10 } } },
};
const BAR_OPTS = {
  maintainAspectRatio: true,
  plugins: { legend: { position: "bottom", labels: { font: { size: 11 } } } },
  scales: { x: { ticks: { font: { size: 10 } } }, y: { beginAtZero: true, ticks: { stepSize: 1 } } },
};

export default function Dashboard({ issues = [], onUpvote }) {
  // Only use issues with a valid known category
  const data = useMemo(
    () => issues.filter((i) => i && i.category && CATEGORIES.includes(i.category)),
    [issues]
  );

  // ── KPIs ────────────────────────────────────────────────────────────────
  const total    = issues.length; // show total even if category is unknown
  const open     = data.filter((i) => i.status === "open").length;
  const inProg   = data.filter((i) => i.status === "in_progress").length;
  const resolved = data.filter((i) => i.status === "resolved").length;

  // ── Chart data ───────────────────────────────────────────────────────────
  const catCounts = useMemo(() => {
    const counts = {};
    CATEGORIES.forEach((c) => { counts[c] = 0; });
    data.forEach((i) => { counts[i.category] = (counts[i.category] || 0) + 1; });
    // Only keep categories with at least 1 issue
    return Object.fromEntries(Object.entries(counts).filter(([, v]) => v > 0));
  }, [data]);

  const labels = Object.keys(catCounts);

  const doughnutData = {
    labels,
    datasets: [{
      data: labels.map((c) => catCounts[c]),
      backgroundColor: labels.map((c) => CAT_COLORS[c] || "#8e44ad"),
      borderWidth: 2,
      borderColor: "#fff",
    }],
  };

  const barData = {
    labels,
    datasets: [
      {
        label: "Open",
        data: labels.map((c) => data.filter((i) => i.category === c && i.status === "open").length),
        backgroundColor: "#e67e22",
        borderRadius: 4,
      },
      {
        label: "In Progress",
        data: labels.map((c) => data.filter((i) => i.category === c && i.status === "in_progress").length),
        backgroundColor: "#2980b9",
        borderRadius: 4,
      },
      {
        label: "Resolved",
        data: labels.map((c) => data.filter((i) => i.category === c && i.status === "resolved").length),
        backgroundColor: "#27ae60",
        borderRadius: 4,
      },
    ],
  };

  // ── Most Upvoted ─────────────────────────────────────────────────────────
  const topIssues = useMemo(
    () => [...issues].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)).slice(0, 3),
    [issues]
  );
  const showTop = topIssues.some((i) => (i.upvotes || 0) > 0);

  // ── Latest Issues (newest first, already sorted by useIssues) ───────────
  const latestIssues = useMemo(() => issues.slice(0, 20), [issues]);

  // ── Empty State ──────────────────────────────────────────────────────────
  if (issues.length === 0) {
    return (
      <div className="dashboard">
        <div className="dash-header">
          <h1 className="dash-title">📊 Dashboard</h1>
        </div>
        <div className="dash-empty">
          <span className="empty-icon">📋</span>
          <p className="empty-title">No issues yet</p>
          <p className="empty-sub">Reports submitted by citizens will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dash-header">
        <h1 className="dash-title">📊 Dashboard</h1>
        <p className="dash-sub">Real-time civic issue analytics</p>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────────── */}
      <div className="kpi-container">
        <div className="kpi-card kpi-total">
          <span className="kpi-icon">📋</span>
          <span className="kpi-number">{total}</span>
          <span className="kpi-label">Total Issues</span>
        </div>
        <div className="kpi-card kpi-open">
          <span className="kpi-icon">🟠</span>
          <span className="kpi-number">{open}</span>
          <span className="kpi-label">Open</span>
        </div>
        <div className="kpi-card kpi-prog">
          <span className="kpi-icon">🔵</span>
          <span className="kpi-number">{inProg}</span>
          <span className="kpi-label">In Progress</span>
        </div>
        <div className="kpi-card kpi-resolved">
          <span className="kpi-icon">✅</span>
          <span className="kpi-number">{resolved}</span>
          <span className="kpi-label">Resolved</span>
        </div>
      </div>

      {/* ── Charts (only if we have categorised data) ────────────────────── */}
      {labels.length > 0 && (
        <div className="chart-row">
          <div className="chart-card">
            <h3 className="chart-title">Issues by Category</h3>
            <div className="chart-inner">
              <Doughnut data={doughnutData} options={DOUGHNUT_OPTS} />
            </div>
          </div>
          <div className="chart-card">
            <h3 className="chart-title">Status by Category</h3>
            <div className="chart-inner">
              <Bar data={barData} options={BAR_OPTS} />
            </div>
          </div>
        </div>
      )}

      {/* ── Most Upvoted ────────────────────────────────────────────────── */}
      {showTop && (
        <section>
          <h2 className="section-title">🔥 Most Upvoted</h2>
          <div className="issue-list">
            {topIssues.map((issue, idx) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onUpvote={onUpvote}
                rank={idx + 1}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Latest Issues ───────────────────────────────────────────────── */}
      <section>
        <h2 className="section-title">🕐 Latest Issues</h2>
        {latestIssues.length === 0 ? (
          <p className="no-issues-text">No issues to show.</p>
        ) : (
          <div className="issue-list">
            {latestIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onUpvote={onUpvote}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}