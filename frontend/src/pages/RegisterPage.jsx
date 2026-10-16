import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Eye,
  EyeOff,
  IdCard,
  User,
  Mail,
  GraduationCap,
  Lock,
  UserPlus,
  AlertCircle,
  Loader2,
} from "lucide-react";

// Components
import AuthHeader from "../components/layout/AuthHeader";
import BlurText from "../components/reactbits/BlurText";
import Select from "../components/ui/Select";

// Assets
import { images } from "../assets";

// --- Design Tokens ---
const COLOR_PRIMARY = "#0F4C5C";
const COLOR_TERTIARY = "#1597A8";
const ANIMATION_EASE = [0.22, 1, 0.36, 1];

// --- Form Constants ---
const NISN_LENGTH = 10;
const MIN_PASSWORD = 8;

const KELAS_GROUPS = [
  { label: "Kelas X", options: ["X-1", "X-2", "X-3"] },
  { label: "Kelas XI", options: ["XI-1", "XI-2", "XI-3"] },
  { label: "Kelas XII", options: ["XII-1", "XII-2", "XII-3"] },
];

const INITIAL_FORM = {
  nisn: "",
  nama: "",
  email: "",
  kelas: "",
  password: "",
};

// Helper Reusable Field Wrapper
const Field = ({ id, label, icon: Icon, error, children }) => (
  <div className="space-y-2">
    <label
      htmlFor={id}
      className="block text-sm font-semibold"
      style={{ color: COLOR_PRIMARY }}
    >
      {label}
    </label>
    <div className="relative">
      <Icon
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
      {children}
    </div>
    {error && (
      <p id={`${id}-error`} className="text-xs text-red-600 pl-4">
        {error}
      </p>
    )}
  </div>
);

export default function RegisterPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // Sanitasi & pembatasan input NISN (hanya angka)
  const handleChange = (e) => {
    const { name, value } = e.target;
    const next =
      name === "nisn" ? value.replace(/\D/g, "").slice(0, NISN_LENGTH) : value;

    setForm((prev) => ({ ...prev, [name]: next }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  // Validasi form lokal
  const validate = () => {
    const e = {};

    if (!form.nisn) {
      e.nisn = "NISN wajib diisi.";
    } else if (form.nisn.length !== NISN_LENGTH) {
      e.nisn = `NISN terdiri dari ${NISN_LENGTH} angka.`;
    }

    if (!form.nama.trim()) {
      e.nama = "Nama lengkap wajib diisi.";
    }

    if (!form.email) {
      e.email = "Email wajib diisi.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      e.email = "Format email belum benar.";
    }

    if (!form.kelas) {
      e.kelas = "Pilih kelasmu.";
    }

    if (!form.password) {
      e.password = "Password wajib diisi.";
    } else if (form.password.length < MIN_PASSWORD) {
      e.password = `Password minimal ${MIN_PASSWORD} karakter.`;
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError("");

    try {
      // TODO: Hubungkan ke endpoint API autentikasi / register
      await new Promise((r) => setTimeout(r, 800));
    } catch (err) {
      setServerError(
        err.message || "Gagal mendaftar. Coba lagi sebentar lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError, extra = "") =>
    `w-full rounded-full bg-white border pl-12 pr-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#1597A8] focus:ring-4 focus:ring-cyan-100 ${
      hasError ? "border-red-400" : "border-slate-200"
    } ${extra}`;

  // Helper Reusable Field Wrapper
  const Field = ({ id, label, icon: Icon, error, children }) => (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-semibold"
        style={{ color: COLOR_PRIMARY }}
      >
        {label}
      </label>
      <div className="relative">
        <Icon
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        {children}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-600 pl-4">
          {error}
        </p>
      )}
    </div>
  );

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
              src={images?.register}
              alt="Ilustrasi membuat akun LaporKeun!"
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
                text="Buat akun baru"
                delay={90}
                className="text-3xl md:text-4xl font-bold leading-[1.15] flex-wrap text-[#0F4C5C]"
              />
              <p className="text-sm text-slate-600 leading-relaxed">
                Daftar untuk menyimpan riwayat laporan dan menjadwalkan
                konseling.
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
              <Field id="nisn" label="NISN" icon={IdCard} error={errors.nisn}>
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
              </Field>

              {/* Nama Field */}
              <Field id="nama" label="Nama" icon={User} error={errors.nama}>
                <input
                  id="nama"
                  name="nama"
                  type="text"
                  autoComplete="name"
                  value={form.nama}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                  aria-invalid={!!errors.nama}
                  aria-describedby={errors.nama ? "nama-error" : undefined}
                  className={inputClass(errors.nama)}
                />
              </Field>

              {/* Email Field */}
              <Field id="email" label="Email" icon={Mail} error={errors.email}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Masukkan email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={inputClass(errors.email)}
                />
              </Field>

              {/* Kelas Field */}
              <div className="space-y-2">
                <label
                  htmlFor="kelas"
                  className="block text-sm font-semibold"
                  style={{ color: COLOR_PRIMARY }}
                >
                  Kelas
                </label>
                <Select
                  id="kelas"
                  name="kelas"
                  value={form.kelas}
                  onChange={handleChange}
                  groups={KELAS_GROUPS}
                  placeholder="Pilih kelas"
                  icon={GraduationCap}
                  invalid={!!errors.kelas}
                  describedBy={errors.kelas ? "kelas-error" : undefined}
                />
                {errors.kelas && (
                  <p id="kelas-error" className="text-xs text-red-600 pl-4">
                    {errors.kelas}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <Field
                id="password"
                label="Password"
                icon={Lock}
                error={errors.password}
              >
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={`Minimal ${MIN_PASSWORD} karakter`}
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  className={inputClass(errors.password, "pr-12")}
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
              </Field>

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
                    <UserPlus size={17} /> Daftar
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Sudah punya akun?{" "}
              <Link
                to="/login"
                className="font-semibold transition hover:underline"
                style={{ color: COLOR_PRIMARY }}
              >
                Masuk di sini
              </Link>
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}