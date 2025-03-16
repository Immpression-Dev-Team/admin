import Card from "./Card"; 
import ScreenTemplate from "./Template/ScreenTemplate";
import '@/styles/home.css';

function Home() {
  return (
    <ScreenTemplate>
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
    </ScreenTemplate>
  );
}

export default Home;
