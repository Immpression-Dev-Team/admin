import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar"; // ✅ Import Navbar

function ArtDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [art, setArt] = useState(null);
  const [loading, setLoading] = useState(true);
  const email = localStorage.getItem("userEmail") || "admin@example.com";

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

  const handleApprove = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/art/${id}/approve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to approve artwork");
      }

      // ✅ Update UI to reflect the new stage
      setArt((prevArt) => ({ ...prevArt, stage: "approved" }));
      alert("Artwork approved!");
    } catch (err) {
      console.error("Error approving artwork:", err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!art) return <p>Artwork not found.</p>;

  return (
    <div>
      <Navbar email={email} />
      <div style={styles.outerContainer}>
        <div style={styles.innerContainer}>
          <div style={styles.leftColumn}>
            <button onClick={() => navigate(-1)} style={styles.backButton}>← Back</button>
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

            {/* ✅ Show Approve Button only if it's in "review" */}
            {art.stage === "review" && (
              <button onClick={handleApprove} style={styles.approveButton}>
                Approve
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  outerContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "calc(100vh - 60px)",
    width: "100%",
  },
  innerContainer: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    maxWidth: "800px",
    width: "100%",
  },
  leftColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  backButton: {
    padding: "5px 10px",
    fontSize: "12px",
    marginBottom: "10px",
    cursor: "pointer",
    backgroundColor: "#ddd",
    border: "none",
    borderRadius: "5px",
    width: "60px",
    textAlign: "center",
  },
  image: {
    width: "250px",
    height: "auto",
    objectFit: "cover",
    border: "1px solid #ddd",
  },
  rightColumn: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    textAlign: "left",
    fontSize: "14px",
    lineHeight: "1.2",
  },
  title: {
    marginBottom: "5px",
    fontSize: "18px",
  },
  approveButton: {
    marginTop: "10px",
    padding: "10px",
    fontSize: "14px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default ArtDetails;
