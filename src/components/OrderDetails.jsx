import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ScreenTemplate from "./Template/ScreenTemplate";
import { useAuth } from "@/context/authContext";
import axios from "axios";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { authState } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLink, setImageLink] = useState(location.state?.imageLink || null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!authState?.token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/orderDetails/${id}`, {
          headers: { Authorization: `Bearer ${authState.token}` },
        });
        setOrder(response.data.data);
        if (!imageLink && response.data.data?.imageLink) {
          setImageLink(response.data.data.imageLink);
        }
      } catch (err) {
        console.error("Failed to fetch order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [authState?.token, id]);

  if (loading) return <p style={{ padding: 20 }}>Loading Order...</p>;
  if (!order) return <p style={{ padding: 20 }}>Order not found.</p>;

  return (
    <ScreenTemplate>
      <div style={{ padding: 30 }}>
        <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
          {/* Left column: back + image */}
          <div style={{ minWidth: 300, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <button
              onClick={() => navigate(-1)}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              style={{
                padding: "4px 12px",
                fontSize: "12px",
                backgroundColor: isHovering ? "var(--primary-color, #007bff)" : "transparent",
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
            <p><strong>Artist:</strong> {order.artistName}</p>
            <p><strong>Price:</strong> ${order.price}</p>
            <p><strong>Status:</strong> {order.status?.toUpperCase()}</p>
            <p><strong>Ordered By:</strong> {order.userAccountName}</p>
            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>

            <h3 style={{ marginTop: 25, fontSize: 18 }}>Delivery Details</h3>
            <p><strong>Name:</strong> {order.deliveryDetails.name}</p>
            <p><strong>Address:</strong> {order.deliveryDetails.address}</p>
            <p><strong>City:</strong> {order.deliveryDetails.city}</p>
            <p><strong>State:</strong> {order.deliveryDetails.state}</p>
            <p><strong>Zip Code:</strong> {order.deliveryDetails.zipCode}</p>
            <p><strong>Country:</strong> {order.deliveryDetails.country}</p>
          </div>
        </div>
      </div>
    </ScreenTemplate>
  );
}

export default OrderDetails;
