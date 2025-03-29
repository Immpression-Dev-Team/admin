import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArtCard from "./ArtCard";
import TopPanel from "./TopPanel";
import ListView from "./ListView"; // ✅ Import the List View
import { getAllImages } from "../api/API"; // ✅ Import API function

import ScreenTemplate from "./Template/ScreenTemplate";
import { Pagination } from "./Pagination";
import { useAuth } from "@/context/authContext";
import { useDebounce } from "@/hooks/useDebounce";
import "@styles/reviewart.css"; // ✅ Import the merged CSS file

function ReviewArt() {
    const DEFAULT_PAGE = 1;  
    const DEFAULT_PAGE_SIZE = 50;
    const DELAY_TIME = 500;

    const navigate = useNavigate();
    const { authState } = useAuth();

    const [page, setPage] = useState(DEFAULT_PAGE);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [totalPages, setTotalPages] = useState(DEFAULT_PAGE);

    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [viewMode, setViewMode] = useState("grid");

    // apply debounced query w/ a delay every time search input changes
    const [queryString, setQueryString] = useState('');
    const debouncedQuery = useDebounce({ value: queryString, delay: DELAY_TIME });
    const [queryStage, setQueryStage] = useState('');

    // call fetch API
    const fetchArts = async() => {
        const query = {
            input: debouncedQuery,
            stage: queryStage,
        }
        const response = await getAllImages(authState.token, page, pageSize, query);

        // update arts & pagination metadata
        setArtworks(response.images);
        setTotalPages(response.pagination.totalPages);
    }

    // ✅ reset page when searching something new
    useEffect(() => {
        setPage(1);
    }, [debouncedQuery]);

    // ✅ fetch data when token, pagination metadata or query updates
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
    }, [authState?.token, page, pageSize, queryStage, debouncedQuery]);

    // ✅ Select a new page
    const handlePageChange = (value) => {
        if(value < 0 || value > totalPages+1){
            return;
        }
        setPage(value);  
    };

    // ✅ Select #items to display per page
    const handlePageSizeChange = (e) => {
        setPageSize(e.target.value);
        setPage(1);
    };

    // helper function to filter arts (update query before fetch)
    const handleFilterArts = (stage) => {
        setQueryStage(stage);
        setPage(1);
    };

    // ✅ Show All Artworks (Reset Filter)
    const handleShowAllArt = () => {
        handleFilterArts('');
    };

    // ✅ Filtering Functions
    const handleFilterPending = () => {
        handleFilterArts('review');
    };

    const handleFilterApproved = () => {
        handleFilterArts('approved');
    };

    const handleFilterRejected = () => {
        handleFilterArts('rejected');
    };

    // ✅ Search Functionality
    const handleSearch = (query) => {
        const lowerCaseQuery = query.trim().toLowerCase();
        setQueryString(lowerCaseQuery);
    };

    // ✅ Toggle View Mode
    const toggleViewMode = () => {
        setViewMode(viewMode === "grid" ? "list" : "grid");
    };

    // render all art & their approval status
    const renderArtStatus = () => {
        if(loading){
            return <p>Loading Art Statuses...</p>;
        }

        if(artworks.length === 0){
            return <p>No artwork available.</p>
        }
        
        // return arts status in grid/list view
        return(
            (viewMode === "grid") ? 
                (
                    <div className="grid">
                        {artworks.map((art) => (
                            <ArtCard key={art._id} art={art} />
                        ))}
                    </div>
                ) :
                (
                    <ListView data={artworks} type="artworks" /> // ✅ FIXED: Correct prop name
                )
        )
    }

    return (
        <ScreenTemplate>
            <TopPanel
                onShowAllArt={handleShowAllArt} // ✅ Pass function to reset filter
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
                { renderArtStatus() }
                <Pagination  
                    // hasArts={artworks.length === 0}
                    page={page}
                    totalPages={totalPages}
                    onChange={handlePageChange}
                />
            </div>

           
        </ScreenTemplate>
    );
}

export default ReviewArt;
