import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OrdersTopPanel from "./OrdersTopPanel";
import ListView from "./ListView";
import ScreenTemplate from "./Template/ScreenTemplate";
import { Pagination } from "./Pagination";
import { useAuth } from "@/context/authContext";
import { useDebounce } from "@/hooks/useDebounce";
import { getAllOrders, deleteOrder } from "../api/API";

import "@styles/orders.css";

function Orders() {
  const DEFAULT_PAGE = 1;
  const DEFAULT_PAGE_SIZE = 50;
  const DELAY_TIME = 500;

  const navigate = useNavigate();
  const { authState } = useAuth();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(DEFAULT_PAGE);

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce({ value: query, delay: DELAY_TIME });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  useEffect(() => {
    const fetchData = async () => {
      if (!authState?.token) {
        navigate("/login");
        return;
      }

      setLoading(true);
      const response = await getAllOrders(authState.token, page, pageSize);
      const orderData = response.data || [];

      setOrders(orderData);
      setFilteredOrders(orderData);
      setTotalPages(response.pagination?.totalPages || 1);

      // Stats
      const completed = orderData.filter(o => (o.status || "").toLowerCase() === "completed").length;
      const pending = orderData.filter(o => {
        const s = (o.status || "").toLowerCase();
        return s === "pending" || s === "processing";
      }).length;
      const cancelled = orderData.filter(o => (o.status || "").toLowerCase() === "cancelled").length;

      setStats({ total: orderData.length, completed, pending, cancelled });
      setLoading(false);
    };

    fetchData();
  }, [authState?.token, page, pageSize, debouncedQuery, navigate]);

  const handlePageChange = (value) => {
    if (value < 1 || value > totalPages) return;
    setPage(value);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(e.target.value);
    setPage(1);
  };

  const handleSearch = (q) => {
    const lower = q.trim().toLowerCase();
    setQuery(lower);

    if (!lower) {
      setFilteredOrders(orders);
      return;
    }

    setFilteredOrders(
      orders.filter((o) => {
        const idMatch = o._id?.toLowerCase().includes(lower);
        const customerMatch = o.customer?.toLowerCase().includes(lower);
        const emailMatch = o.customerEmail?.toLowerCase().includes(lower);
        return idMatch || customerMatch || emailMatch;
      })
    );
  };

  // Filters
  const handleShowAllOrders = () => setFilteredOrders(orders);
  const handleFilterCompleted = () =>
    setFilteredOrders(orders.filter(o => (o.status || "").toLowerCase() === "completed"));
  const handleFilterPending = () =>
    setFilteredOrders(orders.filter(o => {
      const s = (o.status || "").toLowerCase();
      return s === "pending" || s === "processing";
    }));
  const handleFilterCancelled = () =>
    setFilteredOrders(orders.filter(o => (o.status || "").toLowerCase() === "cancelled"));

  // Delete
  const handleDeleteOrder = async (orderId) => {
    try {
      await deleteOrder(orderId, authState.token);
      const updatedOrders = orders.filter(o => o._id !== orderId);
      const updatedFiltered = filteredOrders.filter(o => o._id !== orderId);
      setOrders(updatedOrders);
      setFilteredOrders(updatedFiltered);

      // Recompute stats
      const completed = updatedOrders.filter(o => (o.status || "").toLowerCase() === "completed").length;
      const pending = updatedOrders.filter(o => {
        const s = (o.status || "").toLowerCase();
        return s === "pending" || s === "processing";
      }).length;
      const cancelled = updatedOrders.filter(o => (o.status || "").toLowerCase() === "cancelled").length;
      setStats({ total: updatedOrders.length, completed, pending, cancelled });
    } catch (e) {
      alert("Failed to delete order: " + e.message);
    }
  };

  // ✅ After payout, optimistically update “transferred / remaining” if present
  const handlePayoutDone = (orderId, data) => {
    setOrders(prev =>
      prev.map(o =>
        o._id === orderId
          ? {
              ...o,
              sellerTransferredCents: (o.sellerTransferredCents || 0) + Number(data.amountCents || 0),
              sellerRemainingCents: Math.max(
                0,
                (o.sellerRemainingCents ?? 0) - Number(data.amountCents || 0)
              ),
            }
          : o
      )
    );
    setFilteredOrders(prev =>
      prev.map(o =>
        o._id === orderId
          ? {
              ...o,
              sellerTransferredCents: (o.sellerTransferredCents || 0) + Number(data.amountCents || 0),
              sellerRemainingCents: Math.max(
                0,
                (o.sellerRemainingCents ?? 0) - Number(data.amountCents || 0)
              ),
            }
          : o
      )
    );
  };

  return (
    <ScreenTemplate>
      <OrdersTopPanel
        totalOrders={stats.total}
        completedOrders={stats.completed}
        pendingOrders={stats.pending}
        cancelledOrders={stats.cancelled}
        onShowAllOrders={handleShowAllOrders}
        onFilterCompleted={handleFilterCompleted}
        onFilterPending={handleFilterPending}
        onFilterCancelled={handleFilterCancelled}
        onSearch={handleSearch}
        pageSize={pageSize}
        handlePageSizeChange={handlePageSizeChange}
      />

      <div className="ordersContent">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">📦</div>
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="orders-container">
            <ListView
              data={filteredOrders}
              type="orders"
              onDelete={handleDeleteOrder}
              onPayout={handlePayoutDone} 
            />
          </div>
        )}
        {filteredOrders.length > 0 && (
          <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
        )}
      </div>
    </ScreenTemplate>
  );
}

export default Orders;
