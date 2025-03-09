import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ArtCard from "./ArtCard"; // ✅ Import ArtCard Component
import TopPanel from "./TopPanel";

function ReviewArt() {
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState([]); // Stores all artworks
  const [filteredArtworks, setFilteredArtworks] = useState([]); // Stores filtered artworks
  const [loading, setLoading] = useState(true);
  const [filterReview, setFilterReview] = useState(false); // ✅ Toggle for "Pending Review" filter
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
        setFilteredArtworks(data.images || []); // Initialize filtered state
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
      setFilteredArtworks(artworks); // Show all images if filter is OFF
    } else {
      setFilteredArtworks(artworks.filter((art) => art.stage === "review"));
    }
    setFilterReview(!filterReview); // Toggle filter state
  };

  return (
    <div>
      <Navbar email={email} />
      <TopPanel 
        totalImages={artworks.length} 
        totalPending={artworks.filter((art) => art.stage === "review").length} 
        onFilterPending={handleFilterPending} // ✅ Pass filter function
      />

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

      <button onClick={() => navigate("/home")}>Back to Home</button>
    </div>
  );
}

const styles = {
  grid: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "16px",
    padding: "20px",
  },
};

export default ReviewArt;
