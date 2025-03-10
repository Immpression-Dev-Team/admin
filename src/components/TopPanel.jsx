import React from "react";
import "../styles/toppanel.css"; // ✅ Import the CSS file

function TopPanel({ 
  totalImages, 
  totalPending, 
  totalApproved, 
  totalRejected, 
  onFilterPending, 
  onFilterApproved, 
  onFilterRejected, 
  onSearch, 
  viewMode, 
  toggleViewMode
}) {
  return (
    <div className="panel">
      <div className="statsContainer">
        <p>Total Pictures: {totalImages}</p>
        
        {/* ✅ Entire text is now clickable */}
        <p className="clickable" onClick={onFilterPending}>
          Pending Review: {totalPending}
        </p>
        
        <p className="clickable" onClick={onFilterApproved}>
          Approved: {totalApproved}
        </p>

        <p className="clickable" onClick={onFilterRejected}>
          Rejected: {totalRejected}
        </p>
      </div>

      {/* ✅ Right-aligned Search and View Toggle */}
      <div className="search-view-container">
        <input
          type="text"
          className="searchInput"
          placeholder="Search by title or artist..."
          onChange={(e) => onSearch(e.target.value)}
        />
        <button className="viewToggleButton" onClick={toggleViewMode}>
          {viewMode === "grid" ? "📋 List" : "🖼️ Grid"}
        </button>
      </div>
    </div>
  );
}

export default TopPanel;
