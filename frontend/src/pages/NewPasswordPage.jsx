import React, { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  Eye,
  EyeOff,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Circle,
} from "lucide-react";

// Components
import AuthHeader from "../components/layout/AuthHeader";
import BlurText from "../components/reactbits/BlurText";
import StepIndicator from "../components/ui/StepIndicator";

// Services & Assets
import { api } from "../services/api";
import { images } from "../assets";

// --- Design Tokens ---
const COLOR_PRIMARY = "#0F4C5C";
const COLOR_TERTIARY = "#1597A8";
const ANIMATION_EASE = [0.22, 1, 0.36, 1];

const MIN_PASSWORD = 8;

// Dibuat di luar komponen halaman supaya input tidak kehilangan fokus tiap ketikan
function PasswordField({ id, label, value, onChange, placeholder, error, autoComplete }) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold" style={{ color: COLOR_PRIMARY }}>
        {label}
      </label>
      <div className="relative">
        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          id={id}
          name={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-full bg-white border pl-12 pr-12 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
              : "border-slate-200 focus:border-tertiary focus:ring-cyan-100"
          }`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-tertiary transition cursor-pointer"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-600 pl-4">
          {error}
        </p>
      )}
    </div>
  );
}

function Rule({ ok, children }) {
  return (
    <li className={`flex items-center gap-2 text-xs transition-colors ${ok ? "text-emerald-600" : "text-slate-500"}`}>
      {ok ? <CheckCircle2 size={14} /> : <Circle size={14} />}
      {children}
    </li>
  );
}

export default function NewPasswordPage() {
  const { email, resetToken } = useLocation().state ?? {};

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [sessionEnded, setSessionEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Halaman ini hanya bisa dibuka setelah kode verifikasi benar (resetToken dari langkah 2)
  if (!resetToken && !done) return <Navigate to="/lupa-password" replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const lengthOk = form.password.length >= MIN_PASSWORD;
  const matchOk = form.confirm.length > 0 && form.password === form.confirm;

  const validate = () => {
    const e = {};
    if (!form.password) e.password = "Password wajib diisi.";
    else if (!lengthOk) e.password = `Password minimal ${MIN_PASSWORD} karakter.`;

    if (!form.confirm) e.confirm = "Konfirmasi password wajib diisi.";
    else if (form.password !== form.confirm) e.confirm = "Konfirmasi tidak sama dengan password.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError("");
    try {
      // Server memeriksa resetToken: tanpa kode yang benar, sandi tidak bisa diganti
      const result = await api.resetPassword(resetToken, form.password);

      if (result.error) {
        if (result.field === "password") {
          setErrors((prev) => ({ ...prev, password: result.error }));
        } else {
          setServerError(result.error);
          if (result.field === "token") setSessionEnded(true);
        }
        return;
      }

      setDone(true);
    } catch {
      setServerError("Terjadi kesalahan koneksi server.");
    } finally {
      setLoading(false);
    }
  };

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

        {/* Background Decorative Blurs */}
        <div
          aria-hidden="true"
          className="absolute -top-40 -left-32 w-130 h-130 rounded-full bg-tertiary/15 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-40 right-0 w-115 h-115 rounded-full bg-accent/20 blur-3xl pointer-events-none"
        />

        <div className="relative w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          {/* Ilustrasi */}
          <div className="hidden lg:block">
            <motion.img
              key={done ? "success" : "newpassword"}
              src={done ? images?.success : images?.newpassword}
              alt={done ? "Kata sandi berhasil diubah" : "Ilustrasi membuat kata sandi baru"}
              className="w-full max-w-xl mx-auto object-contain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, -10, 0] }}
              transition={{
                opacity: { duration: 0.4 },
                y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
              }}
            />
          </div>

          {/* Kartu */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: ANIMATION_EASE }}
            className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto rounded-3xl bg-white border border-slate-200 p-8 md:p-10 shadow-xl shadow-cyan-900/10"
          >
            <AnimatePresence mode="wait" initial={false}>
              {done ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: ANIMATION_EASE }}
                  className="text-center space-y-5"
                >
                  <motion.div
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 380, damping: 16, delay: 0.1 }}
                    className="mx-auto w-16 h-16 rounded-full bg-cyan-50 flex items-center justify-center"
                    style={{ color: COLOR_TERTIARY }}
                  >
                    <CheckCircle2 size={34} />
                  </motion.div>
                  <h1 className="text-2xl md:text-3xl font-bold" style={{ color: COLOR_PRIMARY }}>
                    Kata sandi berhasil diubah
                  </h1>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Sekarang kamu bisa masuk dengan kata sandi yang baru.
                  </p>
                  <Link
                    to="/login"
                    replace
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/15 transition hover:-translate-y-0.5 hover:brightness-95"
                    style={{ background: COLOR_PRIMARY }}
                  >
                    Masuk sekarang <ArrowRight size={17} />
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="space-y-2 mb-8">
                    <BlurText
                      text="Buat kata sandi baru"
                      delay={90}
                      className="text-3xl md:text-4xl font-bold leading-[1.15] flex-wrap text-primary"
                    />
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {email ? (
                        <>
                          Atur kata sandi baru untuk{" "}
                          <span className="font-semibold" style={{ color: COLOR_PRIMARY }}>
                            {email}
                          </span>
                          .
                        </>
                      ) : (
                        "Atur kata sandi baru untuk akunmu."
                      )}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    {serverError && (
                      <div
                        role="alert"
                        className="flex items-start gap-2 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
                      >
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <span>
                          {serverError}
                          {sessionEnded && (
                            <>
                              {" "}
                              <Link to="/lupa-password" replace className="font-semibold underline">
                                Mulai ulang
                              </Link>
                            </>
                          )}
                        </span>
                      </div>
                    )}

                    <PasswordField
                      id="password"
                      label="Password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Masukkan password baru"
                      error={errors.password}
                      autoComplete="new-password"
                    />

                    <PasswordField
                      id="confirm"
                      label="Konfirmasi kata sandi"
                      value={form.confirm}
                      onChange={handleChange}
                      placeholder="Ulangi password baru"
                      error={errors.confirm}
                      autoComplete="new-password"
                    />

                    <ul className="space-y-1.5 pl-1" aria-label="Syarat kata sandi">
                      <Rule ok={lengthOk}>Minimal {MIN_PASSWORD} karakter</Rule>
                      <Rule ok={matchOk}>Konfirmasi sama dengan password</Rule>
                    </ul>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/15 transition hover:-translate-y-0.5 hover:brightness-95 disabled:opacity-70 disabled:hover:translate-y-0 cursor-pointer disabled:cursor-not-allowed"
                      style={{ background: COLOR_PRIMARY }}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={17} className="animate-spin" /> Menyimpan...
                        </>
                      ) : (
                        <>
                          Simpan kata sandi <ArrowRight size={17} />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-8">
                    <StepIndicator current={3} total={3} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
}