// src/components/OrderDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ScreenTemplate from "./Template/ScreenTemplate";
import { useAuth } from "@/context/authContext";
import axios from "axios";
import PayoutButton from "./PayoutButton";
import { getPayoutPreview } from "../api/API";

const toUSD = (cents) => `$${(Number(cents || 0) / 100).toFixed(2)}`;

/* ----------------------------- layout & ui ----------------------------- */
const sx = {
  page: { padding: 24, display: "flex", justifyContent: "center" },
  container: { width: "100%", maxWidth: 1400 }, // keeps white space on very wide screens

  header: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
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
    background: tone === "paid" ? "#ecfdf5" : tone === "pending" ? "#fff7ed" : "#f1f5f9",
    color: tone === "paid" ? "#065f46" : tone === "pending" ? "#9a3412" : "#0f172a",
    border: tone === "paid" ? "1px solid #a7f3d0" : tone === "pending" ? "1px solid #fed7aa" : "1px solid #e2e8f0",
  }),

  /* 3 equal columns: left / middle / right */
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 24,
    alignItems: "start",
  },

  /* cards */
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

  /* image + meta (left column) */
  artImg: {
    width: "100%",
    borderRadius: 12,
    objectFit: "cover",
    marginBottom: 14,
  },
  meta: {
    padding: 12,
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    background: "#f8fafc",
    display: "grid",
    gridTemplateColumns: "130px 1fr",
    gap: 6,
    fontSize: 13,
    wordBreak: "break-all",
    overflowWrap: "anywhere",
  },
  k: { color: "#64748b" },
  v: { color: "#0f172a", fontWeight: 600 },

  /* middle column blocks */
  stack: { display: "flex", flexDirection: "column", gap: 20 },
  summaryList: { display: "flex", flexDirection: "column", gap: 8 },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    background: "#f8fafc",
    fontSize: 14,
  },

  /* DL used across sections */
  dl: {
    display: "grid",
    gridTemplateColumns: "150px 1fr",
    gap: 6,
    fontSize: 14,
    wordBreak: "break-all",
    overflowWrap: "anywhere",
  },
  dt: { color: "#64748b", fontSize: 13 },
  dd: { color: "#0f172a", fontWeight: 600 },

  /* raw block */
  raw: { gridColumn: "1 / -1", marginTop: 20 },
  code: {
    whiteSpace: "pre-wrap",
    background: "#0b1220",
    color: "#e2e8f0",
    padding: 12,
    borderRadius: 10,
    fontSize: 12.5,
  },

  /* small screens: stack to one column */
  "@media": "@media (max-width: 1100px)",
};

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { authState } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLink, setImageLink] = useState(location.state?.imageLink || null);
  const [preview, setPreview] = useState(null);
  const [previewError, setPreviewError] = useState("");
  const [isNarrow, setIsNarrow] = useState(() => window.innerWidth < 1100);

  /* responsive listener (keep hooks above returns) */
  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 1100);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const money = useMemo(() => {
    const base = order?.baseAmount ?? order?.price ?? 0;
    const shipping = order?.shippingAmount ?? 0;
    const tax = order?.taxAmount ?? 0;
    const total = order?.totalAmount ?? base + shipping + tax;
    return { base, shipping, tax, total };
  }, [order]);

  const shippingObj = order?.shipping || {};
  const badgeTone =
    String(order?.status || "").toLowerCase() === "paid" ? "paid" : "pending";

  async function reloadOrder() {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/orderDetails/${id}`, {
      headers: { Authorization: `Bearer ${authState.token}` },
    });
    setOrder(res.data.data);
    if (!imageLink && res.data.data?.imageLink) setImageLink(res.data.data.imageLink);
  }

  async function reloadPreview() {
    try {
      setPreviewError("");
      const res = await getPayoutPreview(id, authState.token);
      setPreview(res?.data || null);
    } catch (e) {
      setPreview(null);
      setPreviewError(e?.message || "Failed to load payout preview");
    }
  }

  useEffect(() => {
    (async () => {
      if (!authState?.token) {
        navigate("/login");
        return;
      }
      try {
        await reloadOrder();
        await reloadPreview();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [authState?.token, id]); // eslint-disable-line

  if (loading)
    return (
      <ScreenTemplate>
        <div style={{ padding: 24 }}>Loading Order…</div>
      </ScreenTemplate>
    );
  if (!order)
    return (
      <ScreenTemplate>
        <div style={{ padding: 24 }}>Order not found.</div>
      </ScreenTemplate>
    );

  const sellerStripe = order.artistStripeId || "—";
  const chargeId = order.chargeId || "—";
  const transferGroup = order.transferGroup || `(order_${order._id})`;

  const pv = preview || {};
  const stripe = pv.stripe || {};
  const policy = pv.policy || {};
  const seller = pv.seller || {};

  /* pick grid style (3-col or stacked) */
  const gridStyle = isNarrow
    ? { ...sx.grid, gridTemplateColumns: "1fr" }
    : sx.grid;

  return (
    <ScreenTemplate>
      <div style={sx.page}>
        <div style={sx.container}>
          {/* Header */}
          <div style={sx.header}>
            <div style={sx.headLeft}>
              <button style={sx.backBtn} onClick={() => navigate(-1)}>← Back</button>
              <div>
                <h1 style={sx.title}>{order.artName}</h1>
                <div style={sx.sub}>
                  Ordered by <strong>{order.userAccountName}</strong> •{" "}
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            <span style={sx.badge(badgeTone)}>{String(order.status || "").toUpperCase()}</span>
          </div>

          {/* 3 columns: left / middle / right */}
          <div style={gridStyle}>
            {/* LEFT — image + mini meta */}
            <div>
              {imageLink && <img src={imageLink} alt={order.artName} style={sx.artImg} />}
              <div style={sx.meta}>
                <div style={sx.k}>Artist</div><div style={sx.v}>{order.artistName}</div>
                <div style={sx.k}>Order ID</div><div style={sx.v}>{order._id}</div>
                <div style={sx.k}>Transfer Group</div><div style={sx.v}>{transferGroup}</div>
              </div>
            </div>

            {/* MIDDLE — Summary (stacked), Shipping, Delivery Details */}
            <div style={sx.stack}>
              <div style={sx.card}>
                <div style={sx.cardHeader}><h3 style={sx.titleSm}>Summary</h3></div>
                <div style={sx.body}>
                  <div style={sx.summaryList}>
                    <div style={sx.summaryRow}><span>Base (USD)</span><strong>{toUSD(money.base)}</strong></div>
                    <div style={sx.summaryRow}><span>Shipping</span><strong>{toUSD(money.shipping)}</strong></div>
                    <div style={sx.summaryRow}><span>Tax</span><strong>{toUSD(money.tax)}</strong></div>
                    <div style={sx.summaryRow}><span>Total</span><strong>{toUSD(money.total)}</strong></div>
                  </div>
                </div>
              </div>

              <div style={sx.card}>
                <div style={sx.cardHeader}><h3 style={sx.titleSm}>Shipping</h3></div>
                <div style={sx.body}>
                  <dl style={sx.dl}>
                    <dt style={sx.dt}>Carrier</dt><dd style={sx.dd}>{shippingObj.carrier || "—"}</dd>
                    <dt style={sx.dt}>Tracking #</dt><dd style={sx.dd}>{shippingObj.trackingNumber || "—"}</dd>
                    <dt style={sx.dt}>Status</dt><dd style={sx.dd}>{String(shippingObj.shipmentStatus || "—").toUpperCase()}</dd>
                  </dl>
                </div>
              </div>

              <div style={sx.card}>
                <div style={sx.cardHeader}><h3 style={sx.titleSm}>Delivery Details</h3></div>
                <div style={sx.body}>
                  <dl style={sx.dl}>
                    <dt style={sx.dt}>Name</dt><dd style={sx.dd}>{order.deliveryDetails?.name || "—"}</dd>
                    <dt style={sx.dt}>Address</dt><dd style={sx.dd}>{order.deliveryDetails?.address || "—"}</dd>
                    <dt style={sx.dt}>City</dt><dd style={sx.dd}>{order.deliveryDetails?.city || "—"}</dd>
                    <dt style={sx.dt}>State</dt><dd style={sx.dd}>{order.deliveryDetails?.state || "—"}</dd>
                    <dt style={sx.dt}>Zip Code</dt><dd style={sx.dd}>{order.deliveryDetails?.zipCode || "—"}</dd>
                    <dt style={sx.dt}>Country</dt><dd style={sx.dd}>{order.deliveryDetails?.country || "—"}</dd>
                  </dl>
                </div>
              </div>
            </div>

            {/* RIGHT — Billing / Payout */}
            <div>
              <div style={sx.card}>
                <div style={sx.cardHeader}>
                  <h3 style={sx.titleSm}>Billing / Payout</h3>
                  <span style={sx.badge("default")}>Seller Stripe: {sellerStripe}</span>
                </div>
                <div style={sx.body}>
                  <dl style={sx.dl}>
                    <dt style={sx.dt}>Payment Intent</dt><dd style={sx.dd}>{order.paymentIntentId || "—"}</dd>
                    <dt style={sx.dt}>Charge ID</dt><dd style={sx.dd}>{chargeId}</dd>
                    <dt style={sx.dt}>Stripe Fee (BT)</dt><dd style={sx.dd}>{stripe.fee != null ? toUSD(stripe.fee) : "—"}</dd>
                    <dt style={sx.dt}>Stripe Net</dt><dd style={sx.dd}>{stripe.net != null ? toUSD(stripe.net) : "—"}</dd>
                    <dt style={sx.dt}>Platform hold (3% base)</dt><dd style={sx.dd}>{policy.platformHoldOnBase != null ? toUSD(policy.platformHoldOnBase) : "—"}</dd>
                    <dt style={sx.dt}>Seller target</dt><dd style={sx.dd}>{seller.target != null ? toUSD(seller.target) : "—"}</dd>
                    <dt style={sx.dt}>Already sent</dt><dd style={sx.dd}>{seller.alreadySent != null ? toUSD(seller.alreadySent) : "—"}</dd>
                    <dt style={sx.dt}>Remaining to seller</dt><dd style={sx.dd}>{seller.remaining != null ? toUSD(seller.remaining) : "—"}</dd>
                    <dt style={sx.dt}>Tax held</dt><dd style={sx.dd}>{pv?.amounts?.tax != null ? toUSD(pv.amounts.tax) : "—"}</dd>
                  </dl>

                  {previewError && <div style={{ color: "#b91c1c", marginTop: 8 }}>{previewError}</div>}

                  <div style={{ marginTop: 14 }}>
                    <PayoutButton
                      orderId={order._id}
                      token={authState?.token}
                      onPayout={async () => {
                        await reloadPreview();
                        await reloadOrder();
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Raw objects */}
          <details style={sx.raw}>
            <summary style={{ cursor: "pointer" }}>Show raw objects (order & payout-preview)</summary>
            <pre style={sx.code}>
              {JSON.stringify(
                {
                  order: {
                    _id: order._id,
                    status: order.status,
                    baseAmount: order.baseAmount,
                    shippingAmount: order.shippingAmount,
                    taxAmount: order.taxAmount,
                    totalAmount: order.totalAmount,
                    price_legacy: order.price,
                    paymentIntentId: order.paymentIntentId,
                    chargeId: order.chargeId,
                    transferGroup: order.transferGroup,
                    sellerTransferredCents: order.sellerTransferredCents,
                    artistStripeId: order.artistStripeId,
                    shipping: order.shipping,
                  },
                  payoutPreview: preview,
                },
                null,
                2
              )}
            </pre>
          </details>
        </div>
      </div>
    </ScreenTemplate>
  );
}
