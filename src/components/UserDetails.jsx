import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ScreenTemplate from "./Template/ScreenTemplate";
import { getUserDetails, deleteUser } from "../api/API";
import "@styles/userdetails.css";

function UserDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            const token = localStorage.getItem("token");

            if (!token) {
                console.error("No token found, redirecting to login.");
                navigate("/login");
                return;
            }

            try {
                const userData = await getUserDetails(id, token);
                setUser(userData);
            } catch (error) {
                console.error("Error fetching user details:", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id, navigate]);

    const handleDeleteUser = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this user?");
        if (!confirmed) return;

        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found, cannot delete user.");
            return;
        }

        try {
            // Rely on the backend to handle all deletions (including profile picture)
            await deleteUser(id, token);
            alert("User deleted successfully.");
            navigate("/user-base", { state: { refresh: true } });
        } catch (error) {
            console.error("Error deleting user:", error.message);
            alert("Failed to delete user.");
        }
    };

    if (loading) return <p>Loading User Details...</p>;
    if (!user) return <p>User not found.</p>;

    return (
        <ScreenTemplate>
            <div className="user-details-container">
                <button onClick={() => navigate(-1)} className="back-button">← Back</button>

                <div className="user-details-inner">
                    <div className="user-details-left">
                        <img src={user.profilePictureLink} alt={user.name} className="user-profile-image" />
                    </div>

                    <div className="user-details-right">
                        <h2>{user.name}</h2>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                        <p><strong>Bio:</strong> {user.bio || "No bio available"}</p>
                        <p><strong>Artist Type:</strong> {user.artistType || "N/A"}</p>
                        <p><strong>Views:</strong> {user.views}</p>
                        <p><strong>Account Type:</strong> {user.accountType || "N/A"}</p>
                        <p><strong>Art Categories:</strong> {user.artCategories.length > 0 ? user.artCategories.join(", ") : "None"}</p>
                        <p>
                            <strong>Verification Status:</strong>
                            {user.verified ? (
                                <span className="verified"> Verified ✅</span>
                            ) : (
                                <span className="unverified"> Unverified ❌</span>
                            )}
                        </p>

                        <div className="admin-actions">
                            <button onClick={handleDeleteUser} className="delete-button">Delete User</button>
                        </div>
                    </div>
                </div>
            </div>
        </ScreenTemplate>
    );
}

export default UserDetails;
