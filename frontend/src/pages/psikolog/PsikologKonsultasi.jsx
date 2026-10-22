import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FileText, ArrowLeft } from "lucide-react";

import BkShell, { Panel } from "../../components/layout/BkShell";
import ChatList from "../../components/ChatList";
import ChatHeader from "../../components/ChatHeader";
import ChatBubble from "../../components/ChatBubble";
import ChatInput from "../../components/ChatInput";
import { CASES, PESAN } from "../../data/psikologCases";

const STACKED_LAYOUT_QUERY = "(max-width: 1023px)";
const PAGE_SCROLL_OFFSET = 96;

// Smooth scroll ke elemen target untuk tampilan mobile/tablet
const scrollPageTo = (el) => {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - PAGE_SCROLL_OFFSET;
  window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
};

const nameOf = (c) => (c.anonim ? "Siswa anonim" : c.pelapor);

// Filter sesi aktif & persiapkan data percakapan
const sessions = CASES.filter((c) => c.status !== "menunggu");

const conversations = sessions.map((c) => {
  const last = (PESAN[c.id] ?? []).at(-1);
  return {
    id: c.id,
    name: nameOf(c),
    ticket: c.kode,
    preview: last?.teks ?? c.kategori,
    lastMessage: last?.teks ?? c.kategori,
    time: last?.waktu ?? "",
    unread: c.belumDibaca,
  };
});

const initialThreads = Object.fromEntries(
  Object.entries(PESAN).map(([id, list]) => [
    id,
    list.map((m, i) => ({
      id: `${id}-${i}`,
      from: m.dari === "psikolog" ? "user" : "student",
      text: m.teks,
    })),
  ])
);

export default function PsikologKonsultasi() {
  const [params] = useSearchParams();
  const fromSesi = conversations.find((c) => c.id === params.get("sesi"));

  const [activeId, setActiveId] = useState((fromSesi ?? conversations[0])?.id);
  const [threads, setThreads] = useState(initialThreads);

  const listPanelRef = useRef(null);
  const chatPanelRef = useRef(null);
  const messagesRef = useRef(null);
  const shouldScrollToChat = useRef(false);
  const lastActiveId = useRef(activeId);

  const active = conversations.find((c) => c.id === activeId);
  const activeSesi = sessions.find((c) => c.id === activeId);
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

  // Handler perpindahan percakapan & penyesuaian scroll di mobile
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

  // State fallback ketika belum ada sesi aktif
  if (!active) {
    return (
      <BkShell
        title="Ruang konsultasi"
        subtitle="Percakapan hanya terlihat olehmu dan siswa terkait."
      >
        <Panel delay={0.1} className="p-8 text-center">
          <p className="text-sm text-slate-600">
            Belum ada sesi yang kamu terima. Terima pendampingan dulu untuk membuka ruang chat.
          </p>
          <Link
            to="/psikolog"
            className="mt-4 inline-block text-sm font-semibold text-tertiary hover:underline"
          >
            Lihat siswa dialihkan
          </Link>
        </Panel>
      </BkShell>
    );
  }

  return (
    <BkShell
      title="Ruang konsultasi"
      subtitle="Percakapan hanya terlihat olehmu dan siswa terkait. Pelapor anonim tetap tidak diketahui identitasnya."
    >
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Panel Daftar Percakapan */}
        <Panel
          innerRef={listPanelRef}
          className="scroll-mt-24 p-5 lg:h-160 lg:overflow-y-auto"
        >
          <ChatList
            conversations={conversations}
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

          {/* Banner tautan ke detail sesi */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-5 py-2 text-xs text-slate-500">
            <span>Perlu melihat catatan guru BK?</span>
            <Link
              to={`/psikolog/sesi/${active.id}`}
              className="inline-flex items-center gap-1.5 font-semibold text-tertiary hover:underline"
            >
              <FileText size={13} /> Buka detail sesi
            </Link>
          </div>

          {/* Wadah pesan */}
          <div
            ref={messagesRef}
            className="flex-1 space-y-3 overflow-y-auto bg-[#F4F9F9] px-5 py-5"
          >
            {messages.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">
                Belum ada pesan. Mulai percakapan dengan menyapa siswa.
              </p>
            ) : (
              messages.map((msg) => (
                <ChatBubble key={msg.id} from={msg.from} text={msg.text} />
              ))
            )}
          </div>

          {/* Input Chat / Status Sesi Selesai */}
          {activeSesi?.status === "selesai" ? (
            <p className="border-t border-slate-100 bg-white px-5 py-3.5 text-center text-xs text-slate-500">
              Sesi ini sudah selesai. Percakapan hanya bisa dibaca.
            </p>
          ) : (
            <ChatInput onSend={handleSend} />
          )}
        </Panel>
      </section>
    </BkShell>
  );
}