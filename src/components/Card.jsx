import { useNavigate } from "react-router-dom";
import "../styles/card.css"; // ✅ Import the Card CSS

function Card({ title, description, navigateTo }) {
  const navigate = useNavigate();

  return (
    <div className="card" onClick={() => navigate(navigateTo)}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default Card;
