import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ScreenTemplate from "./Template/ScreenTemplate";
import { useAuth } from "@/context/authContext";
import "@/styles/referrals.css";

const API_URL = import.meta.env.VITE_API_URL;

function formatPercent(value) {
  return `${(value || 0).toFixed(1)}%`;
}

function formatDateTime(value) {
  if (!value) return "No activity yet";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatPlatform(platform) {
  if (platform === "ios") return "iOS";
  if (platform === "android") return "Android";
  if (platform) return "Other";
  return null;
}

function eventLabel(event) {
  switch (event.type) {
    case "PAGE_VIEW":
      return "Page View";
    case "ROLE_SELECTED":
      if (event.role === "ARTIST") return "Selected Artist";
      if (event.role === "ART_LOVER") return "Selected Art Lover";
      if (event.role === "BOTH") return "Selected Both";
      return "Selected Role";
    case "APP_STORE_CLICK":
      return "App Store Click";
    case "PLAY_STORE_CLICK":
      return "Google Play Click";
    default:
      return event.type;
  }
}

function ReferralDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const token = authState?.token;

  const [referral, setReferral] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token]);

  useEffect(() => { fetchStats(); }, [id]);

  async function fetchStats() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/referrals/${id}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to load referral");
      setReferral(data.data.referral);
      setStats(data.data.stats);
      setRecentEvents(data.data.recentEvents || []);
    } catch (err) {
      setError(err.message || "Failed to load referral.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(referral.publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { setError("Could not copy link."); }
  }

  return (
    <ScreenTemplate>
      <div className="ref-page">
        <header className="ref-header">
          <div>
            <button className="ref-back-link" onClick={() => navigate("/referrals")}>← Back to Referrals</button>
            <h1 className="ref-title">Referral Analytics</h1>
          </div>
        </header>

        {error && <div className="ref-error">{error}</div>}

        {loading ? (
          <div className="ref-loading">Loading…</div>
        ) : referral ? (
          <>
            <div className="ref-detail-card">
              <div className="ref-detail-row">
                <span className="ref-detail-label">Name</span>
                <span className="ref-detail-value">{referral.name}</span>
              </div>
              <div className="ref-detail-row">
                <span className="ref-detail-label">Internal Label</span>
                <span className="ref-detail-value">{referral.internalLabel || "—"}</span>
              </div>
              <div className="ref-detail-row">
                <span className="ref-detail-label">Public Invite URL</span>
                <span className="ref-detail-value ref-detail-url">
                  <a href={referral.publicUrl} target="_blank" rel="noopener noreferrer">{referral.publicUrl}</a>
                  <button className="ref-btn-copy" onClick={handleCopy}>{copied ? "Copied!" : "Copy Link"}</button>
                </span>
              </div>
              <div className="ref-detail-row">
                <span className="ref-detail-label">Created</span>
                <span className="ref-detail-value">{new Date(referral.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
              </div>
              <div className="ref-detail-row">
                <span className="ref-detail-label">Current Status</span>
                <span className="ref-detail-value">
                  Active{referral.previousCodes?.length > 0 ? ` · code regenerated ${referral.previousCodes.length} time${referral.previousCodes.length === 1 ? "" : "s"}` : " · original code"}
                </span>
              </div>
            </div>

            <h2 className="ref-section-title">Funnel Stats</h2>
            <div className="ref-stats-grid">
              <div className="ref-stat">
                <span className="ref-stat-value">{stats.pageViews || 0}</span>
                <span className="ref-stat-label">Page Views</span>
              </div>
              <div className="ref-stat">
                <span className="ref-stat-value">{stats.artistSelections || 0}</span>
                <span className="ref-stat-label">Artist Selections</span>
              </div>
              <div className="ref-stat">
                <span className="ref-stat-value">{stats.artLoverSelections || 0}</span>
                <span className="ref-stat-label">Art Lover Selections</span>
              </div>
              <div className="ref-stat">
                <span className="ref-stat-value">{stats.bothSelections || 0}</span>
                <span className="ref-stat-label">Both Selections</span>
              </div>
              <div className="ref-stat">
                <span className="ref-stat-value">{stats.totalRoleSelections || 0}</span>
                <span className="ref-stat-label">Total Role Selections</span>
              </div>
              <div className="ref-stat">
                <span className="ref-stat-value">{stats.appStoreClicks || 0}</span>
                <span className="ref-stat-label">App Store Clicks</span>
              </div>
              <div className="ref-stat">
                <span className="ref-stat-value">{stats.playStoreClicks || 0}</span>
                <span className="ref-stat-label">Google Play Clicks</span>
              </div>
              <div className="ref-stat">
                <span className="ref-stat-value">{stats.totalStoreClicks || 0}</span>
                <span className="ref-stat-label">Total Store Clicks</span>
              </div>
              <div className="ref-stat">
                <span className="ref-stat-value">{formatPercent(stats.visitToRoleConversion)}</span>
                <span className="ref-stat-label">Visit → Role Selection</span>
              </div>
              <div className="ref-stat">
                <span className="ref-stat-value">{formatPercent(stats.visitToStoreConversion)}</span>
                <span className="ref-stat-label">Visit → Store Click</span>
              </div>
              <div className="ref-stat ref-stat-wide">
                <span className="ref-stat-value">{formatDateTime(stats.lastActivity)}</span>
                <span className="ref-stat-label">Last Activity</span>
              </div>
            </div>

            <h2 className="ref-section-title">Recent Activity</h2>
            {recentEvents.length === 0 ? (
              <div className="ref-empty">No activity yet for this referral.</div>
            ) : (
              <ul className="ref-activity-list">
                {recentEvents.map((event) => {
                  const platform = formatPlatform(event.platform);
                  return (
                    <li key={event._id} className="ref-activity-item">
                      <span className="ref-activity-time">{formatDateTime(event.createdAt)}</span>
                      <span className="ref-activity-sep">—</span>
                      <span className="ref-activity-label">{eventLabel(event)}</span>
                      {platform && (
                        <>
                          <span className="ref-activity-sep">—</span>
                          <span className="ref-activity-platform">{platform}</span>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        ) : null}
      </div>
    </ScreenTemplate>
  );
}

export default ReferralDetails;
