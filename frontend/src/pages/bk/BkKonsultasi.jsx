import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FileText, ArrowLeft, Loader2 } from "lucide-react";

import BkShell, { Panel } from "../../components/layout/BkShell";
import ChatList from "../../components/ChatList";
import ChatHeader from "../../components/ChatHeader";
import ChatBubble from "../../components/ChatBubble";
import ChatInput from "../../components/ChatInput";
import { socket } from "../../services/socket";
import { getUser } from "../../utils/auth";
import { api } from "../../services/api"; // Pastikan ini ada

const STACKED_LAYOUT_QUERY = "(max-width: 1023px)";
const PAGE_SCROLL_OFFSET = 96;

const scrollPageTo = (el) => {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - PAGE_SCROLL_OFFSET;
  window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
};

export default function BkKonsultasi() {
  const [params] = useSearchParams();
  const user = getUser();
  
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const listPanelRef = useRef(null);
  const chatPanelRef = useRef(null);
  const messagesRef = useRef(null);
  const shouldScrollToChat = useRef(false);

  const active = conversations.find((c) => c.id === activeId);

  // 1. Ambil daftar chat dari API
  useEffect(() => {
    api.request("/chat/bk")
      .then((res) => {
        const list = res.data || [];
        setConversations(list);
        
        // Pilih chat pertama atau berdasarkan query URL
        const fromQuery = list.find(c => c.ticket === params.get("kode"));
        setActiveId(fromQuery ? fromQuery.id : list[0]?.id || null);
      })
      .catch(console.error)
      .finally(() => setLoadingList(false));
  }, []);

  // 2. Fetch Riwayat Pesan & Setup Socket.IO saat ganti chat
  useEffect(() => {
    if (!active) return;

    setLoadingMessages(true);
    fetch(`http://localhost:5001/api/chat/${active.ticket}`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = (data.chats || []).map((c) => ({
          id: c.id,
          from: c.sender?.role === "GURU_BK" ? "user" : "siswa",
          text: c.pesan,
        }));
        setMessages(formatted);
      })
      .catch((err) => console.error("Gagal ambil chat:", err))
      .finally(() => setLoadingMessages(false));

    socket.connect();
    socket.emit("join_room", active.ticket);

    const handleReceive = (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [
          ...prev,
          {
            id: msg.id,
            from: msg.sender?.role === "GURU_BK" ? "user" : "siswa",
            text: msg.pesan,
          },
        ];
      });
    };

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
      socket.disconnect();
    };
  }, [activeId]);

  // Auto-scroll ke bawah
  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

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

// Di bagian handleSend
const handleSend = (text) => {
  if (!text.trim() || !socketRef.current || !user) return;
  
  // Cek dulu status laporan, kalau udah PROSES, tolak kirim pesan
  const currentReport = conversations.find(c => c.id === activeId);
  if (currentReport?.status === "PROSES") {
    alert("Laporan sudah dialihkan ke Psikolog. Kamu tidak bisa mengirim pesan lagi.");
    return;
  }

  socketRef.current.emit("send_message", {
    kodeTiket: activeId,
    senderId: user.id,
    pesan: text.trim(),
  });
};

  if (loadingList) {
    return (
      <BkShell title="Konsultasi" subtitle="Memuat daftar percakapan...">
        <Panel className="p-6 flex justify-center text-slate-500">
          <Loader2 className="animate-spin mr-2" /> Memuat...
        </Panel>
      </BkShell>
    );
  }

  if (conversations.length === 0) {
    return (
      <BkShell title="Konsultasi" subtitle="Belum ada chat">
        <Panel className="p-6 text-center text-slate-500">
          Belum ada siswa yang memulai percakapan.
        </Panel>
      </BkShell>
    );
  }

  return (
    <BkShell
      title="Konsultasi dengan siswa"
      subtitle="Percakapan hanya terlihat olehmu dan siswa terkait."
    >
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
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

        {active && (
          <Panel
            innerRef={chatPanelRef}
            delay={0.1}
            className="flex h-140 scroll-mt-24 flex-col overflow-hidden lg:h-160"
          >
            <button
              type="button"
              onClick={handleBackToList}
              className="flex shrink-0 cursor-pointer items-center gap-1.5 border-b border-slate-200 bg-white px-5 py-3 text-xs font-semibold text-primary transition hover:bg-slate-50 lg:hidden"
            >
              <ArrowLeft size={14} /> Daftar percakapan
            </button>

            <ChatHeader name={active.name} ticket={active.ticket} />

            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-5 py-2 text-xs text-slate-500">
              <span>Perlu pendampingan lebih lanjut?</span>
              <Link
                to={`/bk/laporan/${active.ticket}`}
                className="inline-flex items-center gap-1.5 font-semibold text-tertiary hover:underline"
              >
                <FileText size={13} /> Buka laporan
              </Link>
            </div>

            <div
              ref={messagesRef}
              className="flex-1 space-y-3 overflow-y-auto bg-[#F4F9F9] px-5 py-5"
            >
              {loadingMessages ? (
                <p className="text-center text-xs text-slate-400">Memuat pesan...</p>
              ) : messages.length === 0 ? (
                <p className="text-center text-xs text-slate-400 pt-10">
                  Belum ada pesan. Mulai percakapan.
                </p>
              ) : (
                messages.map((msg) => (
                  <ChatBubble key={msg.id} from={msg.from} text={msg.text} />
                ))
              )}
            </div>

            <ChatInput onSend={handleSend} />
          </Panel>
        )}
      </section>
    </BkShell>
  );
}