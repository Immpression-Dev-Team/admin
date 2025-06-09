import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopPanel from "./TopPanel";
import ListView from "./ListView";
import ScreenTemplate from "./Template/ScreenTemplate";
import { Pagination } from "./Pagination";
import { useAuth } from "@/context/authContext";
import { useDebounce } from "@/hooks/useDebounce";
import { getAllOrders } from "../api/API"; // Add this function below

import "@styles/reviewart.css";

function Orders() {
  const DEFAULT_PAGE = 1;
  const DEFAULT_PAGE_SIZE = 50;
  const DELAY_TIME = 500;

  const navigate = useNavigate();
  const { authState } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(DEFAULT_PAGE);

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce({ value: query, delay: DELAY_TIME });

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
      setOrders(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
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
    setQuery(query.trim().toLowerCase());
  };

  return (
    <ScreenTemplate>
      <TopPanel
        onSearch={handleSearch}
        viewMode="list"
        pageSize={pageSize}
        handlePageSizeChange={handlePageSizeChange}
        disableFilters={true}
        disableToggle={true}
      />
      <div className="reviewArtsContent">
        {loading ? (
          <p>Loading Orders...</p>
        ) : orders.length === 0 ? (
          <p>No orders available.</p>
        ) : (
          <ListView data={orders} type="orders" />
        )}
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={handlePageChange}
        />
      </div>
    </ScreenTemplate>
  );
}

export default Orders;
