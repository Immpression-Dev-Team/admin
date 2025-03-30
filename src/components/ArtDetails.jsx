import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ScreenTemplate from "./Template/ScreenTemplate";
import {
    getArtwork,
    approveArtwork,
    rejectArtwork,
    deleteArtwork, // ✅ Import delete function
} from "../api/API";
import "@styles/artdetails.css";

function ArtDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [art, setArt] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArt = async () => {
            setLoading(true);
            const token = localStorage.getItem("token");

            if (!token) {
                console.error("No token found, redirecting to login.");
                navigate("/login");
                return;
            }

            try {
                const artwork = await getArtwork(id, token);
                setArt(artwork);
            } catch (error) {
                console.error("Error fetching artwork:", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchArt();
    }, [id, navigate]);

    const handleApprove = async () => {
        const token = localStorage.getItem("token");
        if (!token) return console.error("No token found, cannot approve.");

        try {
            await approveArtwork(id, token);
            setArt((prevArt) => ({ ...prevArt, stage: "approved" }));
            alert("Artwork approved!");
        } catch (error) {
            console.error("Error approving artwork:", error.message);
        }
    };

    const handleReject = async () => {
        const token = localStorage.getItem("token");
        if (!token) return console.error("No token found, cannot reject.");

        try {
            await rejectArtwork(id, token);
            setArt((prevArt) => ({ ...prevArt, stage: "rejected" }));
            alert("Artwork rejected.");
        } catch (error) {
            console.error("Error rejecting artwork:", error.message);
        }
    };

    // ✅ Helper to extract public_id including folder from full URL
    const getCloudinaryPublicId = (url) => {
        const parts = url.split('/');
        const folder = parts[parts.length - 2];
        const file = parts[parts.length - 1].split('.')[0];
        return `${folder}/${file}`; // e.g. artists/image_xyz
    };

    const handleDelete = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this artwork?");
        if (!confirmed) return;
    
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found, cannot delete.");
            return;
        }
    
        try {
            await deleteArtwork(id, token);
            alert("Artwork and image deleted successfully.");
            navigate("/admin");
        } catch (error) {
            console.error("Error during delete process:", error.message);
            alert("Failed to delete artwork.");
        }
    };
    

    if (loading) return <p>Loading Art Details...</p>;
    if (!art) return <p>Artwork not found.</p>;

    return (
        <ScreenTemplate>
            <div className="art-details-container">
                <div className="art-details-inner">
                    <button onClick={() => navigate(-1)} className="back-button">← Back</button>

                    <img src={art.imageLink} alt={art.name} className="art-image" />

                    <div className="art-details-right">
                        <h2 className="art-title">{art.name}</h2>
                        <p><strong>Artist:</strong> {art.artistName}</p>
                        <p><strong>Description:</strong> {art.description}</p>
                        <p><strong>Price:</strong> ${art.price}</p>
                        <p><strong>Views:</strong> {art.views}</p>
                        <p><strong>Category:</strong> {art.category}</p>
                        <p><strong>Stage:</strong> {art.stage}</p>

                        {art.reviewedByEmail && (
                            <p><strong>Reviewed By:</strong> {art.reviewedByEmail} on {new Date(art.reviewedAt).toLocaleString()}</p>
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
