import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ScreenTemplate from "./Template/ScreenTemplate";
import { useAuth } from "@/context/authContext";
import {
  getReportById,
  updateReportStatus,
  warnReportedUser,
  suspendReportedUser,
  banReportedUser,
  removeReportedContent,
  dismissReport,
} from "../api/API";

// Inline styles (following OrderDetails pattern)
const sx = {
  page: { padding: 24, display: "flex", justifyContent: "center" },
  container: { width: "100%", maxWidth: 1400 },

  header: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
    flexWrap: "wrap",
  },
  headLeft: { display: "flex", alignItems: "center", gap: 12 },
  backBtn: {
    padding: "6px 12px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#0f172a",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  title: { margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" },
  sub: { fontSize: 12.5, color: "#64748b" },

  badge: (tone = "default") => ({
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background:
      tone === "resolved" ? "#ecfdf5" :
      tone === "pending" ? "#fff7ed" :
      tone === "under_review" ? "#eff6ff" :
      tone === "overdue" ? "#fef2f2" : "#f1f5f9",
    color:
      tone === "resolved" ? "#065f46" :
      tone === "pending" ? "#9a3412" :
      tone === "under_review" ? "#1e40af" :
      tone === "overdue" ? "#991b1b" : "#475569",
    border:
      tone === "resolved" ? "1px solid #a7f3d0" :
      tone === "pending" ? "1px solid #fed7aa" :
      tone === "under_review" ? "1px solid #bfdbfe" :
      tone === "overdue" ? "1px solid #fecaca" : "1px solid #e2e8f0",
  }),

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 24,
    alignItems: "start",
  },
  gridNarrow: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 24,
    alignItems: "start",
  },

  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    boxShadow: "0 6px 18px rgba(0,0,0,.04)",
  },
  cardHeader: {
    padding: "10px 14px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleSm: { margin: 0, fontSize: 15, fontWeight: 800, color: "#0f172a" },
  body: { padding: 14 },

  dl: {
    display: "grid",
    gridTemplateColumns: "140px 1fr",
    gap: 6,
    fontSize: 14,
    wordBreak: "break-all",
    overflowWrap: "anywhere",
  },
  dt: { color: "#64748b", fontSize: 13 },
  dd: { color: "#0f172a", fontWeight: 600 },

  artImg: {
    width: "100%",
    maxHeight: 300,
    borderRadius: 12,
    objectFit: "cover",
    marginBottom: 14,
  },

  stack: { display: "flex", flexDirection: "column", gap: 20 },

  actionBtn: (color = "default") => ({
    padding: "10px 16px",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    background:
      color === "warn" ? "#fef3c7" :
      color === "suspend" ? "#ffedd5" :
      color === "ban" ? "#fef2f2" :
      color === "remove" ? "#fee2e2" :
      color === "dismiss" ? "#f1f5f9" :
      color === "review" ? "#eff6ff" : "#f1f5f9",
    color:
      color === "warn" ? "#92400e" :
      color === "suspend" ? "#9a3412" :
      color === "ban" ? "#991b1b" :
      color === "remove" ? "#b91c1c" :
      color === "dismiss" ? "#475569" :
      color === "review" ? "#1e40af" : "#0f172a",
  }),

  actionGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },

  slaBox: (isOverdue) => ({
    padding: 12,
    borderRadius: 10,
    background: isOverdue ? "#fef2f2" : "#ecfdf5",
    border: isOverdue ? "1px solid #fecaca" : "1px solid #a7f3d0",
    textAlign: "center",
  }),
  slaValue: (isOverdue) => ({
    fontSize: 24,
    fontWeight: 800,
    color: isOverdue ? "#991b1b" : "#065f46",
  }),
  slaLabel: { fontSize: 12, color: "#64748b" },

  textarea: {
    width: "100%",
    minHeight: 80,
    padding: 10,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    fontSize: 14,
    resize: "vertical",
    marginBottom: 10,
  },

  input: {
    width: "100%",
    padding: 10,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 10,
  },

  alertSuccess: {
    padding: 12,
    background: "#ecfdf5",
    border: "1px solid #a7f3d0",
    borderRadius: 8,
    color: "#065f46",
    marginBottom: 12,
  },
  alertError: {
    padding: 12,
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 8,
    color: "#991b1b",
    marginBottom: 12,
  },
};

