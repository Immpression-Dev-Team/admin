import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h2>Welcome to the Home Page</h2>
      <Link to="/login">
        <button>Go to Login</button>
      </Link>
    </div>
  );
}

export default Home;
