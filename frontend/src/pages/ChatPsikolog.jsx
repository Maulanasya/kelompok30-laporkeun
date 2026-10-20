import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Lock } from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import BlurText from "../components/reactbits/BlurText";
import ShinyText from "../components/reactbits/ShinyText";
import ChatList from "../components/ChatList";
import ChatHeader from "../components/ChatHeader";
import ChatBubble from "../components/ChatBubble";
import ChatInput from "../components/ChatInput";
import {
  conversations as initialConversations,
  messages as initialMessages,
} from "../data/conversations";

// --- Design Tokens (sama dengan LandingPage) ---
const COLOR_TERTIARY = "#3191A0";
const ANIMATION_EASE = [0.22, 1, 0.36, 1];

// Di bawah breakpoint `lg` daftar chat dan area chat bertumpuk (1 kolom)
const STACKED_LAYOUT_QUERY = "(max-width: 1023px)";

function Panel({ children, className = "", delay = 0, innerRef }) {
  return (
    <motion.div
      ref={innerRef}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: ANIMATION_EASE }}
      className={`rounded-3xl border border-slate-200 bg-white shadow-lg shadow-cyan-900/10 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function ChatPsikolog() {
  const [activeId, setActiveId] = useState(initialConversations[0].id);
  const [messages, setMessages] = useState(initialMessages);

  const chatPanelRef = useRef(null); // panel area chat (target scroll halaman)
  const messagesRef = useRef(null); // wadah pesan yang bisa di-scroll

  const activeConversation = initialConversations.find(
    (c) => c.id === activeId
  );

  // Gulir ke pesan terbaru DI DALAM wadah pesan saja.
  // Sebelumnya memakai scrollIntoView pada elemen di akhir list, yang ikut
  // menggulir seluruh halaman (bikin posisi halaman loncat ke tengah di mobile).
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, activeId]);

  const handleSelect = (id) => {
    setActiveId(id);

    // Di mobile/tablet, langsung bawa halaman ke panel chat
    if (window.matchMedia(STACKED_LAYOUT_QUERY).matches) {
      requestAnimationFrame(() => {
        chatPanelRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  };

  const handleSend = (text) => {
    setMessages((prev) => [...prev, { id: Date.now(), from: "user", text }]);
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#F4F9F9] text-slate-800 selection:bg-cyan-100 overflow-x-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
      `}</style>

      <Navbar />

      <main className="relative flex-1 overflow-hidden pt-28 pb-16 md:pt-32 md:pb-24">
        {/* Background Decorative Blurs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -left-32 h-130 w-130 rounded-full bg-tertiary/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 right-0 h-115 w-115 rounded-full bg-[#E9C46A]/20 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-6">
          {/* Judul halaman */}
          <div className="mb-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-white/80 px-4 py-1.5 text-xs font-medium">
              <Lock size={13} color={COLOR_TERTIARY} />
              <ShinyText text="Percakapan dijaga kerahasiaannya" speed={4} />
            </span>

            <BlurText
              text="Ruang konseling dan chat psikolog"
              delay={90}
              className="flex-wrap text-3xl font-bold leading-[1.15] text-primary md:text-4xl"
            />

            <p className="leading-relaxed text-slate-600">
              Konsultasikan masalahmu secara aman dan rahasia.
            </p>
          </div>

          {/* Layout 2 kolom */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            {/* KIRI: List Percakapan */}
            <Panel className="p-5 lg:h-160 lg:overflow-y-auto">
              <ChatList
                conversations={initialConversations}
                activeId={activeId}
                onSelect={handleSelect}
              />
            </Panel>

            {/* KANAN: Area Chat */}
            <Panel
              innerRef={chatPanelRef}
              delay={0.1}
              className="flex h-140 scroll-mt-24 flex-col overflow-hidden lg:h-160"
            >
              <ChatHeader
                name={activeConversation.name}
                ticket={activeConversation.ticket}
              />

              <div
                ref={messagesRef}
                className="flex-1 space-y-3 overflow-y-auto bg-[#F4F9F9] px-5 py-5"
              >
                <div className="text-center">
                  <span className="inline-block rounded-full bg-white px-3 py-1 text-xs text-slate-500 shadow-sm">
                    Hari Ini
                  </span>
                </div>

                {messages.map((msg) => (
                  <ChatBubble key={msg.id} from={msg.from} text={msg.text} />
                ))}
              </div>

              <ChatInput onSend={handleSend} />
            </Panel>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}