import React, { useEffect, useState } from "react";

function TopPanel({ totalImages, totalPending, onFilterPending }) {
  return (
    <div style={styles.panel}>
      <h2>Admin Dashboard</h2>
      <div style={styles.statsContainer}>
        <p><strong>Total Pictures:</strong> {totalImages}</p>
        <p>
          <strong>Pending Review:</strong> 
          <span style={styles.clickable} onClick={onFilterPending}> {totalPending}</span> {/* ✅ Clickable */}
        </p>
      </div>
    </div>
  );
}

const styles = {
  panel: {
    backgroundColor: "#f8f8f8",
    padding: "12px 20px",
    borderBottom: "2px solid #ddd",
    fontSize: "16px",
    fontWeight: "bold",
  },
  statsContainer: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  clickable: {
    color: "blue",
    cursor: "pointer",
    textDecoration: "underline",
  },
};

export default TopPanel;
