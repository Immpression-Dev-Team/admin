import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/listview.css"; // ✅ Import List View Styles

function ListView({ artworks }) {  // ✅ Use the filtered artworks directly
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

    if (!direction) {
      return; // Don't modify the order
    } else {
      artworks.sort((a, b) => { // ✅ Sorting applied to the passed-in filtered list
        if (key === "createdAt") {
          return direction === "asc"
            ? new Date(a[key]) - new Date(b[key])
            : new Date(b[key]) - new Date(a[key]);
        } else {
          return direction === "asc"
            ? a[key].localeCompare(b[key])
            : b[key].localeCompare(a[key]);
        }
      });
    }
  };

  // Render sorting arrow based on current state
  const getArrow = (key) => {
    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") return " ⬇️";
      if (sortConfig.direction === "desc") return " ⬆️";
    }
    return "";
  };

  return (
    <div className="list-view">
      <table>
        <thead>
          <tr>
            <th>Image</th> {/* ✅ New column for images */}
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
          </tr>
        </thead>
        <tbody>
          {artworks.map((art) => (  // ✅ Now using filtered artworks directly
            <tr
              key={art._id}
              className="clickable-row"
              onClick={() => navigate(`/art/${art._id}`)}
            >
              <td>
                <img src={art.imageLink} alt={art.name} className="list-image" />
              </td>
              <td>{art.name}</td>
              <td>{art.artistName}</td>
              <td className={`status ${art.stage}`}>{art.stage}</td>
              <td>{new Date(art.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ListView;
