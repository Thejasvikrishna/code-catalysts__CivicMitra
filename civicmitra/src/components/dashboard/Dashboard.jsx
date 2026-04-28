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

function Dashboard({ issues = [], onUpvote }) {
  const [darkMode, setDarkMode] = useState(false);

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
    {
      id: "3",
      title: "Streetlight not working",
      category: "Electricity",
      status: "resolved",
      upvotes: 3,
      createdAt: Date.now(),
      timeline: [],
    },
  ];

  const baseData = issues.length ? issues : mockIssues;

  const [liveIssues, setLiveIssues] = useState(baseData);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveIssues((prev) => [
        {
          id: Date.now().toString(),
          title: "New issue reported (Live)",
          category: "Roads",
          status: "open",
          upvotes: Math.floor(Math.random() * 5),
          createdAt: Date.now(),
          timeline: [],
        },
        ...prev,
      ]);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const data = liveIssues;

  const total = data.length;
  const open = data.filter((i) => i.status === "open").length;
  const resolved = data.filter((i) => i.status === "resolved").length;

  const topIssues = [...data]
    .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
    .slice(0, 3);

  const showTop = topIssues.some((i) => i.upvotes > 0);

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
          "#e74c3c",
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
      <button className="dark-btn" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "☀ Light" : "🌙 Dark"}
      </button>

      <h1>Dashboard</h1>

      <div className="kpi-container">
        <div className="kpi-card">Total: {total}</div>
        <div className="kpi-card">Open: {open}</div>
        <div className="kpi-card">Resolved: {resolved}</div>
      </div>

      <div className="chart-row">
        <div className="chart-small">
          <Doughnut data={doughnutData} />
        </div>
        <div className="chart-small">
          <Bar data={barData} />
        </div>
      </div>

      {showTop && (
        <>
          <h2>🔥 Most Upvoted</h2>
          <div className="issue-list">
            {topIssues.map((issue, index) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onUpvote={onUpvote}
                rank={index}
              />
            ))}
          </div>
        </>
      )}

      <h2>All Issues</h2>
      <div className="issue-list">
        {data.map((issue) => (
          <IssueCard key={issue.id} issue={issue} onUpvote={onUpvote} />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;