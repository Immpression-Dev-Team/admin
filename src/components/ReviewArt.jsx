import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import ArtCard from "./ArtCard"; 
import TopPanel from "./TopPanel";
import { getAllImages } from "../api/API"; // ✅ Import API function
import "../styles/reviewart.css"; // ✅ Import the merged CSS file

function ReviewArt() {
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState([]); 
  const [filteredArtworks, setFilteredArtworks] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [filterReview, setFilterReview] = useState(false);
  const [filterApproved, setFilterApproved] = useState(false);
  const email = localStorage.getItem("userEmail") || "admin@example.com";

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

  // ✅ Toggle Filter for "Pending Review"
  const handleFilterPending = () => {
    setFilteredArtworks(
      filterReview ? artworks : artworks.filter((art) => art.stage === "review")
    );
    setFilterReview(!filterReview);
    setFilterApproved(false);
  };

  // ✅ Toggle Filter for "Approved"
  const handleFilterApproved = () => {
    setFilteredArtworks(
      filterApproved ? artworks : artworks.filter((art) => art.stage === "approved")
    );
    setFilterApproved(!filterApproved);
    setFilterReview(false);
  };

  return (
    <div className="pageContainer">
      <Navbar email={email} />
      <TopPanel 
        totalImages={artworks.length} 
        totalPending={artworks.filter((art) => art.stage === "review").length}
        totalApproved={artworks.filter((art) => art.stage === "approved").length} 
        onFilterPending={handleFilterPending}
        onFilterApproved={handleFilterApproved} 
      />
  
      <div className="contentContainer">
        {loading ? (
          <p>Loading...</p>
        ) : filteredArtworks.length > 0 ? (
          <div className="grid">
            {filteredArtworks.map((art) => (
              <ArtCard key={art._id} art={art} />
            ))}
          </div>
        ) : (
          <p>No artwork available.</p>
        )}
      </div>
    </div>
  );
}

export default ReviewArt;
