import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useScroll, useSpring } from "framer-motion";
import { ArrowRight, Menu, X, User, LogOut } from "lucide-react";

// Assets & UI Components
import logoImage from "../../assets/logo.png";
import ShinyText from "../reactbits/ShinyText";
import StarBorder from "../reactbits/StarBorder";

// --- Configuration & Constants ---
const NAV_LINKS = [
  { id: "beranda", label: "Beranda" },
  { id: "fitur", label: "Fitur" },
  { id: "keamanan", label: "Keamanan" },
  { id: "cara-kerja", label: "Cara Kerja" },
  { id: "artikel", label: "Artikel" },
  { id: "faq", label: "FAQ" },
];

const LOGGED_IN_LINKS = [
  { id: "beranda", label: "Beranda", path: "/" },
  { id: "form-laporan", label: "Form Laporan", path: "/form-laporan" },
  { id: "riwayat-laporan", label: "Riwayat Laporan", path: "/riwayat-laporan" },
  { id: "chat-psikolog", label: "Chat Psikolog", path: "/chat-psikolog" },
];

const SECTION_IDS = ["fitur", "keamanan", "cara-kerja", "artikel", "faq"];

// Tinggi navbar fixed, dipakai sebagai offset saat scroll ke section
const HEADER_OFFSET = 90;

// Motion Physics Constants
const SPRING_TRANSITION = { type: "spring", stiffness: 380, damping: 30 };
const EASE_OUT_TRANSITION = [0.16, 1, 0.3, 1];

// --- Sub-Components ---

/** Item link navigasi untuk tampilan desktop dengan indikator animasi hover & aktif */
function DesktopNavLink({ label, href, isActive, isHovered, onClick, onHover, onLeave }) {
  const Tag = href ? "a" : "button";
  const tagProps = href ? { href } : { type: "button" };

  return (
    <Tag
      {...tagProps}
      onClick={onClick}
      onMouseEnter={onHover}
      onFocus={onHover}
      onBlur={onLeave}
      aria-current={isActive ? "page" : undefined}
      className={`relative px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-tertiary ${
        isActive ? "text-white" : "text-primary/75 hover:text-primary"
      }`}
    >
      {/* Background Hover Highlight */}
      {isHovered && !isActive && (
        <motion.span
          layoutId="nav-hover"
          transition={SPRING_TRANSITION}
          className="absolute inset-0 rounded-full bg-white shadow-sm"
        />
      )}

      {/* Background Active Indicator */}
      {isActive && (
        <motion.span
          layoutId="nav-active"
          transition={SPRING_TRANSITION}
          className="absolute inset-0 rounded-full bg-linear-to-b from-[#0E5566] to-primary shadow-md shadow-primary/25"
        />
      )}

      <span className="relative z-10">{label}</span>
    </Tag>
  );
}

/** Item link navigasi untuk tampilan menu mobile */
function MobileNavLink({ label, isActive, index, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, x: -16 }}
      animate={{
        opacity: 1,
        x: 0,
        transition: { duration: 0.35, delay: index * 0.04, ease: EASE_OUT_TRANSITION },
      }}
      whileTap={{ scale: 0.98 }}
      aria-current={isActive ? "page" : undefined}
      className={`relative block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors duration-300 ${
        isActive ? "bg-primary text-white" : "text-primary/80 hover:bg-primary-light/50"
      }`}
    >
      {label}
    </motion.button>
  );
}

/** Tombol standar bergaris luar (Sekunder) */
function OutlineButton({ label, onClick, mobile = false }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      className={`text-xs font-bold text-primary border border-primary/15 bg-white/80 hover:border-tertiary/50 hover:text-tertiary cursor-pointer transition-colors duration-300 ${
        mobile ? "w-full px-4 py-3 rounded-xl" : "px-5 py-2.5 rounded-full"
      }`}
    >
      {label}
    </motion.button>
  );
}

