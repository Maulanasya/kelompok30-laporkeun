import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUp, Lock, ShieldCheck, HeartHandshake } from "lucide-react";

import GradientText from "./reactbits/GradientText";

const LUXURY_EASE_TRANSITION = [0.16, 1, 0.3, 1];

const FOOTER_GROUPS = [
  {
    title: "Platform",
    links: [
      { label: "Beranda", to: "/" },
      { label: "Fitur Utama", to: "/#fitur" },
      { label: "Alur Konseling", to: "/#cara-kerja" },
      { label: "Portal Konselor", to: "#" },
    ],
  },
  {
    title: "Bantuan",
    links: [
      { label: "Pusat FAQ", to: "/#faq" },
      { label: "Panduan Darurat", to: "#" },
      { label: "Kontak Dukungan", to: "#" },
      { label: "Hotline Krisis 24/7", to: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Kebijakan Privasi", to: "#" },
      { label: "Syarat & Ketentuan", to: "#" },
      { label: "Standar Keamanan", to: "#" },
      { label: "Kode Etik Konseling", to: "#" },
    ],
  },
];

const TRUST_BADGES = [
  { icon: Lock, label: "Terenkripsi" },
  { icon: ShieldCheck, label: "Bisa anonim" },
  { icon: HeartHandshake, label: "Gratis untuk siswa" },
];

export default function Footer() {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative overflow-hidden bg-primary text-slate-300">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-32 h-105 w-105 rounded-full bg-[#1597A8]/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-20 right-24 h-80 w-[320px] rounded-full bg-[#E9C46A]/10 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-16 top-0 h-px bg-linear-to-r from-transparent via-[#E9C46A]/70 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-6 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: LUXURY_EASE_TRANSITION }}
          className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]"
        >
          <div className="space-y-5">
            <Link to="/" className="inline-flex items-center gap-3" aria-label="LaporKeun! kembali ke beranda">
              <img
                src='/assets/images/logo.svg'
                alt=""
                className="h-12 w-12 object-contain"
                style={{
                  filter:
                    "drop-shadow(0 0 1px rgba(255,255,255,0.9)) drop-shadow(0 0 14px rgba(127,211,223,0.45))",
                }}
              />
              <span className="text-xl font-extrabold text-white">
                LaporKeun<span className="text-[#E9C46A]">!</span>
              </span>
            </Link>

            <p className="text-sm font-semibold">
              <GradientText colors={["#7FD3DF", "#E9C46A", "#7FD3DF"]} animationSpeed={7}>
                Ruang aman untuk bersuara
              </GradientText>
            </p>

            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              Platform pelaporan perundungan yang aman, terenkripsi, dan anonim. Ruang perlindungan
              terpercaya untuk siswa, konselor sekolah, dan orang tua.
            </p>

            <ul className="flex flex-wrap gap-2 pt-1">
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200"
                >
                  <Icon size={13} className="text-[#E9C46A]" /> {label}
                </li>
              ))}
            </ul>
          </div>

          {FOOTER_GROUPS.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h4 className="text-sm font-semibold text-white">{group.title}</h4>
              <ul className="mt-5 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.to.startsWith("/") && !link.to.includes("#") ? (
                      <Link
                        to={link.to}
                        className="group relative inline-block text-sm text-slate-400 transition-colors hover:text-white"
                      >
                        {link.label}
                        <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-[#E9C46A] transition-transform duration-300 group-hover:scale-x-100" />
                      </Link>
                    ) : (
                      <a
                        href={link.to}
                        className="group relative inline-block text-sm text-slate-400 transition-colors hover:text-white"
                      >
                        {link.label}
                        <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-[#E9C46A] transition-transform duration-300 group-hover:scale-x-100" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </motion.div>
      </div>

      <div
        aria-hidden="true"
        className="relative select-none text-center font-extrabold leading-[0.8] whitespace-nowrap mb-[0.12em] text-[clamp(3.5rem,17vw,15rem)]"
        style={{
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent 85%)",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent 85%)",
        }}
      >
        <GradientText colors={["#1597A8", "#E9C46A", "#1597A8"]} animationSpeed={12}>
          LaporKeun!
        </GradientText>
      </div>

      <div className="relative border-t border-white/10 px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} LaporKeun!. Hak cipta dilindungi undang-undang.</span>

          <div className="flex items-center gap-4">
            <span>Privasi dijamin & terenkripsi end-to-end</span>
            <motion.button
              type="button"
              aria-label="Kembali ke atas"
              onClick={handleScrollToTop}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.92 }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:border-[#E9C46A]/60 hover:text-[#E9C46A] cursor-pointer"
            >
              <ArrowUp size={16} />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
}