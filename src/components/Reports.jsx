import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ScreenTemplate from "./Template/ScreenTemplate";
import { Pagination } from "./Pagination";
import { useAuth } from "@/context/authContext";
import { useDebounce } from "@/hooks/useDebounce";
import { getAllReports, getReportsStats } from "../api/API";

import "@styles/reports.css";

// Helper to format time remaining for SLA
const formatTimeRemaining = (deadline) => {
  if (!deadline) return "—";
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate - now;

  if (diff <= 0) return "OVERDUE";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

// Helper for status badge colors
const getStatusBadge = (status) => {
  const styles = {
    pending: { bg: "#fff7ed", color: "#9a3412", border: "#fed7aa" },
    under_review: { bg: "#eff6ff", color: "#1e40af", border: "#bfdbfe" },
    resolved: { bg: "#ecfdf5", color: "#065f46", border: "#a7f3d0" },
    dismissed: { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" },
  };
  return styles[status] || styles.pending;
};

// Helper for priority badge colors
const getPriorityBadge = (priority) => {
  const styles = {
    low: { bg: "#f1f5f9", color: "#475569" },
    normal: { bg: "#eff6ff", color: "#1e40af" },
    high: { bg: "#fef3c7", color: "#92400e" },
    urgent: { bg: "#fef2f2", color: "#991b1b" },
  };
  return styles[priority] || styles.normal;
};

function Reports() {
  const DEFAULT_PAGE = 1;
  const DEFAULT_PAGE_SIZE = 20;
  const DELAY_TIME = 500;

  const navigate = useNavigate();
  const { authState } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(DEFAULT_PAGE);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce({ value: query, delay: DELAY_TIME });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    resolved: 0,
    dismissed: 0,
    urgent: 0,
    overdue: 0,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, statusFilter, typeFilter]);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!authState?.token) return;
      const response = await getReportsStats(authState.token);
      if (response.success && response.data) {
        // Map backend structure to frontend expected structure
        const data = response.data;
        setStats({
          total: (data.byStatus?.pending || 0) + (data.byStatus?.underReview || 0) +
                 (data.byStatus?.resolved || 0) + (data.byStatus?.dismissed || 0),
          pending: data.byStatus?.pending || 0,
          underReview: data.byStatus?.underReview || 0,
          resolved: data.byStatus?.resolved || 0,
          dismissed: data.byStatus?.dismissed || 0,
          urgent: data.needsAttention || 0,
          overdue: data.sla?.breached || 0,
        });
      }
    };
    fetchStats();
  }, [authState?.token]);

  // Fetch reports
  useEffect(() => {
    const fetchData = async () => {
      if (!authState?.token) {
        navigate("/login");
        return;
      }

      setLoading(true);
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (typeFilter) filters.type = typeFilter;

      const response = await getAllReports(authState.token, page, pageSize, filters);
      // Backend returns { success, data: { reports, pagination } }
      const reportData = Array.isArray(response.data?.reports) ? response.data.reports : [];

      setReports(reportData);
      setTotalPages(response.data?.pagination?.totalPages || 1);
      setLoading(false);
    };

    fetchData();
  }, [authState?.token, page, pageSize, debouncedQuery, statusFilter, typeFilter, navigate]);

  const handlePageChange = (value) => {
    if (value < 1 || value > totalPages) return;
    setPage(value);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  const handleReportClick = (reportId) => {
    navigate(`/report/${reportId}`);
  };

  // Filter reports by search query
  const filteredReports = useMemo(() => {
    // Ensure reports is always an array
    const reportsArray = Array.isArray(reports) ? reports : [];
    if (!debouncedQuery) return reportsArray;
    const lower = debouncedQuery.toLowerCase();
    return reportsArray.filter((r) => {
      const idMatch = r._id?.toLowerCase().includes(lower);
      const reasonMatch = r.reason?.toLowerCase().includes(lower);
      return idMatch || reasonMatch;
    });
  }, [reports, debouncedQuery]);

  return (
    <ScreenTemplate>
      <div className="reports-page">
        {/* Stats Cards */}
        <div className="reports-stats-grid">
          <div
            className={`reports-stat-card ${!statusFilter ? 'active' : ''}`}
            onClick={() => setStatusFilter("")}
          >
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Reports</span>
            </div>
          </div>
          <div
            className={`reports-stat-card urgent ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter("pending")}
          >
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <span className="stat-value">{stats.pending}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          <div
            className={`reports-stat-card ${statusFilter === 'under_review' ? 'active' : ''}`}
            onClick={() => setStatusFilter("under_review")}
          >
            <div className="stat-icon">🔍</div>
            <div className="stat-info">
              <span className="stat-value">{stats.underReview}</span>
              <span className="stat-label">Under Review</span>
            </div>
          </div>
          <div
            className={`reports-stat-card success ${statusFilter === 'resolved' ? 'active' : ''}`}
            onClick={() => setStatusFilter("resolved")}
          >
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <span className="stat-value">{stats.resolved}</span>
              <span className="stat-label">Resolved</span>
            </div>
          </div>
          <div className="reports-stat-card warning">
            <div className="stat-icon">🚨</div>
            <div className="stat-info">
              <span className="stat-value">{stats.overdue}</span>
              <span className="stat-label">Overdue (SLA)</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="reports-filters">
          <div className="filter-group">
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Type:</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              <option value="image">Image Reports</option>
              <option value="user">User Reports</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Search by ID or reason..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Per page:</label>
            <select value={pageSize} onChange={handlePageSizeChange}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Reports Table */}
        <div className="reports-content">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">📭</div>
              <p>No reports found.</p>
            </div>
          ) : (
            <div className="reports-table-container">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>SLA</th>
                    <th>Type</th>
                    <th>Reason</th>
                    <th>Reporter</th>
                    <th>Reported</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => {
                    const statusStyle = getStatusBadge(report.status);
                    // Derive priority from slaAtRisk or reason
                    const priority = report.slaAtRisk ? 'urgent' : 'normal';
                    const priorityStyle = getPriorityBadge(priority);
                    const timeRemaining = formatTimeRemaining(report.slaDeadline);
                    const isOverdue = timeRemaining === "OVERDUE";

                    return (
                      <tr
                        key={report._id || report.id}
                        onClick={() => handleReportClick(report._id || report.id)}
                        className={isOverdue ? 'overdue-row' : ''}
                      >
                        <td>
                          <span className={`sla-badge ${isOverdue ? 'overdue' : ''}`}>
                            {timeRemaining}
                          </span>
                        </td>
                        <td>
                          <span className="type-badge">
                            {report.targetType === 'image' ? '🖼️ Image' : '👤 User'}
                          </span>
                        </td>
                        <td className="reason-cell">
                          {report.reason?.replace(/_/g, ' ')}
                        </td>
                        <td>{report.reporterUserId?.name || 'Unknown'}</td>
                        <td>
                          {report.targetType === 'image'
                            ? (report.targetImageId?.name || report.contentSnapshot?.imageName || 'Deleted Image')
                            : (report.targetUserId?.name || report.contentSnapshot?.userName || 'Unknown User')
                          }
                        </td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              background: statusStyle.bg,
                              color: statusStyle.color,
                              border: `1px solid ${statusStyle.border}`,
                            }}
                          >
                            {report.status?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>
                          <span
                            className="priority-badge"
                            style={{
                              background: priorityStyle.bg,
                              color: priorityStyle.color,
                            }}
                          >
                            {priority}
                          </span>
                        </td>
                        <td className="date-cell">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {filteredReports.length > 0 && (
            <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
          )}
        </div>
      </div>
    </ScreenTemplate>
  );
}

export default Reports;
