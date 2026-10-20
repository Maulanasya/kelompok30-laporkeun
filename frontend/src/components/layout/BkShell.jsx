import { MotionConfig, motion } from "motion/react";
import { Lock } from "lucide-react";

import Navbar from "./Navbar";
import Footer from "./Footer";
import BlurText from "../reactbits/BlurText";
import ShinyText from "../reactbits/ShinyText";

export const EASE = [0.22, 1, 0.36, 1];

// Komponen pembungkus panel dengan animasi fade-in & slide-up
export function Panel({ children, className = "", delay = 0, innerRef }) {
  return (
    <motion.div
      ref={innerRef}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={`rounded-3xl border border-slate-200 bg-white shadow-lg shadow-cyan-900/10 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function BkShell({
  title,
  subtitle,
  actions,
  badge = "Data pelapor dijaga kerahasiaannya",
  children,
}) {
  return (
    <MotionConfig reducedMotion="user">
      <div
        className="flex min-h-screen flex-col overflow-x-hidden bg-[#F4F9F9] text-slate-800 selection:bg-cyan-100"
        style={{ fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif" }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        `}</style>

        <Navbar />

        <main className="relative flex-1 overflow-hidden pb-16 pt-28 md:pb-24 md:pt-32">
          {/* Elemen latar belakang untuk efek aura/blur */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-32 -top-40 h-130 w-130 rounded-full bg-tertiary/15 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 right-0 h-115 w-115 rounded-full bg-[#E9C46A]/20 blur-3xl"
          />

          <div className="relative mx-auto max-w-7xl px-6">
            <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl space-y-4">
                {badge && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-white/80 px-4 py-1.5 text-xs font-medium">
                    <Lock size={13} color="#3191A0" />
                    <ShinyText text={badge} speed={4} />
                  </span>
                )}

                <h1>
                  <BlurText
                    text={title}
                    delay={90}
                    className="flex-wrap text-3xl font-bold leading-[1.15] text-primary md:text-4xl"
                  />
                </h1>

                {subtitle && (
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
                    className="leading-relaxed text-slate-600"
                  >
                    {subtitle}
                  </motion.p>
                )}
              </div>
              {actions}
            </header>

            {children}
          </div>
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}