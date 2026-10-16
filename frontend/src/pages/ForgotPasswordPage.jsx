import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Mail, ArrowRight, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";

// Components
import AuthHeader from "../components/layout/AuthHeader";
import BlurText from "../components/reactbits/BlurText";
import StepIndicator from "../components/ui/StepIndicator";

// Assets
import { images } from "../assets";

// --- Design Tokens (sama dengan LandingPage, LoginPage & RegisterPage) ---
const COLOR_PRIMARY = "#0F4C5C";
const COLOR_TERTIARY = "#1597A8";
const ANIMATION_EASE = [0.22, 1, 0.36, 1];

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError("");
    setServerError("");
  };

  const validate = () => {
    if (!email.trim()) {
      setError("Email wajib diisi.");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Format email belum benar.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError("");
    try {
      // TODO: sambungkan ke endpoint backend (kirim kode verifikasi ke email)
      // const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email: email.trim() }),
      // });
      // if (!res.ok) throw new Error((await res.json()).message || "Gagal mengirim kode.");
      await new Promise((r) => setTimeout(r, 800));

      // Bawa email ke halaman verifikasi
      navigate("/verifikasi-kode", { state: { email: email.trim() } });
    } catch (err) {
      setServerError(err.message || "Gagal mengirim kode. Coba lagi sebentar lagi.");
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
          className="absolute -top-40 -left-32 w-130 h-130 rounded-full bg-[#1597A8]/15 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-40 right-0 w-115 h-115 rounded-full bg-accent/20 blur-3xl pointer-events-none"
        />

        <div className="relative w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          {/* Ilustrasi */}
          <div className="hidden lg:block">
            <motion.img
              src={images?.forgotpassword}
              alt="Ilustrasi lupa password"
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
                text="Lupa kata sandi Anda?"
                delay={90}
                className="text-3xl md:text-4xl font-bold leading-[1.15] flex-wrap text-[#0F4C5C]"
              />
              <p className="text-sm text-slate-600 leading-relaxed">
                Masukkan email yang kamu pakai saat mendaftar. Kami akan mengirimkan kode
                verifikasi untuk membuat sandi baru.
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

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold" style={{ color: COLOR_PRIMARY }}>
                  Email
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="Masukkan email"
                    aria-invalid={!!error}
                    aria-describedby={error ? "email-error" : undefined}
                    className={`w-full rounded-full bg-white border pl-12 pr-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#1597A8] focus:ring-4 focus:ring-cyan-100 ${
                      error ? "border-red-400" : "border-slate-200"
                    }`}
                  />
                </div>
                {error && (
                  <p id="email-error" className="text-xs text-red-600 pl-4">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/15 transition hover:-translate-y-0.5 hover:brightness-95 disabled:opacity-70 disabled:hover:translate-y-0 cursor-pointer disabled:cursor-not-allowed"
                style={{ background: COLOR_PRIMARY }}
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" /> Mengirim kode...
                  </>
                ) : (
                  <>
                    Lanjut <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8">
              <StepIndicator current={1} total={3} />
            </div>

            <p className="mt-6 text-center text-sm text-slate-600">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 font-semibold transition hover:underline"
                style={{ color: COLOR_TERTIARY }}
              >
                <ArrowLeft size={15} /> Kembali ke login
              </Link>
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}