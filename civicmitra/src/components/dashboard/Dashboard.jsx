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

// 🔢 Animated Counter Hook
const useCounter = (value) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 500;
    const increment = value / (duration / 20);

    const timer = setInterval(() => {
      start += increment;
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
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // MOCK fallback
  const mockIssues = [
    {
      id: "1",
      title: "Garbage overflow",
      category: "Sanitation",
      status: "in_progress",
      upvotes: 8,
      createdAt: Date.now(),
      timeline: [],
    },
    {
      id: "2",
      title: "Pothole near MG Road",
      category: "Roads",
      status: "open",
      upvotes: 5,
      createdAt: Date.now(),
      timeline: [],
    },
  ];

  const baseData = issues.length ? issues : mockIssues;

  const [liveIssues, setLiveIssues] = useState(baseData);

  // ⏳ Fake loading
  useEffect(() => {
    setTimeout(() => setLoading(false), 1200);
  }, []);

  // 🔴 Live updates + Notification
  useEffect(() => {
    const interval = setInterval(() => {
      const newIssue = {
        id: Date.now().toString(),
        title: "New issue reported (Live)",
        category: "Roads",
        status: "open",
        upvotes: Math.floor(Math.random() * 5),
        createdAt: Date.now(),
        timeline: [],
      };

      setLiveIssues((prev) => [newIssue, ...prev]);
      setNotification("🚨 New issue reported!");

      setTimeout(() => setNotification(null), 3000);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const data = liveIssues;

  // KPIs
  const total = data.length;
  const open = data.filter((i) => i.status === "open").length;
  const resolved = data.filter((i) => i.status === "resolved").length;

  const totalCount = useCounter(total);
  const openCount = useCounter(open);
  const resolvedCount = useCounter(resolved);

  // Top issues
  const topIssues = [...data]
    .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
    .slice(0, 3);

  const showTop = topIssues.some((i) => i.upvotes > 0);

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
        backgroundColor: ["#3498db", "#e67e22", "#2ecc71"],
      },
    ],
  };

  const barData = {
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        label: "Open",
        data: Object.keys(categoryCounts).map(
          (cat) => data.filter((i) => i.category === cat && i.status === "open").length
        ),
        backgroundColor: "#e67e22",
      },
      {
        label: "Resolved",
        data: Object.keys(categoryCounts).map(
          (cat) =>
            data.filter((i) => i.category === cat && i.status === "resolved").length
        ),
        backgroundColor: "#27ae60",
      },
    ],
  };

  return (
    <div className={darkMode ? "dashboard dark" : "dashboard"}>
      
      {/* 🔔 Notification */}
      {notification && <div className="toast">{notification}</div>}

      <button className="dark-btn" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "☀ Light" : "🌙 Dark"}
      </button>

      <h1>Dashboard</h1>

      {/* ⏳ Loading Skeleton */}
      {loading ? (
        <div className="skeleton"></div>
      ) : (
        <>
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

          {/* Top */}
          {showTop && (
            <>
              <h2>🔥 Most Upvoted</h2>
              <div className="issue-list">
                {topIssues.map((issue, index) => (
                  <IssueCard key={issue.id} issue={issue} onUpvote={onUpvote} rank={index} />
                ))}
              </div>
            </>
          )}

          {/* All */}
          <h2>All Issues</h2>
          <div className="issue-list">
            {data.map((issue) => (
              <IssueCard key={issue.id} issue={issue} onUpvote={onUpvote} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;