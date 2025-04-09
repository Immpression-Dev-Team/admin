import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ScreenTemplate from "./Template/ScreenTemplate";
import {
    getArtwork,
    approveArtwork,
    rejectArtwork,
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
            await rejectArtwork(id, authState.token);
            setArt(prev => ({ ...prev, stage: "rejected" }));
            alert("Artwork rejected.");
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
                            <p><span>Reviewed By:</span> {art.reviewedByEmail} <br />
                            on {new Date(art.reviewedAt).toLocaleString()}</p>
                        )}

                        {art.stage === "review" && (
                            <div className="admin-actions">
                                <button onClick={handleApprove} className="approve-button">Approve</button>
                                <button onClick={handleReject} className="reject-button">Reject</button>
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
