import { Link, useLocation, useNavigate } from "react-router-dom";
import { MotionConfig, motion } from "motion/react";
import { ArrowLeft, Undo2 } from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import BlurText from "../components/reactbits/BlurText";
import { getUser } from "../utils/auth";
import logo from "../assets/logo.png";
import notFoundIllustration from "../assets/illustrations/notfoundpage.png";

const EASE = [0.22, 1, 0.36, 1];
const GOLD = "#B8975A";

const COPY = {
  notfound: {
    title: "Halaman tidak ditemukan",
    desc: "Alamat yang kamu tuju tidak ada atau sudah dipindahkan. Tenang, kamu tetap aman di sini.",
  },
  soon: {
    title: "Sedang kami siapkan",
    desc: "Tim kami masih menyempurnakan halaman ini. Sementara itu, kamu bisa kembali ke halaman utama.",
  },
};

// Logo dalam lingkaran putih dengan cincin emas (dipakai pada varian "soon")
function LogoMark({ className = "" }) {
  return (
    <div className={`relative shrink-0 ${className}`}>
      <motion.span
        aria-hidden="true"
        className="absolute -inset-3 rounded-full border"
        style={{ borderColor: `${GOLD}55` }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.9, 0.2, 0.9] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="relative flex h-full w-full items-center justify-center rounded-full bg-white shadow-[0_20px_50px_-20px_rgba(14,85,102,0.35)] ring-1 ring-slate-200/80"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <img src={logo} alt="" className="h-3/5 w-3/5 object-contain" />
      </motion.div>
    </div>
  );
}

export default function NotFoundPage({ variant = "notfound" }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const copy = COPY[variant] ?? COPY.notfound;

  const user = getUser();
  const isBk = (user?.peran ?? user?.role) === "guru_bk";
  const home = isBk ? "/bk/laporan" : "/";
  const homeLabel = isBk ? "Ke laporan masuk" : "Kembali ke beranda";

  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate(home));

  const fadeUp = (delay) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  });

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="min-h-screen flex flex-col bg-[#FBFAF7] text-slate-800 selection:bg-[#B8975A]/20 overflow-x-hidden"
        style={{ fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif" }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        `}</style>

        <Navbar />

        <main className="relative flex flex-1 items-center justify-center overflow-hidden pt-28 pb-16 md:pt-32 md:pb-20">
          {/* Cahaya lembut di latar */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[52%] h-152 w-152 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, rgba(49,145,160,0.13), transparent)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, rgba(184,151,90,0.14), transparent)",
            }}
          />

          <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 text-center">
            {variant !== "notfound" && (
              <motion.div {...fadeUp(0)}>
                <LogoMark className="h-24 w-24 sm:h-28 sm:w-28" />
              </motion.div>
            )}

            {/* Judul + deskripsi */}
            <div className="space-y-4">
              <h1>
                <BlurText
                  text={copy.title}
                  delay={90}
                  className="justify-center flex-wrap text-4xl font-bold leading-[1.1] tracking-tight text-primary sm:text-5xl md:text-6xl"
                />
              </h1>
              <motion.p
                {...fadeUp(0.35)}
                className="mx-auto max-w-md text-[15px] leading-relaxed text-slate-500"
              >
                {copy.desc}
              </motion.p>
            </div>

            {/* Ilustrasi (hanya untuk 404) */}
            {variant === "notfound" && (
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1, delay: 0.4, ease: EASE }}
                className="relative my-2 w-full max-w-md sm:max-w-lg"
              >
                {/* Panggung oval tipis di belakang ilustrasi */}
                <div
                  aria-hidden="true"
                  className="absolute inset-x-[4%] inset-y-[10%] rounded-[50%] border border-[#B8975A]/25 bg-white/50 shadow-[0_40px_90px_-50px_rgba(14,85,102,0.35)]"
                />
                <motion.img
                  src={notFoundIllustration}
                  alt="Ilustrasi angka 404 dengan seorang perempuan yang mengintip dari balik angka nol"
                  draggable={false}
                  className="relative h-auto w-full select-none drop-shadow-[0_24px_36px_rgba(14,85,102,0.14)]"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            )}

            {variant === "notfound" && (
              <motion.code
                {...fadeUp(0.6)}
                className="max-w-full break-all rounded-full border border-slate-200/80 bg-white/60 px-4 py-1.5 font-mono text-[11px] tracking-wide text-slate-400 backdrop-blur"
              >
                {pathname}
              </motion.code>
            )}

            {/* Aksi */}
            <motion.div
              {...fadeUp(0.7)}
              className="flex flex-wrap items-center justify-center gap-3 pt-1"
            >
              <Link
                to={home}
                className="group inline-flex items-center gap-2 rounded-full bg-linear-to-b from-[#3A9FAF] to-[#2C8390] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-tertiary/25 transition-transform duration-300 hover:-translate-y-0.5 active:scale-[0.97]"
              >
                <ArrowLeft
                  size={16}
                  className="transition-transform duration-300 group-hover:-translate-x-0.5"
                />
                {homeLabel}
              </Link>
              <button
                type="button"
                onClick={goBack}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-7 py-3.5 text-sm font-bold text-primary transition duration-300 hover:-translate-y-px hover:border-tertiary/50 hover:text-tertiary active:scale-[0.97]"
              >
                <Undo2 size={16} /> Halaman sebelumnya
              </button>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}