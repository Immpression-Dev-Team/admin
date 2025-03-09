import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar"; // ✅ Import Navbar

function ArtDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [art, setArt] = useState(null);
  const [loading, setLoading] = useState(true);
  const email = localStorage.getItem("userEmail") || "admin@example.com"; // ✅ Get email from local storage

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/admin/art/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch artwork");
        }

        setArt(data.art);
      } catch (err) {
        console.error("Error fetching artwork:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!art) return <p>Artwork not found.</p>;

  return (
    <div>
      <Navbar email={email} /> {/* ✅ Added Navbar */}
      <div style={styles.container}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          ← Back
        </button>
        <img src={art.imageLink} alt={art.name} style={styles.image} />
        <h2>{art.name}</h2>
        <p><strong>Artist:</strong> {art.artistName}</p>
        <p><strong>Description:</strong> {art.description}</p>
        <p><strong>Price:</strong> ${art.price}</p>
        <p><strong>Views:</strong> {art.views}</p>
        <p><strong>Category:</strong> {art.category}</p>
        <p><strong>Stage:</strong> {art.stage}</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "auto",
    padding: "20px",
    textAlign: "left",
  },
  backButton: {
    padding: "8px 16px",
    marginBottom: "20px",
    cursor: "pointer",
    backgroundColor: "#ddd",
    border: "none",
  },
  image: {
    width: "100%",
    height: "300px",
    objectFit: "cover",
    border: "1px solid #ddd",
  },
};

export default ArtDetails;
