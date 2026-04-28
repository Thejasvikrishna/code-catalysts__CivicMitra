import React, { useMemo, useState, useEffect } from "react";
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

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

// Animated Counter Hook
const useCounter = (value) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 500;
    const step = value / (duration / 20);

    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 20);

    return () => clearInterval(timer);
  }, [value]);

  return count;
};

function Dashboard({ issues = [], onUpvote }) {
  const [darkMode, setDarkMode] = useState(false);

  // 🌙 Apply dark mode to FULL PAGE
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  // Mock data (only if no backend yet)
  const mockIssues = [
    {
      id: "1",
      title: "Garbage overflow",
      category: "Sanitation",
      status: "in_progress",
      upvotes: 8,
      createdAt: Date.now(),
      timeline: [],
      imageUrl: "",
    },
    {
      id: "2",
      title: "Pothole near MG Road",
      category: "Roads",
      status: "open",
      upvotes: 5,
      createdAt: Date.now(),
      timeline: [],
      imageUrl: "",
    },
    {
      id: "3",
      title: "Streetlight not working",
      category: "Electricity",
      status: "resolved",
      upvotes: 2,
      createdAt: Date.now(),
      timeline: [],
      imageUrl: "",
    },
  ];

  const data = issues.length ? issues : mockIssues;

  // KPIs
  const total = data.length;
  const open = data.filter((i) => i.status === "open").length;
  const resolved = data.filter((i) => i.status === "resolved").length;

  const totalCount = useCounter(total);
  const openCount = useCounter(open);
  const resolvedCount = useCounter(resolved);

  // Charts
  const categoryCounts = useMemo(() => {
    const counts = {};
    data.forEach((i) => {
      counts[i.category] = (counts[i.category] || 0) + 1;
    });
    return counts;
  }, [data]);

  const doughnutData = {
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        data: Object.values(categoryCounts),
        backgroundColor: [
          "#3498db",
          "#e67e22",
          "#2ecc71",
          "#9b59b6",
          "#f1c40f",
        ],
      },
    ],
  };

  const barData = {
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        label: "Open",
        data: Object.keys(categoryCounts).map(
          (cat) =>
            data.filter((i) => i.category === cat && i.status === "open").length
        ),
        backgroundColor: "#e67e22",
      },
      {
        label: "Resolved",
        data: Object.keys(categoryCounts).map(
          (cat) =>
            data.filter((i) => i.category === cat && i.status === "resolved")
              .length
        ),
        backgroundColor: "#27ae60",
      },
    ],
  };

  // 🔥 Most Upvoted Logic
  const topIssues = [...data]
    .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
    .slice(0, 3);

  const showTop = topIssues.some((i) => i.upvotes > 0);

  return (
    <div className="dashboard">
      <button className="dark-btn" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
      </button>

      <h1>Dashboard</h1>

      {/* KPI */}
      <div className="kpi-container">
        <div className="kpi-card">Total: {totalCount}</div>
        <div className="kpi-card">Open: {openCount}</div>
        <div className="kpi-card">Resolved: {resolvedCount}</div>
      </div>

      {/* Charts */}
      <div className="chart-row">
        <div className="chart-small">
          <Doughnut data={doughnutData} />
        </div>
        <div className="chart-small">
          <Bar data={barData} />
        </div>
      </div>

      {/* 🔥 Most Upvoted */}
      {showTop && (
        <>
          <h2>🔥 Most Upvoted Issues</h2>
          <div className="issue-list">
            {topIssues.map((issue, index) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onUpvote={onUpvote}
                highlight
                rank={index + 1}
              />
            ))}
          </div>
        </>
      )}

      {/* All Issues */}
      <h2>All Issues</h2>
      <div className="issue-list">
        {data.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            onUpvote={onUpvote}
          />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;