// ✅ Updated ListView.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "@styles/listview.css";

function ListView({ data, type }) {
    const navigate = useNavigate();
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key) {
            if (sortConfig.direction === "asc") direction = "desc";
            else if (sortConfig.direction === "desc") direction = null;
            else direction = "asc";
        }

        setSortConfig({ key, direction });

        if (!direction) return;

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

    const getArrow = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === "asc" ? " \u2B07\uFE0F" : " \u2B06\uFE0F";
        }
        return "";
    };

    const HEADERS = (type === "users") ? [
        { label: "Profile", sortable: false },
        { label: "Name", sortable: true, onClick: () => handleSort("name"), arrow: getArrow("name") },
        { label: "Email", sortable: true, onClick: () => handleSort("email"), arrow: getArrow("email") },
        { label: "Joined", sortable: true, onClick: () => handleSort("createdAt"), arrow: getArrow("createdAt") }
    ] : [
        { label: "Image", sortable: false },
        { label: "Title", sortable: true, onClick: () => handleSort("name"), arrow: getArrow("name") },
        { label: "Artist", sortable: true, onClick: () => handleSort("artistName"), arrow: getArrow("artistName") },
        { label: "Status", sortable: false },
        { label: "Date Uploaded", sortable: true, onClick: () => handleSort("createdAt"), arrow: getArrow("createdAt") }
    ];

    const renderTableRowContent = (item) => {
        return (type === "users") ? (
            <>
                <td><img src={item.profilePictureLink || "https://via.placeholder.com/50"} alt={item.name} className="profile-image" /></td>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{new Date(item.createdAt).toLocaleDateString()}</td>
            </>
        ) : (
            <>
                <td><img src={item.imageLink} alt={item.name} className="list-image" /></td>
                <td>{item.name}</td>
                <td>{item.artistName}</td>
                <td className={`status ${item.stage}`}>{item.stage}</td>
                <td>{new Date(item.createdAt).toLocaleDateString()}</td>
            </>
        );
    }

    return (
        <div className="list-view">
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            {HEADERS.map((header, index) => (
                                <th
                                    key={index}
                                    className={header.sortable ? "sortable" : ""}
                                    onClick={header.sortable ? header.onClick : undefined}
                                >
                                    {header.label}{header.arrow}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <tr
                                key={item._id}
                                className="clickable-row"
                                onClick={() => type === "users" ? navigate(`/user/${item._id}`) : navigate(`/art/${item._id}`)}
                            >
                                {renderTableRowContent(item)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ListView;
