import { motion } from "motion/react";
import { Lock } from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import BlurText from "../components/reactbits/BlurText";
import ShinyText from "../components/reactbits/ShinyText";
import FormLaporan from "../components/form-laporan/FormLaporan";
import InfoSidebar from "../components/form-laporan/InfoSidebar";

// --- Design Tokens (sama dengan LandingPage) ---
const COLOR_TERTIARY = "#3191A0";
const ANIMATION_EASE = [0.22, 1, 0.36, 1];

export default function FormLaporanPage() {
  return (
    <div
      className="min-h-screen flex flex-col bg-[#F4F9F9] text-slate-800 selection:bg-cyan-100 overflow-x-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
      `}</style>

      <Navbar />

      <main className="relative flex-1 overflow-hidden pt-28 pb-16 md:pt-32 md:pb-24">
        {/* Background Decorative Blurs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -left-32 h-130 w-130 rounded-full bg-tertiary/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 right-0 h-115 w-115 rounded-full bg-[#E9C46A]/20 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-6">
          {/* Judul halaman */}
          <div className="mb-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-white/80 px-4 py-1.5 text-xs font-medium">
              <Lock size={13} color={COLOR_TERTIARY} />
              <ShinyText text="Gratis, rahasia, dan bisa tanpa nama" speed={4} />
            </span>

            <BlurText
              text="Formulir pengaduan dan pelaporan"
              delay={90}
              className="flex-wrap text-3xl font-bold leading-[1.15] text-primary md:text-4xl"
            />

            <p className="leading-relaxed text-slate-600">
              Sampaikan laporanmu dengan jujur. Identitas dan kerahasiaanmu
              dijaga, dan konselor kami siap mendampingi.
            </p>
          </div>

          {/* Layout 2 kolom */}
          <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            {/* KIRI: Form */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: ANIMATION_EASE }}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-cyan-900/10 sm:p-8"
            >
              <FormLaporan />
            </motion.div>

            {/* KANAN: Sidebar Info (ikut menempel saat scroll di layar besar) */}
            <motion.aside
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: ANIMATION_EASE }}
              className="lg:sticky lg:top-28"
            >
              <InfoSidebar />
            </motion.aside>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}