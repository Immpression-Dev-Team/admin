import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/authContext";
import { getAdminSettings, saveAdminSettings } from "../api/API";
import ScreenTemplate from "./Template/ScreenTemplate";
import { AD_NETWORKS } from "../constants/adNetworks";
import "@/styles/settings.css";

// On/off switches for ads on the public website. The ad code for each
// placement lives in the web-app (src/constants/ads.js); this page only
// controls whether it shows. Each toggle saves immediately.
function AdNetworks() {
  const { authState } = useAuth();
  const token = authState?.token;

  const [ads, setAds] = useState(null); // { [network]: { enabled, placements: { [id]: { enabled } } } }
  const [savingKey, setSavingKey] = useState(null);
  const [notice, setNotice] = useState(null);
  const noticeTimer = useRef(null);

  function showNotice(type, msg) {
    setNotice({ type, msg });
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 4000);
  }

  useEffect(() => () => clearTimeout(noticeTimer.current), []);

  useEffect(() => {
    if (!token) return;
    getAdminSettings(token)
      .then((data) => {
        const saved = data?.data?.ads || {};
        setAds(
          Object.fromEntries(
            AD_NETWORKS.map((n) => [
              n.id,
              {
                enabled: saved[n.id]?.enabled ?? false,
                placements: Object.fromEntries(
                  n.placements.map((p) => [p.id, { enabled: saved[n.id]?.placements?.[p.id]?.enabled ?? false }])
                ),
              },
            ])
          )
        );
      })
      .catch(() => showNotice("error", "Failed to load ad settings."));
  }, [token]);

  // Optimistically flips one switch and saves; reverts if the save fails.
  async function toggle(networkId, placementId, value) {
    const prev = ads;
    const next = {
      ...ads,
      [networkId]: placementId
        ? {
            ...ads[networkId],
            placements: { ...ads[networkId].placements, [placementId]: { enabled: value } },
          }
        : { ...ads[networkId], enabled: value },
    };
    setAds(next);
    setSavingKey(`${networkId}:${placementId || ""}`);

    try {
      await saveAdminSettings(token, { ads: { [networkId]: next[networkId] } });
      showNotice("success", "Saved. Changes reach the website within about a minute.");
    } catch (e) {
      setAds(prev);
      showNotice("error", e.message || "Failed to save.");
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <ScreenTemplate>
      <div className="st-page">
        <h1 className="st-title">Ad Networks</h1>

        {notice && <div className={`st-notice st-notice--${notice.type}`}>{notice.msg}</div>}

        {!ads ? (
          <p style={{ color: "#64748b", fontSize: 14 }}>Loading ad settings...</p>
        ) : (
          AD_NETWORKS.map((network) => {
            const state = ads[network.id];
            return (
              <div key={network.id} className="st-section">
                <div className="st-section-header">
                  <p className="st-section-title">{network.name}</p>
                  <p className="st-section-subtitle">{network.description}</p>
                </div>
                <div className="st-section-body">
                  <div className="st-toggle-row">
                    <div className="st-toggle-label">
                      <span className="st-toggle-name">
                        {network.name} ads
                        <span className={`st-ad-status${state.enabled ? " st-ad-status--live" : ""}`}>
                          {state.enabled ? "On" : "Off"}
                        </span>
                      </span>
                      <span className="st-toggle-desc">
                        Master switch. When off, no {network.name} ads show anywhere on the site.
                      </span>
                    </div>
                    <label className="st-switch">
                      <input
                        type="checkbox"
                        checked={state.enabled}
                        disabled={savingKey !== null}
                        onChange={(e) => toggle(network.id, null, e.target.checked)}
                      />
                      <span className="st-switch-track" />
                    </label>
                  </div>

                  {network.placements.map((placement) => {
                    const on = state.placements[placement.id].enabled;
                    const live = state.enabled && on;
                    return (
                      <div
                        key={placement.id}
                        className={`st-ad-slot${state.enabled ? "" : " st-ad-slot--off"}`}
                      >
                        <div className="st-toggle-row">
                          <div className="st-toggle-label">
                            <span className="st-toggle-name">
                              {placement.name}
                              <span className={`st-ad-status${live ? " st-ad-status--live" : ""}`}>
                                {live ? "Live" : "Off"}
                              </span>
                            </span>
                            <span className="st-toggle-desc">{placement.description}</span>
                          </div>
                          <label className="st-switch">
                            <input
                              type="checkbox"
                              checked={on}
                              disabled={savingKey !== null}
                              onChange={(e) => toggle(network.id, placement.id, e.target.checked)}
                            />
                            <span className="st-switch-track" />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </ScreenTemplate>
  );
}

export default AdNetworks;
