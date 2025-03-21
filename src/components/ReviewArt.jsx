import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArtCard from "./ArtCard";
import TopPanel from "./TopPanel";
import ListView from "./ListView"; // ✅ Import the List View
import { getAllImages } from "../api/API"; // ✅ Import API function

import ScreenTemplate from "./Template/ScreenTemplate";
import { Pagination } from "./Pagination";
import { useAuth } from "../context/authContext";
import "@styles/reviewart.css"; // ✅ Import the merged CSS file

function ReviewArt() {
    const DEFAULT_PAGE = 1;  
    const DEFAULT_PAGE_SIZE = 50;

    const navigate = useNavigate();
    const { authState } = useAuth();

    const [page, setPage] = useState(DEFAULT_PAGE);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [totalPages, setTotalPages] = useState(DEFAULT_PAGE);
    const [totalFilteredPages, setTotalFilteredPages] = useState(DEFAULT_PAGE);

    const [artworks, setArtworks] = useState([]);
    const [filteredArtworks, setFilteredArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("grid");
    const [queryStage, setQueryStage] = useState('');

    // call fetch API
    const fetchArts = async() => {
        const response = await getAllImages(authState.token, page, pageSize, queryStage);
        setArtworks(response.images);
        setFilteredArtworks(response.images);

        // update pagination metadata
        setTotalPages(response.pagination.totalPages);
        setTotalFilteredPages(response.pagination.totalPages);
    }

    // ✅ fetch data when when token, pagination metadata or query updates
    useEffect(() => {
        const fetchData = async () => {
            if (!authState || !authState.token) {
                console.error("No token found, redirecting to login.");
                navigate("/login");
                return;
            }

            setLoading(true);
            await fetchArts();
            setLoading(false);
        };

        fetchData();
    }, [authState?.token, page, pageSize, queryStage]);

    // ✅ Select a new page
    const handlePageChange = (value) => {
        if(value < 0 || value > totalFilteredPages+1){
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
        const filteredArts = artworks.filter((artwork) => {
            const artistMatch = (artwork.artistName) ? artwork.artistName.toLowerCase().includes(lowerCaseQuery) : false;
            const titleMatch = (artwork.name) ? artwork.name.toLowerCase().includes(lowerCaseQuery) : false;
            return artistMatch || titleMatch;
        });

        // restore page length for non-search / use filtered result's page length when searching
        const filteredPages = (lowerCaseQuery.length === 0) ? totalPages : Math.ceil(filteredArts.length / pageSize);

        setFilteredArtworks(filteredArts);
        setTotalFilteredPages(filteredPages);
        setPage(1);
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

        if(filteredArtworks.length === 0){
            return <p>No artwork available.</p>
        }
        
        // return arts status in grid/list view
        return(
            (viewMode === "grid") ? 
                (
                    <div className="grid">
                        {filteredArtworks.map((art) => (
                            <ArtCard key={art._id} art={art} />
                        ))}
                    </div>
                ) :
                (
                    <ListView data={filteredArtworks} type="artworks" /> // ✅ FIXED: Correct prop name
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
                    page={page}
                    totalPages={totalFilteredPages}
                    onChange={handlePageChange}
                />
            </div>

           
        </ScreenTemplate>
    );
}

export default ReviewArt;
