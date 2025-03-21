import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { getAllImagesStats } from "../api/API";

import StatsList from "./StatsList";
import "@styles/toppanel.css"; // ✅ Import the CSS file

function TopPanel({ 
  onShowAllArt,  // ✅ New function prop
  onFilterPending, 
  onFilterApproved, 
  onFilterRejected, 
  onSearch, 
  viewMode, 
  toggleViewMode,
  pageSize,
  handlePageSizeChange,
}) {
  // 
  const { authState } = useAuth();
  const navigate = useNavigate();
  
  const [totalImages, setTotalImages] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [totalApproved, setTotalApproved] = useState(0);
  const [totalRejected, setTotalRejected] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      if (!authState || !authState.token) {
        console.error("No token found, redirecting to login.");
        navigate("/login");
        return;
      }

      const response = await getAllImagesStats(authState.token);
      setTotalImages(response.stats.total);
      setTotalPending(response.stats.pending);
      setTotalApproved(response.stats.approved);
      setTotalRejected(response.stats.rejected);
    };

    loadStats();
  }, [authState?.token])

  // render 4 types of stats for arts
  const stats = [
    { label: "Total Pictures", value: totalImages, filter: onShowAllArt },
    { label: "Pending Review", value: totalPending, filter: onFilterPending },
    { label: "Approved", value: totalApproved, filter: onFilterApproved },
    { label: "Rejected", value: totalRejected, filter: onFilterRejected },
  ];

  return (
    <div className="panel">
      {/* ✅ Now Clickable! Shows all arts */}
      <StatsList stats={stats}/>

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

        <div className="selectPageSize">
          <label>Images per page: </label>
          <select 
            value={pageSize}
            onChange={handlePageSizeChange}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default TopPanel;
