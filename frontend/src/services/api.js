import { getToken, clearUser } from "../utils/auth";

// const API_HOST = import.meta.env.VITE_SERVER_URL || "http://localhost:5001";
const API_HOST = import.meta.env.VITE_API_URL || "https://kelompok30-laporkeun-backend.vercel.app";


export const SERVER_URL = API_HOST;
export const API_BASE_URL = `${API_HOST}/api`;

const getAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const toQuery = (params) =>
  params && Object.keys(params).length
    ? `?${new URLSearchParams(params).toString()}`
    : "";

const handleUnauthorized = (res, auth) => {
  if (res.status !== 401 || !auth || !getToken()) return;
  clearUser();
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

const buildRequest = ({ method = "GET", body, auth = true }) => {
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  return {
    method,
    headers: {
      // Untuk FormData, Content-Type tidak boleh diisi manual agar browser menambahkan boundary
      ...(body && !isForm ? { "Content-Type": "application/json" } : {}),
      ...(auth ? getAuthHeader() : {}),
    },
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  };
};

const parseJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

export const api = {
  request: async (path, { method = "GET", body, auth = true } = {}) => {
    const res = await fetch(
      `${API_BASE_URL}${path}`,
      buildRequest({ method, body, auth })
    );
    const json = await parseJson(res);

    if (!res.ok) {
      handleUnauthorized(res, auth);
      throw new Error(json?.error || json?.message || "Terjadi kesalahan pada server.");
    }
    return json;
  },

  // Mengembalikan JSON respons secara langsung meskipun terjadi error server (digunakan untuk login/register)
  requestSoft: async (path, { method = "GET", body, auth = true } = {}) => {
    const res = await fetch(
      `${API_BASE_URL}${path}`,
      buildRequest({ method, body, auth })
    );
    const json = (await parseJson(res)) || {};

    if (!res.ok) {
      handleUnauthorized(res, auth);
      return {
        ...json,
        error: json.error || json.message || "Terjadi kesalahan pada server.",
        status: res.status,
      };
    }
    return json;
  },

  // ---------- Autentikasi ----------
  login: (identifier, password) =>
    api.requestSoft("/auth/login", {
      method: "POST",
      body: { identifier, password },
      auth: false,
    }),

  register: (userData) =>
    api.requestSoft("/auth/register", { method: "POST", body: userData, auth: false }),

  me: () => api.request("/auth/me"),

  forgotPassword: (email) =>
    api.requestSoft("/auth/forgot-password", { method: "POST", body: { email }, auth: false }),
  verifyCode: (data) =>
    api.requestSoft("/auth/verify-code", { method: "POST", body: data, auth: false }),
  resetPassword: (data) =>
    api.requestSoft("/auth/reset-password", { method: "POST", body: data, auth: false }),

  // ---------- Profil ----------
  getProfile: () => api.request("/profile"),
  updateProfile: (data) => api.request("/profile", { method: "PUT", body: data }),
  changePassword: (data) => api.request("/profile/password", { method: "PUT", body: data }),

  // ---------- Laporan ----------
  kirimLaporan: (data) => api.request("/laporan", { method: "POST", body: data }),
  
  getLaporanByTiket: (kodeTiket) =>
    api.request(`/laporan/tiket/${kodeTiket}`, { auth: false }),

  getDetailLaporan: (kodeTiket) =>
    api.request(`/laporan/detail/${encodeURIComponent(kodeTiket)}`),

  getLaporanSaya: () => api.request("/laporan/saya"),
  getAllLaporan: () => api.request("/laporan"),

  // ---------- Chat ----------
  getChatHistory: (kodeTiket) => api.request(`/chat/${kodeTiket}`),
  getChatList: (params) => api.request(`/chat${toQuery(params)}`),

  // ---------- AI ----------
  askAI: (message) => api.request("/ai/chat", { method: "POST", body: { message } }),

  // ---------- Artikel (publik) ----------
  getArtikelList: (limit) =>
    api.request(`/artikel${limit ? `?limit=${limit}` : ""}`, { auth: false }),
  getArtikelById: (id) => api.request(`/artikel/${id}`, { auth: false }),

  // ---------- Admin ----------
  getAdminStats: () => api.request("/admin/stats"),

  // Akun
  getAdminUsers: () => api.request("/admin/users"),
  createAdminUser: (data) => api.request("/admin/users", { method: "POST", body: data }),
  setUserActive: (id, isActive) =>
    api.request(`/admin/users/${id}/status`, { method: "PATCH", body: { isActive } }),

  // Riwayat penanganan
  getAdminRiwayat: () => api.request("/admin/riwayat"),

  // Artikel Admin
  getAdminArtikel: () => api.requestSoft("/admin/artikel"),
  createAdminArtikel: (data) =>
    api.requestSoft("/admin/artikel", { method: "POST", body: data }),
  updateAdminArtikel: (id, data) =>
    api.requestSoft(`/admin/artikel/${id}`, { method: "PUT", body: data }),
  setAdminArtikelPublished: (id, isPublished) =>
    api.requestSoft(`/admin/artikel/${id}/publish`, {
      method: "PATCH",
      body: { isPublished },
    }),
  deleteAdminArtikel: (id) =>
    api.requestSoft(`/admin/artikel/${id}`, { method: "DELETE" }),

  markChatRead: (kodeTiket) =>
    api.request(`/chat/${encodeURIComponent(kodeTiket)}/read`, {
      method: "PATCH",
    }),
};