const API_BASE_URL = "http://localhost:5000/api";

// Helper untuk mengambil token JWT dari localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // 1. Autentikasi
  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return res.json();
  },

  // 2. Laporan
  kirimLaporan: async (laporanData) => {
    const res = await fetch(`${API_BASE_URL}/laporan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(laporanData),
    });
    return res.json();
  },

  getLaporanByTiket: async (kodeTiket) => {
    const res = await fetch(`${API_BASE_URL}/laporan/tiket/${kodeTiket}`);
    return res.json();
  },

  // 3. Riwayat Chat Konsultasi
  getChatHistory: async (kodeTiket) => {
    const res = await fetch(`${API_BASE_URL}/chat/${kodeTiket}`);
    return res.json();
  },
};