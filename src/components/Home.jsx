import { useState, useEffect } from "react";
import Card from "./Card"; 
import ScreenTemplate from "./Template/ScreenTemplate";
import { useAuth } from "@/context/authContext";
import { getAllImagesStats } from "@/api/API";
import '@/styles/home.css';

function Home() {
  const { authState } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch pending review count
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        if (authState?.token) {
          const response = await getAllImagesStats(authState.token);
          setPendingCount(response.stats.pending || 0);
        }
      } catch (error) {
        console.error("Error fetching pending count:", error);
        setPendingCount(0);
      }
    };

    fetchPendingCount();
  }, [authState?.token]);

  return (
    <ScreenTemplate>
      <div className="card-container">
        <Card 
          title="Review Art"
          description="Click here to review and approve art submissions."
          navigateTo="/review-art"
          counter={pendingCount}
        />
        <Card 
          title="User Base"
          description="View and manage the list of registered users."
          navigateTo="/user-base"
        />
        <Card 
          title="Orders"
          description="Track and manage customer orders."
          navigateTo="/orders"
        />
      </div>
    </ScreenTemplate>
  );
}

export default Home;
