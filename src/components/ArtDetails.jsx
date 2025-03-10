import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar"; // ✅ Import Navbar
import "../styles/artdetails.css"; // ✅ Import the new CSS file

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
      <div className="art-details-container">
        <div className="art-details-inner">
          <div className="art-details-left">
            <button onClick={() => navigate(-1)} className="back-button">← Back</button>
            <img src={art.imageLink} alt={art.name} className="art-image" />
          </div>

          <div className="art-details-right">
            <h2 className="art-title">{art.name}</h2>
            <p><strong>Artist:</strong> {art.artistName}</p>
            <p><strong>Description:</strong> {art.description}</p>
            <p><strong>Price:</strong> ${art.price}</p>
            <p><strong>Views:</strong> {art.views}</p>
            <p><strong>Category:</strong> {art.category}</p>
            <p><strong>Stage:</strong> {art.stage}</p>

            {/* ✅ Show Approve Button only if it's in "review" */}
            {art.stage === "review" && (
              <button onClick={handleApprove} className="approve-button">
                Approve
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArtDetails;
