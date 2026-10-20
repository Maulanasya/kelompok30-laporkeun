import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";
import { getUser, getToken, saveSession, updateUser, clearUser } from "../utils/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getUser());
  const [loading, setLoading] = useState(() => Boolean(getToken()));

  // Saat aplikasi dimuat: validasi token ke server dan segarkan data user (role bisa berubah).
  // Kalau token ditolak (401), api.js otomatis mengeluarkan pengguna ke /login.
  // Kalau server mati (error jaringan), sesi lokal dibiarkan.
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    let active = true;
    api
      .me()
      .then((data) => {
        if (active && data.user) {
          updateUser(data.user);
          setUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // identifier = NISN atau email. remember = simpan di localStorage (bertahan) atau sessionStorage.
  const login = async (identifier, password, remember = false) => {
    try {
      const data = await api.login(identifier, password);
      if (data.token) {
        saveSession(data.user, data.token, remember);
        setUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.error || "Login gagal", field: data.field };
    } catch (err) {
      return { success: false, message: "Terjadi kesalahan koneksi server" };
    }
  };

  const register = async (userData) => {
    try {
      const data = await api.register(userData);
      if (data.user) {
        return { success: true, message: data.message };
      }
      return {
        success: false,
        message: data.error || "Registrasi gagal",
        field: data.field,
        errors: data.errors,
      };
    } catch (err) {
      return { success: false, message: "Terjadi kesalahan koneksi server" };
    }
  };

  const logout = () => {
    clearUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);