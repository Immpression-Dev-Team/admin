import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Add useLocation
import ArtCard from "./ArtCard";
import TopPanel from "./TopPanel";
import ListView from "./ListView";
import { getAllImages } from "../api/API";
import ScreenTemplate from "./Template/ScreenTemplate";
import { Pagination } from "./Pagination";
import { useAuth } from "@/context/authContext";
import { useDebounce } from "@/hooks/useDebounce";
import "@styles/reviewart.css";

function ReviewArt() {
    const DEFAULT_PAGE = 1;
    const DEFAULT_PAGE_SIZE = 50;
    const DELAY_TIME = 500;

    const navigate = useNavigate();
    const location = useLocation(); // Add useLocation to access navigation state
    const { authState } = useAuth();

    const [page, setPage] = useState(DEFAULT_PAGE);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [totalPages, setTotalPages] = useState(DEFAULT_PAGE);

    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [viewMode, setViewMode] = useState("grid");

    const [refresh, setRefresh] = useState(0);
    const triggerRefresh = useCallback(() => {
        setRefresh((prev) => prev + 1);
    }, []);

    // apply debounced query w/ a delay every time search input changes
    const [queryString, setQueryString] = useState("");
    const debouncedQuery = useDebounce({ value: queryString, delay: DELAY_TIME });
    const [queryStage, setQueryStage] = useState("");

    // Check for refresh flag in navigation state
    useEffect(() => {
        if (location.state?.refresh) {
            triggerRefresh();
            // Clear the state to prevent repeated refreshes
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate, triggerRefresh]);

    const fetchArts = async () => {
        const query = {
            input: debouncedQuery,
            stage: queryStage,
        };
        const response = await getAllImages(authState.token, page, pageSize, query);

        setArtworks(response.images);
        setTotalPages(response.pagination.totalPages);
    };

    useEffect(() => {
        setPage(1);
    }, [debouncedQuery]);

    useEffect(() => {
        const fetchData = async () => {
            if (!authState || !authState.token) {
                navigate("/login");
                return;
            }

            setLoading(true);
            await fetchArts();
            setLoading(false);
        };

        fetchData();
    }, [authState?.token, page, pageSize, queryStage, debouncedQuery, refresh]);

    const handlePageChange = (value) => {
        if (value < 0 || value > totalPages + 1) {
            return;
        }
        setPage(value);
    };

    const handlePageSizeChange = (e) => {
        setPageSize(e.target.value);
        setPage(1);
    };

    const handleFilterArts = (stage) => {
        setQueryStage(stage);
        setPage(1);
    };

    const handleShowAllArt = () => {
        handleFilterArts("");
    };

    const handleFilterPending = () => {
        handleFilterArts("review");
    };

    const handleFilterApproved = () => {
        handleFilterArts("approved");
    };

    const handleFilterRejected = () => {
        handleFilterArts("rejected");
    };

    const handleSearch = (query) => {
        const lowerCaseQuery = query.trim().toLowerCase();
        setQueryString(lowerCaseQuery);
    };

    const toggleViewMode = () => {
        setViewMode(viewMode === "grid" ? "list" : "grid");
    };

    const renderArtStatus = () => {
        if (loading) {
            return <p>Loading Art Statuses...</p>;
        }

        if (artworks.length === 0) {
            return <p>No artwork available.</p>;
        }

        return viewMode === "grid" ? (
            <div className="grid">
                {artworks.map((art) => (
                    <ArtCard key={art._id} art={art} />
                ))}
            </div>
        ) : (
            <ListView data={artworks} type="artworks" />
        );
    };

    return (
        <ScreenTemplate>
            <TopPanel
                onShowAllArt={handleShowAllArt}
                onFilterPending={handleFilterPending}
                onFilterApproved={handleFilterApproved}
                onFilterRejected={handleFilterRejected}
                onSearch={handleSearch}
                viewMode={viewMode}
                toggleViewMode={toggleViewMode}
                pageSize={pageSize}
                handlePageSizeChange={handlePageSizeChange}
            />

            <div className="reviewArtsContent">
                {renderArtStatus()}
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onChange={handlePageChange}
                />
            </div>
        </ScreenTemplate>
    );
}

export default ReviewArt;
