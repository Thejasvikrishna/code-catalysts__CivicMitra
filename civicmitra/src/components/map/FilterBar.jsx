import React from "react";

const FilterBar = ({ filters, onChange }) => {
  return (
    <div style={styles.container}>
      <select
        value={filters.category}
        onChange={(e) =>
          onChange({ ...filters, category: e.target.value })
        }
      >
        <option>All</option>
        <option>Roads</option>
        <option>Water</option>
        <option>Electricity</option>
        <option>Sanitation</option>
        <option>Parks</option>
        <option>Other</option>
      </select>

      <select
        value={filters.status}
        onChange={(e) =>
          onChange({ ...filters, status: e.target.value })
        }
      >
        <option>All</option>
        <option value="open">open</option>
        <option value="in_progress">in_progress</option>
        <option value="resolved">resolved</option>
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
    padding: "10px",
    borderRadius: "8px",
  },
};

export default FilterBar;