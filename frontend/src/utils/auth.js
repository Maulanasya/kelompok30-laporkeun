// utils/auth.js

const USER_KEY = "user";
const TOKEN_KEY = "token";

/**
 * Storage yang sedang aktif = storage tempat token berada.
 * localStorage didahulukan (login dengan "Ingat saya"), lalu sessionStorage.
 */
const getActiveStore = () => {
  try {
    if (localStorage.getItem(TOKEN_KEY)) return localStorage;
    if (sessionStorage.getItem(TOKEN_KEY)) return sessionStorage;
  } catch {
    /* storage tidak tersedia */
  }
  return null;
};

/**
 * Mengambil JWT Token dari storage yang aktif
 */
export const getToken = () => {
  const store = getActiveStore();
  return store ? store.getItem(TOKEN_KEY) : null;
};

/**
 * Mengambil data User dari storage yang SAMA dengan token.
 * Sebelumnya user dibaca dari localStorage lebih dulu walau token ada di
 * sessionStorage, sehingga sisa data lama di localStorage bisa menutupi data
 * terbaru dan membuat profil terlihat "reset".
 */
export const getUser = () => {
  try {
    const store = getActiveStore();
    if (!store) return null;
    const raw = store.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Menghapus sesi sepenuhnya dari localStorage dan sessionStorage
 */
export const clearUser = () => {
  [localStorage, sessionStorage].forEach((store) => {
    try {
      store.removeItem(USER_KEY);
      store.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error("Gagal menghapus storage:", e);
    }
  });
};

/**
 * Menyimpan sesi baru saat login
 * @param {Object} user - Data pengguna
 * @param {string} token - JWT Token
 * @param {boolean} remember - Jika true simpan di localStorage, jika false di sessionStorage
 */
export const saveSession = (user, token, remember = false) => {
  clearUser();
  const store = remember ? localStorage : sessionStorage;
  store.setItem(USER_KEY, JSON.stringify(user));
  if (token) store.setItem(TOKEN_KEY, token);
};

/**
 * Memperbarui data user di storage yang aktif (sesuai posisi token),
 * dan membuang salinan user lama di storage lainnya agar tidak saling menimpa.
 */
export const updateUser = (user) => {
  const store = getActiveStore();
  if (!store) return;

  store.setItem(USER_KEY, JSON.stringify(user));

  const other = store === localStorage ? sessionStorage : localStorage;
  try {
    other.removeItem(USER_KEY);
  } catch {
    /* abaikan */
  }
};

/**
 * Kompatibilitas dengan fungsi lama
 */
export const saveUser = (user, remember = false) =>
  saveSession(user, getToken(), remember);