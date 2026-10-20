import { getToken, clearUser } from "../utils/auth";

const API_BASE_URL = "http://localhost:5000/api";

/**
 * Wrapper pembungkus fetch API.
 * Menangani penambahan header otentikasi Bearer token, parsing body (JSON / FormData),
 * penanganan respon error, serta penanganan otomatis status 401 (Unauthorized).
 */
async function request(path, { method = "GET", body, auth = true, redirectOn401 = true } = {}) {
  const headers = {};
  const token = getToken();

  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let payload;
  if (body instanceof FormData) {
    payload = body; // Browser menyisipkan Content-Type beserta boundary secara otomatis
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { method, headers, body: payload });
  const data = await res.json().catch(() => ({}));

  // Skenario penanganan token kadaluarsa atau tidak valid
  if (res.status === 401 && token && redirectOn401) {
    clearUser();
    window.location.assign("/login");
  }

  // Menyeragamkan pesan error jika server tidak mengembalikan properti 'error'
  if (!res.ok && !data.error) {
    data.error = data.message || "Permintaan gagal.";
  }

  return data;
}

export const api = {
  // --- 1. Autentikasi ---
  login: (identifier, password) =>
    request("/auth/login", {
      method: "POST",
      body: { identifier, password },
      auth: false,
      redirectOn401: false,
    }),

  register: (userData) =>
    request("/auth/register", {
      method: "POST",
      body: userData,
      auth: false,
      redirectOn401: false,
    }),

  me: () => request("/auth/me"),

  // --- 2. Laporan ---
  // Parameter laporanData menerima objek JSON atau FormData (termasuk berkas bukti)
  kirimLaporan: (laporanData) =>
    request("/laporan", { method: "POST", body: laporanData }),

  getLaporanByTiket: (kodeTiket) =>
    request(`/laporan/tiket/${kodeTiket}`, { auth: false }),

  getLaporanSaya: () => request("/laporan/saya"),

  // Endpoint khusus manajemen Guru BK
  getAllLaporan: () => request("/laporan"),

  getDetailLaporan: (kodeTiket) => request(`/laporan/detail/${kodeTiket}`),

  updateStatusLaporan: (id, payload) =>
    request(`/laporan/${id}/status`, { method: "PATCH", body: payload }),

  // --- 3. Riwayat Chat Konsultasi ---
  getChatHistory: (kodeTiket) => request(`/chat/${kodeTiket}`),
};