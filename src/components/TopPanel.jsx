import React from "react";
import "../styles/toppanel.css"; // ✅ Import the CSS file

function TopPanel({ totalImages, totalPending, totalApproved, onFilterPending, onFilterApproved }) {
  return (
    <div className="panel">
      <div className="statsContainer">
        <p>Total Pictures: {totalImages}</p>
        <p>
          Pending Review: 
          <span className="clickable" onClick={onFilterPending}> {totalPending}</span>
        </p>
        <p>
          Approved: 
          <span className="clickable" onClick={onFilterApproved}> {totalApproved}</span>
        </p>
      </div>
    </div>
  );
}

export default TopPanel;