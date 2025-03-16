import StatsList from "./StatsList";
import "@styles/toppanel.css"; // ✅ Import the CSS file

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
      </div>
    </div>
  );
}

export default TopPanel;
