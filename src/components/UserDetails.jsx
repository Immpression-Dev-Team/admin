import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ScreenTemplate from "./Template/ScreenTemplate";
import { getUserDetails, deleteUser } from "../api/API";
import { useAuth } from "@/context/authContext";
import "@styles/userdetails.css";

function pillClass(ok) {
  return ok ? "pill verified" : "pill unverified";
}

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authState } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (!authState?.token) {
        navigate("/login");
        return;
      }
      try {
        const userData = await getUserDetails(id, authState.token);
        setUser(userData);
      } catch (e) {
        console.error("Error fetching user details:", e?.message || e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, authState?.token, navigate]);

  const joinedDate = useMemo(
    () => (user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"),
    [user]
  );

  const handleDeleteUser = async () => {
    if (!authState?.token) return;
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteUser(id, authState.token);
      alert("User deleted successfully.");
      navigate("/user-base");
    } catch (e) {
      console.error("Error deleting user:", e?.message || e);
      alert("Failed to delete user.");
    }
  };

  const stripeLinked = Boolean(user?.stripeAccountId);
  const onboardingText = user?.stripeOnboardingCompleted ? "Completed" : "Incomplete";

  if (loading)
    return (
      <ScreenTemplate>
        <div className="pad">Loading User Details…</div>
      </ScreenTemplate>
    );

  if (!user)
    return (
      <ScreenTemplate>
        <div className="pad">User not found.</div>
      </ScreenTemplate>
    );

  return (
    <ScreenTemplate>
      <div className="ud-page">
        {/* Header */}
        <div className="ud-header">
          <div className="left">
            <button className="back-btn" onClick={() => navigate(-1)}>
              ← Back
            </button>
            <div className="titling">
              <h1 className="ud-title">{user.name}</h1>
              <div className="sub">
                Joined <strong>{joinedDate}</strong>
              </div>
            </div>
          </div>
          {/* FIX: use isVerified from schema */}
          <span className={pillClass(!!user.isVerified)}>
            {user.isVerified ? "VERIFIED" : "UNVERIFIED"}
          </span>
        </div>

        {/* Two columns: left (profile), right (cards + actions) */}
        <div className="ud-grid">
          {/* LEFT column */}
          <div className="col">
            {/* Profile card */}
            <div className="card">
              <div className="card-body profile">
                <img
                  className="avatar"
                  src={
                    user.profilePictureLink ||
                    "https://via.placeholder.com/160?text=User"
                  }
                  alt={user.name}
                />
                <div className="who">
                  <div className="name">{user.name}</div>
                  <div className="email">{user.email}</div>
                </div>
              </div>
            </div>

            {/* Numbers / quick meta */}
            <div className="card">
              <div className="card-head">
                <h3>Overview</h3>
              </div>
              <div className="card-body">
                <dl className="kv">
                  <dt>Artist Type</dt>
                  <dd>{user.artistType || "N/A"}</dd>

                  <dt>Views</dt>
                  <dd>{typeof user.views === "number" ? user.views : "—"}</dd>

                  <dt>Account Type</dt>
                  <dd>{user.accountType || "N/A"}</dd>

                  <dt>Categories</dt>
                  <dd>
                    {Array.isArray(user.artCategories) && user.artCategories.length
                      ? user.artCategories.join(", ")
                      : "None"}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          {/* RIGHT column */}
          <div className="col">
            {/* Bio */}
            <div className="card">
              <div className="card-head">
                <h3>Bio</h3>
              </div>
              <div className="card-body">
                <p className="wrap">{user.bio || "No bio available."}</p>
              </div>
            </div>

            {/* Stripe */}
            <div className="card">
              <div className="card-head">
                <h3>Stripe</h3>
              </div>
              <div className="card-body">
                <dl className="kv">
                  <dt>Status</dt>
                  <dd>
                    <span className={pillClass(stripeLinked)}>
                      {stripeLinked ? "LINKED" : "NOT LINKED"}
                    </span>
                  </dd>

                  {stripeLinked && (
                    <>
                      <dt>Account ID</dt>
                      <dd className="mono" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span>{user.stripeAccountId}</span>
                        <button
                          className="btn small"
                          onClick={() => navigator.clipboard.writeText(user.stripeAccountId)}
                          title="Copy Stripe Account ID"
                        >
                          Copy
                        </button>
                      </dd>

                      <dt>Onboarding</dt>
                      <dd>{onboardingText}</dd>

                      {user.stripeOnboardingCompletedAt && (
                        <>
                          <dt>Onboarded At</dt>
                          <dd>
                            {new Date(user.stripeOnboardingCompletedAt).toLocaleString()}
                          </dd>
                        </>
                      )}
                    </>
                  )}
                </dl>
              </div>
            </div>

            {/* Security / Verification */}
            <div className="card">
              <div className="card-head">
                <h3>Security</h3>
              </div>
              <div className="card-body">
                <dl className="kv">
                  <dt>Verification</dt>
                  <dd>
                    <span className={pillClass(!!user.isVerified)}>
                      {user.isVerified ? "VERIFIED" : "UNVERIFIED"}
                    </span>
                  </dd>
                  <dt>User ID</dt>
                  <dd className="mono">{user._id}</dd>
                </dl>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="card">
              <div className="card-head">
                <h3>Admin Actions</h3>
              </div>
              <div className="card-body actions">
                <button className="btn danger" onClick={handleDeleteUser}>
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScreenTemplate>
  );
}
