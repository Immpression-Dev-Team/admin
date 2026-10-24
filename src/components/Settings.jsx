import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/authContext";
import { getAdminSettings, saveAdminSettings, getExportUrl } from "../api/API";
import ScreenTemplate from "./Template/ScreenTemplate";
import "@/styles/settings.css";

const EXPORT_TYPES = [
  {
    key: "users",
    name: "Users",
    desc: "All registered users including name, email, role, and Stripe status.",
  },
  {
    key: "artworks",
    name: "Artworks",
    desc: "All artworks with title, artist, price, category, and approval stage.",
  },
  {
    key: "orders",
    name: "Orders",
    desc: "All orders with buyer, seller, artwork, amount, and status.",
  },
];

// Ad slots on the public website. Ids must match the backend's
// AD_PLACEMENTS and the web-app's ad constants.
const ADSTERRA_PLACEMENTS = [
  {
    id: "marketplaceRailTop",
    name: "Marketplace — right column, top",
    desc: "300 × 250 banner above \"From Immpression\" on /marketplace.",
  },
];

const ADSTERRA_KEY_RE = /^[a-f0-9]{32}$/i;

// Pulls the unit key and script URL out of the code Adsterra gives you:
//   atOptions = { 'key' : '…', … };  <script src="https://…/…"></script>
// The script URL has to be stored because Adsterra rotates its ad domains.
function parseAdsterraCode(code) {
  const key = code.match(/['"]?key['"]?\s*:\s*['"]([a-f0-9]{32})['"]/i)?.[1];
  const src = code.match(/<script[^>]*\bsrc\s*=\s*["'](https:\/\/[^"']+)["']/i)?.[1];
  return key && src ? { key: key.toLowerCase(), src } : null;
}

const scriptHost = (src) => {
  try { return new URL(src).host; } catch { return src; }
};

const emptyPlacements = () =>
  Object.fromEntries(ADSTERRA_PLACEMENTS.map(({ id }) => [id, { enabled: false, key: "", src: "" }]));

function Settings() {
  const { authState } = useAuth();
  const token = authState?.token;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null); // { type: "success"|"error", msg }

  // Notification toggles
  const [notifNewSignup, setNotifNewSignup] = useState(false);
  const [notifNewArtwork, setNotifNewArtwork] = useState(false);
  const [notifNewReport, setNotifNewReport] = useState(false);

  // Email recipient list
  const [emails, setEmails] = useState([]);
  const [emailInput, setEmailInput] = useState("");

  // Ad networks
  const [adsterraEnabled, setAdsterraEnabled] = useState(false);
  const [adsterraPlacements, setAdsterraPlacements] = useState(emptyPlacements);
  const [adCodeDrafts, setAdCodeDrafts] = useState({}); // placement id -> pasted text

  const noticeTimer = useRef(null);

  function showNotice(type, msg) {
    setNotice({ type, msg });
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 5000);
  }

  useEffect(() => {
    return () => clearTimeout(noticeTimer.current);
  }, []);

  useEffect(() => {
    if (!token) return;
    getAdminSettings(token)
      .then((data) => {
        if (data?.data) {
          const s = data.data;
          setNotifNewSignup(s.notifications?.newSignup ?? false);
          setNotifNewArtwork(s.notifications?.newPendingArtwork ?? false);
          setNotifNewReport(s.notifications?.newReport ?? false);
          setEmails(s.notificationEmails ?? []);
          setAdsterraEnabled(s.ads?.adsterra?.enabled ?? false);
          setAdsterraPlacements(
            Object.fromEntries(
              ADSTERRA_PLACEMENTS.map(({ id }) => {
                const p = s.ads?.adsterra?.placements?.[id];
                return [id, { enabled: p?.enabled ?? false, key: p?.key ?? "", src: p?.src ?? "" }];
              })
            )
          );
        }
      })
      .catch(() => showNotice("error", "Failed to load settings."))
      .finally(() => setLoading(false));
  }, [token]);

  function addEmail() {
    const val = emailInput.trim().toLowerCase();
    if (!val) return;
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (!valid) { showNotice("error", "Enter a valid email address."); return; }
    if (emails.includes(val)) { showNotice("error", "That email is already in the list."); return; }
    setEmails((prev) => [...prev, val]);
    setEmailInput("");
  }

  function removeEmail(email) {
    setEmails((prev) => prev.filter((e) => e !== email));
  }

  function handleEmailKeyDown(e) {
    if (e.key === "Enter") { e.preventDefault(); addEmail(); }
  }

  function updatePlacement(id, patch) {
    setAdsterraPlacements((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  function handleAdCodeChange(id, code) {
    setAdCodeDrafts((prev) => ({ ...prev, [id]: code }));
    const parsed = parseAdsterraCode(code);
    if (parsed) updatePlacement(id, parsed);
  }

  function clearAdCode(id) {
    setAdCodeDrafts((prev) => ({ ...prev, [id]: "" }));
    updatePlacement(id, { key: "", src: "", enabled: false });
  }

  async function handleSave() {
    const unparsed = ADSTERRA_PLACEMENTS.find(({ id }) =>
      adCodeDrafts[id]?.trim() && !parseAdsterraCode(adCodeDrafts[id])
    );
    if (unparsed) {
      showNotice("error", `Couldn't read the ad code for "${unparsed.name}". Paste the full code from Adsterra.`);
      return;
    }

    setSaving(true);
    try {
      await saveAdminSettings(token, {
        notifications: {
          newSignup: notifNewSignup,
          newPendingArtwork: notifNewArtwork,
          newReport: notifNewReport,
        },
        notificationEmails: emails,
        ads: {
          adsterra: { enabled: adsterraEnabled, placements: adsterraPlacements },
        },
      });
      showNotice("success", "Settings saved.");
    } catch (e) {
      showNotice("error", e.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <ScreenTemplate>
        <div className="st-page">
          <p style={{ color: "#64748b", fontSize: 14 }}>Loading settings...</p>
        </div>
      </ScreenTemplate>
    );
  }

  return (
    <ScreenTemplate>
    <div className="st-page">
      <h1 className="st-title">Settings</h1>

      {notice && (
        <div className={`st-notice st-notice--${notice.type}`}>{notice.msg}</div>
      )}

      {/* ─── Email Notifications ─── */}
      <div className="st-section">
        <div className="st-section-header">
          <p className="st-section-title">Email Notifications</p>
          <p className="st-section-subtitle">
            Choose which events trigger an email to your admin addresses.
          </p>
        </div>
        <div className="st-section-body">
          <div className="st-toggle-row">
            <div className="st-toggle-label">
              <span className="st-toggle-name">New Sign Up</span>
              <span className="st-toggle-desc">Email when a new user creates an account.</span>
            </div>
            <label className="st-switch">
              <input
                type="checkbox"
                checked={notifNewSignup}
                onChange={(e) => setNotifNewSignup(e.target.checked)}
              />
              <span className="st-switch-track" />
            </label>
          </div>

          <div className="st-toggle-row">
            <div className="st-toggle-label">
              <span className="st-toggle-name">New Pending Artwork</span>
              <span className="st-toggle-desc">Email when an artist submits artwork for review.</span>
            </div>
            <label className="st-switch">
              <input
                type="checkbox"
                checked={notifNewArtwork}
                onChange={(e) => setNotifNewArtwork(e.target.checked)}
              />
              <span className="st-switch-track" />
            </label>
          </div>

          <div className="st-toggle-row">
            <div className="st-toggle-label">
              <span className="st-toggle-name">New Report</span>
              <span className="st-toggle-desc">Email when a user submits a content report.</span>
            </div>
            <label className="st-switch">
              <input
                type="checkbox"
                checked={notifNewReport}
                onChange={(e) => setNotifNewReport(e.target.checked)}
              />
              <span className="st-switch-track" />
            </label>
          </div>

          {/* Recipient email list */}
          <div className="st-email-section">
            <div>
              <p className="st-email-label">Recipient Addresses</p>
              <p className="st-email-sublabel">
                Notifications will be sent to all addresses below.
              </p>
            </div>

            <div className="st-email-chips">
              {emails.length === 0 && (
                <span className="st-email-empty">No addresses added yet.</span>
              )}
              {emails.map((email) => (
                <div key={email} className="st-email-chip">
                  {email}
                  <button
                    className="st-chip-remove"
                    onClick={() => removeEmail(email)}
                    aria-label={`Remove ${email}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="st-email-add">
              <input
                type="email"
                className="st-email-input"
                placeholder="admin@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleEmailKeyDown}
              />
              <button className="st-btn-add" onClick={addEmail}>
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Ad Networks ─── */}
      <div className="st-section">
        <div className="st-section-header">
          <p className="st-section-title">Ad Networks</p>
          <p className="st-section-subtitle">
            Turn ad networks and individual ad slots on the website on or off.
            Changes go live within about a minute of saving.
          </p>
        </div>
        <div className="st-section-body">
          <div className="st-toggle-row">
            <div className="st-toggle-label">
              <span className="st-toggle-name">Adsterra</span>
              <span className="st-toggle-desc">
                Master switch. When off, no Adsterra ads show anywhere on the site.
              </span>
            </div>
            <label className="st-switch">
              <input
                type="checkbox"
                checked={adsterraEnabled}
                onChange={(e) => setAdsterraEnabled(e.target.checked)}
              />
              <span className="st-switch-track" />
            </label>
          </div>

          {ADSTERRA_PLACEMENTS.map(({ id, name, desc }) => {
            const p = adsterraPlacements[id];
            const hasCode = ADSTERRA_KEY_RE.test(p.key) && Boolean(p.src);
            const live = adsterraEnabled && p.enabled && hasCode;
            const draft = adCodeDrafts[id] ?? "";
            const draftInvalid = draft.trim() && !parseAdsterraCode(draft);
            return (
              <div key={id} className={`st-ad-slot${adsterraEnabled ? "" : " st-ad-slot--off"}`}>
                <div className="st-toggle-row">
                  <div className="st-toggle-label">
                    <span className="st-toggle-name">
                      {name}
                      <span className={`st-ad-status${live ? " st-ad-status--live" : ""}`}>
                        {live ? "Live" : "Off"}
                      </span>
                    </span>
                    <span className="st-toggle-desc">{desc}</span>
                  </div>
                  <label className="st-switch">
                    <input
                      type="checkbox"
                      checked={p.enabled}
                      onChange={(e) => updatePlacement(id, { enabled: e.target.checked })}
                    />
                    <span className="st-switch-track" />
                  </label>
                </div>
                {hasCode && (
                  <div className="st-ad-code-current">
                    <span>
                      Key <code>{p.key}</code> · Script <code>{scriptHost(p.src)}</code>
                    </span>
                    <button type="button" className="st-ad-code-clear" onClick={() => clearAdCode(id)}>
                      Remove
                    </button>
                  </div>
                )}
                <textarea
                  className="st-email-input st-ad-code-input"
                  placeholder={hasCode ? "Paste new ad code to replace" : "Paste the ad code from Adsterra (Get code)"}
                  value={draft}
                  onChange={(e) => handleAdCodeChange(id, e.target.value)}
                  rows={3}
                  spellCheck={false}
                  autoComplete="off"
                />
                {draftInvalid && (
                  <span className="st-ad-code-error">
                    Couldn&apos;t find a key and script URL in that code.
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Save ─── */}
      <div className="st-save-row">
        <button className="st-btn-save" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {/* ─── Export Data ─── */}
      <div className="st-section">
        <div className="st-section-header">
          <p className="st-section-title">Export Data</p>
          <p className="st-section-subtitle">
            Download a CSV snapshot of your platform data.
          </p>
        </div>
        <div className="st-section-body">
          <div className="st-export-grid">
            {EXPORT_TYPES.map(({ key, name, desc }) => (
              <div key={key} className="st-export-card">
                <span className="st-export-card-name">{name}</span>
                <span className="st-export-card-desc">{desc}</span>
                <a
                  href={getExportUrl(key, token)}
                  download
                  className="st-btn-export"
                >
                  Download CSV
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </ScreenTemplate>
  );
}

export default Settings;
