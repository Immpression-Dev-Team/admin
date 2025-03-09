import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ArtCard from "./ArtCard"; 
import TopPanel from "./TopPanel";

function ReviewArt() {
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState([]); 
  const [filteredArtworks, setFilteredArtworks] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [filterReview, setFilterReview] = useState(false);
  const [filterApproved, setFilterApproved] = useState(false);
  const email = localStorage.getItem("userEmail") || "admin@example.com";

  useEffect(() => {
    const fetchArtworks = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found, redirecting to login.");
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/admin/all_images", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch images");
        }

        setArtworks(data.images || []);
        setFilteredArtworks(data.images || []);
      } catch (err) {
        console.error("Error fetching images:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [navigate]);

  // ✅ Toggle Filter for "Pending Review"
  const handleFilterPending = () => {
    if (filterReview) {
      setFilteredArtworks(artworks);
    } else {
      setFilteredArtworks(artworks.filter((art) => art.stage === "review"));
    }
    setFilterReview(!filterReview);
    setFilterApproved(false);
  };

  // ✅ Toggle Filter for "Approved"
  const handleFilterApproved = () => {
    if (filterApproved) {
      setFilteredArtworks(artworks);
    } else {
      setFilteredArtworks(artworks.filter((art) => art.stage === "approved"));
    }
    setFilterApproved(!filterApproved);
    setFilterReview(false);
  };

  return (
    <div style={styles.pageContainer}>
      <Navbar email={email} />
      <TopPanel 
        totalImages={artworks.length} 
        totalPending={artworks.filter((art) => art.stage === "review").length}
        totalApproved={artworks.filter((art) => art.stage === "approved").length} 
        onFilterPending={handleFilterPending}
        onFilterApproved={handleFilterApproved} 
      />
  
      <div style={styles.contentContainer}>
        {loading ? (
          <p>Loading...</p>
        ) : filteredArtworks.length > 0 ? (
          <div style={styles.grid}>
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

const styles = {
    pageContainer: {
      display: "flex",
      flexDirection: "column",
      width: "100vw", // ✅ Full width
      minHeight: "100vh", // ✅ Prevent shrinking
      alignItems: "center",
      overflowX: "hidden", // ✅ Prevents horizontal scrolling
    },
    contentContainer: {
      width: "100%", // ✅ Stretches full width
      maxWidth: "1200px", // ✅ Keeps content aligned
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      padding: "20px",
    },
    grid: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      width: "100%",
      maxWidth: "1200px", // ✅ Prevents content from overflowing
      gap: "16px",
      padding: "20px",
    },
};

  

export default ReviewArt;
