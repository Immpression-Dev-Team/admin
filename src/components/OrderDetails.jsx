// src/components/OrderDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ScreenTemplate from "./Template/ScreenTemplate";
import { useAuth } from "@/context/authContext";
import axios from "axios";
import PayoutButton from "./PayoutButton";
import { getPayoutPreview } from "../api/API";

const toUSD = (cents) => `$${(Number(cents || 0) / 100).toFixed(2)}`;

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { authState } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLink, setImageLink] = useState(location.state?.imageLink || null);
  const [isHovering, setIsHovering] = useState(false);

  // payout preview (admin route)
  const [preview, setPreview] = useState(null);
  const [previewError, setPreviewError] = useState("");

  async function reloadOrder() {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/orderDetails/${id}`, {
      headers: { Authorization: `Bearer ${authState.token}` },
    });
    setOrder(res.data.data);
    if (!imageLink && res.data.data?.imageLink) {
      setImageLink(res.data.data.imageLink);
    }
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
    const run = async () => {
      if (!authState?.token) {
        navigate("/login");
        return;
      }
      try {
        await reloadOrder();
        await reloadPreview(); // ok if it fails; you’ll see the error card
      } catch (err) {
        console.error("Failed to fetch order/preview:", err);
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState?.token, id]);

  if (loading) return <p style={{ padding: 20 }}>Loading Order...</p>;
  if (!order) return <p style={{ padding: 20 }}>Order not found.</p>;

  const money = {
    base: order.baseAmount ?? order.price ?? 0,
    shipping: order.shippingAmount ?? 0,
    tax: order.taxAmount ?? 0,
    total: order.totalAmount ?? (order.baseAmount ?? order.price ?? 0) + (order.shippingAmount ?? 0) + (order.taxAmount ?? 0),
  };

  const shipping = order.shipping || {};
  const sellerStripe = order.artistStripeId || "(none)";
  const chargeId = order.chargeId || "(none)";
  const transferGroup = order.transferGroup || `(order_${order._id})`;

  // Preview fields (defensive if route failed or different shape)
  const pv = preview || {};
  const amounts = pv.amounts || {};
  const stripe = pv.stripe || {};
  const policy = pv.policy || {};
  const seller = pv.seller || {};

  return (
    <ScreenTemplate>
      <div style={{ padding: 30 }}>
        <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
          {/* Left column: back + image */}
          <div
            style={{
              minWidth: 300,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <button
              onClick={() => navigate(-1)}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              style={{
                padding: "4px 12px",
                fontSize: "12px",
                backgroundColor: isHovering
                  ? "var(--primary-color, #007bff)"
                  : "transparent",
                color: isHovering ? "#fff" : "var(--primary-color, #007bff)",
                border: "1px solid var(--primary-color, #007bff)",
                borderRadius: 0,
                cursor: "pointer",
                marginBottom: 20,
                fontWeight: 500,
                textTransform: "uppercase",
                width: "auto",
                transition: "all 0.2s ease-in-out",
              }}
            >
              ← Back
            </button>

            {imageLink && (
              <img
                src={imageLink}
                alt={order.artName}
                style={{
                  width: 300,
                  borderRadius: 8,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
            )}
          </div>

          {/* Right column: info */}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 24, marginBottom: 15 }}>{order.artName}</h2>

            {/* Core order details */}
            <p><strong>Artist:</strong> {order.artistName}</p>
            <p><strong>Base (USD):</strong> {toUSD(money.base)}</p>
            <p><strong>Shipping:</strong> {toUSD(money.shipping)}</p>
            <p><strong>Tax:</strong> {toUSD(money.tax)}</p>
            <p><strong>Total:</strong> {toUSD(money.total)}</p>
            <p><strong>Status:</strong> {String(order.status || "").toUpperCase()}</p>
            <p><strong>Ordered By:</strong> {order.userAccountName}</p>
            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>

            {/* Shipping section (if any) */}
            {(shipping.shipmentStatus || shipping.trackingNumber || shipping.carrier) && (
              <>
                <h3 style={{ marginTop: 25, fontSize: 18 }}>Shipping</h3>
                <p><strong>Carrier:</strong> {shipping.carrier || "—"}</p>
                <p><strong>Tracking #:</strong> {shipping.trackingNumber || "—"}</p>
                <p><strong>Status:</strong> {String(shipping.shipmentStatus || "—").toUpperCase()}</p>
              </>
            )}

            {/* Delivery details */}
            <h3 style={{ marginTop: 25, fontSize: 18 }}>Delivery Details</h3>
            <p><strong>Name:</strong> {order.deliveryDetails?.name}</p>
            <p><strong>Address:</strong> {order.deliveryDetails?.address}</p>
            <p><strong>City:</strong> {order.deliveryDetails?.city}</p>
            <p><strong>State:</strong> {order.deliveryDetails?.state}</p>
            <p><strong>Zip Code:</strong> {order.deliveryDetails?.zipCode}</p>
            <p><strong>Country:</strong> {order.deliveryDetails?.country}</p>

            {/* Billing / payout block */}
            <div
              style={{
                marginTop: 24,
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 16,
                background: "#fff",
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
              }}
            >
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                Billing / Payout
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", rowGap: 8 }}>
                <div><strong>Payment Intent:</strong></div>
                <div>{order.paymentIntentId || "(none)"}</div>

                <div><strong>Charge ID:</strong></div>
                <div>{chargeId}</div>

                <div><strong>Transfer Group:</strong></div>
                <div>{transferGroup}</div>

                <div><strong>Seller Stripe:</strong></div>
                <div>{sellerStripe}</div>

                <div><strong>Stripe Fee (from BT):</strong></div>
                <div>{stripe.fee != null ? toUSD(stripe.fee) : "—"}</div>

                <div><strong>Stripe Net:</strong></div>
                <div>{stripe.net != null ? toUSD(stripe.net) : "—"}</div>

                <div><strong>Platform hold (3% base):</strong></div>
                <div>{policy.platformHoldOnBase != null ? toUSD(policy.platformHoldOnBase) : "—"}</div>

                <div><strong>Seller target (net - tax - hold):</strong></div>
                <div>{seller.target != null ? toUSD(seller.target) : "—"}</div>

                <div><strong>Already sent:</strong></div>
                <div>{seller.alreadySent != null ? toUSD(seller.alreadySent) : "—"}</div>

                <div><strong>Remaining to seller:</strong></div>
                <div>{seller.remaining != null ? toUSD(seller.remaining) : "—"}</div>
              </div>

              {previewError && (
                <div style={{ marginTop: 10, color: "#b91c1c" }}>
                  {previewError}
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                <PayoutButton
                  orderId={order._id}
                  token={authState?.token}
                  onPayout={async () => {
                    // after a payout, refresh preview + order to see “alreadySent/remaining” change
                    await reloadPreview();
                    await reloadOrder();
                  }}
                />
              </div>
            </div>

            {/* Collapsible raw JSON (helps debug what’s missing) */}
            <details style={{ marginTop: 16 }}>
              <summary style={{ cursor: "pointer" }}>Show raw objects (order & payout-preview)</summary>
              <pre style={{ whiteSpace: "pre-wrap", background: "#f9fafb", padding: 12, borderRadius: 8, marginTop: 8 }}>
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
      </div>
    </ScreenTemplate>
  );
}
