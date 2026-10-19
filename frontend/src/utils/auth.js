// Helper sesi sederhana.
// "Ingat saya" dicentang -> localStorage (bertahan), tidak -> sessionStorage (hilang saat tab ditutup).
const KEY = "user";

export const getUser = () => {
  try {
    const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveUser = (user, remember = false) => {
  clearUser();
  (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(user));
};

export const clearUser = () => {
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
};