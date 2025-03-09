import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/navbar.css"; // ✅ Import the CSS file

function Navbar({ email }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleLogoClick = () => {
    navigate("/home"); // ✅ Navigate to Home when clicking the logo
  };

  return (
    <nav className="navbar">
      {/* Left Side: Clickable Logo */}
      <div className="left-section">
        <img
          src="src/assets/Logo_T.png"
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
