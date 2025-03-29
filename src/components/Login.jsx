import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../api/API"; // ✅ Import the API function
import logo from "@assets/Immpression_Logo_Transparent.png";
import ImmpressionLogo from '@assets/Immpression.png';
import "@styles/login.css";

import { useAuth } from '@/context/authContext';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, msg, setMsg } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // ✅ Use the API function instead of direct axios call
      const response = await loginAdmin(email, password);

      console.log("Login successful:", response);

      // ✅ Store token & email in global state + localStorage
      login(response.token, response.email);

      // ✅ Redirect to home after successful login
      navigate("/home");

    } catch (err) {
      console.error("Login error:", err.message);
      // ✅ Set error message from API response
      setMsg({
        type: 'error',
        message: err.message
      });
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
          {msg && <p className={(msg.type === 'error') ? "error-message": "general-message"}>{msg.message}</p>} 
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
