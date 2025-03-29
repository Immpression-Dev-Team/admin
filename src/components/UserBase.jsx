import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserTopPanel from "./UserTopPanel"; // ✅ Import the new Top Panel
import ListView from "./ListView";
import { getAllUsers } from "../api/API";

import ScreenTemplate from "./Template/ScreenTemplate";
import { useAuth } from "@/context/authContext";
import "@styles/userbase.css";

function UserBase() {
  const navigate = useNavigate();
  const { authState } = useAuth();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch users when auth token is available
  useEffect(() => {
    async function fetchUsers() {
      if (!authState || !authState.token) {
        console.error("No token found, redirecting to login.");
        navigate("/login");
        return;
      }

      setLoading(true);
      const userList = await getAllUsers(authState.token);

      setUsers(userList);
      setFilteredUsers(userList);
      setLoading(false);
    }

    fetchUsers();
  }, [authState?.token]);

  // ✅ Show All Users
  const handleShowAllUsers = () => {
    setFilteredUsers(users);
  };

  // ✅ Filter Verified Users (Future Implementation)
  const handleFilterVerified = () => {
    setFilteredUsers(users.filter((user) => user.verified));
  };

  // ✅ Filter Unverified Users (Future Implementation)
  const handleFilterUnverified = () => {
    setFilteredUsers(users.filter((user) => !user.verified));
  };

  // ✅ Search Functionality
  const handleSearch = (query) => {
    const lowerCaseQuery = query.trim().toLowerCase();

    setFilteredUsers(
      users.filter((user) => {
        const nameMatch = (user.name) ? user.name.toLowerCase().includes(lowerCaseQuery) : false;
        const emailMatch = (user.email) ? user.email.toLowerCase().includes(lowerCaseQuery) : false;
        return nameMatch || emailMatch;
      })
    );
  };

  return (
    <ScreenTemplate>
      <UserTopPanel 
        totalUsers={users.length} 
        totalVerified={users.filter(user => user.verified).length} 
        totalUnverified={users.filter(user => !user.verified).length} 
        onShowAllUsers={handleShowAllUsers} 
        onFilterVerified={handleFilterVerified} 
        onFilterUnverified={handleFilterUnverified} 
        onSearch={handleSearch}
      />
      
      {/* ✅ Keep content aligned */}
      <div className="userBaseContent">
        {loading ? <p>Loading Users...</p> : <ListView data={filteredUsers} type="users" />}
      </div>
    </ScreenTemplate>
  );
}

export default UserBase;