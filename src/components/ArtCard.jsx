import React from "react";
import { useNavigate } from "react-router-dom";

function ArtCard({ art }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/art/${art._id}`); // ✅ Navigates to the new page
  };

  return (
    <div onClick={handleClick} style={styles.card}>
      <img src={art.imageLink} alt={art.name} style={styles.image} />
      <h3 style={styles.title}>{art.name}</h3>
      <p style={styles.artist}>{art.artistName}</p>
    </div>
  );
}

const styles = {
  card: {
    cursor: "pointer",
    width: "200px",
    border: "1px solid #ddd",
    padding: "10px",
    textAlign: "left",
  },
  image: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
  },
  title: {
    fontSize: "16px",
    fontWeight: "bold",
    margin: "5px 0",
  },
  artist: {
    fontSize: "14px",
    color: "#555",
  },
};

export default ArtCard;
