import React from "react";
import "../styles/toppanel.css"; // ✅ Import the CSS file

function TopPanel({ 
  totalImages, 
  totalPending, 
  totalApproved, 
  totalRejected, 
  onShowAllArt,  // ✅ New function prop
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
        {/* ✅ Now Clickable! Shows all art */}
        <p className="clickable" onClick={onShowAllArt}>
          Total Pictures: {totalImages}
        </p>
        
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
