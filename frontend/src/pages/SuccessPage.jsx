import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Copy, Check, Home, FileSearch, Info, MessageCircle, Loader2 } from "lucide-react";

// Components
import AuthHeader from "../components/layout/AuthHeader";
import BlurText from "../components/reactbits/BlurText";

// Assets
import { images } from "../assets";
import { api } from "../services/api"; // <-- Import API

// --- Design Tokens ---
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

  const ticket = location.state?.ticket || "TICK-2026-X9A";
  const currentStatus = 0;

  const [copied, setCopied] = useState(false);

  // State untuk kirim WA
  const [waNumber, setWaNumber] = useState("");
  const [loadingWa, setLoadingWa] = useState(false);
  const [waStatus, setWaStatus] = useState({ type: "", message: "" });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ticket);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard bisa saja diblokir browser; abaikan saja
    }
  };

  const handleLacak = () => {
    navigate(`/riwayat-laporan?kode=${encodeURIComponent(ticket)}`);
  };

  const handleKirimWa = async (e) => {
    e.preventDefault();
    if (!waNumber.trim()) return;

    setLoadingWa(true);
    setWaStatus({ type: "", message: "" });

    try {
      await api.request(`/laporan/${ticket}/kirim-wa`, {
        method: "POST",
        body: { noWhatsapp: waNumber.trim() },
        auth: false, // Nggak butuh login
      });
      setWaStatus({ type: "success", message: "Kode tiket berhasil dikirim ke WhatsApp!" });
      setWaNumber(""); // Reset input
    } catch (err) {
      setWaStatus({ type: "error", message: err.message || "Gagal mengirim WA." });
    } finally {
      setLoadingWa(false);
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

        <div aria-hidden="true" className="absolute -top-40 -left-32 w-130 h-130 rounded-full bg-tertiary/15 blur-3xl pointer-events-none" />
        <div aria-hidden="true" className="absolute -bottom-40 right-0 w-115 h-115 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          <div className="hidden lg:block">
            <motion.img
              src={images?.success}
              alt="Ilustrasi laporan berhasil dikirim"
              className="w-full max-w-xl mx-auto object-contain"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: ANIMATION_EASE }}
            className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto rounded-3xl bg-white border border-slate-200 p-8 md:p-10 shadow-xl shadow-cyan-900/10"
          >
            <div className="space-y-2 mb-8">
              <BlurText
                text="Laporan berhasil dikirim"
                delay={90}
                className="text-3xl md:text-4xl font-bold leading-[1.15] flex-wrap text-primary"
              />
              <p className="text-sm text-slate-600 leading-relaxed">
                Laporanmu sudah kami terima. Simpan kode tiket berikut untuk memantau
                perkembangannya.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="ticket" className="block text-sm font-semibold" style={{ color: COLOR_PRIMARY }}>
                Kode tiket kamu
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="ticket"
                  type="text"
                  readOnly
                  value={`#${ticket}`}
                  onFocus={(e) => e.target.select()}
                  className="min-w-0 flex-1 rounded-full bg-[#F4F9F9] border border-slate-200 px-5 py-3.5 text-sm font-semibold tracking-wide outline-none transition focus:border-tertiary focus:ring-4 focus:ring-cyan-100"
                  style={{ color: COLOR_PRIMARY }}
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="shrink-0 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/15 transition hover:-translate-y-0.5 hover:brightness-95 cursor-pointer"
                  style={{ background: COLOR_PRIMARY }}
                >
                  {copied ? <><Check size={16} /> Tersalin</> : <><Copy size={16} /> Salin</>}
                </button>
              </div>
            </div>

            {/* FORM KIRIM WA (BARU) */}
            <form onSubmit={handleKirimWa} className="mt-4 space-y-2 rounded-2xl border border-slate-200 p-4 bg-[#F4F9F9]">
              <label htmlFor="wa" className="block text-xs font-semibold text-primary">
                Belum isi WA? Kirim kode tiket ini ke WhatsApp kamu:
              </label>
              <div className="flex gap-2">
                <input
                  id="wa"
                  type="tel"
                  value={waNumber}
                  onChange={(e) => setWaNumber(e.target.value)}
                  placeholder="Contoh: 08123456789"
                  className="min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-tertiary"
                />
                <button
                  type="submit"
                  disabled={loadingWa || !waNumber.trim()}
                  className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-full bg-tertiary px-5 py-2 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                  style={{ background: COLOR_TERTIARY }}
                >
                  {loadingWa ? <Loader2 size={14} className="animate-spin" /> : <MessageCircle size={14} />}
                  {loadingWa ? "Mengirim..." : "Kirim"}
                </button>
              </div>
              {waStatus.message && (
                <p className={`text-xs ${waStatus.type === "error" ? "text-red-500" : "text-emerald-600"}`}>
                  {waStatus.message}
                </p>
              )}
            </form>

            {/* TOMBOL LACAK LAPORAN */}
            <button
              type="button"
              onClick={handleLacak}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/15 transition hover:-translate-y-0.5 hover:brightness-110 cursor-pointer"
              style={{ background: COLOR_TERTIARY }}
            >
              <FileSearch size={17} /> Lacak Status Laporan
            </button>

            <div className="mt-8 pt-8 border-t border-slate-200">
              <h2 className="text-sm font-semibold mb-5" style={{ color: COLOR_PRIMARY }}>Status laporan</h2>
              <ol className="space-y-0">
                {STATUS_STEPS.map((step, index) => {
                  const isDone = index < currentStatus;
                  const isActive = index === currentStatus;
                  const isLast = index === STATUS_STEPS.length - 1;
                  return (
                    <li key={step.label} className="relative flex items-start gap-4 pb-6 last:pb-0">
                      {!isLast && (
                        <span aria-hidden="true" className="absolute left-2.5 top-6 bottom-0 w-0.5 -translate-x-1/2" style={{ background: isDone ? COLOR_TERTIARY : "#E2E8F0" }} />
                      )}
                      <span aria-hidden="true" className="relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 bg-white" style={{ borderColor: isDone || isActive ? COLOR_TERTIARY : "#CBD5E1", background: isDone ? COLOR_TERTIARY : "#fff" }}>
                        {isDone && <Check size={11} className="text-white" strokeWidth={3} />}
                        {isActive && <span className="h-2 w-2 rounded-full" style={{ background: COLOR_PRIMARY }} />}
                      </span>
                      <span className={`text-sm leading-snug ${isActive ? "font-semibold" : isDone ? "font-medium" : "text-slate-400"}`} style={isActive || isDone ? { color: COLOR_PRIMARY } : undefined} aria-current={isActive ? "step" : undefined}>
                        {step.label}
                      </span>
                    </li>
                  );
                })}
              </ol>
              <div role="status" className="mt-6 flex items-start gap-2 rounded-2xl bg-[#F4F9F9] border border-slate-200 px-4 py-3 text-xs text-slate-600 leading-relaxed">
                <Info size={15} className="mt-0.5 shrink-0" style={{ color: COLOR_TERTIARY }} />
                <p><span className="font-semibold" style={{ color: COLOR_PRIMARY }}>Status saat ini:</span> {STATUS_STEPS[currentStatus].desc}</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Link to="/" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold transition hover:border-tertiary" style={{ color: COLOR_PRIMARY }}>
                <Home size={16} /> Kembali ke beranda
              </Link>
              <button type="button" onClick={() => navigate("/riwayat-laporan", { state: { ticket } })} className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/15 transition hover:-translate-y-0.5 hover:brightness-95 cursor-pointer" style={{ background: COLOR_PRIMARY }}>
                <FileSearch size={16} /> Lihat detail
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}