import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";

// Components
import AuthHeader from "../components/layout/AuthHeader";
import BlurText from "../components/reactbits/BlurText";
import CodeSlots from "../components/reactbits/CodeSlots";
import StepIndicator from "../components/ui/StepIndicator";

// Assets
import { images } from "../assets";

// --- Design Tokens ---
const COLOR_PRIMARY = "#0F4C5C";
const COLOR_TERTIARY = "#1597A8";
const ANIMATION_EASE = [0.22, 1, 0.36, 1];

const CODE_LENGTH = 4;
const RESEND_SECONDS = 60;

// Ukuran slot menyesuaikan lebar layar agar tidak meluber di HP
function useIsWide(query = "(min-width: 640px)") {
  const [wide, setWide] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setWide(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return wide;
}

export default function VerifyCodePage() {
  const navigate = useNavigate();
  const email = useLocation().state?.email;
  const wide = useIsWide();

  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle | error | success
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slotsKey, setSlotsKey] = useState(0); // ganti key = reset slot
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const redirectTimer = useRef();

  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  // Hitung mundur untuk tombol "Kirim Ulang"
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleChange = (value) => {
    setCode(value);
    setStatus("idle");
    if (value) setError("");
  };

  const verify = async (value) => {
    if (loading || status === "success") return;
    if (value.length < CODE_LENGTH) {
      setError(`Masukkan ${CODE_LENGTH} digit kode verifikasi.`);
      return;
    }

    setLoading(true);
    setError("");
    try {
      // TODO: verifikasi kode ke backend
      // const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-code`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email, code: value }),
      // });
      // if (!res.ok) throw new Error("Kode salah atau sudah kedaluwarsa.");
      // const { resetToken } = await res.json();
      await new Promise((r) => setTimeout(r, 800));

      setStatus("success");
      // Beri waktu animasi centang sebelum pindah halaman
      redirectTimer.current = setTimeout(
        () => navigate("/buat-sandi-baru", { state: { email /*, resetToken */ } }),
        1100
      );
    } catch (err) {
      setStatus("error");
      setError(err.message || "Kode salah atau sudah kedaluwarsa.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verify(code);
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError("");
    try {
      // TODO: kirim ulang kode ke email
      await new Promise((r) => setTimeout(r, 600));
      setCode("");
      setStatus("idle");
      setSlotsKey((k) => k + 1);
      setCooldown(RESEND_SECONDS);
    } catch {
      setError("Gagal mengirim ulang kode. Coba lagi sebentar lagi.");
    } finally {
      setResending(false);
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

        {/* Background Decorative Blurs */}
        <div
          aria-hidden="true"
          className="absolute -top-40 -left-32 w-130 h-130 rounded-full bg-[#1597A8]/15 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-40 right-0 w-115 h-115 rounded-full bg-accent/20 blur-3xl pointer-events-none"
        />

        <div className="relative w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          {/* Ilustrasi */}
          <div className="hidden lg:block">
            <motion.img
              src={images?.verify}
              alt="Ilustrasi verifikasi kode"
              className="w-full max-w-xl mx-auto object-contain"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Kartu Form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: ANIMATION_EASE }}
            className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto rounded-3xl bg-white border border-slate-200 p-8 md:p-10 shadow-xl shadow-cyan-900/10"
          >
            <div className="space-y-2 mb-8">
              <BlurText
                text="Kode verifikasi"
                delay={90}
                className="text-3xl md:text-4xl font-bold leading-[1.15] flex-wrap text-[#0F4C5C]"
              />
              <p className="text-sm text-slate-600 leading-relaxed">
                Kami sudah mengirim {CODE_LENGTH} digit kode ke{" "}
                {email ? (
                  <span className="font-semibold" style={{ color: COLOR_PRIMARY }}>
                    {email}
                  </span>
                ) : (
                  "emailmu"
                )}
                . Masukkan kode tersebut di bawah ini.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="flex justify-center">
                <CodeSlots
                  key={slotsKey}
                  length={CODE_LENGTH}
                  status={status}
                  disabled={loading}
                  autoFocus
                  onChange={handleChange}
                  onComplete={verify}
                  accentColor={COLOR_PRIMARY}
                  inkColor={COLOR_PRIMARY}
                  slotColor="#EAF4F6"
                  digitColor="#FFFFFF"
                  dangerColor="#D9534F"
                  slotSize={wide ? 68 : 56}
                  gap={wide ? 14 : 10}
                  radius={16}
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <p className="text-sm text-slate-600">
                Tidak menerima kode?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || resending}
                  className="font-semibold transition enabled:hover:underline disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
                  style={cooldown > 0 || resending ? undefined : { color: COLOR_TERTIARY }}
                >
                  {resending ? "Mengirim..." : cooldown > 0 ? `Kirim ulang (${cooldown} dtk)` : "Kirim Ulang"}
                </button>
              </p>

              <button
                type="submit"
                disabled={loading || status === "success"}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/15 transition hover:-translate-y-0.5 hover:brightness-95 disabled:opacity-70 disabled:hover:translate-y-0 cursor-pointer disabled:cursor-not-allowed"
                style={{ background: COLOR_PRIMARY }}
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" /> Memeriksa...
                  </>
                ) : status === "success" ? (
                  "Kode benar, mengalihkan..."
                ) : (
                  <>
                    Lanjut <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8">
              <StepIndicator current={2} total={3} />
            </div>

            <p className="mt-6 text-center text-sm">
              <Link
                to="/lupa-password"
                className="inline-flex items-center gap-2 font-semibold transition hover:underline"
                style={{ color: COLOR_TERTIARY }}
              >
                <ArrowLeft size={15} /> Ganti email
              </Link>
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}