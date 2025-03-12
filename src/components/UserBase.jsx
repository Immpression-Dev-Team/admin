import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import ListView from "./ListView";
import { getAllUsers } from "../api/API";

function UserBase() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchUsers() {
      const userList = await getAllUsers(token);
      setUsers(userList);
    }
    fetchUsers();
  }, [token]);

  return (
    <div>
      <Navbar email={localStorage.getItem("userEmail") || "admin@example.com"} />
      <h2>User Base</h2>
      <p>This is where you can view and manage registered users.</p>
      
      {/* ✅ Use ListView to display users */}
      <ListView data={users} type="users" />

      <button onClick={() => navigate("/home")}>Back to Home</button>
    </div>
  );
}

export default UserBase;
