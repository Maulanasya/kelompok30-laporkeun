import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useScroll,
  useSpring,
} from "motion/react";
import { Menu, X, User, LogOut, ArrowRight } from "lucide-react";

import ShinyText from "../reactbits/ShinyText";
import StarBorder from "../reactbits/StarBorder";
import { clearUser, getUser } from "../../utils/auth";
import logo from "../../assets/logo.png";

// Menu navigasi untuk pengguna terautentikasi (siswa)
const LOGGED_IN_LINKS = [
  { key: "beranda", to: "/", label: "Beranda" },
  { key: "form-laporan", to: "/form-laporan", label: "Form Laporan" },
  { key: "riwayat-laporan", to: "/riwayat-laporan", label: "Riwayat Laporan" },
  { key: "chat-psikolog", to: "/chat-psikolog", label: "Chat Psikolog" },
];

// Menu navigasi khusus untuk peran guru BK
const BK_LINKS = [
  { key: "bk-laporan", to: "/bk/laporan", label: "Laporan Masuk" },
  { key: "bk-konsultasi", to: "/bk/konsultasi", label: "Konsultasi" },
];

// Menu navigasi berbasis section untuk pengunjung (guest)
const GUEST_LINKS = [
  { id: "beranda", label: "Beranda" },
  { id: "fitur", label: "Fitur" },
  { id: "keamanan", label: "Keamanan" },
  { id: "cara-kerja", label: "Cara Kerja" },
  { id: "artikel", label: "Artikel" },
  { id: "faq", label: "FAQ" },
].map((link) => ({
  ...link,
  key: link.id,
  to: { pathname: "/", hash: `#${link.id}` },
}));

const SPRING_TRANSITION = { type: "spring", stiffness: 380, damping: 30 };
const EASE_OUT_TRANSITION = [0.16, 1, 0.3, 1];
const NAVBAR_OFFSET = 88;

// Mengambil data peran pengguna aktif
const getRole = () => {
  const user = getUser();
  return user?.role ?? user?.peran ?? null;
};

// Fungsi pembantu scroll ke posisi paling atas
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.documentElement.scrollTo?.({ top: 0, behavior: "smooth" });
  document.body.scrollTo?.({ top: 0, behavior: "smooth" });
};

// Memposisikan layar ke section target dengan memperhitungkan tinggi navbar
const scrollToSection = (id) => {
  if (id === "beranda") {
    scrollToTop();
    return;
  }

  const el = document.getElementById(id);
  if (!el) {
    console.warn(`[Navbar] Section id="${id}" tidak ditemukan di halaman.`);
    return;
  }

  el.style.scrollMarginTop = `${NAVBAR_OFFSET}px`;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
};

function DesktopNavLink({ link, isActive, isHovered, onHover, onLeave, onClick }) {
  return (
    <Link
      to={link.to}
      onClick={onClick}
      onMouseEnter={onHover}
      onFocus={onHover}
      onBlur={onLeave}
      aria-current={isActive ? "page" : undefined}
      className={`relative px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors duration-300 ${
        isActive ? "text-white" : "text-primary/75 hover:text-primary"
      }`}
    >
      {isHovered && !isActive && (
        <motion.span
          layoutId="nav-hover"
          transition={SPRING_TRANSITION}
          className="absolute inset-0 rounded-full bg-white shadow-sm"
        />
      )}
      {isActive && (
        <motion.span
          layoutId="nav-active"
          transition={SPRING_TRANSITION}
          className="absolute inset-0 rounded-full bg-linear-to-b from-[#0E5566] to-primary shadow-md shadow-primary/25"
        />
      )}
      <span className="relative z-10">{link.label}</span>
    </Link>
  );
}

function MobileNavLink({ link, isActive, index, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{
        opacity: 1,
        x: 0,
        transition: {
          duration: 0.35,
          delay: index * 0.04,
          ease: EASE_OUT_TRANSITION,
        },
      }}
    >
      <Link
        to={link.to}
        onClick={onClick}
        className={`relative block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors duration-300 touch-manipulation ${
          isActive
            ? "bg-primary text-white"
            : "text-primary/80 hover:bg-primary-light/50"
        }`}
      >
        {link.label}
      </Link>
    </motion.div>
  );
}

function OutlineButton({ label, onClick, mobile = false }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      className={`text-xs font-bold text-primary border border-primary/15 bg-white/80 hover:border-tertiary/50 hover:text-tertiary cursor-pointer transition-colors duration-300 touch-manipulation ${
        mobile ? "w-full px-4 py-3 rounded-xl" : "px-5 py-2.5 rounded-full"
      }`}
    >
      {label}
    </motion.button>
  );
}

