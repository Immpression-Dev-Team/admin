import React, { useState } from "react";
import "@styles/toppanel.css";

export default function OrdersTopPanel({ 
  totalOrders = 0,
  completedOrders = 0,
  pendingOrders = 0,
  cancelledOrders = 0,
  onShowAllOrders,  
  onFilterCompleted, 
  onFilterPending,
  onFilterCancelled,
  onSearch,
  pageSize,
  handlePageSizeChange
}) {
  const [activeFilter, setActiveFilter] = useState('all');

  const handleFilterClick = (filterType, callback) => {
    setActiveFilter(filterType);
    callback();
  };

  // Render stats overview cards similar to ReviewArt
  const renderStatsOverview = () => {
    const statCards = [
      {
        title: "Total Orders",
        value: totalOrders,
        filter: 'all',
        color: '#3498db',
        icon: '📦',
        onClick: () => handleFilterClick('all', onShowAllOrders)
      },
      {
        title: "Completed",
        value: completedOrders,
        filter: 'completed',
        color: '#27ae60',
        icon: '✅',
        onClick: () => handleFilterClick('completed', onFilterCompleted)
      },
      {
        title: "Pending",
        value: pendingOrders,
        filter: 'pending',
        color: '#f39c12',
        icon: '⏳',
        onClick: () => handleFilterClick('pending', onFilterPending)
      },
      {
        title: "Cancelled",
        value: cancelledOrders,
        filter: 'cancelled',
        color: '#e74c3c',
        icon: '❌',
        onClick: () => handleFilterClick('cancelled', onFilterCancelled)
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
                {stat.value.toLocaleString()}
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
        <h1>Orders Management Dashboard</h1>
        <p>Monitor and manage customer orders</p>
      </div>
      
      <div className="panel">
        <div className="stats-container">
          {renderStatsOverview()}
        </div>
        
        <div className="search-view-container">
          <input
            type="text"
            className="searchInput"
            placeholder="Search by order ID or customer..."
            onChange={(e) => onSearch(e.target.value)}
          />

          <div className="selectPageSize">
            <label>Orders per page: </label>
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