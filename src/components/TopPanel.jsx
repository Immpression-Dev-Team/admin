import React from "react";

function TopPanel({ totalImages, totalPending, totalApproved, onFilterPending, onFilterApproved }) {
  return (
    <div style={styles.panel}>
      <div style={styles.statsContainer}>
        <p><strong>Total Pictures:</strong> {totalImages}</p>
        <p>
          <strong>Pending Review:</strong> 
          <span style={styles.clickable} onClick={onFilterPending}> {totalPending}</span>
        </p>
        <p>
          <strong>Approved:</strong> 
          <span style={styles.clickable} onClick={onFilterApproved}> {totalApproved}</span>
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
      width: "100%", // ✅ Ensures full width
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      boxSizing: "border-box",
      minHeight: "60px",
      marginTop: "60px",
    },
    statsContainer: {
      display: "flex", // ✅ Ensures side-by-side layout
      gap: "30px", // ✅ Adds spacing between options
      flexWrap: "nowrap", // ✅ Prevents wrapping (if there's space)
      justifyContent: "center",
      alignItems: "center",
      width: "100%", // ✅ Ensures the section spans across the panel
    },
    clickable: {
      color: "blue",
      cursor: "pointer",
      textDecoration: "underline",
      marginLeft: "5px", // ✅ Small spacing for better readability
    },
};

  
  

export default TopPanel;
