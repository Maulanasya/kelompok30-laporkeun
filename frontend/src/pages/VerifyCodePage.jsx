import React, { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";

import AuthHeader from "../components/layout/AuthHeader";
import BlurText from "../components/reactbits/BlurText";
import CodeSlots from "../components/reactbits/CodeSlots";
import StepIndicator from "../components/ui/StepIndicator";

import { api } from "../services/api";
import { images } from "../assets";

const COLOR_PRIMARY = "#0F4C5C";
const COLOR_TERTIARY = "#1597A8";
const ANIMATION_EASE = [0.22, 1, 0.36, 1];

const CODE_LENGTH = 4;
const RESEND_SECONDS = 60;

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
  const { email, resendIn } = useLocation().state ?? {};
  const wide = useIsWide();

  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slotsKey, setSlotsKey] = useState(0);
  const [cooldown, setCooldown] = useState(resendIn ?? RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const redirectTimer = useRef();

  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (!email) return <Navigate to="/lupa-password" replace />;

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
      const result = await api.verifyCode(email, value);

      if (result.error || !result.resetToken) {
        setStatus("error");
        setError(result.error || "Kode salah atau sudah kedaluwarsa.");
        return;
      }

      setStatus("success");
      redirectTimer.current = setTimeout(
        () =>
          navigate("/buat-sandi-baru", {
            state: { email, resetToken: result.resetToken },
            replace: true,
          }),
        1100
      );
    } catch {
      setStatus("error");
      setError("Terjadi kesalahan koneksi server.");
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
      const result = await api.forgotPassword(email);

      if (result.retryAfter) {
        setCooldown(result.retryAfter);
        return;
      }
      if (result.error) {
        setError(result.error);
        return;
      }

      setCode("");
      setStatus("idle");
      setSlotsKey((k) => k + 1);
      setCooldown(result.resendIn ?? RESEND_SECONDS);
    } catch {
      setError("Gagal mengirim ulang kode. Coba lagi sebentar lagi.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className="flex min-h-screen flex-col overflow-x-hidden bg-[#F4F9F9] text-slate-800 selection:bg-cyan-100"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
      `}</style>

      <main className="relative flex flex-1 items-center overflow-hidden py-24">
        <AuthHeader />

        {/* Decorative Background Elements */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 -top-40 h-130 w-130 rounded-full bg-tertiary/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 right-0 h-115 w-115 rounded-full bg-accent/20 blur-3xl"
        />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Ilustrasi */}
          <div className="hidden lg:block">
            <motion.img
              src={images?.verify}
              alt="Ilustrasi verifikasi kode"
              className="mx-auto w-full max-w-xl object-contain"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Kartu Form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: ANIMATION_EASE }}
            className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-cyan-900/10 lg:mx-0 lg:ml-auto md:p-10"
          >
            <div className="mb-8 space-y-2">
              <BlurText
                text="Kode verifikasi"
                delay={90}
                className="flex-wrap text-3xl font-bold leading-[1.15] text-primary md:text-4xl"
              />
              <p className="text-sm leading-relaxed text-slate-600">
                Kami sudah mengirim {CODE_LENGTH} digit kode ke{" "}
                <span className="font-semibold" style={{ color: COLOR_PRIMARY }}>
                  {email}
                </span>
                . Masukkan kode tersebut di bawah ini. Kode berlaku 10 menit.
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
                  className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
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
                  className="cursor-pointer font-semibold transition enabled:hover:underline disabled:cursor-not-allowed disabled:text-slate-400"
                  style={cooldown > 0 || resending ? undefined : { color: COLOR_TERTIARY }}
                >
                  {resending
                    ? "Mengirim..."
                    : cooldown > 0
                    ? `Kirim ulang (${cooldown} dtk)`
                    : "Kirim Ulang"}
                </button>
              </p>

              <button
                type="submit"
                disabled={loading || status === "success"}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/15 transition hover:-translate-y-0.5 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
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