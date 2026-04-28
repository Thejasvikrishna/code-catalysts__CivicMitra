import L from "leaflet";

export const CATEGORY_COLORS = {
  Roads: "#e67e22",
  Water: "#2980b9",
  Electricity: "#f1c40f",
  Sanitation: "#27ae60",
  Parks: "#16a085",
  Other: "#8e44ad",
};

export const STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

export const createMarkerIcon = (category = "Other") => {
  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;

  const svg = `
    <svg width="30" height="40" viewBox="0 0 24 36">
      <path fill="${color}" d="M12 0C5 0 0 5 0 12c0 9 12 24 12 24s12-15 12-24C24 5 19 0 12 0z"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [30, 40],
    iconAnchor: [15, 40],
  });
};