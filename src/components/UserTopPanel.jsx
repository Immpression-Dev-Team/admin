import React from "react";
import "@styles/toppanel.css"; // ✅ Import the CSS file
import StatsList from "./StatsList";

export default function UserTopPanel({ 
  totalUsers, 
  totalVerified, 
  totalUnverified, 
  onShowAllUsers,  
  onFilterVerified, 
  onFilterUnverified, 
  onSearch
}) {
  // render 3 types of stats for user
  const stats = [
    { label: "Total Users", value: totalUsers, filter: onShowAllUsers },
    { label: "Verified Users", value: totalVerified, filter: onFilterVerified },
    { label: "Unverified Users", value: totalUnverified, filter: onFilterUnverified },
  ];

  return (
    <div className="panel">
      {/* ✅ Now Clickable! Shows all users */}
      <StatsList stats={stats}/>
      
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