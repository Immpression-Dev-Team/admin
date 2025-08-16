import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/authContext";

import logo from '@assets/Logo_T.png';
import immpressionLogo from '@assets/Immpression.png';
import "@styles/navbar.css"; // ✅ Import the CSS file

function Navbar({ height, toggleSidebar, sidebarOpen }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    console.log("Logging out...");
    logout();
    navigate("/");
  };

  const handleLogoClick = () => {
    navigate("/home"); // ✅ Navigate to Home when clicking the logo
  };

  return (
    <nav className="navbar" style={{ height: `${height}px`}}>
      {/* Left Side: Arrow Buttons */}
      <div className="left-section">
        {/* Open arrow - visible when sidebar is closed */}
        {!sidebarOpen && (
          <div className="navbar-arrow-btn" onClick={toggleSidebar}>
            <span className="navbar-arrow-icon">▶</span>
          </div>
        )}
        
        {/* Close arrow - visible when sidebar is open */}
        {sidebarOpen && (
          <div className="navbar-close-arrow" onClick={toggleSidebar}>
            <span className="navbar-arrow-icon">◀</span>
          </div>
        )}
      </div>

      {/* Right Side: Empty */}
      <div className="right-section">
      </div>
    </nav>
  );
}

export default Navbar;
