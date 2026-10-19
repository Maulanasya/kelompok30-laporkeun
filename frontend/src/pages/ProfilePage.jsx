import { useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ProfileHeader from "../components/ProfileHeader";
import DataDiriTab from "../components/DataDiriTab";
import KeamananTab from "../components/KeamananTab";

const SPRING_TRANSITION = { type: "spring", stiffness: 380, damping: 30 };
const ANIMATION_EASE = [0.22, 1, 0.36, 1];

const tabs = [
  { id: "data", label: "Data diri" },
  { id: "keamanan", label: "Keamanan & Privasi" },
];

// Animasi masuk: muncul dari bawah sambil memudar
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: ANIMATION_EASE },
});

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("data");
  const [profile, setProfile] = useState({
    nisn: "0051234567",
    nama: "Aulia Rahma",
    email: "auliarahma09@gmail.com",
    kelas: "11 SMA/K",
    bergabung: "Agustus 2026",
  });

  const handleSave = (values) => {
    setProfile((prev) => ({ ...prev, ...values }));
    // TODO: sambungkan ke API
  };

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="min-h-screen flex flex-col bg-[#F4F9F9] text-slate-800 selection:bg-cyan-100 overflow-x-hidden"
        style={{ fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif" }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        `}</style>

        <Navbar />

        <main className="relative flex-1 overflow-hidden">
          {/* Dekorasi latar yang bergerak pelan */}
          <motion.div
            aria-hidden="true"
            animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-40 -left-32 w-130 h-130 rounded-full bg-tertiary/15 blur-3xl pointer-events-none"
          />
          <motion.div
            aria-hidden="true"
            animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-40 right-0 w-115 h-115 rounded-full bg-accent/20 blur-3xl pointer-events-none"
          />

          {/* Lebar & padding sama seperti landing page */}
          <div className="relative max-w-7xl mx-auto px-6 pb-20 pt-32 md:pt-36 space-y-8">
            <motion.div {...fadeUp(0.05)}>
              <ProfileHeader profile={profile} />
            </motion.div>

            <motion.section
              {...fadeUp(0.2)}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-cyan-900/5"
            >
              {/* Tab */}
              <div className="px-5 pt-5 md:px-7">
                <div
                  role="tablist"
                  aria-label="Pengaturan profil"
                  className="inline-flex max-w-full items-center gap-0.5 rounded-full border border-primary/5 bg-primary/5 p-1"
                >
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        role="tab"
                        type="button"
                        aria-selected={isActive}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors duration-300 sm:px-5 ${
                          isActive
                            ? "text-white"
                            : "text-primary/75 hover:text-primary"
                        }`}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="profile-tab-active"
                            transition={SPRING_TRANSITION}
                            className="absolute inset-0 rounded-full bg-linear-to-b from-[#0E5566] to-primary shadow-md shadow-primary/25"
                          />
                        )}
                        <span className="relative z-10">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Isi tab: transisi saat berpindah */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: ANIMATION_EASE }}
                >
                  {activeTab === "data" ? (
                    <DataDiriTab
                      key={profile.nama + profile.email + profile.kelas}
                      profile={profile}
                      onSave={handleSave}
                    />
                  ) : (
                    <KeamananTab
                      onChangePassword={() => alert("Fitur ganti kata sandi")}
                      onLogoutAll={() => alert("Keluar dari semua perangkat")}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.section>
          </div>
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}