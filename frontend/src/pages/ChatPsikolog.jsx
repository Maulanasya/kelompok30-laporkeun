import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Lock, ArrowLeft } from "lucide-react";

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

const COLOR_TERTIARY = "#3191A0";
const ANIMATION_EASE = [0.22, 1, 0.36, 1];
const STACKED_LAYOUT_QUERY = "(max-width: 1023px)";
const PAGE_SCROLL_OFFSET = 96;

// Smooth scroll ke elemen target untuk tampilan mobile/tablet
const scrollPageTo = (el) => {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - PAGE_SCROLL_OFFSET;
  window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
};

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

  const listPanelRef = useRef(null);
  const chatPanelRef = useRef(null);
  const messagesRef = useRef(null);
  const shouldScrollToChat = useRef(false);

  const activeConversation = initialConversations.find(
    (c) => c.id === activeId
  );

  // Scroll otomatis ke dasar wadah pesan saat ada pesan baru
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  // Handler perpindahan percakapan dan penyesuaian posisi layar di mobile
  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;

    if (shouldScrollToChat.current) {
      shouldScrollToChat.current = false;
      scrollPageTo(chatPanelRef.current);
    }
  }, [activeId]);

  const handleSelect = (id) => {
    const stacked = window.matchMedia(STACKED_LAYOUT_QUERY).matches;

    if (id === activeId) {
      if (stacked) scrollPageTo(chatPanelRef.current);
      return;
    }

    shouldScrollToChat.current = stacked;
    setActiveId(id);
  };

  const handleBackToList = () => {
    scrollPageTo(listPanelRef.current);
  };

  const handleSend = (text) => {
    setMessages((prev) => [...prev, { id: Date.now(), from: "user", text }]);
  };

  return (
    <div
      className="flex min-h-screen flex-col overflow-x-hidden bg-[#F4F9F9] text-slate-800 selection:bg-cyan-100"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
      `}</style>

      <Navbar />

      <main className="relative flex-1 overflow-hidden pb-16 pt-28 md:pb-24 md:pt-32">
        {/* Decorative Blurs Background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 -top-40 h-130 w-130 rounded-full bg-tertiary/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 right-0 h-115 w-115 rounded-full bg-[#E9C46A]/20 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-6">
          {/* Header Halaman */}
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

          {/* Grid Layout 2 Kolom */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            {/* Panel Daftar Percakapan */}
            <Panel
              innerRef={listPanelRef}
              className="scroll-mt-24 p-5 lg:h-160 lg:overflow-y-auto"
            >
              <ChatList
                conversations={initialConversations}
                activeId={activeId}
                onSelect={handleSelect}
              />
            </Panel>

            {/* Panel Ruang Chat */}
            <Panel
              innerRef={chatPanelRef}
              delay={0.1}
              className="flex h-140 scroll-mt-24 flex-col overflow-hidden lg:h-160"
            >
              {/* Tombol Kembali ke Daftar Percakapan (Khusus Mobile/Tablet) */}
              <button
                type="button"
                onClick={handleBackToList}
                className="flex shrink-0 cursor-pointer items-center gap-1.5 border-b border-slate-200 bg-white px-5 py-3 text-xs font-semibold text-primary transition hover:bg-slate-50 lg:hidden"
              >
                <ArrowLeft size={14} /> Daftar percakapan
              </button>

              <ChatHeader
                name={activeConversation.name}
                ticket={activeConversation.ticket}
              />

              {/* Wadah Pesan Chat */}
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