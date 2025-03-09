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
      <Navbar email={email} /> {/* ✅ Fixed Navbar */}

      {/* ✅ Full Centering */}
      <div style={styles.outerContainer}>
        <div style={styles.innerContainer}>
          {/* ✅ Two Columns: Back Button + Image (Left) | Data (Right) */}
          <div style={styles.leftColumn}>
            <button onClick={() => navigate(-1)} style={styles.backButton}>
              ← Back
            </button>
            <img src={art.imageLink} alt={art.name} style={styles.image} />
          </div>

          <div style={styles.rightColumn}>
            <h2 style={styles.title}>{art.name}</h2>
            <p><strong>Artist:</strong> {art.artistName}</p>
            <p><strong>Description:</strong> {art.description}</p>
            <p><strong>Price:</strong> ${art.price}</p>
            <p><strong>Views:</strong> {art.views}</p>
            <p><strong>Category:</strong> {art.category}</p>
            <p><strong>Stage:</strong> {art.stage}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  /* ✅ Full Page Centering */
  outerContainer: {
    display: "flex",
    justifyContent: "center", // ✅ Centers horizontally
    alignItems: "center", // ✅ Centers vertically
    height: "calc(100vh - 60px)", // ✅ Makes sure it's fully centered under Navbar
    width: "100%",
  },
  innerContainer: {
    display: "flex",
    alignItems: "center", // ✅ Aligns items in the center
    gap: "20px",
    maxWidth: "800px", // ✅ Restricts width to keep it compact
    width: "100%",
  },
  leftColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start", // ✅ Aligns back button to the left
  },
  backButton: {
    padding: "5px 10px", // ✅ Smaller width
    fontSize: "12px",
    marginBottom: "10px",
    cursor: "pointer",
    backgroundColor: "#ddd",
    border: "none",
    borderRadius: "5px",
    width: "60px", // ✅ Keeps it compact
    textAlign: "center",
  },
  image: {
    width: "250px", // ✅ Adjusted size
    height: "auto",
    objectFit: "cover",
    border: "1px solid #ddd",
  },
  rightColumn: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center", // ✅ Keeps text centered within column
    textAlign: "left",
    fontSize: "14px", // ✅ Smaller font for compact text
    lineHeight: "1.2", // ✅ Reduced line height for tight spacing
  },
  title: {
    marginBottom: "5px",
    fontSize: "18px",
  },
};

export default ArtDetails;
