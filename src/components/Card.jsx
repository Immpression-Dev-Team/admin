import { useNavigate } from "react-router-dom";
import "@styles/card.css"; // ✅ Import the Card CSS

function Card({ title, description, navigateTo, counter, icon, gradient }) {
  const navigate = useNavigate();

  // Default icons for different card types
  const getIcon = () => {
    if (icon) return icon;
    switch (title) {
      case "Review Art":
        return "🎨";
      case "User Base":
        return "👥";
      case "Orders":
        return "📦";
      default:
        return "📋";
    }
  };

  // Default gradients for different card types
  const getGradient = () => {
    if (gradient) return gradient;
    switch (title) {
      case "Review Art":
        return "from-purple-500 to-pink-500";
      case "User Base":
        return "from-blue-500 to-cyan-500";
      case "Orders":
        return "from-green-500 to-emerald-500";
      default:
        return "from-gray-500 to-slate-500";
    }
  };

  return (
    <div className="modern-card" onClick={() => navigate(navigateTo)}>
      <div className="card-icon-section">
        <div className={`card-icon-bg bg-gradient-to-br ${getGradient()}`}>
          <span className="card-icon">{getIcon()}</span>
        </div>
        {counter !== undefined && counter > 0 && (
          <span className="card-counter">{counter}</span>
        )}
      </div>
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
        <div className="card-arrow">
          <span>→</span>
        </div>
      </div>
    </div>
  );
}

export default Card;
