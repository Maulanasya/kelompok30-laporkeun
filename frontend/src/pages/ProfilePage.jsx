import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  GraduationCap,
  X,
  Loader2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getUser, getToken, updateUser } from "../utils/auth";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import BlurText from "../components/reactbits/BlurText";

const API_BASE_URL = "http://localhost:5000/api";

// --- Design Tokens & Mappings ---
const COLOR_PRIMARY = "#0F4C5C";
const COLOR_TERTIARY = "#1597A8";
const ANIMATION_EASE = [0.22, 1, 0.36, 1];

const ROLE_LABELS = {
  SISWA: "Siswa",
  GURU_BK: "Guru BK",
  PSIKOLOG: "Psikolog",
  ADMIN: "Administrator",
};

const STATUS_LABELS = {
  true: "Akun aktif",
  false: "Akun tidak aktif",
};

// --- Helper Functions ---
function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "LK"
  );
}

function formatDate(date) {
  if (!date) return "Belum tersedia";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Belum tersedia";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

// --- Animation Variants ---
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: ANIMATION_EASE,
    },
  },
};

const tabContentVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: ANIMATION_EASE },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: ANIMATION_EASE },
  },
};

const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const gridItemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: ANIMATION_EASE,
    },
  },
};

// --- Sub Components ---
function AnimatedCard({ children, className = "", reduceMotion }) {
  return (
    <motion.section
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={reduceMotion ? undefined : { y: -2 }}
      transition={{ duration: 0.2, ease: ANIMATION_EASE }}
      className={`rounded-3xl border border-slate-200 bg-white shadow-xl shadow-cyan-900/5 ${className}`}
    >
      {children}
    </motion.section>
  );
}

