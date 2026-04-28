import React from "react";

const categories = [
  "All",
  "Roads",
  "Water",
  "Electricity",
  "Sanitation",
  "Parks",
  "Other",
];

const statuses = ["All", "open", "in_progress", "resolved"];

const FilterBar = ({ filters, onChange }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div style={styles.container}>
      <select
        value={filters.category}
        onChange={(e) => handleChange("category", e.target.value)}
        style={styles.select}
      >
        {categories.map((cat) => (
          <option key={cat}>{cat}</option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(e) => handleChange("status", e.target.value)}
        style={styles.select}
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
};

const styles = {
  container: {
    position: "absolute",
    top: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1000,
    display: "flex",
    gap: "10px",
    background: "white",
    padding: "8px 12px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  },
  select: {
    padding: "6px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
};

export default FilterBar;