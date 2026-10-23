import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FileText, ArrowLeft, Loader2 } from "lucide-react";
import { io } from "socket.io-client";

import BkShell, { Panel } from "../../components/layout/BkShell";
import ChatList from "../../components/ChatList";
import ChatHeader from "../../components/ChatHeader";
import ChatBubble from "../../components/ChatBubble";
import ChatInput from "../../components/ChatInput";
import { api } from "../../services/api";
import { getUser } from "../../utils/auth";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const API_URL = `${SOCKET_URL}/api`;

const STACKED_LAYOUT_QUERY = "(max-width: 1023px)";
const PAGE_SCROLL_OFFSET = 96;

const scrollPageTo = (el) => {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - PAGE_SCROLL_OFFSET;
  window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
};

export default function PsikologKonsultasi() {
  const [params] = useSearchParams();
  const user = getUser();
  
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null); // Pakai kodeTiket sebagai ID
  const [messages, setMessages] = useState([]);
  
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const listPanelRef = useRef(null);
  const chatPanelRef = useRef(null);
  const messagesRef = useRef(null);
  const socketRef = useRef(null);
  const shouldScrollToChat = useRef(false);
  const lastActiveId = useRef(activeId);

  const active = conversations.find((c) => c.id === activeId);

  // 1. Ambil Daftar Laporan (Status PROSES & Punya Chat) dari API
  useEffect(() => {
    api.getAllLaporan()
      .then((res) => {
        const list = res?.data || [];
        
        // Filter HANYA laporan yang statusnya PROSES atau SELESAI
        const filteredList = list.filter(
          (r) => (r.status === "PROSES" || r.status === "SELESAI") && r.sesi?.length > 0
        );

        const formatted = filteredList.map((l) => {
          const sesi = l.sesi[0];
          const name = l.isAnonim ? "Siswa Anonim" : `${l.pelapor?.nama} (${l.pelapor?.kelas || "-"})`;
          return {
            id: l.kodeTiket, // Pakai kodeTiket
            name: name,
            ticket: l.kodeTiket,
            status: l.status,
            lastMessage: "Buka untuk melihat chat",
            time: new Date(l.updatedAt).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }),
            unread: 0,
          };
        });

        setConversations(formatted);
        
        // Pilih chat pertama atau berdasarkan query
        const fromQuery = formatted.find(c => c.id === params.get("sesi"));
        setActiveId(fromQuery ? fromQuery.id : formatted[0]?.id || null);
      })
      .catch(console.error)
      .finally(() => setLoadingList(false));
  }, []);

  // 2. Fetch Pesan & Setup Socket saat ganti chat
  useEffect(() => {
    if (!activeId) return;

    setMessages([]);
    setLoadingMessages(true);

    // Fetch riwayat chat
    fetch(`${API_URL}/chat/${activeId}`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = (data.chats || []).map((c) => ({
          id: c.id,
          from: c.sender?.id === user?.id ? "user" : "student",
          text: c.pesan,
        }));
        setMessages(formatted);
      })
      .catch((err) => console.error("Gagal ambil chat:", err))
      .finally(() => setLoadingMessages(false));

    // Setup Socket.IO
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, { withCredentials: true });
    }
    const socket = socketRef.current;

    socket.connect();
    socket.emit("join_room", activeId);

    const handleReceive = (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [
          ...prev,
          {
            id: msg.id,
            from: msg.sender?.id === user?.id ? "user" : "student",
            text: msg.pesan,
          },
        ];
      });
    };

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [activeId, user?.id]);

  // Scroll ke bawah
  useEffect(() => {
    if (lastActiveId.current !== activeId) {
      lastActiveId.current = activeId;
      return;
    }
    const el = messagesRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, activeId]);

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

  const handleSend = (text) => {
    if (!text.trim() || !socketRef.current || !user || !activeId) return;
    socketRef.current.emit("send_message", {
      kodeTiket: activeId,
      senderId: user.id,
      pesan: text.trim(),
    });
  };

  if (loadingList) {
    return (
      <BkShell title="Ruang Konsultasi" subtitle="Memuat...">
        <Panel className="flex h-[400px] items-center justify-center text-slate-500 gap-2">
          <Loader2 className="animate-spin" /> Memuat data...
        </Panel>
      </BkShell>
    );
  }

  if (conversations.length === 0) {
    return (
      <BkShell title="Ruang Konsultasi" subtitle="Belum ada sesi">
        <Panel className="p-8 text-center">
          <p className="text-sm text-slate-600 mb-4">
            Belum ada siswa yang dialihkan ke kamu untuk pendampingan.
          </p>
          <Link to="/psikolog" className="text-sm font-semibold text-tertiary hover:underline">
            Kembali ke daftar siswa
          </Link>
        </Panel>
      </BkShell>
    );
  }

  return (
    <BkShell
      title="Ruang konsultasi"
      subtitle="Percakapan hanya terlihat olehmu dan siswa terkait."
    >
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Panel Kiri: List Chat */}
        <Panel innerRef={listPanelRef} className="scroll-mt-24 p-5 lg:h-160 lg:overflow-y-auto">
          <ChatList conversations={conversations} activeId={activeId} onSelect={handleSelect} />
        </Panel>

        {/* Panel Kanan: Ruang Chat */}
        <Panel innerRef={chatPanelRef} delay={0.1} className="flex h-140 scroll-mt-24 flex-col overflow-hidden lg:h-160">
          <button
            type="button"
            onClick={handleBackToList}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 border-b border-slate-200 bg-white px-5 py-3 text-xs font-semibold text-primary transition hover:bg-slate-50 lg:hidden"
          >
            <ArrowLeft size={14} /> Daftar percakapan
          </button>

          {active && (
            <>
              <ChatHeader name={active.name} ticket={active.ticket} />

              <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-5 py-2 text-xs text-slate-500">
                <span>Perlu melihat catatan guru BK?</span>
                <Link
                  to={`/psikolog/sesi/${active.id}`}
                  className="inline-flex items-center gap-1.5 font-semibold text-tertiary hover:underline"
                >
                  <FileText size={13} /> Buka detail sesi
                </Link>
              </div>

              <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto bg-[#F4F9F9] px-5 py-5">
                {loadingMessages ? (
                  <p className="text-center text-xs text-slate-400 mt-10">Memuat pesan...</p>
                ) : messages.length === 0 ? (
                  <p className="text-center text-sm text-slate-500 mt-10">
                    Belum ada pesan. Mulai percakapan dengan menyapa siswa.
                  </p>
                ) : (
                  messages.map((msg) => (
                    <ChatBubble key={msg.id} from={msg.from === "student" ? "psikolog" : "user"} text={msg.text} />
                  ))
                )}
              </div>

              <ChatInput onSend={handleSend} />
            </>
          )}
        </Panel>
      </section>
    </BkShell>
  );
}