// Helper to format time remaining
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

export default function ReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authState } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isNarrow, setIsNarrow] = useState(() => window.innerWidth < 1100);

  // Action form states
  const [warnMessage, setWarnMessage] = useState("");
  const [suspendDays, setSuspendDays] = useState(7);
  const [suspendMessage, setSuspendMessage] = useState("");
  const [banReason, setBanReason] = useState("");
  const [dismissReason, setDismissReason] = useState("");
  const [showActionForm, setShowActionForm] = useState(null);

  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 1100);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const loadReport = async () => {
    if (!authState?.token) {
      navigate("/login");
      return;
    }
    try {
      const response = await getReportById(id, authState.token);
      // Backend returns { success, data: { report, relatedReports, slaTimeRemaining } }
      setReport(response.data?.report || response.data);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [authState?.token, id]); // eslint-disable-line

  const handleAction = async (action, data = {}) => {
    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      let response;
      switch (action) {
        case "review":
          response = await updateReportStatus(id, "under_review", authState.token);
          break;
        case "warn":
          response = await warnReportedUser(id, warnMessage, authState.token);
          setWarnMessage("");
          break;
        case "suspend":
          response = await suspendReportedUser(id, suspendDays, suspendMessage, authState.token);
          setSuspendMessage("");
          break;
        case "ban":
          response = await banReportedUser(id, banReason, authState.token);
          setBanReason("");
          break;
        case "remove":
          response = await removeReportedContent(id, authState.token);
          break;
        case "dismiss":
          response = await dismissReport(id, dismissReason, authState.token);
          setDismissReason("");
          break;
        default:
          throw new Error("Unknown action");
      }

      setMessage({ type: "success", text: response.message || "Action completed successfully" });
      setShowActionForm(null);
      await loadReport();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenTemplate>
        <div style={{ padding: 24 }}>Loading Report...</div>
      </ScreenTemplate>
    );
  }

  if (!report) {
    return (
      <ScreenTemplate>
        <div style={{ padding: 24 }}>Report not found.</div>
      </ScreenTemplate>
    );
  }

  const timeRemaining = formatTimeRemaining(report.slaDeadline);
  const isOverdue = timeRemaining === "OVERDUE";
  const badgeTone = isOverdue ? "overdue" : report.status;
  const gridStyle = isNarrow ? sx.gridNarrow : sx.grid;

  // Map backend field names to local variables
  const reportedUser = report.targetUserId || {};
  const reporter = report.reporterUserId || {};
  const reportedImage = report.targetImageId || {};
  const reportType = report.targetType || 'image';

  return (
    <ScreenTemplate>
      <div style={sx.page}>
        <div style={sx.container}>
          {/* Header */}
          <div style={sx.header}>
            <div style={sx.headLeft}>
              <button style={sx.backBtn} onClick={() => navigate(-1)}>
                ← Back
              </button>
              <div>
                <h1 style={sx.title}>
                  Report: {report.reason?.replace(/_/g, " ")}
                </h1>
                <div style={sx.sub}>
                  {reportType === "image" ? "Image Report" : "User Report"} •{" "}
                  Submitted {new Date(report.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            <span style={sx.badge(badgeTone)}>
              {report.status?.replace(/_/g, " ").toUpperCase()}
            </span>
          </div>

          {/* Messages */}
          {message.text && (
            <div style={message.type === "success" ? sx.alertSuccess : sx.alertError}>
              {message.text}
            </div>
          )}

          {/* Grid */}
          <div style={gridStyle}>
            {/* LEFT - Content Preview */}
            <div>
              <div style={sx.card}>
                <div style={sx.cardHeader}>
                  <h3 style={sx.titleSm}>Reported Content</h3>
                </div>
                <div style={sx.body}>
                  {reportType === "image" && (report.contentSnapshot?.imageLink || reportedImage?.imageLink) && (
                    <img
                      src={report.contentSnapshot?.imageLink || reportedImage?.imageLink}
                      alt="Reported content"
                      style={sx.artImg}
                    />
                  )}
                  <dl style={sx.dl}>
                    {reportType === "image" ? (
                      <>
                        <dt style={sx.dt}>Title</dt>
                        <dd style={sx.dd}>{reportedImage?.name || report.contentSnapshot?.imageName || "—"}</dd>
                        <dt style={sx.dt}>Description</dt>
                        <dd style={sx.dd}>{reportedImage?.description || report.contentSnapshot?.imageDescription || "—"}</dd>
                        <dt style={sx.dt}>Artist</dt>
                        <dd style={sx.dd}>{reportedUser?.name || report.contentSnapshot?.userName || "Unknown"}</dd>
                        <dt style={sx.dt}>Image ID</dt>
                        <dd style={sx.dd}>{reportedImage?._id || "Deleted"}</dd>
                      </>
                    ) : (
                      <>
                        <dt style={sx.dt}>User Name</dt>
                        <dd style={sx.dd}>{reportedUser.name || "Unknown"}</dd>
                        <dt style={sx.dt}>Email</dt>
                        <dd style={sx.dd}>{reportedUser.email || "—"}</dd>
                        <dt style={sx.dt}>User ID</dt>
                        <dd style={sx.dd}>{reportedUser._id || "—"}</dd>
                        <dt style={sx.dt}>Status</dt>
                        <dd style={sx.dd}>{reportedUser.moderationStatus || "active"}</dd>
                      </>
                    )}
                  </dl>
                </div>
              </div>

              {/* SLA Box */}
              <div style={{ ...sx.card, marginTop: 20 }}>
                <div style={sx.cardHeader}>
                  <h3 style={sx.titleSm}>SLA Deadline</h3>
                </div>
                <div style={sx.body}>
                  <div style={sx.slaBox(isOverdue)}>
                    <div style={sx.slaValue(isOverdue)}>{timeRemaining}</div>
                    <div style={sx.slaLabel}>
                      {isOverdue ? "Action Required Immediately" : "Time Remaining"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MIDDLE - Report Details */}
            <div style={sx.stack}>
              <div style={sx.card}>
                <div style={sx.cardHeader}>
                  <h3 style={sx.titleSm}>Report Details</h3>
                </div>
                <div style={sx.body}>
                  <dl style={sx.dl}>
                    <dt style={sx.dt}>Report ID</dt>
                    <dd style={sx.dd}>{report._id}</dd>
                    <dt style={sx.dt}>Type</dt>
                    <dd style={sx.dd}>{reportType}</dd>
                    <dt style={sx.dt}>Reason</dt>
                    <dd style={sx.dd}>{report.reason?.replace(/_/g, " ")}</dd>
                    <dt style={sx.dt}>SLA At Risk</dt>
                    <dd style={sx.dd}>{report.slaAtRisk ? "Yes" : "No"}</dd>
                    <dt style={sx.dt}>Status</dt>
                    <dd style={sx.dd}>{report.status?.replace(/_/g, " ")}</dd>
                  </dl>
                </div>
              </div>

              <div style={sx.card}>
                <div style={sx.cardHeader}>
                  <h3 style={sx.titleSm}>Reporter Information</h3>
                </div>
                <div style={sx.body}>
                  <dl style={sx.dl}>
                    <dt style={sx.dt}>Name</dt>
                    <dd style={sx.dd}>{reporter.name || "Unknown"}</dd>
                    <dt style={sx.dt}>Email</dt>
                    <dd style={sx.dd}>{reporter.email || "—"}</dd>
                    <dt style={sx.dt}>User ID</dt>
                    <dd style={sx.dd}>{reporter._id || "—"}</dd>
                  </dl>
                </div>
              </div>

              {report.description && (
                <div style={sx.card}>
                  <div style={sx.cardHeader}>
                    <h3 style={sx.titleSm}>Additional Details</h3>
                  </div>
                  <div style={sx.body}>
                    <p style={{ margin: 0, color: "#0f172a" }}>
                      {report.description}
                    </p>
                  </div>
                </div>
              )}

              {report.resolutionNotes && (
                <div style={sx.card}>
                  <div style={sx.cardHeader}>
                    <h3 style={sx.titleSm}>Resolution Notes</h3>
                  </div>
                  <div style={sx.body}>
                    <p style={{ margin: 0, color: "#0f172a" }}>
                      {report.resolutionNotes}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT - Actions */}
            <div>
              <div style={sx.card}>
                <div style={sx.cardHeader}>
                  <h3 style={sx.titleSm}>Moderation Actions</h3>
                </div>
                <div style={sx.body}>
                  {report.status === "resolved" || report.status === "dismissed" ? (
                    <div style={{ textAlign: "center", color: "#64748b" }}>
                      <p>This report has been {report.status}.</p>
                      {report.resolutionAction && (
                        <p><strong>Resolution:</strong> {report.resolutionAction?.replace(/_/g, " ")}</p>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Quick Actions */}
                      {report.status === "pending" && (
                        <button
                          style={{ ...sx.actionBtn("review"), width: "100%", marginBottom: 12 }}
                          onClick={() => handleAction("review")}
                          disabled={actionLoading}
                        >
                          🔍 Mark as Under Review
                        </button>
                      )}

                      <div style={sx.actionGrid}>
                        <button
                          style={sx.actionBtn("warn")}
                          onClick={() => setShowActionForm("warn")}
                          disabled={actionLoading}
                        >
                          ⚠️ Warn User
                        </button>
                        <button
                          style={sx.actionBtn("suspend")}
                          onClick={() => setShowActionForm("suspend")}
                          disabled={actionLoading}
                        >
                          🚫 Suspend User
                        </button>
                        <button
                          style={sx.actionBtn("ban")}
                          onClick={() => setShowActionForm("ban")}
                          disabled={actionLoading}
                        >
                          ❌ Ban User
                        </button>
                        {reportType === "image" && (
                          <button
                            style={sx.actionBtn("remove")}
                            onClick={() => setShowActionForm("remove")}
                            disabled={actionLoading}
                          >
                            🗑️ Remove Content
                          </button>
                        )}
                      </div>

                      <hr style={{ margin: "16px 0", border: "none", borderTop: "1px solid #e5e7eb" }} />

                      <button
                        style={{ ...sx.actionBtn("dismiss"), width: "100%" }}
                        onClick={() => setShowActionForm("dismiss")}
                        disabled={actionLoading}
                      >
                        🙅 Dismiss Report
                      </button>

                      {/* Action Forms */}
                      {showActionForm === "warn" && (
                        <div style={{ marginTop: 16 }}>
                          <h4 style={{ margin: "0 0 8px", fontSize: 14 }}>Warning Message</h4>
                          <textarea
                            style={sx.textarea}
                            placeholder="Enter warning message for the user..."
                            value={warnMessage}
                            onChange={(e) => setWarnMessage(e.target.value)}
                          />
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              style={{ ...sx.actionBtn("warn"), flex: 1 }}
                              onClick={() => handleAction("warn")}
                              disabled={actionLoading || !warnMessage.trim()}
                            >
                              Send Warning
                            </button>
                            <button
                              style={{ ...sx.actionBtn(), flex: 1 }}
                              onClick={() => setShowActionForm(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {showActionForm === "suspend" && (
                        <div style={{ marginTop: 16 }}>
                          <h4 style={{ margin: "0 0 8px", fontSize: 14 }}>Suspension Details</h4>
                          <input
                            type="number"
                            style={sx.input}
                            placeholder="Duration (days)"
                            value={suspendDays}
                            onChange={(e) => setSuspendDays(Number(e.target.value))}
                            min={1}
                            max={365}
                          />
                          <textarea
                            style={sx.textarea}
                            placeholder="Suspension reason message..."
                            value={suspendMessage}
                            onChange={(e) => setSuspendMessage(e.target.value)}
                          />
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              style={{ ...sx.actionBtn("suspend"), flex: 1 }}
                              onClick={() => handleAction("suspend")}
                              disabled={actionLoading || !suspendMessage.trim()}
                            >
                              Suspend for {suspendDays} days
                            </button>
                            <button
                              style={{ ...sx.actionBtn(), flex: 1 }}
                              onClick={() => setShowActionForm(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {showActionForm === "ban" && (
                        <div style={{ marginTop: 16 }}>
                          <h4 style={{ margin: "0 0 8px", fontSize: 14 }}>Ban Reason</h4>
                          <textarea
                            style={sx.textarea}
                            placeholder="Enter reason for permanent ban..."
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                          />
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              style={{ ...sx.actionBtn("ban"), flex: 1 }}
                              onClick={() => handleAction("ban")}
                              disabled={actionLoading || !banReason.trim()}
                            >
                              Permanently Ban User
                            </button>
                            <button
                              style={{ ...sx.actionBtn(), flex: 1 }}
                              onClick={() => setShowActionForm(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {showActionForm === "remove" && (
                        <div style={{ marginTop: 16 }}>
                          <h4 style={{ margin: "0 0 8px", fontSize: 14 }}>Remove Content</h4>
                          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
                            This will permanently delete the reported image.
                          </p>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              style={{ ...sx.actionBtn("remove"), flex: 1 }}
                              onClick={() => handleAction("remove")}
                              disabled={actionLoading}
                            >
                              Confirm Remove
                            </button>
                            <button
                              style={{ ...sx.actionBtn(), flex: 1 }}
                              onClick={() => setShowActionForm(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {showActionForm === "dismiss" && (
                        <div style={{ marginTop: 16 }}>
                          <h4 style={{ margin: "0 0 8px", fontSize: 14 }}>Dismiss Reason</h4>
                          <textarea
                            style={sx.textarea}
                            placeholder="Enter reason for dismissing this report..."
                            value={dismissReason}
                            onChange={(e) => setDismissReason(e.target.value)}
                          />
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              style={{ ...sx.actionBtn("dismiss"), flex: 1 }}
                              onClick={() => handleAction("dismiss")}
                              disabled={actionLoading || !dismissReason.trim()}
                            >
                              Dismiss Report
                            </button>
                            <button
                              style={{ ...sx.actionBtn(), flex: 1 }}
                              onClick={() => setShowActionForm(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Resolution History */}
              {report.resolutionAction && (
                <div style={{ ...sx.card, marginTop: 20 }}>
                  <div style={sx.cardHeader}>
                    <h3 style={sx.titleSm}>Resolution</h3>
                  </div>
                  <div style={sx.body}>
                    <dl style={sx.dl}>
                      <dt style={sx.dt}>Action Taken</dt>
                      <dd style={sx.dd}>{report.resolutionAction?.replace(/_/g, " ")}</dd>
                      <dt style={sx.dt}>Resolution Notes</dt>
                      <dd style={sx.dd}>{report.resolutionNotes || "—"}</dd>
                      <dt style={sx.dt}>Resolved By</dt>
                      <dd style={sx.dd}>{report.resolvedByAdminId?.name || report.resolvedByAdminId || "—"}</dd>
                      <dt style={sx.dt}>Resolved At</dt>
                      <dd style={sx.dd}>
                        {report.resolvedAt
                          ? new Date(report.resolvedAt).toLocaleString()
                          : "—"}
                      </dd>
                    </dl>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ScreenTemplate>
  );
}