function CtaButton({ label, onClick, mobile = false }) {
  return (
    <StarBorder
      onClick={onClick}
      type="button"
      color="#E9C46A"
      speed="5s"
      className={`cursor-pointer shadow-lg shadow-tertiary/25 transition-transform duration-300 hover:-translate-y-0.5 active:scale-[0.97] touch-manipulation ${
        mobile ? "w-full rounded-xl!" : ""
      }`}
      innerClassName={`bg-gradient-to-b from-[#3A9FAF] to-[#2C8390] text-white text-xs font-bold px-5 py-2.5 ${
        mobile ? "!rounded-xl" : ""
      }`}
    >
      {label}
      <ArrowRight size={15} />
    </StarBorder>
  );
}

export default function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(getUser()));
  const [role, setRole] = useState(getRole);
  const [activeSection, setActiveSection] = useState("beranda");

  const location = useLocation();
  const navigate = useNavigate();
  const closeBtnRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  const isBk = isLoggedIn && role === "guru_bk";
  const links = !isLoggedIn ? GUEST_LINKS : isBk ? BK_LINKS : LOGGED_IN_LINKS;
  const isHome = location.pathname === "/";

  // Perbarui status otentikasi saat rute berubah
  useEffect(() => {
    setIsLoggedIn(Boolean(getUser()));
    setRole(getRole());
  }, [location.pathname]);

  // Pantau posisi scroll untuk mengubah tampilan visual navbar
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 25);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer untuk mendeteksi section aktif pada landing page
  useEffect(() => {
    if (!isHome || isLoggedIn) return;
    const elements = GUEST_LINKS.map((l) => document.getElementById(l.id)).filter(Boolean);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-35% 0px -60% 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isHome, isLoggedIn]);

  // Menangani penavigasian langsung ke hash URL dari luar halaman
  useEffect(() => {
    if (!isHome || !location.hash) return;
    const targetId = location.hash.slice(1);

    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (targetId === "beranda" || document.getElementById(targetId)) {
        scrollToSection(targetId);
        clearInterval(timer);
      } else if (attempts >= 10) {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [isHome, location.hash]);

  // Navigasi keyboard Escape untuk modal konfirmasi keluar
  useEffect(() => {
    if (!showLogoutConfirm) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowLogoutConfirm(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLogoutConfirm]);

  // Tutup menu seluler otomatis saat jalur URL berubah
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    clearUser();
    setIsLoggedIn(false);
    setRole(null);
    setShowLogoutConfirm(false);
    navigate("/");
  };

  // Menangani klik menu navigasi dan perpindahan posisi layar
  const handleLinkClick = (e, link) => {
    setIsMobileOpen(false);

    if (!isHome) return;

    const targetId = link.id || (link.to === "/" ? "beranda" : null);

    if (targetId) {
      e.preventDefault();
      setActiveSection(targetId);

      setTimeout(() => {
        scrollToSection(targetId);
      }, 50);
    }
  };

  // Pengecekan item navigasi mana yang sedang aktif
  const isLinkActive = (link) => {
    if (link.id) return isHome && activeSection === link.id;
    return link.to === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(link.to);
  };

  return (
    <MotionConfig reducedMotion="user">
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE_OUT_TRANSITION }}
        className="fixed top-0 left-0 right-0 z-50 pt-3 px-4 md:px-8 pointer-events-none"
      >
        <div
          className={`relative mx-auto max-w-7xl pointer-events-auto rounded-2xl lg:rounded-full transition-all duration-500 border ${
            isScrolled
              ? "bg-white/80 backdrop-blur-xl border-white shadow-xl shadow-primary/10 py-2 px-4 md:px-5"
              : "bg-white/55 backdrop-blur-md border-white/60 shadow-sm py-3 px-4 md:px-6"
          }`}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-[#E9C46A]/80 to-transparent"
          />

          <div className="flex items-center justify-between gap-4">
            <Link
              to={isBk ? "/bk/laporan" : "/"}
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center gap-3 cursor-pointer shrink-0 group"
              aria-label={
                isBk
                  ? "LaporKeun! kembali ke laporan masuk"
                  : "LaporKeun! kembali ke beranda"
              }
            >
              <img
                src={logo}
                alt=""
                className="h-10 w-10 object-contain transition-transform duration-300 group-hover:-rotate-3"
              />
              <div className="text-left leading-tight">
                <div className="text-base font-extrabold tracking-tight text-primary">
                  LaporKeun<span className="text-tertiary">!</span>
                </div>
                <ShinyText
                  text={isBk ? "Ruang kerja guru BK" : "Ruang aman untuk bersuara"}
                  speed={5}
                  className="hidden sm:block text-[10px] font-medium"
                />
              </div>
            </Link>

            <nav
              aria-label="Navigasi utama"
              className="hidden lg:flex items-center gap-0.5 bg-primary/5 border border-primary/5 p-1 rounded-full"
              onMouseLeave={() => setHoveredId(null)}
            >
              {links.map((link) => (
                <DesktopNavLink
                  key={link.key}
                  link={link}
                  isActive={isLinkActive(link)}
                  isHovered={hoveredId === link.key}
                  onHover={() => setHoveredId(link.key)}
                  onLeave={() => setHoveredId(null)}
                  onClick={(e) => handleLinkClick(e, link)}
                />
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-2.5">
              {isLoggedIn ? (
                <>
                  <motion.div
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                  >
                    <Link
                      to="/profile"
                      aria-label="Akun saya"
                      title="Akun"
                      className="w-10 h-10 rounded-full border border-primary/10 bg-white text-primary flex items-center justify-center hover:text-tertiary shadow-sm cursor-pointer"
                    >
                      <User size={16} />
                    </Link>
                  </motion.div>

                  <motion.button
                    type="button"
                    aria-label="Keluar akun"
                    title="Keluar"
                    onClick={() => setShowLogoutConfirm(true)}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-secondary shadow-md cursor-pointer"
                  >
                    <LogOut size={15} />
                  </motion.button>
                </>
              ) : (
                <>
                  <OutlineButton
                    label="Masuk"
                    onClick={() => navigate("/login")}
                  />
                  <CtaButton
                    label="Daftar"
                    onClick={() => navigate("/register")}
                  />
                </>
              )}
            </div>

            <motion.button
              type="button"
              aria-label={isMobileOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={isMobileOpen}
              onClick={() => setIsMobileOpen((prev) => !prev)}
              whileTap={{ scale: 0.92 }}
              className="lg:hidden w-10 h-10 rounded-xl border border-primary/10 bg-white flex items-center justify-center text-primary shadow-sm cursor-pointer touch-manipulation"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isMobileOpen ? "close" : "open"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>

          <motion.span
            aria-hidden="true"
            style={{ scaleX: progress, originX: 0 }}
            className="pointer-events-none absolute left-8 right-8 bottom-0 h-0.5 rounded-full bg-linear-to-r from-tertiary to-[#E9C46A]"
          />
        </div>

        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -10 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: EASE_OUT_TRANSITION }}
              className="lg:hidden overflow-hidden pointer-events-auto mt-2 mx-auto max-w-7xl rounded-2xl border border-white bg-white/95 backdrop-blur-2xl shadow-xl shadow-primary/10 max-h-[80vh] overflow-y-auto"
            >
              <div className="p-5 space-y-1.5">
                {links.map((link, i) => (
                  <MobileNavLink
                    key={link.key}
                    link={link}
                    index={i}
                    isActive={isLinkActive(link)}
                    onClick={(e) => handleLinkClick(e, link)}
                  />
                ))}

                <div className="pt-3 mt-2 border-t border-primary/10 space-y-2">
                  {isLoggedIn ? (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setIsMobileOpen(false)}
                        className="w-full px-4 py-3 rounded-xl border border-primary/15 bg-white text-primary text-xs font-bold flex items-center justify-center gap-2 hover:border-tertiary/50 hover:text-tertiary transition-colors cursor-pointer touch-manipulation"
                      >
                        <User size={16} /> Akun
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileOpen(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-danger-light text-danger text-xs font-bold flex items-center justify-center gap-2 hover:bg-danger-light-hover transition-colors cursor-pointer touch-manipulation"
                      >
                        <LogOut size={16} /> Keluar
                      </button>
                    </>
                  ) : (
                    <>
                      <OutlineButton
                        mobile
                        label="Masuk"
                        onClick={() => {
                          setIsMobileOpen(false);
                          navigate("/login");
                        }}
                      />
                      <CtaButton
                        mobile
                        label="Daftar"
                        onClick={() => {
                          setIsMobileOpen(false);
                          navigate("/register");
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showLogoutConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="logout-title"
              onClick={() => setShowLogoutConfirm(false)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-darker/50 backdrop-blur-sm pointer-events-auto"
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.92, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 16 }}
                className="bg-white rounded-3xl p-7 max-w-sm w-full shadow-2xl text-center space-y-5"
              >
                <div className="w-12 h-12 bg-danger-light text-danger rounded-2xl flex items-center justify-center mx-auto">
                  <LogOut size={22} />
                </div>

                <div className="space-y-1.5">
                  <h3
                    id="logout-title"
                    className="text-base font-extrabold text-primary"
                  >
                    Keluar dari akun?
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {isBk
                      ? "Kamu perlu masuk lagi untuk meninjau laporan dan berkonsultasi dengan siswa."
                      : "Kamu perlu masuk lagi untuk mengakses laporan dan riwayat konselingmu."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    ref={closeBtnRef}
                    autoFocus
                    type="button"
                    onClick={() => setShowLogoutConfirm(false)}
                    className="py-2.5 rounded-xl border border-slate-200 text-primary text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer touch-manipulation"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="py-2.5 rounded-xl bg-danger text-white text-xs font-bold hover:bg-danger-hover transition-colors cursor-pointer touch-manipulation"
                  >
                    Ya, keluar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </MotionConfig>
  );
}