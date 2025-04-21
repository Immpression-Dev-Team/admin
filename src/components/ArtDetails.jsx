import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ScreenTemplate from "./Template/ScreenTemplate";
import {
  getArtwork,
  approveArtwork,
  deleteArtwork,
} from "../api/API";
import "@styles/artdetails.css";
import { useAuth } from "@/context/authContext";

function ArtDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [art, setArt] = useState(null);
  const [loading, setLoading] = useState(true);
  const { authState } = useAuth();

  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState("");

  useEffect(() => {
    const fetchArt = async () => {
      setLoading(true);
      if (!authState?.token) {
        console.error("No token found, redirecting to login.");
        navigate("/login");
        return;
      }

      try {
        const artwork = await getArtwork(id, authState.token);
        setArt(artwork);
      } catch (error) {
        console.error("Error fetching artwork:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArt();
  }, [id, authState?.token, navigate]);

  const handleApprove = async () => {
    if (!authState?.token) return;
    try {
      await approveArtwork(id, authState.token);
      setArt(prev => ({ ...prev, stage: "approved" }));
      alert("Artwork approved!");
    } catch (error) {
      console.error("Approve error:", error.message);
    }
  };

  const handleReject = async () => {
    if (!authState?.token) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/art/${id}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authState.token}`,
          },
          body: JSON.stringify({ rejectionMessage }),
        }
      );

      if (!response.ok) throw new Error("Failed to reject artwork");

      const data = await response.json();
      setArt(prev => ({ ...prev, stage: "rejected" }));
      alert("Artwork rejected.");
      setShowRejectBox(false);
    } catch (error) {
      console.error("Reject error:", error.message);
    }
  };

  const handleDelete = async () => {
    if (!authState?.token) return;
    const confirmed = window.confirm("Delete this artwork?");
    if (!confirmed) return;
    try {
      await deleteArtwork(id, authState.token);
      alert("Deleted successfully.");
      navigate("/review-art");
    } catch (error) {
      console.error("Delete error:", error.message);
    }
  };

  if (loading) return <p>Loading Art Details...</p>;
  if (!art) return <p>Artwork not found.</p>;

  return (
    <ScreenTemplate>
      <div className="art-details-container">
        <button onClick={() => navigate(-1)} className="back-button">← Back</button>

        <div className="art-details-inner">
          <img src={art.imageLink} alt={art.name} className="art-image" />

          <div className="art-details-info">
            <h2>{art.name}</h2>
            <p><span>Artist:</span> {art.artistName}</p>
            <p><span>Description:</span> {art.description}</p>
            <p><span>Price:</span> ${art.price}</p>
            <p><span>Views:</span> {art.views}</p>
            <p><span>Category:</span> {art.category}</p>
            <p><span>Stage:</span> {art.stage}</p>

            {art.reviewedByEmail && (
              <p><span>Reviewed By:</span> {art.reviewedByEmail}<br />
                on {new Date(art.reviewedAt).toLocaleString()}</p>
            )}

            {art.rejectionMessage && (
              <p><span>Rejection Message:</span> {art.rejectionMessage}</p>
            )}

            {art.stage === "review" && (
              <div className="admin-actions">
                <button onClick={handleApprove} className="approve-button">Approve</button>

                {!showRejectBox && (
                  <button onClick={() => setShowRejectBox(true)} className="reject-button">Reject</button>
                )}

                {showRejectBox && (
                  <div style={{ marginTop: "10px", width: "100%" }}>
                    <textarea
                      placeholder="Why are you rejecting this?"
                      value={rejectionMessage}
                      onChange={(e) => setRejectionMessage(e.target.value)}
                      rows={3}
                      style={{ width: "100%" }}
                    />
                    <button onClick={handleReject} className="reject-button" style={{ marginTop: "5px" }}>
                      Confirm Reject
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="admin-actions">
              <button onClick={handleDelete} className="delete-button">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </ScreenTemplate>
  );
}

export default ArtDetails;
