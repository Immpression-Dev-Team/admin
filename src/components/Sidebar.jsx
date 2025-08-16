// components/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/Logo_T.png";
import immpressionLogo from "@/assets/Immpression.png";
import "@/styles/sidebar.css";

function Sidebar({ isOpen, toggleSidebar, email, logout }) {
  const location = useLocation();

  const menuItems = [
    { path: "/review-art", label: "Review Art", icon: "🎨" },
    { path: "/user-base", label: "User Base", icon: "👤" },
    { path: "/orders", label: "Orders", icon: "🧾" },
    { path: "/analytics", label: "Analytics", icon: "📊" },
    { path: "/settings", label: "Settings", icon: "⚙️" }
  ];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={toggleSidebar}></div>
      
      
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={logo} alt="Immpression Logo" className="logo-icon" />
            {isOpen && <img src={immpressionLogo} alt="Immpression" className="sidebar-title-img" />}
          </div>
          <button className="mobile-close-btn" onClick={toggleSidebar}>
            ✕
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="sidebar-links">
            {menuItems.map((item) => (
              <li key={item.path} className={location.pathname === item.path ? 'active' : ''}>
                <Link to={item.path} onClick={() => window.innerWidth <= 768 && toggleSidebar()}>
                  <span className="link-icon">{item.icon}</span>
                  {isOpen && <span className="link-text">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {isOpen && (
          <div className="sidebar-footer">
            <div className="user-info">
              <span className="user-avatar">👤</span>
              <div className="user-details">
                <span className="user-name">Admin User</span>
                <span className="user-email">{email}</span>
              </div>
            </div>
            <button className="sidebar-logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Sidebar;
