import React from "react";
import "@styles/toppanel.css"; // ✅ Import the CSS file

function UserTopPanel({ 
  totalUsers, 
  totalVerified, 
  totalUnverified, 
  onShowAllUsers,  
  onFilterVerified, 
  onFilterUnverified, 
  onSearch
}) {
  return (
    <div className="panel">
      <div className="statsContainer">
        {/* ✅ Now Clickable! Shows all users */}
        <p className="clickable" onClick={onShowAllUsers}>
          Total Users: {totalUsers}
        </p>
        
        <p className="clickable" onClick={onFilterVerified}>
          Verified Users: {totalVerified}
        </p>
        
        <p className="clickable" onClick={onFilterUnverified}>
          Unverified Users: {totalUnverified}
        </p>
      </div>

      <div className="search-view-container">
        <input
          type="text"
          className="searchInput"
          placeholder="Search by name or email..."
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
  );
}

export default UserTopPanel;
