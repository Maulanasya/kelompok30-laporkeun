import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Copy, Check, MessageCircle, Home, FileSearch, Info } from "lucide-react";

// Components
import AuthHeader from "../components/layout/AuthHeader";
import BlurText from "../components/reactbits/BlurText";

// Assets
import { images } from "../assets";

// --- Design Tokens (sama dengan LandingPage, LoginPage, RegisterPage & ForgotPasswordPage) ---
const COLOR_PRIMARY = "#0F4C5C";
const COLOR_TERTIARY = "#1597A8";
const ANIMATION_EASE = [0.22, 1, 0.36, 1];

// --- Static Data ---
const STATUS_STEPS = [
  { label: "Laporan diterima", desc: "Laporan telah diterima dan menunggu proses peninjauan oleh tim terkait." },
  { label: "Sedang ditinjau", desc: "Konselor sedang menilai tingkat risiko laporanmu." },
  { label: "Dalam proses tindak lanjut", desc: "Tim sedang menjalankan langkah penanganan dan pendampingan." },
  { label: "Selesai", desc: "Laporanmu telah selesai ditangani." },
];

export default function SuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Kode tiket dikirim dari halaman form laporan lewat navigate("/laporan-berhasil", { state: { ticket } })
  const ticket = location.state?.ticket || "TICK-2026-X9A";
  const currentStatus = 0; // index pada STATUS_STEPS (nanti bisa diambil dari backend)

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ticket);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard bisa saja diblokir browser; abaikan saja
    }
  };

  const handleWhatsApp = () => {
    const link = `${window.location.origin}/lacak?kode=${encodeURIComponent(ticket)}`;
    const text = `Kode tiket laporan LaporKeun! saya: ${ticket}\nPantau perkembangannya di: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
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
              src={images?.success}
              alt="Ilustrasi laporan berhasil dikirim"
              className="w-full max-w-xl mx-auto object-contain"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Kartu Sukses */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: ANIMATION_EASE }}
            className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto rounded-3xl bg-white border border-slate-200 p-8 md:p-10 shadow-xl shadow-cyan-900/10"
          >
            {/* Judul */}
            <div className="space-y-2 mb-8">
              <BlurText
                text="Laporan berhasil dikirim"
                delay={90}
                className="text-3xl md:text-4xl font-bold leading-[1.15] flex-wrap text-[#0F4C5C]"
              />
              <p className="text-sm text-slate-600 leading-relaxed">
                Laporanmu sudah kami terima. Simpan kode tiket berikut untuk memantau
                perkembangannya.
              </p>
            </div>

            {/* Kode Tiket */}
            <div className="space-y-2">
              <label
                htmlFor="ticket"
                className="block text-sm font-semibold"
                style={{ color: COLOR_PRIMARY }}
              >
                Kode tiket kamu
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="ticket"
                  type="text"
                  readOnly
                  value={`#${ticket}`}
                  onFocus={(e) => e.target.select()}
                  className="min-w-0 flex-1 rounded-full bg-[#F4F9F9] border border-slate-200 px-5 py-3.5 text-sm font-semibold tracking-wide outline-none transition focus:border-[#1597A8] focus:ring-4 focus:ring-cyan-100"
                  style={{ color: COLOR_PRIMARY }}
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="shrink-0 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/15 transition hover:-translate-y-0.5 hover:brightness-95 cursor-pointer"
                  style={{ background: COLOR_PRIMARY }}
                >
                  {copied ? (
                    <>
                      <Check size={16} /> Tersalin
                    </>
                  ) : (
                    <>
                      <Copy size={16} /> Salin
                    </>
                  )}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleWhatsApp}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/15 transition hover:-translate-y-0.5 hover:brightness-110 cursor-pointer"
              style={{ background: COLOR_TERTIARY }}
            >
              <MessageCircle size={17} /> Kirim link akses via WhatsApp
            </button>

            {/* Status Laporan */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h2 className="text-sm font-semibold mb-5" style={{ color: COLOR_PRIMARY }}>
                Status laporan
              </h2>

              <ol className="space-y-0">
                {STATUS_STEPS.map((step, index) => {
                  const isDone = index < currentStatus;
                  const isActive = index === currentStatus;
                  const isLast = index === STATUS_STEPS.length - 1;

                  return (
                    <li key={step.label} className="relative flex items-start gap-4 pb-6 last:pb-0">
                      {/* Garis penghubung */}
                      {!isLast && (
                        <span
                          aria-hidden="true"
                          className="absolute left-2.5 top-6 -bottom-0 w-0.5 -translate-x-1/2"
                          style={{ background: isDone ? COLOR_TERTIARY : "#E2E8F0" }}
                        />
                      )}

                      {/* Penanda */}
                      <span
                        aria-hidden="true"
                        className="relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 bg-white"
                        style={{
                          borderColor: isDone || isActive ? COLOR_TERTIARY : "#CBD5E1",
                          background: isDone ? COLOR_TERTIARY : "#fff",
                        }}
                      >
                        {isDone && <Check size={11} className="text-white" strokeWidth={3} />}
                        {isActive && (
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ background: COLOR_PRIMARY }}
                          />
                        )}
                      </span>

                      <span
                        className={`text-sm leading-snug ${
                          isActive ? "font-semibold" : isDone ? "font-medium" : "text-slate-400"
                        }`}
                        style={isActive || isDone ? { color: COLOR_PRIMARY } : undefined}
                        aria-current={isActive ? "step" : undefined}
                      >
                        {step.label}
                      </span>
                    </li>
                  );
                })}
              </ol>

              {/* Status saat ini */}
              <div
                role="status"
                className="mt-6 flex items-start gap-2 rounded-2xl bg-[#F4F9F9] border border-slate-200 px-4 py-3 text-xs text-slate-600 leading-relaxed"
              >
                <Info size={15} className="mt-0.5 shrink-0" style={{ color: COLOR_TERTIARY }} />
                <p>
                  <span className="font-semibold" style={{ color: COLOR_PRIMARY }}>
                    Status saat ini:
                  </span>{" "}
                  {STATUS_STEPS[currentStatus].desc}
                </p>
              </div>
            </div>

            {/* Aksi */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold transition hover:border-[#1597A8]"
                style={{ color: COLOR_PRIMARY }}
              >
                <Home size={16} /> Kembali ke beranda
              </Link>
              <button
                type="button"
                onClick={() => navigate(`/lacak?kode=${encodeURIComponent(ticket)}`)}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/15 transition hover:-translate-y-0.5 hover:brightness-95 cursor-pointer"
                style={{ background: COLOR_PRIMARY }}
              >
                <FileSearch size={16} /> Lihat detail
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}