import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Eye,
  EyeOff,
  IdCard,
  Lock,
  LogIn,
  AlertCircle,
  Loader2,
} from "lucide-react";

// Components
import AuthHeader from "../components/layout/AuthHeader";
import BlurText from "../components/reactbits/BlurText";

// Context, Utils & Assets
import { useAuth } from "../context/AuthContext";
import { getUser, saveUser } from "../utils/auth";
import { images } from "../assets";

// --- Design Tokens ---
const COLOR_PRIMARY = "#0F4C5C";
const COLOR_TERTIARY = "#1597A8";
const ANIMATION_EASE = [0.22, 1, 0.36, 1];

// --- Form Constants ---
const NISN_LENGTH = 10;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

// Tujuan setelah login berdasarkan peran akun.
// Key = nilai role dari backend (enum Prisma) dalam huruf kecil.
// Path disamakan dengan menu di Navbar.jsx.
const ROLE_HOME = {
  siswa: "/",
  guru_bk: "/bk/laporan",
  psikolog: "/psikolog",
  admin: "/admin",
};

// Alias supaya variasi penulisan role tetap dikenali.
const ROLE_ALIASES = {
  bk: "guru_bk",
  gurubk: "guru_bk",
};

// Backend mengirim `role` (SISWA, GURU_BK, PSIKOLOG, ADMIN),
// sesi lama di localStorage memakai `peran`. Dua-duanya dibaca di sini.
const normalizeRole = (user) => {
  const raw = String(user?.role ?? user?.peran ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  return ROLE_ALIASES[raw] || raw;
};

const getRoleHome = (user) => ROLE_HOME[normalizeRole(user)] || "/";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const [form, setForm] = useState({
    identifier: "",
    password: "",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // Sudah login? Arahkan ke beranda sesuai perannya
  // (diletakkan setelah semua hooks agar urutan hooks tetap konsisten)
  const currentUser = getUser();
  if (currentUser) {
    return <Navigate to={getRoleHome(currentUser)} replace />;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let next = type === "checkbox" ? checked : value;

    if (name === "identifier") {
      // Spasi tidak pernah valid di NISN maupun email, jadi dibuang
      next = value.replace(/\s/g, "");

      // Kalau isinya angka semua, dianggap NISN dan dibatasi maksimal 10 digit
      if (/^\d+$/.test(next)) next = next.slice(0, NISN_LENGTH);
    }

    setForm((prev) => ({ ...prev, [name]: next }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  // Deteksi jenis identifier: "email" jika ada @, selain itu dianggap NISN
  const detectType = (value) => (value.includes("@") ? "email" : "nisn");

  // Validasi form lokal
  const validate = () => {
    const nextErrors = {};
    const id = form.identifier.trim();

    if (!id) {
      nextErrors.identifier = "NISN atau email wajib diisi.";
    } else if (detectType(id) === "email") {
      if (!EMAIL_REGEX.test(id)) {
        nextErrors.identifier = "Format email belum benar.";
      }
    } else if (!/^\d+$/.test(id)) {
      nextErrors.identifier = "NISN hanya berisi angka, atau masukkan email.";
    } else if (id.length !== NISN_LENGTH) {
      nextErrors.identifier = `NISN terdiri dari ${NISN_LENGTH} angka.`;
    }

    if (!form.password) {
      nextErrors.password = "Password wajib diisi.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError("");

    const identifier = form.identifier.trim();

    try {
      // login() dari AuthContext -> { success, user, message, field }
      const result = await login(identifier, form.password, form.remember);

      if (!result?.success) {
        // Server menyebut kolom yang salah -> tampilkan tepat di bawah kolom itu
        if (result?.field === "identifier" || result?.field === "password") {
          setErrors((prev) => ({ ...prev, [result.field]: result.message }));
        } else {
          setServerError(
            result?.message || "Gagal masuk. Coba lagi sebentar lagi."
          );
        }
        return;
      }

      // Validasi role dari server (bukan dari input user)
      const role = normalizeRole(result.user);
      if (!ROLE_HOME[role]) {
        logout(); // sesi sudah tersimpan oleh login(), batalkan
        setServerError("Peran akun tidak dikenali. Hubungi admin.");
        return;
      }

      // Simpan sesi lokal (dipakai getUser / RequireRole).
      // `peran` ikut disimpan agar RequireRole yang membaca `peran` tetap jalan.
      const user = { ...result.user, peran: role };
      saveUser(user, form.remember);

      // replace: tombol Back dari beranda tidak kembali ke halaman login
      navigate(getRoleHome(user), { replace: true });
    } catch (err) {
      setServerError(err.message || "Gagal masuk. Coba lagi sebentar lagi.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full rounded-full bg-white border pl-12 pr-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${
      hasError
        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
        : "border-slate-200 focus:border-[#1597A8] focus:ring-cyan-100"
    }`;

  return (
    <div
      className="min-h-screen flex flex-col bg-[#F4F9F9] text-slate-800 selection:bg-cyan-100 overflow-x-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
      `}</style>

      <main className="relative flex-1 flex items-center py-24 overflow-hidden">
        <AuthHeader />

        {/* Decorative Background Elements */}
        <div
          aria-hidden="true"
          className="absolute -top-40 -left-32 w-130 h-130 rounded-full bg-tertiary/15 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-40 right-0 w-115 h-115 rounded-full bg-[#E9C46A]/20 blur-3xl pointer-events-none"
        />

        <div className="relative w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          {/* Hero Illustration */}
          <div className="hidden lg:block">
            <motion.img
              src={images?.login}
              alt="Ilustrasi masuk ke akun LaporKeun!"
              className="w-full max-w-xl mx-auto object-contain"
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: ANIMATION_EASE }}
            className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto rounded-3xl bg-white border border-slate-200 p-8 md:p-10 shadow-xl shadow-cyan-900/10"
          >
            <div className="space-y-2 mb-8">
              <BlurText
                text="Selamat datang kembali!"
                delay={90}
                className="text-3xl md:text-4xl font-bold leading-[1.15] flex-wrap text-primary"
              />
              <p className="text-sm text-slate-600 leading-relaxed">
                Masuk untuk melihat riwayat laporan dan jadwal konselingmu.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {serverError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {serverError}
                </div>
              )}

              {/* NISN / Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="identifier"
                  className="block text-sm font-semibold"
                  style={{ color: COLOR_PRIMARY }}
                >
                  NISN atau Email
                </label>
                <div className="relative">
                  <IdCard
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    inputMode="email"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={form.identifier}
                    onChange={handleChange}
                    placeholder="Masukkan NISN atau email"
                    aria-invalid={!!errors.identifier}
                    aria-describedby={
                      errors.identifier ? "identifier-error" : undefined
                    }
                    className={inputClass(errors.identifier)}
                  />
                </div>
                {errors.identifier && (
                  <p
                    id="identifier-error"
                    className="text-xs text-red-600 pl-4"
                  >
                    {errors.identifier}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold"
                  style={{ color: COLOR_PRIMARY }}
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Masukkan password"
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                    className={`${inputClass(errors.password)} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-tertiary transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-xs text-red-600 pl-4">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between gap-4 text-sm">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none text-slate-600">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-slate-300 accent-tertiary cursor-pointer"
                  />
                  Ingat saya
                </label>
                <Link
                  to="/lupa-password"
                  className="font-semibold transition hover:underline"
                  style={{ color: COLOR_TERTIARY }}
                >
                  Lupa password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/15 transition hover:-translate-y-0.5 hover:brightness-95 disabled:opacity-70 disabled:hover:translate-y-0 cursor-pointer disabled:cursor-not-allowed"
                style={{ background: COLOR_PRIMARY }}
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" /> Memproses...
                  </>
                ) : (
                  <>
                    <LogIn size={17} /> Masuk
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Belum punya akun?{" "}
              <Link
                to="/register"
                className="font-semibold transition hover:underline"
                style={{ color: COLOR_PRIMARY }}
              >
                Daftar di sini
              </Link>
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}