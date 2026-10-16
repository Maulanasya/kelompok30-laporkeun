import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useScroll,
  useSpring,
} from "framer-motion";
import { Menu, X, User, LogOut, ArrowRight } from "lucide-react";

import ShinyText from "./reactbits/ShinyText";
import StarBorder from "./reactbits/StarBorder";

/* ============================================================
   MENU
   ============================================================ */

// Menu ketika user sudah login
const LOGGED_IN_LINKS = [
  { to: "/", label: "Beranda" },
  { to: "/form-laporan", label: "Form Laporan" },
  { to: "/riwayat-laporan", label: "Riwayat Laporan" },
  { to: "/chat-psikolog", label: "Chat Psikolog" },
];

// Menu ketika user belum login (guest)
const GUEST_LINKS = [
  { to: "/", label: "Beranda" },
  { to: "/riwayat-laporan", label: "Riwayat Laporan" },
  { to: "/chat-psikolog", label: "Chat Psikolog" },
];

/* ============================================================
   KONSTANTA ANIMASI
   ============================================================ */

const SPRING_TRANSITION = { type: "spring", stiffness: 380, damping: 30 };
const EASE_OUT_TRANSITION = [0.16, 1, 0.3, 1];

/* ============================================================
   SUB-COMPONENTS
   ============================================================ */

function DesktopNavLink({ to, label, isActive, isHovered, onHover, onLeave }) {
  return (
    <NavLink
      to={to}
      onMouseEnter={onHover}
      onFocus={onHover}
      onBlur={onLeave}
      aria-current={isActive ? "page" : undefined}
      className={`relative px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-colors duration-300 ${
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
      <span className="relative z-10">{label}</span>
    </NavLink>
  );
}

function MobileNavLink({ to, label, isActive, index, onClick }) {
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
      <NavLink
        to={to}
        onClick={onClick}
        className={`relative block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors duration-300 ${
          isActive
            ? "bg-primary text-white"
            : "text-primary/80 hover:bg-primary-light/50"
        }`}
      >
        {label}
      </NavLink>
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
      className={`text-xs font-bold text-primary border border-primary/15 bg-white/80 hover:border-tertiary/50 hover:text-tertiary cursor-pointer transition-colors duration-300 ${
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

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const closeBtnRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  // Cek status login dari localStorage
  const isLoggedIn = Boolean(localStorage.getItem("user"));
  const links = isLoggedIn ? LOGGED_IN_LINKS : GUEST_LINKS;

  // Efek scroll: navbar jadi solid saat di-scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 25);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Accessibility: tutup modal logout dengan ESC
  useEffect(() => {
    if (!showLogoutConfirm) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowLogoutConfirm(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLogoutConfirm]);

  // Tutup menu mobile setiap kali pindah halaman
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const isPathActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

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
          {/* Accent Line */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-[#E9C46A]/80 to-transparent"
          />

          <div className="flex items-center justify-between gap-4">
            {/* Brand */}
            <Link
              to="/"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center gap-3 cursor-pointer shrink-0 group"
              aria-label="LaporKeun! kembali ke beranda"
            >
              <img
                src="/assets/images/logo.png"
                alt=""
                className="h-10 w-10 object-contain transition-transform duration-300 group-hover:-rotate-3"
              />
              <div className="text-left leading-tight hidden sm:block">
                <div className="text-base font-extrabold tracking-tight text-primary">
                  LaporKeun<span className="text-tertiary">!</span>
                </div>
                <ShinyText
                  text="Ruang aman untuk bersuara"
                  speed={5}
                  className="text-[10px] font-medium"
                />
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav
              aria-label="Navigasi utama"
              className="hidden lg:flex items-center gap-0.5 bg-primary/5 border border-primary/5 p-1 rounded-full"
              onMouseLeave={() => setHoveredId(null)}
            >
              {links.map((link) => (
                <DesktopNavLink
                  key={link.to}
                  to={link.to}
                  label={link.label}
                  isActive={isPathActive(link.to)}
                  isHovered={hoveredId === link.to}
                  onHover={() => setHoveredId(link.to)}
                  onLeave={() => setHoveredId(null)}
                />
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2.5">
              {isLoggedIn ? (
                <>
                  <motion.div
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                  >
                    <Link
                      to="/profile"
                      aria-label="Profil"
                      className="w-10 h-10 rounded-full border border-primary/10 bg-white text-primary flex items-center justify-center hover:text-tertiary shadow-sm cursor-pointer"
                    >
                      <User size={16} />
                    </Link>
                  </motion.div>

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

            {/* Mobile Toggle */}
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

          {/* Progress Bar */}
          <motion.span
            aria-hidden="true"
            style={{ scaleX: progress, originX: 0 }}
            className="pointer-events-none absolute left-8 right-8 bottom-0 h-0.5 rounded-full bg-linear-to-r from-tertiary to-[#E9C46A]"
          />
        </div>

        {/* Mobile Menu */}
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
                    key={link.to}
                    to={link.to}
                    label={link.label}
                    index={i}
                    isActive={isPathActive(link.to)}
                    onClick={() => setIsMobileOpen(false)}
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

        {/* Modal Logout */}
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
                    Kamu perlu masuk lagi untuk mengakses laporan dan riwayat
                    konselingmu.
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