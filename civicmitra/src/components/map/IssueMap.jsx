import React, { useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";

import FilterBar from "./FilterBar";
import {
  createMarkerIcon,
  CATEGORY_COLORS,
  STATUS_LABELS,
} from "./markerIcons";

// ===== MOCK DATA =====
const mockIssues = Array.from({ length: 10 }).map((_, i) => ({
  id: i.toString(),
  title: `Issue ${i + 1}`,
  category: ["Roads", "Water", "Electricity", "Sanitation", "Parks", "Other"][i % 6],
  lat: 12.97 + (Math.random() - 0.5) * 0.02,
  lng: 77.59 + (Math.random() - 0.5) * 0.02,
  upvotes: Math.floor(Math.random() * 100),
  status: ["open", "in_progress", "resolved"][i % 3],
  imageUrl: "",
}));

// ===== HEATMAP =====
const HeatmapLayer = ({ points }) => {
  const map = useMap();

  React.useEffect(() => {
    if (!map || !points.length) return;

    const heat = L.heatLayer(points, {
      radius: 25,
      blur: 15,
    }).addTo(map);

    return () => map.removeLayer(heat);
  }, [map, points]);

  return null;
};

// ===== LOCATE BUTTON =====
const LocateButton = () => {
  const map = useMap();

  const locate = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      map.flyTo([pos.coords.latitude, pos.coords.longitude], 15);
    });
  };

  return (
    <button style={styles.locate} onClick={locate}>
      📍 Locate Me
    </button>
  );
};

// ===== MAIN COMPONENT =====
const IssueMap = ({ issues }) => {
  // 👉 Replace with real data later
  const data = issues && issues.length ? issues : mockIssues;

  const [filters, setFilters] = useState({
    category: "All",
    status: "All",
  });

  const [showHeat, setShowHeat] = useState(true);

  // ===== FILTER =====
  const filtered = useMemo(() => {
    return data.filter(
      (i) =>
        (filters.category === "All" || i.category === filters.category) &&
        (filters.status === "All" || i.status === filters.status)
    );
  }, [data, filters]);

  // ===== EXTRA TASK: ISSUE COUNTS =====
  const openCount = filtered.filter((i) => i.status === "open").length;
  const inProgCount = filtered.filter((i) => i.status === "in_progress").length;
  const resolvedCount = filtered.filter((i) => i.status === "resolved").length;

  const summaryText =
    filters.category === "All"
      ? `${openCount} open · ${inProgCount} in progress · ${resolvedCount} resolved`
      : `${openCount} open ${filters.category} issues`;

  // ===== HEATMAP DATA =====
  const heatPoints = filtered
    .filter((i) => i.status !== "resolved")
    .map((i) => [i.lat, i.lng, 1]);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      
      {/* FILTER BAR */}
      <FilterBar filters={filters} onChange={setFilters} />

      {/* ISSUE COUNT LABEL */}
      <div style={styles.summary}>{summaryText}</div>

      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* MARKERS */}
        {filtered.map((issue) => (
          <Marker
            key={issue.id}
            position={[issue.lat, issue.lng]}
            icon={createMarkerIcon(issue.category)}
          >
            <Popup>
              <div>
                <h4>{issue.title}</h4>

                <span style={{
                  background: CATEGORY_COLORS[issue.category],
                  color: "white",
                  padding: "3px 6px",
                  borderRadius: "4px",
                  marginRight: "5px"
                }}>
                  {issue.category}
                </span>

                <span style={{
                  background: "#555",
                  color: "white",
                  padding: "3px 6px",
                  borderRadius: "4px"
                }}>
                  {STATUS_LABELS[issue.status]}
                </span>

                <p>👍 {issue.upvotes}</p>

                {issue.imageUrl && (
                  <img
                    src={issue.imageUrl}
                    alt=""
                    style={{ width: "100%", borderRadius: "6px" }}
                  />
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* HEATMAP */}
        {showHeat && heatPoints.length > 0 && (
          <HeatmapLayer points={heatPoints} />
        )}

        <LocateButton />
      </MapContainer>

      {/* HEATMAP BUTTON */}
      <button style={styles.heat} onClick={() => setShowHeat(!showHeat)}>
        🔥 Heatmap
      </button>
    </div>
  );
};

// ===== STYLES =====
const styles = {
  locate: {
    position: "absolute",
    bottom: "20px",
    right: "10px",
    zIndex: 1000,
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "white",
    cursor: "pointer",
  },
  heat: {
    position: "absolute",
    top: "10px",
    right: "10px",
    zIndex: 1000,
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "white",
    cursor: "pointer",
  },
  summary: {
    position: "absolute",
    top: "60px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1000,
    background: "rgba(0,0,0,0.75)",
    color: "white",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "500",
    whiteSpace: "nowrap",
  },
};

export default IssueMap;