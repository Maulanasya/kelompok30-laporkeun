// Helper sesi (user + token JWT disimpan bersama).
// "Ingat saya" dicentang -> localStorage (bertahan), tidak -> sessionStorage (hilang saat tab ditutup).
const USER_KEY = "user";
const TOKEN_KEY = "token";

const read = (key) => {
  try {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

export const getToken = () => read(TOKEN_KEY);

// User dianggap login hanya jika token juga ada.
export const getUser = () => {
  try {
    if (!getToken()) return null;
    const raw = read(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Hapus sesi sepenuhnya (user dan token, di kedua storage)
export const clearUser = () => {
  [localStorage, sessionStorage].forEach((store) => {
    store.removeItem(USER_KEY);
    store.removeItem(TOKEN_KEY);
  });
};

export const saveSession = (user, token, remember = false) => {
  clearUser();
  const store = remember ? localStorage : sessionStorage;
  store.setItem(USER_KEY, JSON.stringify(user));
  if (token) store.setItem(TOKEN_KEY, token);
};

// Perbarui data user di storage yang sama dengan token (dipakai setelah cek /auth/me)
export const updateUser = (user) => {
  const store = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
  store.setItem(USER_KEY, JSON.stringify(user));
};

// Kompatibilitas dengan kode lama
export const saveUser = (user, remember = false) =>
  saveSession(user, getToken(), remember);