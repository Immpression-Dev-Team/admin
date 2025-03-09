import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Card from "./Card"; 

function Home() {
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail") || "admin@example.com";

  return (
    <div className="home-container">
      <Navbar email={email} />
      
      {/* ✅ Centered Cards */}
      <div className="card-container">
        <Card 
          title="Review Art"
          description="Click here to review and approve art submissions."
          navigateTo="/review-art"
        />
        <Card 
          title="User Base"
          description="View and manage the list of registered users."
          navigateTo="/user-base"
        />
      </div>
    </div>
  );
}

export default Home;
