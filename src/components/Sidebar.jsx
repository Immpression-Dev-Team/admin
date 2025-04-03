// components/Sidebar.jsx
import { Link } from "react-router-dom";
import "@/styles/sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Admin Panel</h2>
      <ul className="sidebar-links">
        <li><Link to="/review-art">🎨 Review Art</Link></li>
        <li><Link to="/user-base">👤 User Base</Link></li>
        <li><Link to="/analytics">📊 Analytics</Link></li>
        <li><Link to="/settings">⚙️ Settings</Link></li>
      </ul>
    </div>
  );
}

export default Sidebar;
