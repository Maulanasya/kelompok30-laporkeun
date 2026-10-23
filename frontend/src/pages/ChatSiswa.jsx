import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "motion/react";
import { Lock, MessageCircleOff, Loader2 } from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import BlurText from "../components/reactbits/BlurText";
import ShinyText from "../components/reactbits/ShinyText";
import ChatHeader from "../components/ChatHeader";
import ChatBubble from "../components/ChatBubble";
import ChatInput from "../components/ChatInput";
import { getUser } from "../utils/auth";
import { api } from "../services/api";

const COLOR_TERTIARY = "#3191A0";
const ANIMATION_EASE = [0.22, 1, 0.36, 1];

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const API_URL = `${SOCKET_URL}/api`;

function Panel({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: ANIMATION_EASE }}
      className={`rounded-3xl border border-slate-200 bg-white shadow-lg shadow-cyan-900/10 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function ChatSiswa() {
  const [searchParams] = useSearchParams();
  const user = getUser();
  
  const urlKodeTiket = searchParams.get("kode");
  const urlLawan = searchParams.get("lawan"); // "BK" atau "PSIKOLOG"

  const [kodeTiket, setKodeTiket] = useState(urlKodeTiket);
  const [messages, setMessages] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noSession, setNoSession] = useState(false);
  
  const [lawanName, setLawanName] = useState(
    urlLawan === "PSIKOLOG" ? "Psikolog" : "Guru BK"
  );

  const socketRef = useRef(null);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (urlKodeTiket) {
      setLoading(false);
      return;
    }

    api.getLaporanSaya()
      .then((res) => {
        const list = res?.data || [];
        const target = list.find((l) => l.status === "DITINJAU" || l.status === "PROSES");

        if (target) {
          setKodeTiket(target.kodeTiket);
          setLawanName(target.status === "DITINJAU" ? "Guru BK" : "Psikolog");
        } else {
          setNoSession(true);
        }
      })
      .catch((err) => setError(err.message || "Gagal memuat data laporan."))
      .finally(() => setLoading(false));
  }, [urlKodeTiket]);

  useEffect(() => {
    if (!kodeTiket) return;

    setLoading(true);
    setError(null);

    fetch(`${API_URL}/chat/${kodeTiket}`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil riwayat chat.");
        return res.json();
      })
      .then((data) => {
        const formatted = (data.chats || []).map((c) => ({
          id: c.id,
          from: c.sender?.id === user?.id ? "user" : "psikolog",
          text: c.pesan,
        }));
        setMessages(formatted);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    const socket = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_room", kodeTiket);
    });

    socket.on("receive_message", (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [
          ...prev,
          {
            id: msg.id,
            from: msg.sender?.id === user?.id ? "user" : "psikolog",
            text: msg.pesan,
          },
        ];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [kodeTiket, user?.id]);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const handleSend = (text) => {
    if (!text.trim() || !socketRef.current || !user || !kodeTiket) return;
    socketRef.current.emit("send_message", {
      kodeTiket: kodeTiket,
      senderId: user.id,
      pesan: text.trim(),
    });
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#F4F9F9] text-slate-800 selection:bg-cyan-100" style={{ fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');`}</style>

      <Navbar />

      <main className="relative flex-1 overflow-hidden pb-16 pt-28 md:pb-24 md:pt-32">
        <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-130 w-130 rounded-full bg-tertiary/15 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 right-0 h-115 w-115 rounded-full bg-[#E9C46A]/20 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="mb-8 max-w-2xl space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-white/80 px-4 py-1.5 text-xs font-medium">
                <Lock size={13} color={COLOR_TERTIARY} />
                <ShinyText text="Percakapan dijaga kerahasiaannya" speed={4} />
              </span>

              <BlurText 
                text={lawanName === "Psikolog" ? "Konseling dengan Psikolog" : "Konsultasi dengan Guru BK"} 
                delay={90} 
                className="flex-wrap text-3xl font-bold leading-[1.15] text-primary md:text-4xl" 
              />
              <p className="leading-relaxed text-slate-600">Konsultasikan masalahmu secara aman dan rahasia.</p>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Panel className="flex h-[600px] flex-col items-center justify-center text-slate-500 gap-3">
                  <Loader2 size={32} className="animate-spin text-tertiary" />
                  <p>Memuat ruang chat...</p>
                </Panel>
              </motion.div>
            ) : error ? (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Panel className="flex h-[600px] flex-col items-center justify-center text-red-500">
                  <p className="font-semibold">{error}</p>
                </Panel>
              </motion.div>
            ) : noSession ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Panel className="flex h-[600px] flex-col items-center justify-center text-center p-6">
                  <div className="mb-6 flex justify-center text-slate-300"><MessageCircleOff size={80} strokeWidth={1.5} /></div>
                  <h2 className="mb-3 text-xl font-bold text-primary">Belum Ada Sesi Konseling</h2>
                  <p className="text-sm leading-relaxed text-slate-500 max-w-md">
                    Saat ini belum ada laporan yang sedang ditinjau atau diproses. 
                    Silakan buat laporan terlebih dahulu atau tunggu Guru BK meninjau laporanmu.
                  </p>
                </Panel>
              </motion.div>
            ) : (
              <motion.div key="chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Panel className="flex h-[600px] flex-col overflow-hidden">
                  <ChatHeader name={lawanName} ticket={kodeTiket} />

                  <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto bg-[#F4F9F9] px-5 py-5">
                    <div className="text-center">
                      <span className="inline-block rounded-full bg-white px-3 py-1 text-xs text-slate-500 shadow-sm">Hari Ini</span>
                    </div>

                    {messages.length === 0 ? (
                      <p className="text-center text-sm text-slate-400 mt-10">Belum ada pesan. Mulai percakapan sekarang.</p>
                    ) : (
                      messages.map((msg) => (
                        <ChatBubble key={msg.id} from={msg.from} text={msg.text} />
                      ))
                    )}
                  </div>

                  <ChatInput onSend={handleSend} />
                </Panel>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}