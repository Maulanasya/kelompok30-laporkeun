import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FileText } from "lucide-react";

import BkShell, { Panel } from "../../components/layout/BkShell";
import ChatList from "../../components/ChatList";
import ChatHeader from "../../components/ChatHeader";
import ChatBubble from "../../components/ChatBubble";
import ChatInput from "../../components/ChatInput";
import { bkConversations, bkMessages } from "../../data/bkReports";

// Media query penanda skema layout bertumpuk untuk tampilan mobile & tablet (< 1024px)
const STACKED_LAYOUT_QUERY = "(max-width: 1023px)";

export default function BkKonsultasi() {
  const [params] = useSearchParams();
  const fromReport = bkConversations.find((c) => c.ticket === params.get("kode"));

  // Menentukan percakapan aktif berdasarkan query parameter URL atau default ke pesan pertama
  const [activeId, setActiveId] = useState((fromReport ?? bkConversations[0]).id);
  const [threads, setThreads] = useState(bkMessages);

  const chatPanelRef = useRef(null);
  const messagesRef = useRef(null);

  const active = bkConversations.find((c) => c.id === activeId);
  const messages = threads[activeId] ?? [];

  // Menggulirkan area percakapan secara otomatis ke pesan terbaru saat terdapat perubahan pesan
  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, activeId]);

  // Mengubah percakapan aktif dan menggulirkan tampilan ke panel chat pada perangkat seluler
  const handleSelect = (id) => {
    setActiveId(id);
    if (window.matchMedia(STACKED_LAYOUT_QUERY).matches) {
      requestAnimationFrame(() =>
        chatPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    }
  };

  // Menambahkan pesan baru dari Guru BK ke dalam percakapan aktif
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
        {/* Panel daftar percakapan aktif */}
        <Panel className="p-5 lg:h-160 lg:overflow-y-auto">
          <ChatList
            conversations={bkConversations}
            activeId={activeId}
            onSelect={handleSelect}
          />
        </Panel>

        {/* Panel ruang chat aktif */}
        <Panel
          innerRef={chatPanelRef}
          delay={0.1}
          className="flex h-140 scroll-mt-24 flex-col overflow-hidden lg:h-160"
        >
          <ChatHeader name={active.name} ticket={active.ticket} />

          {/* Banner tautan langsung ke rincian laporan */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-5 py-2 text-xs text-slate-500">
            <span>Perlu pendampingan lebih lanjut?</span>
            <Link
              to={`/bk/laporan/${active.ticket}`}
              className="inline-flex items-center gap-1.5 font-semibold text-tertiary hover:underline"
            >
              <FileText size={13} /> Buka laporan
            </Link>
          </div>

          {/* Kontainer riwayat gelembung pesan */}
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