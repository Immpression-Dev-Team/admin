import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function ReviewArt() {
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtworks = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found, redirecting to login.");
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/admin/all_images", { // ✅ Admin endpoint
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch images");
        }

        // ✅ Show all images (Admin sees everything)
        setArtworks(data.images || []);
      } catch (err) {
        console.error("Error fetching images:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [navigate]);

  return (
    <div>
      <Navbar />
      <h2>Admin - Review Art Page</h2>
      <p>This is where you will review all submitted artwork.</p>

      {loading ? (
        <p>Loading...</p>
      ) : artworks.length > 0 ? (
        <div>
          {artworks.map((art) => (
            <div key={art._id}>
              <img src={art.imageLink} alt={art.name} width="200px" />
              <h3>{art.name}</h3>
              <p>{art.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No artwork available.</p>
      )}

      <button onClick={() => navigate("/home")}>Back to Home</button>
    </div>
  );
}

export default ReviewArt;
