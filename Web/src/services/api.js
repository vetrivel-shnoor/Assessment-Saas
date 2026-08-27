import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true, // Important for sending/receiving cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function UpdatePersonalInfo(data) {
  try {
    const res = await api.put("/api/profile/info", data);
    return {
      success: true,
      user: res.data?.user,
      message: res.data?.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Update failed",
    };
  }
}

export async function uploadProfileImage(file) {
  try {
    const formData = new FormData();
    formData.append("image", file);
    const res = await api.post("/api/profile/profile-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return {
      success: true,
      message: res.data?.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Upload failed",
    };
  }
}

export async function checkAuth() {
  try {
    const response = await api.get("/api/auth/me");
    return {
      isAuthenticated: true,
      user: response.data.user,
    };
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return { isAuthenticated: false, user: null };
    }
    throw error;
  }
}

export async function logout() {
  try {
    await api.get("/api/auth/logout");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export default api;
