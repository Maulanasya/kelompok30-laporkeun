import React, { useState } from "react";
import { Link } from "react-router-dom";
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

// Assets
import { images } from "../assets";

// --- Design Tokens ---
const COLOR_PRIMARY = "#0F4C5C";
const COLOR_TERTIARY = "#1597A8";
const ANIMATION_EASE = [0.22, 1, 0.36, 1];

// --- Form Constants ---
const NISN_LENGTH = 10;

export default function LoginPage() {
  const [form, setForm] = useState({ nisn: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // Sanitasi input NISN (hanya angka) & penanganan checkbox
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const next =
      name === "nisn" ? value.replace(/\D/g, "").slice(0, NISN_LENGTH) : value;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : next,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  // Validasi form lokal
  const validate = () => {
    const nextErrors = {};

    if (!form.nisn) {
      nextErrors.nisn = "NISN wajib diisi.";
    } else if (form.nisn.length !== NISN_LENGTH) {
      nextErrors.nisn = `NISN terdiri dari ${NISN_LENGTH} angka.`;
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

    try {
      // TODO: Hubungkan ke endpoint API autentikasi / login
      await new Promise((r) => setTimeout(r, 800));
    } catch (err) {
      setServerError(
        err.message || "Gagal masuk. Coba lagi sebentar lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full rounded-full bg-white border pl-12 pr-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#1597A8] focus:ring-4 focus:ring-cyan-100 ${
      hasError ? "border-red-400" : "border-slate-200"
    }`;

  return (
    <div
      className="min-h-screen flex flex-col bg-[#F4F9F9] text-slate-800 selection:bg-cyan-100 overflow-x-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
      `}</style>

      <AuthHeader />

      <main className="relative flex-1 flex items-center pt-28 pb-16 md:pt-32 md:pb-20 overflow-hidden">
        {/* Decorative Background Elements */}
        <div
          aria-hidden="true"
          className="absolute -top-40 -left-32 w-130 h-130 rounded-full bg-[#1597A8]/15 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-40 right-0 w-115 h-115 rounded-full bg-accent/20 blur-3xl pointer-events-none"
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
                className="text-3xl md:text-4xl font-bold leading-[1.15] flex-wrap text-[#0F4C5C]"
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

              {/* NISN Field */}
              <div className="space-y-2">
                <label
                  htmlFor="nisn"
                  className="block text-sm font-semibold"
                  style={{ color: COLOR_PRIMARY }}
                >
                  NISN
                </label>
                <div className="relative">
                  <IdCard
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="nisn"
                    name="nisn"
                    type="text"
                    inputMode="numeric"
                    autoComplete="username"
                    value={form.nisn}
                    onChange={handleChange}
                    placeholder="Masukkan NISN"
                    aria-invalid={!!errors.nisn}
                    aria-describedby={errors.nisn ? "nisn-error" : undefined}
                    className={inputClass(errors.nisn)}
                  />
                </div>
                {errors.nisn && (
                  <p id="nisn-error" className="text-xs text-red-600 pl-4">
                    {errors.nisn}
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
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1597A8] transition cursor-pointer"
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
                    className="w-4 h-4 rounded border-slate-300 accent-[#1597A8] cursor-pointer"
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