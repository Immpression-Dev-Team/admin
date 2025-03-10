import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../api/API"; // ✅ Import the API function
import logo from "../assets/Immpression_Logo_Transparent.png";
import ImmpressionLogo from '../assets/Immpression.png';
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
      // ✅ Use the API function instead of direct axios call
      const response = await loginAdmin(email, password);

      console.log("Login successful:", response);

      // ✅ Store the token in localStorage
      localStorage.setItem("token", response.token);

      // ✅ Redirect to home after successful login
      navigate("/home");

    } catch (err) {
      console.error("Login error:", err.message);
      setError(err.message); // ✅ Set error message from API response
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
