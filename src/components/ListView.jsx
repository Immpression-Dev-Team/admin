import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/listview.css"; // ✅ Import List View Styles

function ListView({ artworks }) {
  const navigate = useNavigate();
  const [sortedArtworks, setSortedArtworks] = useState(artworks);
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
      setSortedArtworks([...artworks]); // Reset to original order
    } else {
      const sortedData = [...sortedArtworks].sort((a, b) => {
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
      setSortedArtworks(sortedData);
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
          {sortedArtworks.map((art) => (
            <tr
              key={art._id}
              className="clickable-row"
              onClick={() => navigate(`/art/${art._id}`)} // ✅ Clickable Row
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
