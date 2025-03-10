import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/artcard.css"; // ✅ Import the CSS file

function ArtCard({ art }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/art/${art._id}`); // ✅ Navigates to the new page
  };

  return (
    <div onClick={handleClick} className="art-card">
      <img src={art.imageLink} alt={art.name} />
      <h3 className="art-card-title">{art.name}</h3>
      <p className="art-card-artist">{art.artistName}</p>
    </div>
  );
}

export default ArtCard;
