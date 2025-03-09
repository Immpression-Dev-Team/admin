import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar"; // Import Navbar

function Home() {
  const navigate = useNavigate();

  // Retrieve the email from localStorage or state (assuming it's stored)
  const email = localStorage.getItem("userEmail") || "admin@example.com"; // Replace with actual email state

  return (
    <div>
      <Navbar email={email} /> {/* Navbar Component */}
      <h2>Welcome to the Home Page</h2>
    </div>
  );
}

export default Home;
