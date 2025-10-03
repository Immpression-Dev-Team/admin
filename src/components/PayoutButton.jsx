import React, { useEffect, useMemo, useState } from "react";
import { getPayoutPreview, payoutOrder } from "../api/API";

const toUSD = (cents) => `$${(Number(cents || 0) / 100).toFixed(2)}`;

export default function PayoutButton({
  orderId,
  token,
  onPayout,                 // optional callback(result)
  className = "",
}) {
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [doingPayout, setDoingPayout] = useState(false);
  const [customUsd, setCustomUsd] = useState(""); // optional override in USD

  async function loadPreview() {
    if (!orderId || !token) return;
    setLoadingPreview(true);
    setError("");
    try {
      const res = await getPayoutPreview(orderId, token);
      if (res?.success) setPreview(res.data);
      else setError(res?.error || "Failed to load payout preview.");
    } catch (e) {
      setError(e?.message || "Failed to load payout preview.");
    } finally {
      setLoadingPreview(false);
    }
  }

  useEffect(() => {
    loadPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, token]);

  const remainingCents = Number(preview?.seller?.remaining || 0);
  const suggestedCents = remainingCents;

  const remainingUsd = useMemo(() => toUSD(remainingCents), [remainingCents]);
  const suggestedUsd = useMemo(() => toUSD(suggestedCents), [suggestedCents]);

  async function handlePayout() {
    if (!orderId || !token) return;

    let amountCents;
    const trimmed = String(customUsd || "").trim();
    if (trimmed) {
      const parsed = Math.round(Number(trimmed) * 100);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        alert("Enter a valid custom amount in USD.");
        return;
      }
      amountCents = parsed;
    } else if (Number.isFinite(remainingCents) && remainingCents > 0) {
      amountCents = remainingCents;
    }

    const human = amountCents != null ? toUSD(amountCents) : "the remaining amount";
    if (!window.confirm(`Send a payout of ${human} to the seller?`)) return;

    try {
      setDoingPayout(true);
      const res = await payoutOrder(orderId, token, { amountCents });
      if (!res?.success) throw new Error(res?.error || "Payout failed.");
      const amt = toUSD(Number(res?.data?.amountCents || 0));
      alert(`✅ Payout sent: ${amt}`);
      setCustomUsd("");
      onPayout && onPayout(res);
      await loadPreview();
    } catch (e) {
      alert("❌ " + (e?.message || "Payout failed."));
    } finally {
      setDoingPayout(false);
    }
  }

  const stripeFee = preview?.stripe?.fee;
  const tax = preview?.amounts?.tax;
  const platformHold = preview?.policy?.platformHoldOnBase;

  return (
    <div className={`payout-card ${className}`} style={ui.card}>
      <div style={ui.topRow}>
        <div style={ui.metaCol}>
          <div style={ui.line}>
            <strong>Remaining to seller:</strong>{" "}
            {loadingPreview ? "Loading…" : remainingUsd}
          </div>
          <div style={ui.line}>
            <strong>Suggested payout:</strong> {suggestedUsd}
          </div>

          {(stripeFee != null || tax != null || platformHold != null) && (
            <div style={{ ...ui.line, opacity: 0.85 }}>
              {stripeFee != null && <>Stripe fee: {toUSD(stripeFee)} • </>}
              {tax != null && <>Tax held: {toUSD(tax)} • </>}
              {platformHold != null && <>Platform hold (3% base): {toUSD(platformHold)}</>}
            </div>
          )}

          {!!error && <div style={ui.error}>{error}</div>}
        </div>

        <div style={ui.controlsCol}>
          <div style={ui.inline}>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Custom USD (optional)"
              value={customUsd}
              onChange={(e) => setCustomUsd(e.target.value)}
              style={ui.input}
            />
            <button
              onClick={() => setCustomUsd(String((suggestedCents / 100).toFixed(2)))}
              type="button"
              style={ui.smallBtn}
              title="Fill with suggested"
            >
              Use suggested
            </button>
          </div>

          <button
            type="button"
            onClick={handlePayout}
            disabled={doingPayout || !token}
            style={{
              ...ui.payoutBtn,
              opacity: doingPayout || !token ? 0.7 : 1,
              cursor: doingPayout || !token ? "not-allowed" : "pointer",
            }}
          >
            {doingPayout ? "Processing…" : "PAYOUT"}
          </button>
        </div>
      </div>
    </div>
  );
}

const ui = {
  card: {
    padding: 14,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#f8fafc",
  },
  topRow: { display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" },
  metaCol: { flex: 1, minWidth: 280 },
  controlsCol: { display: "flex", flexDirection: "column", gap: 10, minWidth: 280 },
  line: { marginBottom: 6, fontSize: 14 },
  error: { color: "#b91c1c", marginTop: 6, fontSize: 13 },
  inline: { display: "flex", gap: 8, alignItems: "center" },
  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 14,
    background: "#fff",
  },
  smallBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    background: "#eef2ff",
    border: "1px solid #c7d2fe",
    color: "#3730a3",
    fontSize: 13,
    fontWeight: 700,
  },
  payoutBtn: {
    width: "100%",
    padding: "12px 14px",
    border: "none",
    borderRadius: 12,
    background: "#1e293b",
    color: "#fff",
    fontWeight: 800,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
};
