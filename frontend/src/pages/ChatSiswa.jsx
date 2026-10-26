import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, MessageCircleOff, Loader2 } from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import BlurText from "../components/reactbits/BlurText";
import ShinyText from "../components/reactbits/ShinyText";
import ChatWorkspace from "../components/chat/ChatWorkspace";
import { api } from "../services/api";

const COLOR_TERTIARY = "#3191A0";

function Panel({ children, className = "" }) {
  return (
    <div className={`rounded-3xl border border-slate-200 bg-white shadow-lg shadow-cyan-900/10 ${className}`}>
      {children}
    </div>
  );
}

export default function ChatSiswa() {
  const [searchParams] = useSearchParams();

  const urlKodeTiket = searchParams.get("kode");
  const urlLawan = searchParams.get("lawan"); // "BK" atau "PSIKOLOG"

  const [initialTicket, setInitialTicket] = useState(urlKodeTiket);
  const [loading, setLoading] = useState(!urlKodeTiket);
  const [error, setError] = useState(null);
  const [noSession, setNoSession] = useState(false);

  const [lawanTitle, setLawanTitle] = useState(
    urlLawan === "PSIKOLOG" ? "Konseling dengan Psikolog" : "Konsultasi dengan Guru BK"
  );

  useEffect(() => {
    if (urlKodeTiket) {
      setInitialTicket(urlKodeTiket);
      setLawanTitle(
        urlLawan === "PSIKOLOG" ? "Konseling dengan Psikolog" : "Konsultasi dengan Guru BK"
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    api.getLaporanSaya()
      .then((res) => {
        const list = res?.data || [];
        const target = list.find((l) => l.status === "DITINJAU" || l.status === "PROSES");

        if (target) {
          setInitialTicket(target.kodeTiket);
          setLawanTitle(
            target.status === "DITINJAU" ? "Konsultasi dengan Guru BK" : "Konseling dengan Psikolog"
          );
        } else {
          setNoSession(true);
        }
      })
      .catch((err) => setError(err.message || "Gagal memuat data laporan."))
      .finally(() => setLoading(false));
  }, [urlKodeTiket, urlLawan]);

  return (
    <div
      className="flex min-h-screen flex-col overflow-x-hidden bg-[#F4F9F9] text-slate-800 selection:bg-cyan-100"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif" }}
    >
      <Navbar />

      <main className="relative flex-1 overflow-hidden pb-16 pt-28 md:pb-24 md:pt-32">
        <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-130 w-130 rounded-full bg-tertiary/15 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 right-0 h-115 w-115 rounded-full bg-[#E9C46A]/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="mb-8 max-w-2xl space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-white/80 px-4 py-1.5 text-xs font-medium">
                <Lock size={13} color={COLOR_TERTIARY} />
                <ShinyText text="Percakapan dijaga kerahasiaannya" speed={4} />
              </span>

              <BlurText
                text={lawanTitle}
                delay={90}
                className="flex-wrap text-3xl font-bold leading-[1.15] text-primary md:text-4xl"
              />
              <p className="leading-relaxed text-slate-600">Konsultasikan masalahmu secara aman dan rahasia.</p>
            </div>
          </motion.div>

          {loading ? (
            <Panel className="flex h-125 flex-col items-center justify-center text-slate-500 gap-3">
              <Loader2 size={32} className="animate-spin text-tertiary" />
              <p className="text-sm">Memuat ruang chat...</p>
            </Panel>
          ) : error ? (
            <Panel className="flex h-125 flex-col items-center justify-center text-red-500">
              <p className="font-semibold text-sm">{error}</p>
            </Panel>
          ) : noSession ? (
            <Panel className="flex h-125 flex-col items-center justify-center text-center p-6">
              <div className="mb-6 flex justify-center text-slate-300">
                <MessageCircleOff size={80} strokeWidth={1.5} />
              </div>
              <h2 className="mb-3 text-xl font-bold text-primary">Belum Ada Sesi Konseling</h2>
              <p className="text-sm leading-relaxed text-slate-500 max-w-md">
                Saat ini belum ada laporan yang sedang ditinjau atau diproses.
                Silakan buat laporan terlebih dahulu atau tunggu Guru BK meninjau laporanmu.
              </p>
            </Panel>
          ) : (
            /* Tampilan 2 Kolom (Panel Daftar Percakapan & Panel Ruang Chat) */
            <ChatWorkspace
              initialTicket={initialTicket}
              bannerText="Lihat riwayat status laporan ini?"
              bannerLabel="Buka riwayat laporan"
              reportLink={(ticket) => `/riwayat-laporan?kode=${ticket}`}
              emptyText="Belum ada percakapan konseling."
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}