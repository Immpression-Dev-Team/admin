import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import logo from "../assets/Immpression_Logo_Transparent.png";
import ImmpressionLogo from '../assets/Immpression.png'
import "../styles/login.css"; 

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError(""); // Reset error state before API call

    try {
      // ✅ Send login request to backend
      const response = await axios.post("http://localhost:5000/api/admin/login", {
        email,
        password,
      });

      console.log("Login successful:", response.data);

      // ✅ Store the token in localStorage
      localStorage.setItem("token", response.data.token);

      // ✅ Redirect to home after successful login
      navigate("/home");

    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="login-container">
    <img src={ImmpressionLogo} alt="Impression Logo" className="ImmpressionLogo" />
    <img src={logo} alt="Impression Logo" className="logo" />
      <div className="login-box">
        <h2 className="adminLogin">Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>} 
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
