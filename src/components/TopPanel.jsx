import "@styles/toppanel.css";

function TopPanel({ 
  onShowAllArt,
  onFilterPending, 
  onFilterApproved, 
  onFilterRejected, 
  onSearch, 
  viewMode, 
  toggleViewMode,
  pageSize,
  handlePageSizeChange,
  activeFilter = 'all',
  stats = { total: 0, pending: 0, approved: 0, rejected: 0 },
  statsLoading = false,
}) {
  

  // Render stats overview cards
  const renderStatsOverview = () => {
    const statCards = [
      {
        title: "Total Submitted",
        value: stats.total,
        filter: 'all',
        color: '#3498db',
        icon: '📊',
        onClick: onShowAllArt
      },
      {
        title: "Pending Review",
        value: stats.pending,
        filter: 'pending',
        color: '#f39c12',
        icon: '⏳',
        onClick: onFilterPending
      },
      {
        title: "Approved",
        value: stats.approved,
        filter: 'approved',
        color: '#27ae60',
        icon: '✅',
        onClick: onFilterApproved
      },
      {
        title: "Rejected",
        value: stats.rejected,
        filter: 'rejected',
        color: '#e74c3c',
        icon: '❌',
        onClick: onFilterRejected
      }
    ];

    return (
      <>
        {statCards.map((stat) => (
          <div 
            key={stat.filter}
            className={`stat-item ${activeFilter === stat.filter ? 'active' : ''}`}
            onClick={stat.onClick}
            style={{ borderLeftColor: stat.color }}
          >
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <div className="stat-value">
                {statsLoading ? '...' : stat.value.toLocaleString()}
              </div>
              <div className="stat-title">{stat.title}</div>
            </div>
          </div>
        ))}
      </>
    );
  };

  return (
    <div className="top-panel-container">
      <div className="admin-header">
        <h1>Artwork Review Dashboard</h1>
        <p>Manage and review submitted artworks</p>
      </div>
      
      <div className="panel">
        <div className="stats-container">
          {renderStatsOverview()}
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
    </div>
  );
}

export default TopPanel;
