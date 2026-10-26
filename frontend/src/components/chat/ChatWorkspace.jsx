import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FileText, ArrowLeft } from "lucide-react";

import { Panel } from "../layout/BkShell";
import ChatList from "../ChatList";
import ChatHeader from "../ChatHeader";
import ChatBubble from "../ChatBubble";
import ChatInput from "../ChatInput";
import useChat from "../../hooks/useChat";
import { api } from "../../services/api";

const STACKED_LAYOUT_QUERY = "(max-width: 1023px)";
const PAGE_SCROLL_OFFSET = 96;

const scrollPageTo = (el) => {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - PAGE_SCROLL_OFFSET;
  window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
};

export default function ChatWorkspace({
  initialTicket: propInitialTicket,
  bannerText = "Perlu melihat detail laporan?",
  bannerLabel = "Buka detail laporan",
  reportLink = (ticket) => `/bk/laporan/${ticket}`,
  emptyText = "Belum ada percakapan.",
}) {
  const [params] = useSearchParams();
  const urlTicket = ((params.get("kode") || params.get("sesi")) || "").trim().toUpperCase() || null;
  const urlLawan = (params.get("lawan") || "").trim().toUpperCase() || null;
  const initialTicket = propInitialTicket || urlTicket;

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");

  const listPanelRef = useRef(null);
  const chatPanelRef = useRef(null);
  const messagesRef = useRef(null);

  const loadList = useCallback(async () => {
    try {
      // Sertakan query lawan jika ada dari URL
      const queryParams = urlLawan ? { lawan: urlLawan } : undefined;
      const res = await api.getChatList(queryParams);

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
  }, [urlLawan]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const items = useMemo(() => {
    if (initialTicket && !conversations.some((c) => c.ticket === initialTicket)) {
      return [
        {
          id: initialTicket,
          ticket: initialTicket,
          name: urlLawan === "PSIKOLOG" ? "Psikolog Pendamping" : "Guru BK Pendamping",
          lastMessage: "Belum ada pesan",
          time: "",
          unread: 0,
        },
        ...conversations,
      ];
    }
    return conversations;
  }, [conversations, initialTicket, urlLawan]);

  const active =
    items.find((c) => c.id === activeId) ??
    items.find((c) => c.ticket === initialTicket) ??
    items[0];

  const {
    messages,
    readOnly,
    loading: loadingMessages,
    error,
    connected,
    send,
  } = useChat(active?.ticket, { lawan: urlLawan, onListChange: loadList });

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
      <Panel className="flex h-100 items-center justify-center text-slate-500">
        Memuat daftar percakapan...
      </Panel>
    );
  }

  if (!active) {
    return (
      <Panel className="p-8 text-center text-sm text-slate-600">
        {listError || emptyText}
      </Panel>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      {/* Panel Kiri: Daftar Chat */}
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

      {/* Panel Kanan: Area Room Chat */}
      <Panel
        innerRef={chatPanelRef}
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

        {bannerText && (
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-5 py-2 text-xs text-slate-500">
            <span>{bannerText}</span>
            <Link
              to={reportLink(active.ticket)}
              className="inline-flex items-center gap-1.5 font-semibold text-tertiary hover:underline"
            >
              <FileText size={13} /> {bannerLabel}
            </Link>
          </div>
        )}

        {!connected && (
          <p className="bg-amber-50 px-5 py-1.5 text-center text-xs text-amber-700">
            Menghubungkan ke server chat...
          </p>
        )}

        <div
          ref={messagesRef}
          className="flex-1 space-y-3 overflow-y-auto bg-[#F4F9F9] px-5 py-5"
        >
          {loadingMessages ? (
            <p className="pt-10 text-center text-xs text-slate-400">Memuat pesan...</p>
          ) : messages.length === 0 ? (
            <p className="pt-10 text-center text-sm text-slate-500">
              Belum ada pesan. Mulai percakapan sekarang.
            </p>
          ) : (
            messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                from={msg.from}
                isMe={msg.isMe}
                text={msg.text}
                senderName={msg.senderName}
                time={msg.time}
                createdAt={msg.createdAt}
                sudahBaca={msg.sudahBaca}
              />
            ))
          )}
        </div>

        {error && (
          <p role="alert" className="border-t border-red-100 bg-red-50 px-5 py-2 text-xs text-red-700">
            {error}
          </p>
        )}

        {readOnly ? (
          <p className="border-t border-slate-100 bg-white px-5 py-3.5 text-center text-xs text-slate-500">
            Percakapan ini sudah ditutup karena laporan telah selesai.
          </p>
        ) : (
          <ChatInput onSend={send} />
        )}
      </Panel>
    </section>
  );
}