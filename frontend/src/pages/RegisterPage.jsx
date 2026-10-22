import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

import AuthHeader from "../components/layout/AuthHeader";
import BlurText from "../components/reactbits/BlurText";
import Select from "../components/ui/Select";

import { useAuth } from "../context/AuthContext";
import { images } from "../assets";

const COLOR_PRIMARY = "#0F4C5C";
const COLOR_TERTIARY = "#1597A8";
const ANIMATION_EASE = [0.22, 1, 0.36, 1];

const NISN_LENGTH = 10;
const MIN_PASSWORD = 8;

const FIELD_ORDER = ["nisn", "nama", "email", "kelas", "password"];

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

// Helper Field Wrapper (Didefinisikan di luar komponen utama)
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
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
      />
      {children}
    </div>
    {error && (
      <p id={`${id}-error`} className="pl-4 text-xs text-red-600">
        {error}
      </p>
    )}
  </div>
);

const inputClass = (hasError, extra = "") =>
  `w-full rounded-full bg-white border pl-12 pr-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-slate-200 focus:border-[#1597A8] focus:ring-cyan-100"
  } ${extra}`;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next =
      name === "nisn" ? value.replace(/\D/g, "").slice(0, NISN_LENGTH) : value;

    setForm((prev) => ({ ...prev, [name]: next }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError("");

    try {
      const result = await register({
        nisn: form.nisn,
        nama: form.nama.trim(),
        email: form.email.trim(),
        kelas: form.kelas,
        password: form.password,
      });

      if (!result?.success) {
        const fromServer =
          result?.errors ??
          (result?.field ? { [result.field]: result.message } : {});

        const fieldErrors = {};
        FIELD_ORDER.forEach((key) => {
          if (fromServer[key]) fieldErrors[key] = fromServer[key];
        });

        const firstField = FIELD_ORDER.find((key) => fieldErrors[key]);
        if (firstField) {
          setErrors((prev) => ({ ...prev, ...fieldErrors }));
          document.getElementById(firstField)?.focus();
        } else {
          setServerError(
            result?.message || "Gagal mendaftar. Coba lagi sebentar lagi."
          );
        }
        return;
      }

      navigate("/login", { replace: true });
    } catch (err) {
      setServerError(err.message || "Gagal mendaftar. Coba lagi sebentar lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen flex-col overflow-x-hidden bg-[#F4F9F9] text-slate-800 selection:bg-cyan-100"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
      `}</style>

      <main className="relative flex flex-1 items-center overflow-hidden py-24">
        <AuthHeader />

        {/* Decorative Background Elements */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 -top-40 h-130 w-130 rounded-full bg-tertiary/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 right-0 h-115 w-115 rounded-full bg-accent/20 blur-3xl"
        />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Hero Illustration */}
          <div className="hidden lg:block">
            <motion.img
              src={images?.register}
              alt="Ilustrasi membuat akun LaporKeun!"
              className="mx-auto w-full max-w-xl object-contain"
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
            className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-cyan-900/10 lg:mx-0 lg:ml-auto md:p-10"
          >
            <div className="mb-8 space-y-2">
              <BlurText
                text="Buat akun baru"
                delay={90}
                className="flex-wrap text-3xl font-bold leading-[1.15] text-primary md:text-4xl"
              />
              <p className="text-sm leading-relaxed text-slate-600">
                Daftar untuk menyimpan riwayat laporan dan menjadwalkan
                konseling.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {serverError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
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
                  <p id="kelas-error" className="pl-4 text-xs text-red-600">
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 transition hover:text-tertiary"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </Field>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/15 transition hover:-translate-y-0.5 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
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