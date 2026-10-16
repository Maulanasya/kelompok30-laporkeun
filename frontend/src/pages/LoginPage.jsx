import React, { useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff, IdCard, Lock, LogIn, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "../assets/logo.png";

// Components
import Navbar from "../components/layout/Navbar";
import BlurText from "../components/reactbits/BlurText";

// Assets
import { images } from "../assets";

// --- Design Tokens (sama dengan LandingPage) ---
const COLOR_PRIMARY = "#0F4C5C";
const COLOR_TERTIARY = "#1597A8";
const ANIMATION_EASE = [0.22, 1, 0.36, 1];

const NISN_LENGTH = 10;

export default function LoginPage() {
  const [form, setForm] = useState({ nisn: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // NISN hanya boleh angka
    const next = name === "nisn" ? value.replace(/\D/g, "").slice(0, NISN_LENGTH) : value;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : next }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.nisn) nextErrors.nisn = "NISN wajib diisi.";
    else if (form.nisn.length !== NISN_LENGTH)
      nextErrors.nisn = `NISN terdiri dari ${NISN_LENGTH} angka.`;
    if (!form.password) nextErrors.password = "Password wajib diisi.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError("");
    try {
      await new Promise((r) => setTimeout(r, 800));
    } catch (err) {
      setServerError(err.message || "Gagal masuk. Coba lagi sebentar lagi.");
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

      {/* Header minimal */}
<header className="absolute top-0 inset-x-0 z-10">
  <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
    <Link to="/" className="flex items-center gap-2">
      <img src={logo} alt="LaporKeun!" className="h-9 w-auto" />
      <span className="font-bold text-lg" style={{ color: COLOR_PRIMARY }}>
        LaporKeun<span style={{ color: COLOR_TERTIARY }}>!</span>
      </span>
    </Link>
    <Link
      to="/"
      className="inline-flex items-center gap-2 text-sm font-semibold transition hover:underline"
      style={{ color: COLOR_PRIMARY }}
    >
      <ArrowLeft size={16} /> Kembali ke beranda
    </Link>
  </div>
</header>

      <main className="relative flex-1 flex items-center pt-28 pb-16 md:pt-32 md:pb-20 overflow-hidden">
        {/* Background Decorative Blurs */}
        <div
          aria-hidden="true"
          className="absolute -top-40 -left-32 w-130 h-130 rounded-full bg-[#1597A8]/15 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-40 right-0 w-115 h-115 rounded-full bg-[#E9C46A]/20 blur-3xl pointer-events-none"
        />

        <div className="relative w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          {/* Ilustrasi (disembunyikan di mobile agar form langsung terlihat) */}
          <div className="hidden lg:block">
            <motion.img
              src={images?.login}
              alt="Ilustrasi masuk ke akun LaporKeun!"
              className="w-full max-w-xl mx-auto object-contain"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Kartu Form */}
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

              {/* NISN */}
              <div className="space-y-2">
                <label htmlFor="nisn" className="block text-sm font-semibold" style={{ color: COLOR_PRIMARY }}>
                  NISN
                </label>
                <div className="relative">
                  <IdCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
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

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold" style={{ color: COLOR_PRIMARY }}>
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Masukkan password"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    className={`${inputClass(errors.password)} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
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

              {/* Ingat saya & Lupa password */}
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
                <a
                  href="/lupa-password"
                  className="font-semibold transition hover:underline"
                  style={{ color: COLOR_TERTIARY }}
                >
                  Lupa password?
                </a>
              </div>

              {/* Tombol Masuk */}
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
              <a
                href="/register"
                className="font-semibold transition hover:underline"
                style={{ color: COLOR_PRIMARY }}
              >
                Daftar di sini
              </a>
            </p>

          </motion.div>
        </div>
      </main>
    </div>
  );
}