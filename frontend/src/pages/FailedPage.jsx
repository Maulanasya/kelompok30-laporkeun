import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { AlertCircle, Home, RotateCcw, ShieldCheck } from "lucide-react";

// Components
import AuthHeader from "../components/layout/AuthHeader";
import BlurText from "../components/reactbits/BlurText";

// Assets
import { images } from "../assets";

// --- Design Tokens (sama dengan LandingPage, LoginPage, RegisterPage, ForgotPasswordPage & SuccessPage) ---
const COLOR_PRIMARY = "#0F4C5C";
const COLOR_TERTIARY = "#1597A8";
const ANIMATION_EASE = [0.22, 1, 0.36, 1];

const DEFAULT_MESSAGE =
  "Terjadi gangguan pada sistem. Silakan coba kembali beberapa saat lagi.";

export default function FailedPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Dikirim dari halaman form laporan:
  // navigate("/laporan-gagal", { state: { message: err.message, retryPath: "/form-laporan" } })
  const message = location.state?.message || DEFAULT_MESSAGE;
  const retryPath = location.state?.retryPath;

  const handleRetry = () => {
    if (retryPath) navigate(retryPath);
    else navigate(-1);
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
              src={images?.failed}
              alt="Ilustrasi laporan gagal dikirim"
              className="w-full max-w-xl mx-auto object-contain"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Kartu Gagal */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: ANIMATION_EASE }}
            className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto rounded-3xl bg-white border border-slate-200 p-8 md:p-10 shadow-xl shadow-cyan-900/10"
          >
            <div className="space-y-2 mb-8">
              <BlurText
                text="Laporan gagal dikirim"
                delay={90}
                className="text-3xl md:text-4xl font-bold leading-[1.15] flex-wrap text-primary"
              />
              <p className="text-sm text-slate-600 leading-relaxed">
                Laporanmu belum berhasil dikirim. Jangan khawatir, data yang kamu isi belum
                berhasil diproses.
              </p>
            </div>

            {/* Penyebab */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold" style={{ color: COLOR_PRIMARY }}>
                Penyebab
              </h2>
              <div
                role="alert"
                className="flex items-start gap-2 rounded-2xl bg-red-50 border border-dashed border-red-300 px-4 py-3.5 text-sm text-red-700 leading-relaxed"
              >
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {message}
              </div>
            </div>

            {/* Info privasi */}
            <p className="mt-5 flex items-start gap-2 text-xs font-medium text-slate-500 leading-relaxed">
              <ShieldCheck
                size={14}
                color={COLOR_TERTIARY}
                className="mt-0.5 shrink-0"
              />
              Identitas dan datamu tetap dijaga kerahasiaannya. Kamu bisa mencoba kirim ulang
              kapan saja.
            </p>

            {/* Aksi */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold transition hover:border-tertiary"
                style={{ color: COLOR_PRIMARY }}
              >
                <Home size={16} /> Kembali ke beranda
              </Link>
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/15 transition hover:-translate-y-0.5 hover:brightness-95 cursor-pointer"
                style={{ background: COLOR_PRIMARY }}
              >
                <RotateCcw size={16} /> Coba lagi
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}