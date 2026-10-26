import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FileText, ArrowLeft, Loader2 } from "lucide-react";

import BkShell, { Panel } from "../../components/layout/BkShell";
import ChatList from "../../components/ChatList";
import ChatHeader from "../../components/ChatHeader";
import ChatBubble from "../../components/ChatBubble";
import ChatInput from "../../components/ChatInput";
import useChat from "../../hooks/useChat";
import { api } from "../../services/api";

const STACKED_LAYOUT_QUERY = "(max-width: 1023px)";
const PAGE_SCROLL_OFFSET = 96;

const scrollPageTo = (el) => {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - PAGE_SCROLL_OFFSET;
  window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
};

const dayLabel = (value) => {
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const same = (a, b) => a.toDateString() === b.toDateString();

  if (same(d, today)) return "Hari ini";
  if (same(d, yesterday)) return "Kemarin";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const isSameDay = (a, b) => {
  const da = new Date(a);
  const db = new Date(b);
  if (isNaN(da.getTime()) || isNaN(db.getTime())) return false;
  return da.toDateString() === db.toDateString();
};

export default function BkKonsultasi() {
  const [params] = useSearchParams();
  const initialTicket = (params.get("kode") || "").trim().toUpperCase() || null;

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");

  const listPanelRef = useRef(null);
  const chatPanelRef = useRef(null);
  const messagesRef = useRef(null);

  // 1. Memuat daftar percakapan
  const loadList = useCallback(async () => {
    try {
      const res = await api.getChatList();
      if (res.error) {
        setListError(res.error);
        return;
      }
      setConversations(res.data || []);
      setListError("");
    } catch {
      setListError("Gagal memuat daftar percakapan.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const items = useMemo(() => {
    if (initialTicket && !conversations.some((c) => c.ticket === initialTicket)) {
      return [
        {
          id: initialTicket,
          ticket: initialTicket,
          name: `Laporan ${initialTicket}`,
          lastMessage: "Belum ada pesan",
          time: "",
          unread: 0,
        },
        ...conversations,
      ];
    }
    return conversations;
  }, [conversations, initialTicket]);

  const active =
    items.find((c) => c.id === activeId) ??
    items.find((c) => c.ticket === initialTicket) ??
    items[0];

  // 2. Load riwayat chat & socket realtime
  const {
    messages,
    readOnly,
    loading: loadingMessages,
    error,
    connected,
    send,
  } = useChat(active?.ticket, { onListChange: loadList });

  // Hanya dikunci jika laporan memiliki sesi Psikolog (sudah dialihkan)
  const lockedByRule = Boolean(active?.hasPsikolog);

  // Auto-scroll ke pesan terbaru
  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, active?.id]);

  const handleSelect = (id) => {
    const stacked = window.matchMedia(STACKED_LAYOUT_QUERY).matches;
    if (id === active?.id) {
      if (stacked) scrollPageTo(chatPanelRef.current);
      return;
    }
    setActiveId(id);
    if (stacked) requestAnimationFrame(() => scrollPageTo(chatPanelRef.current));
  };

  const handleBackToList = () => scrollPageTo(listPanelRef.current);

  if (loadingList) {
    return (
      <BkShell title="Konsultasi" subtitle="Memuat daftar percakapan...">
        <Panel className="flex h-100 items-center justify-center gap-2 text-slate-500">
          <Loader2 className="animate-spin" /> Memuat...
        </Panel>
      </BkShell>
    );
  }

  if (!active) {
    return (
      <BkShell title="Konsultasi" subtitle="Belum ada chat">
        <Panel className="p-8 text-center">
          <p className="text-sm text-slate-600">
            {listError || "Belum ada siswa yang memulai percakapan."}
          </p>
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
        {/* Panel Kiri: daftar percakapan */}
        <Panel
          innerRef={listPanelRef}
          className="scroll-mt-24 p-5 lg:h-160 lg:overflow-y-auto"
        >
          <ChatList
            conversations={items}
            activeId={active.id}
            onSelect={handleSelect}
          />
        </Panel>

        {/* Panel Kanan: ruang chat */}
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

          {!connected && (
            <p className="bg-amber-50 px-5 py-1.5 text-center text-xs text-amber-700">
              Menghubungkan ke server chat...
            </p>
          )}

          {/* Area bubble chat */}
          <div
            ref={messagesRef}
            className="flex-1 space-y-3 overflow-y-auto bg-[#F4F9F9] px-5 py-5"
          >
            {loadingMessages ? (
              <p className="pt-10 text-center text-xs text-slate-400">Memuat pesan...</p>
            ) : messages.length === 0 ? (
              <p className="pt-10 text-center text-sm text-slate-500">
                Belum ada pesan. Mulai percakapan.
              </p>
            ) : (
              messages.map((msg, i) => {
                const prev = messages[i - 1];
                const showDate =
                  msg.createdAt &&
                  (!prev?.createdAt || !isSameDay(prev.createdAt, msg.createdAt));

                return (
                  <Fragment key={msg.id}>
                    {showDate && (
                      <div className="flex justify-center py-1">
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-slate-500 shadow-sm">
                          {dayLabel(msg.createdAt)}
                        </span>
                      </div>
                    )}
                    <ChatBubble
                      from={msg.from}
                      isMe={msg.isMe}
                      text={msg.text}
                      senderName={msg.senderName}
                      time={msg.time}
                      createdAt={msg.createdAt}
                      sudahBaca={msg.sudahBaca}
                    />
                  </Fragment>
                );
              })
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="border-t border-red-100 bg-red-50 px-5 py-2 text-xs text-red-700"
            >
              {error}
            </p>
          )}

          {readOnly || lockedByRule ? (
            <p className="border-t border-slate-100 bg-white px-5 py-3.5 text-center text-xs text-slate-500">
              {readOnly
                ? "Percakapan ini sudah ditutup karena laporan telah selesai. Hanya bisa dibaca."
                : "Laporan sudah dialihkan ke psikolog. Kamu tidak bisa mengirim pesan lagi."}
            </p>
          ) : (
            <ChatInput onSend={send} />
          )}
        </Panel>
      </section>
    </BkShell>
  );
}