/** Tombol aksi utama (CTA) dengan efek StarBorder */
function CtaButton({ label, onClick, mobile = false }) {
  return (
    <StarBorder
      onClick={onClick}
      type="button"
      color="#E9C46A"
      speed="5s"
      className={`cursor-pointer shadow-lg shadow-tertiary/25 transition-transform duration-300 hover:-translate-y-0.5 active:scale-[0.97] ${
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

// --- Helper: Smooth Scroll ke Section (scrollTo + offset, lebih andal di mobile) ---
function scrollToSection(id) {
  if (id === "beranda") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top, behavior: "smooth" });
}

// --- Main Navbar Component ---
export default function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeId, setActiveId] = useState("beranda");
  const [hoveredId, setHoveredId] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const closeBtnRef = useRef(null);

  // Smooth Progress Bar untuk penanda Scroll Halaman
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  // Pengecekan Status Sesi User & Halaman Saat Ini
  const pathname = window.location.pathname;
  const isLoggedIn = Boolean(localStorage.getItem("user"));
  const isHomePage = pathname === "/";
  const links = isLoggedIn ? LOGGED_IN_LINKS : NAV_LINKS;

  // Menangani Efek Scroll: Perubahan Tampilan Glassmorphism & Active Section Detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);

      if (!isHomePage) return;

      let currentSection = "beranda";
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) {
          currentSection = id;
        }
      }
      setActiveId(currentSection);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  // Scroll otomatis jika halaman dibuka dengan hash (mis. /#fitur dari halaman lain)
  useEffect(() => {
    if (!isHomePage || !window.location.hash) return;
    const id = window.location.hash.slice(1);
    const t = setTimeout(() => scrollToSection(id), 300);
    return () => clearTimeout(t);
  }, [isHomePage]);

  // Accessibility: Menutup Modal Logout saat menekan tombol ESC
  useEffect(() => {
    if (!showLogoutConfirm) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowLogoutConfirm(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLogoutConfirm]);

  // Handler Navigasi Link (Bisa dipakai Desktop & Mobile)
  const handleNavClick = (link) => {
    setIsMobileOpen(false); // Selalu tutup menu mobile setelah item diklik

    if (isLoggedIn) {
      window.location.href = link.path;
      return;
    }

    // Bukan di halaman utama -> pindah dulu ke beranda dengan hash
    if (!isHomePage) {
      window.location.href = link.id === "beranda" ? "/" : `/#${link.id}`;
      return;
    }

    // Beri jeda supaya menu mobile selesai menutup sebelum scroll
    setTimeout(() => scrollToSection(link.id), 150);
  };

  // Helper Pengecekan Status Aktif Link
  const isPathActive = (path) => (path === "/" ? pathname === "/" : pathname.startsWith(path));
  const checkIsActive = (link) => (isLoggedIn ? isPathActive(link.path) : activeId === link.id);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <MotionConfig reducedMotion="user">
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE_OUT_TRANSITION }}
        className="fixed top-0 left-0 right-0 z-50 pt-3 px-4 md:px-8 pointer-events-none"
      >
        {/* Navigation Floating Bar */}
        <div
          className={`relative mx-auto max-w-7xl pointer-events-auto rounded-2xl lg:rounded-full transition-all duration-500 border ${
            isScrolled
              ? "bg-white/80 backdrop-blur-xl border-white shadow-xl shadow-primary/10 py-2 px-4 md:px-5"
              : "bg-white/55 backdrop-blur-md border-white/60 shadow-sm py-3 px-4 md:px-6"
          }`}
        >
          {/* Accent Line Border */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-[#E9C46A]/80 to-transparent"
          />

          <div className="flex items-center justify-between gap-4">
            {/* Brand Logo */}
            <motion.button
              type="button"
              onClick={() => {
                setIsMobileOpen(false);
                if (isHomePage) {
                  scrollToSection("beranda");
                } else {
                  window.location.href = "/";
                }
              }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 cursor-pointer shrink-0 group"
              aria-label="LaporKeun! kembali ke beranda"
            >
              <img
                src={logoImage}
                alt=""
                className="h-10 w-10 object-contain transition-transform duration-300 group-hover:-rotate-3"
              />
              <div className="text-left leading-tight">
                <div className="text-base font-extrabold tracking-tight text-primary">
                  LaporKeun<span className="text-tertiary">!</span>
                </div>
                <ShinyText text="Ruang aman untuk bersuara" speed={5} className="text-[10px] font-medium" />
              </div>
            </motion.button>

            {/* Desktop Navigation */}
            <nav
              aria-label="Navigasi utama"
              className="hidden lg:flex items-center gap-0.5 bg-primary/5 border border-primary/5 p-1 rounded-full"
              onMouseLeave={() => setHoveredId(null)}
            >
              {links.map((link) => (
                <DesktopNavLink
                  key={link.id}
                  label={link.label}
                  href={isLoggedIn ? link.path : undefined}
                  isActive={checkIsActive(link)}
                  isHovered={hoveredId === link.id}
                  onClick={() => handleNavClick(link)}
                  onHover={() => setHoveredId(link.id)}
                  onLeave={() => setHoveredId(null)}
                />
              ))}
            </nav>

            {/* Desktop User Actions */}
            <div className="hidden lg:flex items-center gap-2.5">
              {isLoggedIn ? (
                <>
                  <motion.button
                    type="button"
                    aria-label="Profil"
                    onClick={() => (window.location.href = "/profil")}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    className="w-10 h-10 rounded-full border border-primary/10 bg-white text-primary flex items-center justify-center hover:text-tertiary shadow-sm cursor-pointer"
                  >
                    <User size={16} />
                  </motion.button>

                  <motion.button
                    type="button"
                    aria-label="Keluar akun"
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
                  <OutlineButton label="Masuk" onClick={() => (window.location.href = "/login")} />
                  <CtaButton label="Daftar" onClick={() => (window.location.href = "/register")} />
                </>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <motion.button
              type="button"
              aria-label={isMobileOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={isMobileOpen}
              onClick={() => setIsMobileOpen((prev) => !prev)}
              whileTap={{ scale: 0.92 }}
              className="lg:hidden w-10 h-10 rounded-xl border border-primary/10 bg-white flex items-center justify-center text-primary shadow-sm cursor-pointer"
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

          {/* Indikator Progress Scroll */}
          <motion.span
            aria-hidden="true"
            style={{ scaleX: progress, originX: 0 }}
            className="pointer-events-none absolute left-8 right-8 bottom-0 h-0.5 rounded-full bg-linear-to-r from-tertiary to-[#E9C46A]"
          />
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -10 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: EASE_OUT_TRANSITION }}
              className="lg:hidden overflow-hidden pointer-events-auto mt-2 mx-auto max-w-7xl rounded-2xl border border-white bg-white/95 backdrop-blur-2xl shadow-xl shadow-primary/10"
            >
              <div className="p-5 space-y-1.5">
                {links.map((link, i) => (
                  <MobileNavLink
                    key={link.id}
                    label={link.label}
                    index={i}
                    isActive={checkIsActive(link)}
                    onClick={() => handleNavClick(link)}
                  />
                ))}

                <div className="pt-3 mt-2 border-t border-primary/10 space-y-2">
                  {isLoggedIn ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileOpen(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-danger-light text-danger text-xs font-bold flex items-center justify-center gap-2 hover:bg-danger-light-hover transition-colors cursor-pointer"
                    >
                      <LogOut size={16} /> Keluar akun
                    </button>
                  ) : (
                    <>
                      <OutlineButton
                        mobile
                        label="Masuk"
                        onClick={() => {
                          setIsMobileOpen(false);
                          window.location.href = "/login";
                        }}
                      />
                      <CtaButton
                        mobile
                        label="Daftar"
                        onClick={() => {
                          setIsMobileOpen(false);
                          window.location.href = "/register";
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Konfirmasi Logout */}
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
                  <h3 id="logout-title" className="text-base font-extrabold text-primary">
                    Keluar dari akun?
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Kamu perlu masuk lagi untuk mengakses laporan dan riwayat konselingmu.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    ref={closeBtnRef}
                    autoFocus
                    type="button"
                    onClick={() => setShowLogoutConfirm(false)}
                    className="py-2.5 rounded-xl border border-slate-200 text-primary text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="py-2.5 rounded-xl bg-danger text-white text-xs font-bold hover:bg-danger-hover transition-colors cursor-pointer"
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