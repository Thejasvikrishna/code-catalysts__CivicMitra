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

// MOCK DATA
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

// HEATMAP
const HeatmapLayer = ({ points }) => {
  const map = useMap();

  React.useEffect(() => {
    const heat = L.heatLayer(points).addTo(map);
    return () => map.removeLayer(heat);
  }, [map, points]);

  return null;
};

// LOCATE BUTTON
const LocateButton = () => {
  const map = useMap();

  const handleLocate = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      map.flyTo([pos.coords.latitude, pos.coords.longitude], 15);
    });
  };

  return (
    <button style={styles.locate} onClick={handleLocate}>
      📍
    </button>
  );
};

const IssueMap = ({ issues }) => {
  // 👉 replace mockIssues with real issues later
  const data = issues && issues.length ? issues : mockIssues;

  const [filters, setFilters] = useState({
    category: "All",
    status: "All",
  });

  const [showHeat, setShowHeat] = useState(true);

  const filtered = useMemo(() => {
    return data.filter(
      (i) =>
        (filters.category === "All" || i.category === filters.category) &&
        (filters.status === "All" || i.status === filters.status)
    );
  }, [data, filters]);

  const heatPoints = filtered
    .filter((i) => i.status !== "resolved")
    .map((i) => [i.lat, i.lng]);

  return (
    <div style={{ height: "100vh" }}>
      <FilterBar filters={filters} onChange={setFilters} />

      <MapContainer center={[12.9716, 77.5946]} zoom={13} style={{ height: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {filtered.map((issue) => (
          <Marker
            key={issue.id}
            position={[issue.lat, issue.lng]}
            icon={createMarkerIcon(issue.category)}
          >
            <Popup>
              <h4>{issue.title}</h4>
              <p>{issue.category}</p>
              <p>{STATUS_LABELS[issue.status]}</p>
              <p>👍 {issue.upvotes}</p>
            </Popup>
          </Marker>
        ))}

        {showHeat && <HeatmapLayer points={heatPoints} />}
        <LocateButton />
      </MapContainer>

      <button style={styles.heat} onClick={() => setShowHeat(!showHeat)}>
        🔥
      </button>
    </div>
  );
};

const styles = {
  locate: {
    position: "absolute",
    bottom: "20px",
    right: "10px",
    zIndex: 1000,
  },
  heat: {
    position: "absolute",
    top: "10px",
    right: "10px",
    zIndex: 1000,
  },
};

export default IssueMap;