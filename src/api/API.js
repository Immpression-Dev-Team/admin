import axios from "axios";

// ✅ Load API URL correctly for Vite
const API_URL = import.meta.env.VITE_API_URL;

console.log("🔍 API URL:", API_URL); // ✅ Debugging Step

// ✅ Function to fetch all images
export async function getAllImages(token) {
  try {
    const response = await axios.get(`${API_URL}/api/admin/all_images`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.images || [];
  } catch (error) {
    console.error("Error fetching images:", error.response?.data || error);
    return [];
  }
}

// ✅ Function to handle admin login
export async function loginAdmin(email, password) {
  try {
    const response = await axios.post(`${API_URL}/api/admin/login`, {
      email,
      password,
    });

    return response.data; // ✅ Return token and message
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Login failed. Please try again.");
  }
}

// ✅ Function to fetch a single artwork by ID
export async function getArtwork(id, token) {
  try {
    const response = await axios.get(`${API_URL}/api/admin/art/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.art; // ✅ Return artwork data
  } catch (error) {
    console.error("Error fetching artwork:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch artwork.");
  }
}

// ✅ Function to approve an artwork
export async function approveArtwork(id, token) {
  try {
    const response = await axios.put(
      `${API_URL}/api/admin/art/${id}/approve`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data; // ✅ Return updated artwork data
  } catch (error) {
    console.error("Error approving artwork:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to approve artwork.");
  }
}
