import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/listview.css"; // ✅ Import styles

function ListView({ data, type }) {
    const navigate = useNavigate();
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

    // Sorting function
    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key) {
            if (sortConfig.direction === "asc") direction = "desc";
            else if (sortConfig.direction === "desc") direction = null;
            else direction = "asc";
        }

        setSortConfig({ key, direction });

        if (!direction) return; // Don't modify the order

        data.sort((a, b) => {
            if (key === "createdAt") {
                return direction === "asc"
                    ? new Date(a[key]) - new Date(b[key])
                    : new Date(b[key]) - new Date(a[key]);
            } else {
                return direction === "asc"
                    ? (a[key] || "").localeCompare(b[key] || "")
                    : (b[key] || "").localeCompare(a[key] || "");
            }
        });
    };

    // Render sorting arrow based on current state
    const getArrow = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === "asc" ? " ⬇️" : " ⬆️";
        }
        return "";
    };

    return (
        <div className="list-view">
            <table>
                <thead>
                    <tr>
                        {type === "users" ? (
                            <>
                                <th>Profile</th> {/* ✅ Profile Picture Column */}
                                <th className="sortable" onClick={() => handleSort("name")}>
                                    Name {getArrow("name")}
                                </th>
                                <th className="sortable" onClick={() => handleSort("email")}>
                                    Email {getArrow("email")}
                                </th>
                                <th className="sortable" onClick={() => handleSort("createdAt")}>
                                    Joined {getArrow("createdAt")}
                                </th>
                            </>
                        ) : (
                            <>
                                <th>Image</th>
                                <th className="sortable" onClick={() => handleSort("name")}>
                                    Title {getArrow("name")}
                                </th>
                                <th className="sortable" onClick={() => handleSort("artistName")}>
                                    Artist {getArrow("artistName")}
                                </th>
                                <th>Status</th>
                                <th className="sortable" onClick={() => handleSort("createdAt")}>
                                    Date Uploaded {getArrow("createdAt")}
                                </th>
                            </>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr
                            key={item._id}
                            className="clickable-row"
                            onClick={() => type === "users" ? navigate(`/user/${item._id}`) : navigate(`/art/${item._id}`)}
                        >
                            {type === "users" ? (
                                <>
                                    <td>
                                        <img
                                            src={item.profilePictureLink || "https://via.placeholder.com/50"}
                                            alt={item.name}
                                            className="profile-image"
                                        />
                                    </td>
                                    <td>{item.name}</td>
                                    <td>{item.email}</td>
                                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                                </>
                            ) : (
                                <>
                                    <td>
                                        <img src={item.imageLink} alt={item.name} className="list-image" />
                                    </td>
                                    <td>{item.name}</td>
                                    <td>{item.artistName}</td>
                                    <td className={`status ${item.stage}`}>{item.stage}</td>
                                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>

            </table>
        </div>
    );
}

export default ListView;
