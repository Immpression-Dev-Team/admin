import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function UserBase() {
  const navigate = useNavigate();

  return (
    <div>
      <Navbar email={localStorage.getItem("userEmail") || "admin@example.com"} />
      <h2>User Base</h2>
      <p>This is where you can view and manage registered users.</p>
      <button onClick={() => navigate("/home")}>Back to Home</button>
    </div>
  );
}

export default UserBase;
