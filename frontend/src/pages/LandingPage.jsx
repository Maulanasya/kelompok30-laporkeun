import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  Lock,
  UserCheck,
  FileText,
  ArrowRight,
  MessageSquare,
  Eye,
  ShieldCheck,
  Phone,
  Plus,
  KeyRound,
  Search,
  HeartHandshake,
} from "lucide-react";

// Components
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ShinyText from "../components/reactbits/ShinyText";
import BlurText from "../components/reactbits/BlurText";
import CountUp from "../components/reactbits/CountUp";
import SpotlightCard from "../components/reactbits/SpotlightCard";

// Assets
import { images } from "../assets";

// --- Design Tokens ---
const COLOR_PRIMARY = "#023346";
const COLOR_TERTIARY = "#3191A0";
const ANIMATION_EASE = [0.22, 1, 0.36, 1];

// --- Static Data ---
const FEATURES = [
  {
    icon: Shield,
    title: "Lapor tanpa nama",
    desc: "Ceritakan kejadiannya tanpa membuka identitasmu. Kamu yang memilih: anonim penuh atau terverifikasi.",
  },
  {
    icon: MessageSquare,
    title: "Ngobrol dengan psikolog",
    desc: "Konselor profesional siap mendengarkan, kapan pun kamu merasa perlu bicara.",
  },
  {
    icon: FileText,
    title: "Pantau laporanmu",
    desc: "Cek status laporan dengan kode tiket. Tidak perlu login atau mendaftar.",
  },
  {
    icon: UserCheck,
    title: "Ruang pribadimu",
    desc: "Simpan riwayat laporan, jadwal konseling, dan bahan bacaan di satu tempat.",
  },
];

const SECURITY_ITEMS = [
  {
    icon: Lock,
    title: "Data terenkripsi",
    desc: "Laporan dan lampiranmu dienkripsi sebelum disimpan.",
  },
  {
    icon: Eye,
    title: "Identitas tersembunyi",
    desc: "Nama dan akunmu tidak terlihat oleh siapa pun di sekolah.",
  },
  {
    icon: ShieldCheck,
    title: "Akses terbatas",
    desc: "Hanya konselor dan tim penanganan yang bisa membaca laporanmu.",
  },
  {
    icon: KeyRound,
    title: "Kamu pegang kodenya",
    desc: "Hanya pemilik kode tiket yang bisa melihat perkembangan laporan.",
  },
];

const WORKFLOW_STEPS = [
  {
    t: "Ceritakan kejadiannya",
    d: "Tulis kronologi dan lampirkan bukti kalau ada. Boleh tanpa nama.",
  },
  {
    t: "Simpan kode tiketmu",
    d: "Kode unik muncul setelah laporan terkirim. Ini kunci untuk memantau laporan.",
  },
  {
    t: "Tim meninjau",
    d: "Konselor menilai tingkat risiko dan menentukan langkah penanganan.",
  },
  {
    t: "Lihat tindak lanjutnya",
    d: "Kamu menerima kabar terbaru, rekomendasi konseling, dan pendampingan.",
  },
];

const ARTICLES = [
  {
    cat: "Cyberbullying",
    title: "Mengenali tanda-tanda cyberbullying dan cara menghadapinya",
    desc: "Pelajari cara menjaga batasan digital dan mendokumentasikan bukti dengan aman.",
    date: "12 Maret 2025",
  },
  {
    cat: "Kesehatan mental",
    title: "Menjaga kesehatan mental di tengah tekanan sekolah",
    desc: "Teknik pernapasan, manajemen stres, dan kapan saatnya meminta bantuan ahli.",
    date: "12 Oktober 2025",
  },
  {
    cat: "Hak siswa",
    title: "Hak perlindungan hukum siswa: panduan praktis",
    desc: "Aturan yang menjamin kamu berhak belajar tanpa intimidasi.",
    date: "3 Maret 2026",
  },
];

