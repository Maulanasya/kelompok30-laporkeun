import { getToken, clearUser } from "../utils/auth";

const API_BASE_URL = "http://localhost:5001/api";

// Pembungkus fetch: otomatis kirim token, dukung JSON dan FormData,
// dan keluarkan pengguna kalau server menolak token (401).
async function request(path, { method = "GET", body, auth = true, redirectOn401 = true } = {}) {
  const headers = {};
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (body instanceof FormData) {
    payload = body; // browser mengisi Content-Type + boundary sendiri
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { method, headers, body: payload });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && token && redirectOn401) {
    clearUser();
    window.location.assign("/login");
  }
  if (!res.ok && !data.error) {
    data.error = data.message || "Permintaan gagal.";
  }
  return data;
}

export const api = {
  // 1. Autentikasi
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

  // Lupa password (3 langkah)
  forgotPassword: (email) =>
    request("/auth/forgot-password", {
      method: "POST",
      body: { email },
      auth: false,
      redirectOn401: false,
    }),

  verifyCode: (email, code) =>
    request("/auth/verify-code", {
      method: "POST",
      body: { email, code },
      auth: false,
      redirectOn401: false,
    }),

  resetPassword: (resetToken, password) =>
    request("/auth/reset-password", {
      method: "POST",
      body: { resetToken, password },
      auth: false,
      redirectOn401: false,
    }),

  // 2. Laporan
  // laporanData boleh berupa FormData (dengan file bukti di field "bukti") atau objek biasa
  kirimLaporan: (laporanData) =>
    request("/laporan", { method: "POST", body: laporanData }),

  getLaporanByTiket: (kodeTiket) =>
    request(`/laporan/tiket/${kodeTiket}`, { auth: false }),

  getLaporanSaya: () => request("/laporan/saya"),

  // Khusus guru BK
  getAllLaporan: () => request("/laporan"),
  getDetailLaporan: (kodeTiket) => request(`/laporan/detail/${kodeTiket}`),
  updateStatusLaporan: (id, payload) =>
    request(`/laporan/${id}/status`, { method: "PATCH", body: payload }),

  // 3. Riwayat Chat Konsultasi
  getChatHistory: (kodeTiket) => request(`/chat/${kodeTiket}`),
};