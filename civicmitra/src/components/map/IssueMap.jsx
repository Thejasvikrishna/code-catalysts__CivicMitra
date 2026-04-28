import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import FilterBar from "./FilterBar";
import {
  createMarkerIcon,
  CATEGORY_COLORS,
  STATUS_LABELS,
} from "./markerIcons";

// ===== SAFE HEATMAP LAYER =====
// leaflet.heat modifies L globally — we import it carefully
let heatLayerAvailable = false;
try {
  // leaflet.heat is a side-effect import that adds L.heatLayer
  await import("leaflet.heat");
  heatLayerAvailable = typeof L.heatLayer === "function";
} catch {
  heatLayerAvailable = false;
}

function HeatmapLayer({ points }) {
  const map = useMap();
  const heatRef = useRef(null);

  useEffect(() => {
    if (!map || !points.length || !heatLayerAvailable) return;

    const heat = L.heatLayer(points, { radius: 25, blur: 15 }).addTo(map);
    heatRef.current = heat;

    return () => {
      if (heatRef.current) {
        map.removeLayer(heatRef.current);
        heatRef.current = null;
      }
    };
  }, [map, points]);

  return null;
}

// ===== LOCATE BUTTON =====
function LocateButton() {
  const map = useMap();

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => map.flyTo([pos.coords.latitude, pos.coords.longitude], 15),
      () => {} // silently fail
    );
  };

  return (
    <button
      onClick={handleLocate}
      aria-label="Locate me on map"
      style={{
        position: "absolute",
        bottom: 20,
        right: 10,
        zIndex: 1000,
        padding: "10px 14px",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        background: "white",
        cursor: "pointer",
        fontSize: "0.88rem",
        fontWeight: 600,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        minHeight: 44,
      }}
    >
      📍 Locate Me
    </button>
  );
}

// ===== ERROR BOUNDARY =====
class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.error("Map error:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", height: "100%", color: "#6b7280",
        }}>
          <p style={{ fontSize: "2rem" }}>🗺️</p>
          <p style={{ fontWeight: 600 }}>Map failed to load</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              marginTop: 8, padding: "8px 16px", borderRadius: 8,
              border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ===== MAIN COMPONENT =====
export default function IssueMap({ issues = [] }) {
  const [filters, setFilters] = useState({ category: "All", status: "All" });
  const [showHeat, setShowHeat] = useState(false);

  // Filter out issues with invalid coordinates first, then apply user filters
  const filtered = useMemo(() => {
    return issues
      .filter((i) => typeof i.lat === "number" && typeof i.lng === "number" && !isNaN(i.lat) && !isNaN(i.lng))
      .filter(
        (i) =>
          (filters.category === "All" || i.category === filters.category) &&
          (filters.status === "All" || i.status === filters.status)
      );
  }, [issues, filters]);

  const openCount = filtered.filter((i) => i.status === "open").length;
  const inProgCount = filtered.filter((i) => i.status === "in_progress").length;
  const resolvedCount = filtered.filter((i) => i.status === "resolved").length;

  const summaryText =
    filters.category === "All"
      ? `${openCount} open · ${inProgCount} in progress · ${resolvedCount} resolved`
      : `${openCount} open ${filters.category} issues`;

  const heatPoints = useMemo(() => {
    return filtered
      .filter((i) => i.status !== "resolved")
      .map((i) => [i.lat, i.lng, 1]);
  }, [filtered]);

  return (
    <div
      style={{
        position: "relative",
        height: "calc(100vh - 130px)",
        width: "100%",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 2px 16px rgba(0,0,0,0.1)",
        border: "1px solid #e5e7eb",
      }}
    >
      <FilterBar filters={filters} onChange={setFilters} />

      <div
        style={{
          position: "absolute",
          top: 60,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          background: "rgba(0,0,0,0.75)",
          color: "white",
          padding: "6px 16px",
          borderRadius: 20,
          fontSize: 13,
          fontWeight: 500,
          whiteSpace: "nowrap",
        }}
      >
        {summaryText}
      </div>

      {issues.length === 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 800,
            textAlign: "center",
            background: "rgba(255,255,255,0.92)",
            padding: "1.5rem 2rem",
            borderRadius: 14,
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          }}
        >
          <p style={{ fontSize: "2rem", margin: 0 }}>📍</p>
          <p style={{ fontSize: "0.95rem", color: "#374151", fontWeight: 600, margin: "0.5rem 0 0.25rem" }}>
            No issues reported yet
          </p>
          <p style={{ fontSize: "0.82rem", color: "#6b7280", margin: 0 }}>
            Submit a report to see it on the map
          </p>
        </div>
      )}

      <MapErrorBoundary>
        <MapContainer
          center={[12.9716, 77.5946]}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%", zIndex: 1 }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          />

          {filtered.map((issue) => (
            <Marker
              key={issue.id}
              position={[issue.lat, issue.lng]}
              icon={createMarkerIcon(issue.category)}
            >
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <h4 style={{ margin: "0 0 6px", fontSize: "0.95rem" }}>
                    {issue.title}
                  </h4>
                  <span
                    style={{
                      background: CATEGORY_COLORS[issue.category] || "#8e44ad",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: 6,
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      marginRight: 5,
                    }}
                  >
                    {issue.category}
                  </span>
                  <span
                    style={{
                      background:
                        issue.status === "resolved" ? "#27ae60"
                        : issue.status === "in_progress" ? "#2980b9"
                        : "#e67e22",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: 6,
                      fontSize: "0.72rem",
                      fontWeight: 600,
                    }}
                  >
                    {STATUS_LABELS[issue.status]}
                  </span>
                  <p style={{ margin: "6px 0 0", fontSize: "0.82rem", color: "#555" }}>
                    👍 {issue.upvotes || 0} upvotes
                  </p>
                  {issue.imageUrl && (
                    <img
                      src={issue.imageUrl}
                      alt={`Photo of ${issue.title}`}
                      style={{
                        width: "100%",
                        borderRadius: 6,
                        marginTop: 6,
                        maxHeight: 120,
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {showHeat && heatLayerAvailable && heatPoints.length > 0 && (
            <HeatmapLayer points={heatPoints} />
          )}

          <LocateButton />
        </MapContainer>
      </MapErrorBoundary>

      {heatLayerAvailable && (
        <button
          onClick={() => setShowHeat(!showHeat)}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 1000,
            padding: "8px 14px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: showHeat ? "#01696f" : "white",
            color: showHeat ? "white" : "#374151",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: 600,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            minHeight: 40,
          }}
        >
          🔥 {showHeat ? "Hide" : "Show"} Heatmap
        </button>
      )}
    </div>
  );
}