const FAQS = [
  {
    q: "Apakah laporan saya benar-benar anonim?",
    a: "Ya. Kamu bisa melapor tanpa nama. Identitasmu tidak dibagikan ke pihak sekolah, dan data laporan dienkripsi.",
  },
  {
    q: "Bagaimana cara melacak laporan saya?",
    a: "Masukkan kode tiket di kolom pelacakan pada halaman beranda. Tidak perlu login.",
  },
  {
    q: "Berapa lama sampai konselor merespons?",
    a: "Laporan masuk ditinjau secepatnya. Untuk kasus mendesak, gunakan tombol bantuan darurat.",
  },
  {
    q: "Apakah LaporKeun! berbayar?",
    a: "Tidak. Layanan ini gratis untuk semua siswa.",
  },
  {
    q: "Bukti apa yang bisa saya lampirkan?",
    a: "Tangkapan layar, foto, atau dokumen pendukung kronologi kejadian.",
  },
];

const STATS = [
  { to: 15000, suffix: "+", label: "laporan tertangani", sep: "." },
  { to: 24, suffix: " jam", label: "layanan darurat siaga", sep: "" },
  { to: 100, suffix: "%", label: "gratis untuk siswa", sep: "" },
];

export default function LandingPage() {
  const [ticket, setTicket] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  // Redireksi ke halaman pelacakan laporan berdasarkan kode tiket
  const handleTrackSubmit = (e) => {
    e.preventDefault();
    const trimmedTicket = ticket.trim();
    if (!trimmedTicket) return;

    window.location.href = `/lacak?kode=${encodeURIComponent(trimmedTicket)}`;
  };

  const toggleFaq = (index) => {
    setOpenFaq((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#F4F9F9] text-slate-800 selection:bg-cyan-100 overflow-x-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif" }}
    >
      {/* Dynamic Font & Smooth Scroll Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        html { scroll-behavior: smooth; }
        section[id] { scroll-margin-top: 64px; }
      `}</style>

      <Navbar />

      {/* ================= HERO SECTION ================= */}
      <section
        id="beranda"
        className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden"
      >
        {/* Background Decorative Blurs */}
        <div
          aria-hidden="true"
          className="absolute -top-40 -left-32 w-130 h-130 rounded-full bg-tertiary/15 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-40 right-0 w-115 h-115 rounded-full bg-accent/20 blur-3xl pointer-events-none"
        />

        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-cyan-100 px-4 py-1.5 text-xs font-medium">
              <Lock size={13} color={COLOR_TERTIARY} />
              <ShinyText text="Gratis, rahasia, dan bisa tanpa nama" speed={4} />
            </span>

            <BlurText
              text="Kamu tidak harus menghadapinya sendirian"
              delay={90}
              className="text-4xl md:text-5xl lg:text-[3.4rem] font-bold leading-[1.12] flex-wrap text-primary"
            />

            <p className="text-slate-600 leading-relaxed max-w-xl">
              LaporKeun! adalah tempat aman untuk melaporkan perundungan di
              sekolah. Ceritamu dienkripsi, identitasmu terlindungi, dan
              konselor profesional siap mendampingi.
            </p>

            {/* Form Pelacakan Tiket */}
            <form
              onSubmit={handleTrackSubmit}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl rounded-3xl sm:rounded-full bg-white p-2 border border-slate-200 shadow-xl shadow-cyan-900/10 transition focus-within:border-tertiary focus-within:ring-4 focus-within:ring-cyan-100"
            >
              <label htmlFor="ticket" className="sr-only">
                Kode tiket laporan
              </label>
              <div className="flex items-center gap-3 px-4 w-full">
                <Search size={18} className="text-slate-400 shrink-0" />
                <input
                  id="ticket"
                  value={ticket}
                  onChange={(e) => setTicket(e.target.value)}
                  placeholder="Masukkan ID / kode tiket laporanmu"
                  className="w-full py-2 text-sm outline-none bg-transparent placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 shrink-0 rounded-full px-7 py-3 text-sm font-semibold text-white transition hover:brightness-110 cursor-pointer"
                style={{ background: COLOR_TERTIARY }}
              >
                Cari <ArrowRight size={16} />
              </button>
            </form>

            <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Lock size={14} color={COLOR_TERTIARY} className="shrink-0" />
              Identitas dan datamu dijaga kerahasiaannya. Kamu bisa melapor
              tanpa nama.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href="/form-laporan"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/15 transition hover:-translate-y-0.5 hover:brightness-95"
                style={{ background: COLOR_PRIMARY }}
              >
                <HeartHandshake size={17} /> Buat laporan
              </a>
              <a
                href="#cara-kerja"
                className="inline-flex items-center rounded-full border border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold transition hover:border-tertiary"
                style={{ color: COLOR_PRIMARY }}
              >
                Lihat cara kerjanya
              </a>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="relative">
            <motion.img
              src={images?.hero}
              alt="Tiga siswa saling mendukung"
              className="w-full max-w-lg mx-auto object-contain"
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>

        {/* Counter Stats */}
        <div className="relative max-w-4xl mx-auto px-6 mt-16 grid grid-cols-3 gap-4 text-center">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div
                className="text-3xl md:text-4xl font-bold"
                style={{ color: COLOR_PRIMARY }}
              >
                <CountUp to={stat.to} separator={stat.sep} duration={2} />
                {stat.suffix}
              </div>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FITUR SECTION ================= */}
      <section id="fitur" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-14 space-y-3">
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ color: COLOR_PRIMARY }}
            >
              Semua yang kamu butuhkan, di satu tempat
            </h2>
            <p className="text-slate-600">
              Dari melapor sampai pulih, setiap langkah dirancang agar kamu
              merasa aman dan didengar.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <SpotlightCard
                key={title}
                spotlightColor="rgba(21,151,168,0.18)"
                className="bg-[#F4F9F9] border-slate-200"
              >
                <div
                  className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-5"
                  style={{ color: COLOR_TERTIARY }}
                >
                  <Icon size={22} />
                </div>
                <h3
                  className="font-semibold mb-2"
                  style={{ color: COLOR_PRIMARY }}
                >
                  {title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* ================= KEAMANAN SECTION ================= */}
      <section
        id="keamanan"
        className="relative py-24 text-white overflow-hidden"
        style={{ background: COLOR_PRIMARY }}
      >
        <div
          aria-hidden="true"
          className="absolute -top-32 right-0 w-120 h-120 rounded-full bg-tertiary/25 blur-3xl pointer-events-none"
        />

        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-[0.8fr_1.2fr] gap-14 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Privasimu adalah yang pertama kami jaga
            </h2>
            <p className="text-slate-300 leading-relaxed">
              Kami tahu melapor itu tidak mudah. Karena itu, sistem ini dibuat
              agar hanya kamu yang menentukan siapa yang tahu.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {SECURITY_ITEMS.map(({ icon: Icon, title, desc }) => (
              <SpotlightCard
                key={title}
                spotlightColor="rgba(233,196,106,0.2)"
                className="bg-white/5 border-white/10"
              >
                <Icon size={22} className="text-accent mb-3" />
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{desc}</p>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CARA KERJA SECTION ================= */}
      <section id="cara-kerja" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
          <img
            src={images?.carakerja}
            alt="Ilustrasi proses pelaporan"
            className="w-full max-w-lg mx-auto object-contain"
          />

          <div>
            <h2
              className="text-3xl md:text-4xl font-bold mb-10"
              style={{ color: COLOR_PRIMARY }}
            >
              Empat langkah, tanpa ribet
            </h2>
            <ol className="relative space-y-8 border-l-2 border-cyan-100 ml-4">
              {WORKFLOW_STEPS.map((step, index) => (
                <li key={step.t} className="pl-8 relative">
                  <span
                    className="absolute -left-4.25 top-0 w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center ring-4 ring-white"
                    style={{ background: COLOR_PRIMARY }}
                  >
                    {index + 1}
                  </span>
                  <h3
                    className="font-semibold"
                    style={{ color: COLOR_PRIMARY }}
                  >
                    {step.t}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mt-1 max-w-md">
                    {step.d}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ================= ARTIKEL SECTION ================= */}
      <section id="artikel" className="py-24 bg-[#F4F9F9]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-12 space-y-3">
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ color: COLOR_PRIMARY }}
            >
              Bacaan yang membantumu tenang
            </h2>
            <p className="text-slate-600">
              Panduan singkat untuk memahami dan melewati situasi sulit.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {ARTICLES.map((article) => (
              <a
                key={article.title}
                href="#"
                className="group rounded-3xl bg-white border border-slate-200 p-7 flex flex-col gap-3 transition hover:shadow-xl hover:shadow-cyan-900/10 hover:-translate-y-1"
              >
                <span className="self-start rounded-full bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1">
                  {article.cat}
                </span>
                <h3
                  className="font-bold leading-snug"
                  style={{ color: COLOR_PRIMARY }}
                >
                  {article.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed flex-1">
                  {article.desc}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                  {article.date}
                  <ArrowRight
                    size={15}
                    style={{ color: COLOR_TERTIARY }}
                    className="transition group-hover:translate-x-1"
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BANTUAN DARURAT BANNER ================= */}
      <section className="px-6 pb-20 bg-[#F4F9F9]">
        <div className="max-w-7xl mx-auto rounded-3xl bg-linear-to-br from-[#FFF6E0] to-[#FDEBC0] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold" style={{ color: COLOR_PRIMARY }}>
              Butuh bantuan sekarang?
            </h3>
            <p className="text-sm text-slate-700 mt-1 max-w-xl">
              Kalau kamu atau temanmu dalam situasi berbahaya, hubungi tim
              siaga darurat kami. mereka siap membantu setiap saat.
            </p>
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white whitespace-nowrap transition hover:brightness-110"
            style={{ background: COLOR_PRIMARY }}
          >
            <Phone size={16} /> Hubungi bantuan darurat
          </a>
        </div>
      </section>

      {/* ================= FAQ SECTION ================= */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2
            className="text-3xl md:text-4xl font-bold mb-10 text-center"
            style={{ color: COLOR_PRIMARY }}
          >
            Pertanyaan yang sering diajukan
          </h2>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl bg-[#F4F9F9] border border-slate-200 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left text-sm font-semibold cursor-pointer"
                    style={{ color: COLOR_PRIMARY }}
                  >
                    {faq.q}
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      className="shrink-0"
                      style={{ color: COLOR_TERTIARY }}
                    >
                      <Plus size={18} />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: ANIMATION_EASE }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 text-sm text-slate-600 leading-relaxed">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= CALL TO ACTION ================= */}
      <section className="px-6 pb-20 bg-white">
        <div
          className="relative max-w-7xl mx-auto overflow-hidden rounded-3xl px-8 py-16 text-center text-white"
          style={{ background: COLOR_PRIMARY }}
        >
          <div
            aria-hidden="true"
            className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-130 h-65 rounded-full bg-tertiary/40 blur-3xl pointer-events-none"
          />
          <div className="relative space-y-5">
            <h2 className="text-3xl md:text-4xl font-bold">
              Suaramu berharga. Kami siap mendengarkan.
            </h2>
            <p className="text-slate-300 text-sm max-w-xl mx-auto">
              Gratis, rahasia, dan bisa tanpa nama. Mulai kapan pun kamu siap.
            </p>
            <a
              href="/form-laporan"
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110"
              style={{ background: COLOR_TERTIARY }}
            >
              Buat laporan sekarang <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}