function InfoItem({ icon: Icon, label, value, hint }) {
  return (
    <motion.div
      variants={gridItemVariants}
      whileHover={{ y: -3, transition: { duration: 0.2, ease: ANIMATION_EASE } }}
      className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-100 bg-[#FBFDFD] p-4 transition-colors hover:border-cyan-200/80 hover:bg-[#F5FAFA] hover:shadow-md hover:shadow-cyan-900/5"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50"
        style={{ color: COLOR_TERTIARY }}
      >
        <Icon size={18} strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p
          className="mt-1 wrap-break-word text-sm font-semibold"
          style={{ color: COLOR_PRIMARY }}
        >
          {value || "Belum tersedia"}
        </p>

        {hint && (
          <p className="mt-1 text-xs leading-5 text-slate-400">{hint}</p>
        )}
      </div>
    </motion.div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
  onToggle,
  placeholder,
  autoComplete,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold"
        style={{ color: COLOR_PRIMARY }}
      >
        {label}
      </label>

      <div className="relative mt-2">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className="w-full rounded-full border border-slate-200 bg-white py-3.5 pl-5 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-tertiary focus:ring-4 focus:ring-cyan-100"
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={
            visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
          }
          className="absolute inset-y-0 right-4 flex items-center justify-center text-slate-400 transition hover:text-tertiary"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

// --- Password Change Modal ---
function PasswordModal({ onClose, onSuccess }) {
  const reduceMotion = useReducedMotion();

  const [form, setForm] = useState({
    passwordLama: "",
    passwordBaru: "",
    konfirmasiPassword: "",
  });

  const [visible, setVisible] = useState({
    lama: false,
    baru: false,
    konfirmasi: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setError("");
  };

  const toggleVisibility = (field) => {
    setVisible((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading || success) return;
    setError("");

    // Validasi form
    if (form.passwordBaru.length < 8) {
      setError("Kata sandi baru minimal 8 karakter.");
      return;
    }

    if (form.passwordBaru !== form.konfirmasiPassword) {
      setError("Konfirmasi kata sandi baru belum cocok.");
      return;
    }

    if (form.passwordBaru === form.passwordLama) {
      setError("Kata sandi baru harus berbeda dari kata sandi lama.");
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Sesi login tidak ditemukan. Silakan login kembali.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/profile/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Kata sandi gagal diperbarui.");
      }

      const successText = result.message || "Kata sandi berhasil diperbarui.";

      setSuccess(successText);
      setTimeout(() => {
        onSuccess(successText, Boolean(result.requiresLogin));
      }, 1400);
    } catch (err) {
      setError(
        err.message || "Tidak dapat terhubung ke server. Coba lagi sebentar."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="password-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.22 }}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !loading) {
            onClose();
          }
        }}
        className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm"
      >
        <motion.section
          role="dialog"
          aria-modal="true"
          aria-labelledby="password-modal-title"
          initial={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: 24, scale: 0.96 }
          }
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: 12, scale: 0.98 }
          }
          transition={{
            duration: reduceMotion ? 0 : 0.4,
            ease: ANIMATION_EASE,
          }}
          className="my-auto w-full max-w-md overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-cyan-900/20"
        >
          <div
            className="relative overflow-hidden px-6 py-7 text-white sm:px-7"
            style={{ background: COLOR_PRIMARY }}
          >
            <div
              aria-hidden="true"
              className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl"
            />

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              aria-label="Tutup dialog"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
            >
              <X size={19} />
            </button>

            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
              <KeyRound size={22} />
            </div>

            <h2
              id="password-modal-title"
              className="relative mt-4 text-xl font-bold tracking-tight"
            >
              Ganti kata sandi
            </h2>

            <p className="relative mt-2 max-w-sm text-sm leading-6 text-white/70">
              Perbarui kata sandi untuk membantu menjaga keamanan akunmu.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 px-6 py-6 sm:px-7"
          >
            {success && (
              <div
                role="status"
                className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
              >
                <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
                <p>{success}</p>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <PasswordField
              id="passwordLama"
              label="Kata sandi lama"
              value={form.passwordLama}
              onChange={(value) => updateField("passwordLama", value)}
              visible={visible.lama}
              onToggle={() => toggleVisibility("lama")}
              placeholder="Masukkan kata sandi saat ini"
              autoComplete="current-password"
            />

            <PasswordField
              id="passwordBaru"
              label="Kata sandi baru"
              value={form.passwordBaru}
              onChange={(value) => updateField("passwordBaru", value)}
              visible={visible.baru}
              onToggle={() => toggleVisibility("baru")}
              placeholder="Minimal 8 karakter"
              autoComplete="new-password"
            />

            <PasswordField
              id="konfirmasiPassword"
              label="Konfirmasi kata sandi baru"
              value={form.konfirmasiPassword}
              onChange={(value) =>
                updateField("konfirmasiPassword", value)
              }
              visible={visible.konfirmasi}
              onToggle={() => toggleVisibility("konfirmasi")}
              placeholder="Ulangi kata sandi baru"
              autoComplete="new-password"
            />

            <div className="flex items-start gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
              <ShieldCheck
                size={16}
                className="mt-0.5 shrink-0"
                style={{ color: COLOR_TERTIARY }}
              />
              <p>
                Jangan gunakan kata sandi yang sama dengan akun lain. Kata
                sandi diproses oleh backend.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={loading}
                onClick={onClose}
                className="min-h-11 cursor-pointer rounded-full px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={loading || !!success}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white shadow-lg shadow-cyan-900/15 transition hover:-translate-y-0.5 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
                style={{ background: COLOR_PRIMARY }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <KeyRound size={16} />
                    Simpan perubahan
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}

// --- Main Profile Page ---
export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const reduceMotion = useReducedMotion();

  const [user, setUser] = useState(() => getUser() || {});
  const [activeTab, setActiveTab] = useState("profil");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [notice, setNotice] = useState(null);

  // Auto-dismiss toast notice
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  // Sinkronisasi data profil terbaru dari server
  useEffect(() => {
    const controller = new AbortController();

    const fetchLatestProfile = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const result = await response.json().catch(() => ({}));
        const fresh = result.data ?? result.user;

        if (!response.ok || !(fresh?.email || fresh?.nama)) return;

        const current = getUser() || {};
        const merged = {
          ...current,
          ...fresh,
          peran: String(
            fresh.peran || fresh.role || current.peran || current.role || ""
          ).toLowerCase(),
        };

        setUser(merged);
        updateUser(merged);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Gagal memperbarui profil dari server:", err);
        }
      }
    };

    fetchLatestProfile();
    return () => controller.abort();
  }, []);

  const name = user.nama || user.name || "Pengguna LaporKeun!";
  const role = String(user.role || user.peran || "").toUpperCase();
  const roleLabel = ROLE_LABELS[role] || "Pengguna";
  const isActive = user.isActive;

  const handlePasswordSuccess = (message, requiresLogin) => {
    setShowPasswordModal(false);

    if (requiresLogin) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    setNotice({ type: "success", text: message });
  };

  const tabs = [
    { id: "profil", label: "Informasi profil", icon: UserRound },
    { id: "keamanan", label: "Keamanan", icon: ShieldCheck },
  ];

  return (
    <div
      className="flex min-h-screen flex-col overflow-x-hidden bg-[#F4F9F9] text-slate-800 selection:bg-cyan-100"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
      `}</style>

      <Navbar />

      <main className="relative flex-1 overflow-hidden pb-16 pt-24 sm:pt-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -left-32 h-130 w-130 rounded-full bg-tertiary/15 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 right-0 h-115 w-115 rounded-full bg-accent/20 blur-3xl"
        />

        <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Header */}
            <motion.header
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: ANIMATION_EASE }}
              className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
            >
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-[0.18em]"
                  style={{ color: COLOR_TERTIARY }}
                >
                  Pengaturan akun
                </p>

                <div className="mt-2">
                  <BlurText
                    text="Profil saya"
                    delay={90}
                    className="flex-wrap text-2xl font-bold tracking-tight text-primary sm:text-3xl lg:text-4xl"
                  />
                </div>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Kelola informasi akun dan keamananmu dalam satu tempat.
                </p>
              </div>

              <div
                className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold shadow-sm"
                style={{ color: COLOR_TERTIARY }}
              >
                <ShieldCheck size={15} />
                Ruang aman LaporKeun!
              </div>
            </motion.header>

            {/* Profile Hero Card */}
            <AnimatedCard
              reduceMotion={reduceMotion}
              className="relative overflow-hidden"
            >
              <div
                className="absolute inset-x-0 top-0 h-32 sm:h-36"
                style={{
                  background: `linear-gradient(135deg, ${COLOR_PRIMARY} 0%, #0B3C48 50%, ${COLOR_TERTIARY} 100%)`,
                }}
              />

              <div
                aria-hidden="true"
                className="absolute right-8 top-0 h-36 w-36 rounded-full border border-white/10 sm:right-20"
              />

              <div className="relative px-5 pb-6 pt-16 sm:px-8 sm:pt-20">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                  <motion.div
                    initial={
                      reduceMotion
                        ? false
                        : { opacity: 0, scale: 0.8, y: 10 }
                    }
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.1,
                      ease: ANIMATION_EASE,
                    }}
                    className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border-4 border-white bg-cyan-50 text-2xl font-bold shadow-lg shadow-cyan-900/10 sm:h-24 sm:w-24 sm:text-3xl"
                    style={{ color: COLOR_PRIMARY }}
                  >
                    {getInitials(name)}
                  </motion.div>

                  <div className="min-w-0 flex-1 sm:pb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="wrap-break-word text-xl font-bold tracking-tight text-white sm:text-2xl">
                        {name}
                      </h2>

                      {isActive === true && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Aktif
                        </span>
                      )}

                      {isActive === false && (
                        <span className="rounded-full border border-rose-200/60 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                          Tidak aktif
                        </span>
                      )}
                    </div>

                    <p className="mt-1 break-all text-sm text-slate-300">
                      {user.email || "Email belum tersedia"}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-semibold"
                        style={{ color: COLOR_PRIMARY }}
                      >
                        <GraduationCap size={14} />
                        {roleLabel}
                      </span>

                      {user.nisn && (
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                          NISN: {user.nisn}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Sidebar & Tab Content */}
            <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
              <nav
                aria-label="Navigasi profil"
                className="h-fit rounded-3xl border border-slate-200 bg-white p-2 shadow-xl shadow-cyan-900/5"
              >
                <p className="px-4 pb-3 pt-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Pengaturan
                </p>

                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const selected = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      aria-current={selected ? "page" : undefined}
                      className={`group relative mb-1 flex min-h-12 w-full cursor-pointer items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                        selected
                          ? "bg-cyan-50 text-primary"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                      }`}
                    >
                      {selected && (
                        <motion.span
                          layoutId="profile-tab-indicator"
                          className="absolute inset-y-2 left-0 w-1 rounded-r-full"
                          style={{ background: COLOR_TERTIARY }}
                          transition={{
                            duration: 0.3,
                            ease: ANIMATION_EASE,
                          }}
                        />
                      )}

                      <Icon size={18} />

                      <span className="flex-1">{tab.label}</span>

                      <ChevronRight
                        size={16}
                        className={`transition ${
                          selected
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                        }`}
                      />
                    </button>
                  );
                })}

                <div className="mx-3 my-3 border-t border-slate-100" />

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm"
                    style={{ color: COLOR_TERTIARY }}
                  >
                    <ShieldCheck size={18} />
                  </div>
                  <p
                    className="mt-3 text-sm font-bold"
                    style={{ color: COLOR_PRIMARY }}
                  >
                    Privasi kamu penting
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Informasi akun digunakan untuk mendukung layanan
                    LaporKeun!.
                  </p>
                </div>
              </nav>

              <div className="min-w-0">
                <AnimatePresence mode="wait" initial={false}>
                  {activeTab === "profil" ? (
                    <motion.div
                      key="profile-information"
                      variants={tabContentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-6"
                    >
                      <AnimatedCard
                        reduceMotion={reduceMotion}
                        className="p-5 sm:p-7"
                      >
                        <div className="mb-6">
                          <h2
                            className="text-lg font-bold"
                            style={{ color: COLOR_PRIMARY }}
                          >
                            Informasi akun
                          </h2>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            Informasi yang tersedia dari data akun kamu.
                          </p>
                        </div>

                        <motion.div
                          variants={gridContainerVariants}
                          initial="hidden"
                          animate="visible"
                          className="grid gap-3 sm:grid-cols-2"
                        >
                          <InfoItem
                            icon={UserRound}
                            label="Nama lengkap"
                            value={user.nama || user.name}
                          />

                          <InfoItem
                            icon={Mail}
                            label="Alamat email"
                            value={user.email}
                          />

                          <InfoItem
                            icon={GraduationCap}
                            label="NISN"
                            value={user.nisn || "Belum tersedia"}
                            hint="Nomor induk siswa nasional"
                          />

                          <InfoItem
                            icon={ShieldCheck}
                            label="Peran akun"
                            value={roleLabel}
                          />

                          <InfoItem
                            icon={CalendarDays}
                            label="Tanggal bergabung"
                            value={formatDate(user.createdAt)}
                            hint={
                              user.createdAt
                                ? undefined
                                : "Tanggal belum tersedia pada data login."
                            }
                          />

                          <InfoItem
                            icon={LockKeyhole}
                            label="Status akun"
                            value={
                              typeof isActive === "boolean"
                                ? STATUS_LABELS[String(isActive)]
                                : "Belum tersedia"
                            }
                          />
                        </motion.div>

                        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                          <p
                            className="text-sm font-semibold"
                            style={{ color: COLOR_PRIMARY }}
                          >
                            Perlu memperbarui informasi?
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            Pengeditan nama, email, dan NISN belum
                            disediakan di halaman ini. Data ditampilkan dari
                            sesi login yang tersimpan.
                          </p>
                        </div>
                      </AnimatedCard>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="profile-security"
                      variants={tabContentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-6"
                    >
                      <AnimatedCard
                        reduceMotion={reduceMotion}
                        className="p-5 sm:p-7"
                      >
                        <div className="mb-6 flex items-start gap-3">
                          <div
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50"
                            style={{ color: COLOR_TERTIARY }}
                          >
                            <ShieldCheck size={20} />
                          </div>

                          <div>
                            <h2
                              className="text-lg font-bold"
                              style={{ color: COLOR_PRIMARY }}
                            >
                              Keamanan akun
                            </h2>
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                              Kelola keamanan akses ke akun LaporKeun!.
                            </p>
                          </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                          <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-start gap-3">
                              <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50"
                                style={{ color: COLOR_TERTIARY }}
                              >
                                <KeyRound size={18} />
                              </div>

                              <div>
                                <h3
                                  className="text-sm font-bold"
                                  style={{ color: COLOR_PRIMARY }}
                                >
                                  Kata sandi
                                </h3>
                                <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                                  Gunakan kata sandi yang kuat dan berbeda dari
                                  akun lainnya.
                                </p>
                                <p className="mt-2 text-xs text-slate-400">
                                  Minimal 8 karakter.
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setShowPasswordModal(true)}
                              className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/15 transition hover:-translate-y-0.5 hover:brightness-95"
                              style={{ background: COLOR_PRIMARY }}
                            >
                              <KeyRound size={16} />
                              Ganti kata sandi
                              <ArrowRight size={15} />
                            </button>
                          </div>

                          <div className="flex items-start gap-3 py-5">
                            <div
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50"
                              style={{ color: COLOR_TERTIARY }}
                            >
                              <LockKeyhole size={18} />
                            </div>

                            <div>
                              <h3
                                className="text-sm font-bold"
                                style={{ color: COLOR_PRIMARY }}
                              >
                                Anonimitas laporan
                              </h3>
                              <p className="mt-1 max-w-lg text-sm leading-6 text-slate-500">
                                Pilihan anonim diterapkan pada masing-masing
                                laporan, sesuai dengan kolom{" "}
                                <code className="rounded bg-slate-100 px-1 py-0.5 text-xs text-slate-700">
                                  isAnonim
                                </code>{" "}
                                pada database.
                              </p>

                              <span
                                className="mt-3 inline-flex rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-semibold"
                                style={{ color: COLOR_PRIMARY }}
                              >
                                Diatur per laporan
                              </span>
                            </div>
                          </div>
                        </div>
                      </AnimatedCard>

                      <AnimatedCard
                        reduceMotion={reduceMotion}
                        className="p-5 sm:p-6"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <ShieldCheck size={18} />
                          </div>

                          <div>
                            <h3
                              className="text-sm font-bold"
                              style={{ color: COLOR_PRIMARY }}
                            >
                              Tips menjaga keamanan
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                              Jangan bagikan kata sandi kepada orang lain.
                              Jika menggunakan perangkat bersama, pastikan kamu
                              keluar dari akun setelah selesai.
                            </p>
                          </div>
                        </div>
                      </AnimatedCard>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Floating Success Toast Notification */}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-110 flex justify-center px-4">
        <AnimatePresence>
          {notice && (
            <motion.div
              key={notice.text}
              role="status"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.3, ease: ANIMATION_EASE }}
              className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-xl shadow-emerald-900/10"
            >
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              <p className="flex-1">{notice.text}</p>
              <button
                type="button"
                onClick={() => setNotice(null)}
                aria-label="Tutup notifikasi"
                className="cursor-pointer text-emerald-700 hover:text-emerald-900"
              >
                <X size={17} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showPasswordModal && (
          <PasswordModal
            onClose={() => setShowPasswordModal(false)}
            onSuccess={handlePasswordSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}