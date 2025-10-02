// src/components/PayoutButton.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getPayoutPreview, payoutOrder } from "../api/API";

const toUSD = (cents) => `$${(Number(cents || 0) / 100).toFixed(2)}`;

export default function PayoutButton({
  orderId,
  token,
  onPayout,              // optional callback(result)
  className = "",
}) {
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [doingPayout, setDoingPayout] = useState(false);
  const [customUsd, setCustomUsd] = useState(""); // optional override in USD

  // --- Load payout preview (advisory only; does NOT gate the button) ---
  async function loadPreview() {
    if (!orderId || !token) return;
    setLoadingPreview(true);
    setError("");
    try {
      const res = await getPayoutPreview(orderId, token);
      if (res?.success) {
        setPreview(res.data);
      } else {
        setError(res?.error || "Failed to load payout preview.");
      }
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

  // --- Derived display values from new nested shape ---
  const remainingCents = Number(preview?.seller?.remaining || 0);
  const suggestedCents = remainingCents; // suggest full remaining by default

  const remainingUsd = useMemo(() => toUSD(remainingCents), [remainingCents]);
  const suggestedUsd = useMemo(() => toUSD(suggestedCents), [suggestedCents]);

  // --- Send payout ---
  async function handlePayout() {
    if (!orderId || !token) return;

    // Decide amount
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
    } // else omit to let server choose default

    const human =
      amountCents != null ? toUSD(amountCents) : "the remaining amount";

    if (!window.confirm(`Send a payout of ${human} to the seller?`)) return;

    try {
      setDoingPayout(true);
      const res = await payoutOrder(orderId, token, { amountCents });
      if (!res?.success) throw new Error(res?.error || "Payout failed.");
      const amt = toUSD(Number(res?.data?.amountCents || 0));
      alert(`✅ Payout sent: ${amt}`);
      setCustomUsd("");
      onPayout && onPayout(res);
      await loadPreview(); // refresh numbers after payout
    } catch (e) {
      alert("❌ " + (e?.message || "Payout failed."));
    } finally {
      setDoingPayout(false);
    }
  }

  // Quick reads for the info line
  const stripeFee = preview?.stripe?.fee;
  const tax = preview?.amounts?.tax;
  const platformHold = preview?.policy?.platformHoldOnBase;

  return (
    <div className={`payout-card ${className}`} style={styles.card}>
      <div style={styles.row}>
        <div style={styles.metaCol}>
          <div style={styles.line}>
            <strong>Remaining to seller:</strong>{" "}
            {loadingPreview ? "Loading…" : remainingUsd}
          </div>
          <div style={styles.line}>
            <strong>Suggested payout:</strong> {suggestedUsd}
          </div>

          {(stripeFee != null || tax != null || platformHold != null) && (
            <div style={{ ...styles.line, opacity: 0.85 }}>
              {stripeFee != null && <>Stripe fee: {toUSD(stripeFee)} • </>}
              {tax != null && <>Tax held: {toUSD(tax)} • </>}
              {platformHold != null && <>Platform hold (3% base): {toUSD(platformHold)}</>}
            </div>
          )}

          {!!error && <div style={styles.error}>{error}</div>}
        </div>

        <div style={styles.controlsCol}>
          <div style={styles.inline}>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Custom USD (optional)"
              value={customUsd}
              onChange={(e) => setCustomUsd(e.target.value)}
              style={styles.input}
            />
            <button
              onClick={() => setCustomUsd(String((suggestedCents / 100).toFixed(2)))}
              type="button"
              style={styles.smallBtn}
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
              ...styles.payoutBtn,
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

/* inline styles for quick drop-in */
const styles = {
  card: {
    marginTop: 16,
    padding: 16,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  row: { display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" },
  metaCol: { flex: 1, minWidth: 280 },
  controlsCol: { display: "flex", flexDirection: "column", gap: 10, minWidth: 280 },
  line: { marginBottom: 6, fontSize: 14 },
  error: { color: "#b91c1c", marginTop: 6, fontSize: 13 },
  inline: { display: "flex", gap: 8, alignItems: "center" },
  input: {
    flex: 1,
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 14,
  },
  smallBtn: {
    padding: "8px 10px",
    borderRadius: 8,
    background: "#eef2ff",
    border: "1px solid #c7d2fe",
    color: "#3730a3",
    fontSize: 13,
    fontWeight: 600,
  },
  payoutBtn: {
    width: "100%",
    padding: "12px 14px",
    border: "none",
    borderRadius: 10,
    background: "#1e293b",
    color: "#fff",
    fontWeight: 700,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
};
