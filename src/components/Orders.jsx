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

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    cancelled: 0
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
      
      // Calculate stats
      const completed = orderData.filter(order => order.status === 'completed').length;
      const pending = orderData.filter(order => order.status === 'pending' || order.status === 'processing').length;
      const cancelled = orderData.filter(order => order.status === 'cancelled').length;
      
      setStats({
        total: orderData.length,
        completed,
        pending,
        cancelled
      });
      
      setLoading(false);
    };

    fetchData();
  }, [authState?.token, page, pageSize, debouncedQuery]);

  const handlePageChange = (value) => {
    if (value < 1 || value > totalPages) return;
    setPage(value);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(e.target.value);
    setPage(1);
  };

  const handleSearch = (query) => {
    const lowerCaseQuery = query.trim().toLowerCase();
    setQuery(lowerCaseQuery);
    
    if (lowerCaseQuery === '') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(
        orders.filter((order) => {
          const idMatch = order._id?.toLowerCase().includes(lowerCaseQuery);
          const customerMatch = order.customer?.toLowerCase().includes(lowerCaseQuery);
          const emailMatch = order.customerEmail?.toLowerCase().includes(lowerCaseQuery);
          return idMatch || customerMatch || emailMatch;
        })
      );
    }
  };

  // Filter functions
  const handleShowAllOrders = () => {
    setFilteredOrders(orders);
  };

  const handleFilterCompleted = () => {
    setFilteredOrders(orders.filter(order => order.status === 'completed'));
  };

  const handleFilterPending = () => {
    setFilteredOrders(orders.filter(order => order.status === 'pending' || order.status === 'processing'));
  };

  const handleFilterCancelled = () => {
    setFilteredOrders(orders.filter(order => order.status === 'cancelled'));
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await deleteOrder(orderId, authState.token);
      
      // Remove the deleted order from both orders and filteredOrders
      const updatedOrders = orders.filter(order => order._id !== orderId);
      const updatedFilteredOrders = filteredOrders.filter(order => order._id !== orderId);
      
      setOrders(updatedOrders);
      setFilteredOrders(updatedFilteredOrders);
      
      // Update stats
      const completed = updatedOrders.filter(order => order.status === 'completed').length;
      const pending = updatedOrders.filter(order => order.status === 'pending' || order.status === 'processing').length;
      const cancelled = updatedOrders.filter(order => order.status === 'cancelled').length;
      
      setStats({
        total: updatedOrders.length,
        completed,
        pending,
        cancelled
      });
      
    } catch (error) {
      alert('Failed to delete order: ' + error.message);
    }
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
            <ListView data={filteredOrders} type="orders" onDelete={handleDeleteOrder} />
          </div>
        )}
        {filteredOrders.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={handlePageChange}
          />
        )}
      </div>
    </ScreenTemplate>
  );
}

export default Orders;
