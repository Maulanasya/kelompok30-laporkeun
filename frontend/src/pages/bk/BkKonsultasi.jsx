import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FileText, ArrowLeft } from "lucide-react";

import BkShell, { Panel } from "../../components/layout/BkShell";
import ChatList from "../../components/ChatList";
import ChatHeader from "../../components/ChatHeader";
import ChatBubble from "../../components/ChatBubble";
import ChatInput from "../../components/ChatInput";
import { bkConversations, bkMessages } from "../../data/bkReports";

const STACKED_LAYOUT_QUERY = "(max-width: 1023px)";
const PAGE_SCROLL_OFFSET = 96;

// Smooth scroll ke elemen target untuk tampilan mobile/tablet
const scrollPageTo = (el) => {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - PAGE_SCROLL_OFFSET;
  window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
};

export default function BkKonsultasi() {
  const [params] = useSearchParams();
  const fromReport = bkConversations.find((c) => c.ticket === params.get("kode"));

  const [activeId, setActiveId] = useState((fromReport ?? bkConversations[0]).id);
  const [threads, setThreads] = useState(bkMessages);

  const listPanelRef = useRef(null);
  const chatPanelRef = useRef(null);
  const messagesRef = useRef(null);
  const shouldScrollToChat = useRef(false);
  const lastActiveId = useRef(activeId);

  const active = bkConversations.find((c) => c.id === activeId);
  const messages = threads[activeId] ?? [];

  // Scroll otomatis ke bawah saat ada pesan baru dalam percakapan aktif
  useEffect(() => {
    if (lastActiveId.current !== activeId) {
      lastActiveId.current = activeId;
      return;
    }
    const el = messagesRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, activeId]);

  // Handler pergantian percakapan & penyesuaian scroll di mobile
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

  const handleBackToList = () => scrollPageTo(listPanelRef.current);

  const handleSend = (text) =>
    setThreads((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] ?? []), { id: Date.now(), from: "user", text }],
    }));

  return (
    <BkShell
      title="Konsultasi dengan siswa"
      subtitle="Percakapan hanya terlihat olehmu dan siswa terkait. Pelapor anonim tetap tidak diketahui identitasnya."
    >
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Panel Daftar Percakapan */}
        <Panel
          innerRef={listPanelRef}
          className="scroll-mt-24 p-5 lg:h-160 lg:overflow-y-auto"
        >
          <ChatList
            conversations={bkConversations}
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
          {/* Tombol kembali ke daftar (khusus mobile/tablet) */}
          <button
            type="button"
            onClick={handleBackToList}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 border-b border-slate-200 bg-white px-5 py-3 text-xs font-semibold text-primary transition hover:bg-slate-50 lg:hidden"
          >
            <ArrowLeft size={14} /> Daftar percakapan
          </button>

          <ChatHeader name={active.name} ticket={active.ticket} />

          {/* Banner tautan ke detail laporan */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-5 py-2 text-xs text-slate-500">
            <span>Perlu pendampingan lebih lanjut?</span>
            <Link
              to={`/bk/laporan/${active.ticket}`}
              className="inline-flex items-center gap-1.5 font-semibold text-tertiary hover:underline"
            >
              <FileText size={13} /> Buka laporan
            </Link>
          </div>

          {/* Wadah pesan */}
          <div
            ref={messagesRef}
            className="flex-1 space-y-3 overflow-y-auto bg-[#F4F9F9] px-5 py-5"
          >
            {messages.map((msg) => (
              <ChatBubble key={msg.id} from={msg.from} text={msg.text} />
            ))}
          </div>

          <ChatInput onSend={handleSend} />
        </Panel>
      </section>
    </BkShell>
  );
}