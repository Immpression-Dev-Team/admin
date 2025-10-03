import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ScreenTemplate from "./Template/ScreenTemplate";
import { getArtwork, approveArtwork, deleteArtwork } from "../api/API";
import "@styles/artdetails.css";
import { useAuth } from "@/context/authContext";

const fmt = (n) =>
  typeof n === "number" && Number.isFinite(n) ? n.toLocaleString() : "—";

function stagePill(stage) {
  const s = String(stage || "").toLowerCase();
  return s === "approved" ? "pill approved" : s === "rejected" ? "pill rejected" : "pill review";
}

export default function ArtDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authState } = useAuth();

  const [art, setArt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (!authState?.token) {
        navigate("/login");
        return;
      }
      try {
        const artwork = await getArtwork(id, authState.token);
        setArt(artwork);
      } catch (e) {
        console.error("Error fetching artwork:", e?.message || e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, authState?.token, navigate]);

  const dims = useMemo(() => {
    const d = art?.dimensions || {};
    return {
      height: fmt(d.height),
      width: fmt(d.width),
      length: fmt(d.length),
    };
  }, [art]);

  const handleApprove = async () => {
    if (!authState?.token) return;
    try {
      await approveArtwork(id, authState.token);
      setArt((prev) => ({ ...prev, stage: "approved" }));
      alert("Artwork approved!");
    } catch (e) {
      console.error("Approve error:", e?.message || e);
      alert("Failed to approve.");
    }
  };

  const handleReject = async () => {
    if (!authState?.token) return;
    try {
      const res = await fetch(
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
      if (!res.ok) throw new Error("Failed to reject artwork");
      await res.json();
      setArt((prev) => ({ ...prev, stage: "rejected" }));
      setShowRejectBox(false);
      alert("Artwork rejected.");
    } catch (e) {
      console.error("Reject error:", e?.message || e);
      alert("Failed to reject.");
    }
  };

  const handleDelete = async () => {
    if (!authState?.token) return;
    if (!window.confirm("Delete this artwork?")) return;
    try {
      await deleteArtwork(id, authState.token);
      alert("Deleted successfully.");
      navigate("/review-art");
    } catch (e) {
      console.error("Delete error:", e?.message || e);
      alert("Failed to delete.");
    }
  };

  if (loading)
    return (
      <ScreenTemplate>
        <div className="pad">Loading Art Details…</div>
      </ScreenTemplate>
    );
  if (!art)
    return (
      <ScreenTemplate>
        <div className="pad">Artwork not found.</div>
      </ScreenTemplate>
    );

  return (
    <ScreenTemplate>
      <div className="artd-page">
        {/* Header */}
        <div className="artd-header">
          <div className="left">
            <button className="back-btn" onClick={() => navigate(-1)}>
              ← Back
            </button>
            <div className="titling">
              <h1 className="artd-title">{art.name}</h1>
              <div className="sub">
                Artist <strong>{art.artistName}</strong> • Uploaded{" "}
                {new Date(art.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
          <span className={stagePill(art.stage)}>
            {String(art.stage || "").toUpperCase()}
          </span>
        </div>

        {/* TWO COLUMNS: left = image + meta; right = content + admin actions */}
        <div className="artd-grid-2">
          {/* LEFT */}
          <div className="col">
            <div className="card">
              <div className="card-body">
                <img className="artd-image" src={art.imageLink} alt={art.name} />
              </div>
            </div>

            {/* Meta under image */}
            <div className="card">
              <div className="card-head">
                <h3>Meta</h3>
              </div>
              <div className="card-body">
                <dl className="kv">
                  <dt>Category</dt>
                  <dd>{art.category || "—"}</dd>
                  <dt>Views</dt>
                  <dd>{fmt(art.views)}</dd>
                  <dt>Sold Status</dt>
                  <dd>{(art.soldStatus || "unsold").toUpperCase()}</dd>
                </dl>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="col">
            {/* Overview */}
            <div className="card">
              <div className="card-head">
                <h3>Overview</h3>
              </div>
              <div className="card-body">
                <dl className="kv">
                  <dt>Price</dt>
                  <dd>${fmt(art.price)}</dd>
                  <dt>Description</dt>
                  <dd className="wrap">{art.description || "—"}</dd>
                </dl>
              </div>
            </div>

            {/* Attributes */}
            <div className="card">
              <div className="card-head">
                <h3>Attributes</h3>
              </div>
              <div className="card-body">
                <dl className="kv">
                  <dt>Dimensions</dt>
                  <dd>
                    {dims.height} × {dims.width} × {dims.length}
                  </dd>
                  <dt>Weight</dt>
                  <dd>{fmt(art.weight)}</dd>
                  <dt>Signed</dt>
                  <dd>{art.isSigned ? "Yes" : "No"}</dd>
                  <dt>Framed</dt>
                  <dd>{art.isFramed ? "Yes" : "No"}</dd>
                </dl>
              </div>
            </div>

            {/* Auction / Bids — intentionally commented out */}
            {/*
            <div className="card">
              <div className="card-head"><h3>Auction / Bids</h3></div>
              <div className="card-body">…</div>
            </div>
            */}

            {/* Review */}
            {(art.reviewedByEmail || art.rejectionMessage) && (
              <div className="card">
                <div className="card-head">
                  <h3>Review</h3>
                </div>
                <div className="card-body">
                  <dl className="kv">
                    {art.reviewedByEmail && (
                      <>
                        <dt>Reviewed By</dt>
                        <dd className="wrap">{art.reviewedByEmail}</dd>
                        <dt>Reviewed At</dt>
                        <dd>
                          {art.reviewedAt
                            ? new Date(art.reviewedAt).toLocaleString()
                            : "—"}
                        </dd>
                      </>
                    )}
                    {art.rejectionMessage && (
                      <>
                        <dt>Rejection Message</dt>
                        <dd className="wrap">{art.rejectionMessage}</dd>
                      </>
                    )}
                  </dl>
                </div>
              </div>
            )}

            {/* Admin Actions — now in the RIGHT column */}
            <div className="card">
              <div className="card-head">
                <h3>Admin Actions</h3>
              </div>
              <div className="card-body actions">
                {art.stage === "review" && (
                  <>
                    <button className="btn approve" onClick={handleApprove}>
                      Approve
                    </button>
                    {!showRejectBox && (
                      <button
                        className="btn reject"
                        onClick={() => setShowRejectBox(true)}
                      >
                        Reject
                      </button>
                    )}
                    {showRejectBox && (
                      <div className="reject-box">
                        <textarea
                          placeholder="Why are you rejecting this?"
                          value={rejectionMessage}
                          onChange={(e) => setRejectionMessage(e.target.value)}
                          rows={3}
                        />
                        <button className="btn reject" onClick={handleReject}>
                          Confirm Reject
                        </button>
                      </div>
                    )}
                  </>
                )}
                <button className="btn neutral" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScreenTemplate>
  );
}
