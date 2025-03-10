import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import ArtCard from "./ArtCard"; 
import TopPanel from "./TopPanel";
import ListView from "./ListView"; // ✅ Import the new List View
import { getAllImages } from "../api/API"; // ✅ Import API function
import "../styles/reviewart.css"; // ✅ Import the merged CSS file

function ReviewArt() {
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState([]); 
  const [filteredArtworks, setFilteredArtworks] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // ✅ New State for View Mode

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found, redirecting to login.");
        navigate("/login");
        return;
      }

      const images = await getAllImages(token); // ✅ Fetch from API
      setArtworks(images);
      setFilteredArtworks(images);
      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  // ✅ Search Function
  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());

    setFilteredArtworks(
      artworks.filter(
        (art) =>
          art.name.toLowerCase().includes(query.toLowerCase()) ||
          art.artistName.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  // ✅ Toggle View Mode
  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid");
  };

  return (
    <div className="pageContainer">
      <Navbar email={localStorage.getItem("userEmail") || "admin@example.com"} />
      <TopPanel 
        totalImages={artworks.length} 
        totalPending={artworks.filter((art) => art.stage === "review").length}
        totalApproved={artworks.filter((art) => art.stage === "approved").length} 
        totalRejected={artworks.filter((art) => art.stage === "rejected").length} 
        onSearch={handleSearch}
        viewMode={viewMode} 
        toggleViewMode={toggleViewMode} // ✅ Pass View Toggle Function
      />
  
      <div className="contentContainer">
        {loading ? (
          <p>Loading...</p>
        ) : filteredArtworks.length > 0 ? (
          viewMode === "grid" ? ( // ✅ Conditional Rendering
            <div className="grid">
              {filteredArtworks.map((art) => (
                <ArtCard key={art._id} art={art} />
              ))}
            </div>
          ) : (
            <ListView artworks={filteredArtworks} /> // ✅ Show List View
          )
        ) : (
          <p>No artwork available.</p>
        )}
      </div>
    </div>
  );
}

export default ReviewArt;
