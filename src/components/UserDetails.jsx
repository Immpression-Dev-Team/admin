import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ScreenTemplate from "./ScreenTemplate";
import { getUserDetails } from "../api/API";
import "@styles/userdetails.css"; // ✅ Add custom styles for user details

function UserDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const email = localStorage.getItem("userEmail") || "admin@example.com";

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
                const userData = await getUserDetails(id, token); // ✅ Fetch user data
                setUser(userData);
            } catch (error) {
                console.error("Error fetching user details:", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id, navigate]);

    if (loading) return <p>Loading User Details...</p>;
    if (!user) return <p>User not found.</p>;

    return (
        <ScreenTemplate>
            <div className="user-details-container">
                <button onClick={() => navigate(-1)} className="back-button">← Back</button>

                <div className="user-details-inner">
                    {/* Left Column - Profile Picture */}
                    <div className="user-details-left">
                        <img src={user.profilePictureLink} alt={user.name} className="user-profile-image" />
                    </div>

                    {/* Right Column - User Information */}
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
                            {user.verified ? 
                                <span className="verified"> Verified ✅</span> : 
                                <span className="unverified"> Unverified ❌</span>
                            }
                        </p>
                    </div>
                </div>
            </div>
        </ScreenTemplate>
    );
}

export default UserDetails;
