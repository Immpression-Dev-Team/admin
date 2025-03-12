import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import UserTopPanel from "./UserTopPanel"; // ✅ Import the new Top Panel
import ListView from "./ListView";
import { getAllUsers } from "../api/API";

function UserBase() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const userList = await getAllUsers(token);
      setUsers(userList);
      setFilteredUsers(userList);
      setLoading(false);
    }
    fetchUsers();
  }, [token]);

  // ✅ Show All Users
  const handleShowAllUsers = () => {
    setFilteredUsers(users);
  };

  // ✅ Filter Verified Users (Future Implementation)
  const handleFilterVerified = () => {
    setFilteredUsers(users.filter((user) => user.verified === true));
  };

  // ✅ Filter Unverified Users (Future Implementation)
  const handleFilterUnverified = () => {
    setFilteredUsers(users.filter((user) => user.verified === false));
  };

  // ✅ Search Functionality
  const handleSearch = (query) => {
    const lowerCaseQuery = query.toLowerCase();
    setFilteredUsers(
      users.filter(
        (user) =>
          user.name.toLowerCase().includes(lowerCaseQuery) ||
          user.email.toLowerCase().includes(lowerCaseQuery)
      )
    );
  };

return (
    <div className="pageContainer"> {/* ✅ Wrap in pageContainer */}
      <Navbar email={localStorage.getItem("userEmail") || "admin@example.com"} />
      <UserTopPanel 
        totalUsers={users.length} 
        totalVerified={users.filter(user => user.verified).length} 
        totalUnverified={users.filter(user => !user.verified).length} 
        onShowAllUsers={handleShowAllUsers} 
        onFilterVerified={handleFilterVerified} 
        onFilterUnverified={handleFilterUnverified} 
        onSearch={handleSearch}
      />

      <div className="contentContainer"> {/* ✅ Keep content aligned */}
        {loading ? <p>Loading...</p> : <ListView data={filteredUsers} type="users" />}
      </div>
    </div>
);

}

export default UserBase;
