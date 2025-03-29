import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/authContext";

import logo from '@assets/Logo_T.png';
import "@styles/navbar.css"; // ✅ Import the CSS file

function Navbar({ email, height }) {
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
      {/* Left Side: Clickable Logo */}
      <div className="left-section">
        <img
          src={logo}
          alt="Logo"
          className="logo-img"
          onClick={handleLogoClick} // ✅ Make the logo clickable
        />
      </div>

      {/* Right Side: User Dropdown */}
      <div className="user-section" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
        <div className="user-info">
          <span className="user-email">{email}</span>
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="dropdown">
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
