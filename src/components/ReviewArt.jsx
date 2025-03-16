import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArtCard from "./ArtCard";
import TopPanel from "./TopPanel";
import ListView from "./ListView"; // ✅ Import the List View
import { getAllImages } from "../api/API"; // ✅ Import API function

import ScreenTemplate from "./Template/ScreenTemplate";
import { useAuth } from "../context/authContext";
import "@styles/reviewart.css"; // ✅ Import the merged CSS file

function ReviewArt() {
    const navigate = useNavigate();
    const { authState } = useAuth();

    const [artworks, setArtworks] = useState([]);
    const [filteredArtworks, setFilteredArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("grid");

    // fetch arts when auth token is available
    useEffect(() => {
        const fetchData = async () => {
            if (!authState || !authState.token) {
                console.error("No token found, redirecting to login.");
                navigate("/login");
                return;
            }

            setLoading(true);
            const images = await getAllImages(authState.token);
            setArtworks(images);
            setFilteredArtworks(images);
            setLoading(false);
        };

        fetchData();
    }, [authState?.token]);

    // ✅ Show All Artworks (Reset Filter)
    const handleShowAllArt = () => {
        setFilteredArtworks(artworks);
    };

    // ✅ Filtering Functions
    const handleFilterPending = () => {
        setFilteredArtworks(artworks.filter((art) => art.stage === "review"));
    };

    const handleFilterApproved = () => {
        setFilteredArtworks(artworks.filter((art) => art.stage === "approved"));
    };

    const handleFilterRejected = () => {
        setFilteredArtworks(artworks.filter((art) => art.stage === "rejected"));
    };

    // ✅ Search Functionality
    const handleSearch = (query) => {
        const lowerCaseQuery = query.trim().toLowerCase();
    
        setFilteredArtworks(
            artworks.filter((artwork) => {
                const artistMatch = (artwork.artistName) ? artwork.artistName.toLowerCase().includes(lowerCaseQuery) : false;
                const titleMatch = (artwork.name) ? artwork.name.toLowerCase().includes(lowerCaseQuery) : false;
                return artistMatch || titleMatch;
            })
        );
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
                totalImages={artworks.length}
                totalPending={artworks.filter((art) => art.stage === "review").length}
                totalApproved={artworks.filter((art) => art.stage === "approved").length}
                totalRejected={artworks.filter((art) => art.stage === "rejected").length}
                onShowAllArt={handleShowAllArt} // ✅ Pass function to reset filter
                onFilterPending={handleFilterPending}
                onFilterApproved={handleFilterApproved}
                onFilterRejected={handleFilterRejected}
                onSearch={handleSearch}
                viewMode={viewMode}
                toggleViewMode={toggleViewMode}
            />

            <div className="reviewArtsContent">
                { renderArtStatus() }
            </div>
        </ScreenTemplate>
    );
}

export default ReviewArt;
