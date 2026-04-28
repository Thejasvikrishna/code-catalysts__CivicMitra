// smartAssistant.js — Member 4 | Smart Report Assistant Service
// Exported functions consumed by ReportForm (Member 1) via App.jsx props.
// NO React imports — pure JS utility module.

// ─── KEYWORD MAP ────────────────────────────────────────────────────────────
const CATEGORY_KEYWORDS = {
  Roads:       ["pothole", "road", "street", "footpath", "pavement", "traffic", "signal", "divider"],
  Water:       ["water", "pipe", "leak", "drain", "flood", "sewage", "tap", "borewell"],
  Electricity: ["light", "electric", "streetlight", "wire", "power", "current", "transformer"],
  Sanitation:  ["garbage", "waste", "trash", "dump", "smell", "dirty", "clean", "toilet", "sewage"],
  Parks:       ["park", "tree", "garden", "bench", "grass", "playground"],
};

// ─── DESCRIPTION HINTS ──────────────────────────────────────────────────────
const DESCRIPTION_HINTS = {
  Roads:       "Mention: exact location, pothole size, how long it's been there",
  Water:       "Mention: pipe location, leak severity, affected households",
  Electricity: "Mention: pole number if visible, area affected, time since outage",
  Sanitation:  "Mention: waste type, area size, how many days accumulated",
  Parks:       "Mention: park name, specific area, type of damage",
  default:     "Describe the issue clearly with location details",
};

// ─── 1. detectCategory ──────────────────────────────────────────────────────
// Called by Member 1's ReportForm to auto-fill the category dropdown.
// Returns a category string or null if no keywords match.
export function detectCategory(title = "", description = "") {
  const combined = `${title} ${description}`.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matched = keywords.some((kw) => combined.includes(kw));
    if (matched) return category;
  }

  return null; // No match — let the user pick manually
}

// ─── 2. suggestDescription ──────────────────────────────────────────────────
// Called by Member 1's ReportForm when category is known (auto or manual).
// Returns a hint string shown as placeholder/helper text in the description field.
export function suggestDescription(category) {
  return DESCRIPTION_HINTS[category] ?? DESCRIPTION_HINTS.default;
}

// ─── 3. Haversine Helper (internal) ─────────────────────────────────────────
// Returns distance in km between two lat/lng points.
// Formula reference: movable-type.co.uk/scripts/latlong.html
function haversine(lat1, lng1, lat2, lng2) {
  const R    = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── 4. findSimilarIssues ────────────────────────────────────────────────────
// Called via App.jsx closure: (lat, lng, cat) => findSimilarIssues(issues, lat, lng, cat)
// Finds up to 3 open/in-progress issues of the same category within 1km.
// Member 1's ReportForm shows these as a "Similar Issues Nearby" warning.
export function findSimilarIssues(issues, lat, lng, category) {
  if (!issues || !lat || !lng || !category) return [];

  return issues
    .filter((issue) => {
      const sameCategory  = issue.category === category;
      const notResolved   = issue.status !== "resolved";
      const withinRadius  = haversine(lat, lng, issue.lat, issue.lng) < 1; // < 1km
      return sameCategory && notResolved && withinRadius;
    })
    .slice(0, 3); // Max 3 results
}