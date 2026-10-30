import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Lock, MessageCircleOff, ArrowLeft, Loader2 } from "lucide-react";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Panel } from "../components/layout/BkShell";
import BlurText from "../components/reactbits/BlurText";
import ShinyText from "../components/reactbits/ShinyText";
import ChatList from "../components/ChatList";
import ChatHeader from "../components/ChatHeader";
import ChatBubble from "../components/ChatBubble";
import ChatInput from "../components/ChatInput";
import { api } from "../services/api";
import { getUser } from "../utils/auth";
import { db } from "../lib/firebase";

const COLOR_TERTIARY = "#3191A0";
const STACKED_LAYOUT_QUERY = "(max-width: 1023px)";
const PAGE_SCROLL_OFFSET = 96;

const scrollPageTo = (el) => {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - PAGE_SCROLL_OFFSET;
  window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
};

const lawanLabel = (lawan) => (lawan === "PSIKOLOG" ? "Psikolog" : "Guru BK");


export default function ChatSiswa() {
  const [params] = useSearchParams();
  const user = getUser();

  const urlKode = (params.get("kode") || "").trim().toUpperCase() || null;
  const urlLawan = params.get("lawan") === "PSIKOLOG" ? "PSIKOLOG" : params.get("lawan") === "BK" ? "BK" : null;

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);

  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [listError, setListError] = useState("");
  const [chatError, setChatError] = useState("");

  const listPanelRef = useRef(null);
  const chatPanelRef = useRef(null);
  const messagesRef = useRef(null);

  // 1. Ambil daftar laporan milik siswa
  const loadList = useCallback(async () => {
    try {
      const res = await api.getLaporanSaya();
      const list = res?.data || [];

      const formatted = list
        .filter((l) => l.status === "DITINJAU" || l.status === "PROSES")
        .flatMap((l) => {
          const time = new Date(l.updatedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
          const make = (lawan, person) => {
            return {
              id: `${l.kodeTiket}__${lawan}`,
              ticket: l.kodeTiket,
              lawan,
              person,
              name: person || `${lawanLabel(lawan)} · ${l.kodeTiket}`,
              lastMessage: person ? `${lawanLabel(lawan)} · ${l.kodeTiket}` : "Buka untuk melihat chat",
              time,
              unread: 0,
            };
          };

          // Satu chat per jenis sesi (BK / PSIKOLOG) yang ada di laporan ini.
          const seen = new Set();
          const rows = [];
          for (const s of l.sesi || []) {
            const lawan = s.jenis === "PSIKOLOG" ? "PSIKOLOG" : "BK";
            if (seen.has(lawan)) continue;
            seen.add(lawan);
            rows.push(make(lawan, lawan === "PSIKOLOG" ? s.psikolog?.nama : s.guruBk?.nama));
          }

          // Cadangan: belum ada sesi sama sekali, tampilkan chat BK dari data pendamping.
          if (rows.length === 0) {
            rows.push(make("BK", l.pendamping?.role === "BK" ? l.pendamping?.nama : null));
          }
          return rows;
        });

      setConversations(formatted);
      setListError("");
    } catch (err) {
      setListError(err?.message || "Gagal memuat daftar percakapan.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  // Kalau dibuka dari URL (?kode=...&lawan=...) tapi belum ada di daftar
  const items = useMemo(() => {
    if (urlKode) {
      const lawan = urlLawan || "BK";
      const id = `${urlKode}__${lawan}`;
      if (!conversations.some((c) => c.id === id)) {
        return [
          {
            id,
            ticket: urlKode,
            lawan,
            name: `${lawanLabel(lawan)} · ${urlKode}`,
            lastMessage: "Belum ada pesan",
            time: "",
            unread: 0,
          },
          ...conversations,
        ];
      }
    }
    return conversations;
  }, [conversations, urlKode, urlLawan]);

  const active =
    items.find((c) => c.id === activeId) ??
    items.find((c) => c.ticket === urlKode && (!urlLawan || c.lawan === urlLawan)) ??
    items[0];

  // 2. Tarik chat dari Firestore (realtime)
  useEffect(() => {
    if (!active?.ticket) return;

    setLoadingMessages(true);
    setMessages([]);
    setChatError("");

    const q = query(
      collection(db, "chats"),
      where("kodeTiket", "==", active.ticket),
      where("lawan", "==", active.lawan),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoadingMessages(false);
      },
      (err) => {
        console.error(err);
        setChatError("Gagal memuat pesan.");
        setLoadingMessages(false);
      }
    );

    return () => unsubscribe();
  }, [active?.ticket, active?.lawan]);

  // 3. Kirim pesan
  const handleSend = async (text) => {
    if (!text?.trim() || !user || !active?.ticket) return;
    try {
      await addDoc(collection(db, "chats"), {
        kodeTiket: active.ticket,
        lawan: active.lawan,
        senderId: user.id,
        senderName: user.nama,
        senderRole: user.role,
        pesan: text.trim(),
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Gagal kirim pesan:", err);
    }
  };

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

  const heading = active ? `Konsultasi dengan ${lawanLabel(active.lawan)}` : "Ruang Konsultasi";

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F9F9] text-slate-800">
      <Navbar />
      <main className="relative flex-1 pb-16 pt-28 md:pb-24 md:pt-32">
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mb-8 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-white/80 px-4 py-1.5 text-xs font-medium">
              <Lock size={13} color={COLOR_TERTIARY} />
              <ShinyText text="Percakapan dijaga kerahasiaannya" speed={4} />
            </span>
            <BlurText
              key={heading}
              text={heading}
              delay={90}
              className="flex-wrap text-3xl font-bold leading-[1.15] text-primary md:text-4xl"
            />
          </div>

          {loadingList ? (
            <Panel className="flex h-100 items-center justify-center gap-2 text-slate-500">
              <Loader2 className="animate-spin text-tertiary" /> Memuat ruang chat...
            </Panel>
          ) : !active ? (
            <Panel className="flex h-100 flex-col items-center justify-center p-8 text-center">
              <MessageCircleOff size={80} className="mb-6 text-slate-300" strokeWidth={1.5} />
              <h2 className="mb-3 text-xl font-bold text-primary">
                {listError ? "Gagal memuat sesi" : "Belum Ada Sesi Konseling"}
              </h2>
              <p className="max-w-md text-sm text-slate-500">
                {listError || "Saat ini belum ada laporan yang sedang ditinjau atau diproses."}
              </p>
            </Panel>
          ) : (
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
              <Panel innerRef={listPanelRef} className="scroll-mt-24 p-5 lg:h-160 lg:overflow-y-auto">
                <ChatList conversations={items} activeId={active.id} onSelect={handleSelect} />
              </Panel>

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

                <ChatHeader
                  name={active.person ? `${active.person} (${lawanLabel(active.lawan)})` : lawanLabel(active.lawan)}
                  ticket={active.ticket}
                />

                <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto bg-[#F4F9F9] px-5 py-5">
                  {loadingMessages ? (
                    <p className="pt-10 text-center text-xs text-slate-400">Memuat pesan...</p>
                  ) : chatError ? (
                    <p className="pt-10 text-center text-xs text-red-500">{chatError}</p>
                  ) : messages.length === 0 ? (
                    <p className="pt-10 text-center text-sm text-slate-500">
                      Belum ada pesan. Mulai percakapan dengan menyapa {active.person || lawanLabel(active.lawan)}.
                    </p>
                  ) : (
                    messages.map((msg) => (
                      <ChatBubble
                        key={msg.id}
                        from={String(msg.senderId) === String(user?.id) ? "user" : "psikolog"}
                        text={msg.pesan}
                      />
                    ))
                  )}
                </div>

                <ChatInput onSend={handleSend} />
              </Panel>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}