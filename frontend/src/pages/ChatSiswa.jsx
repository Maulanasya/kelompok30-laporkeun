import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, MessageCircleOff, Loader2 } from "lucide-react";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import BlurText from "../components/reactbits/BlurText";
import ShinyText from "../components/reactbits/ShinyText";
import ChatHeader from "../components/ChatHeader";
import ChatBubble from "../components/ChatBubble";
import ChatInput from "../components/ChatInput";
import { api } from "../services/api";
import { getUser } from "../utils/auth";
import { db } from "../lib/firebase";

const COLOR_TERTIARY = "#3191A0";

function Panel({ children, className = "" }) {
  return (
    <div className={`rounded-3xl border border-slate-200 bg-white shadow-lg shadow-cyan-900/10 ${className}`}>
      {children}
    </div>
  );
}

export default function ChatSiswa() {
  const [searchParams] = useSearchParams();
  const user = getUser();

  const urlKodeTiket = searchParams.get("kode");
  const urlLawan = searchParams.get("lawan"); // "BK" atau "PSIKOLOG"

  const [kodeTiket, setKodeTiket] = useState(urlKodeTiket);
  const [lawan, setLawan] = useState(urlLawan === "PSIKOLOG" ? "PSIKOLOG" : "BK");
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(!urlKodeTiket);
  const [error, setError] = useState(null);
  const [noSession, setNoSession] = useState(false);

  const messagesRef = useRef(null);

  // 1. Cari tiket otomatis kalau dari URL kosong
  useEffect(() => {
    if (urlKodeTiket) {
      setKodeTiket(urlKodeTiket);
      setLawan(urlLawan === "PSIKOLOG" ? "PSIKOLOG" : "BK");
      setLoading(false);
      return;
    }

    api.getLaporanSaya()
      .then((res) => {
        const list = res?.data || [];
        const target = list.find((l) => l.status === "DITINJAU" || l.status === "PROSES");
        if (target) {
          setKodeTiket(target.kodeTiket);
          setLawan(target.status === "DITINJAU" ? "BK" : "PSIKOLOG");
        } else {
          setNoSession(true);
        }
      })
      .catch((err) => setError(err.message || "Gagal memuat data laporan."))
      .finally(() => setLoading(false));
  }, [urlKodeTiket, urlLawan]);

  // 2. Tarik Chat dari Firestore (Realtime)
  useEffect(() => {
    if (!kodeTiket || !lawan) return;

    setLoading(true);
    setMessages([]);
    setError(null);
    
    const q = query(
      collection(db, "chats"),
      where("kodeTiket", "==", kodeTiket),
      where("lawan", "==", lawan),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setError("Gagal memuat pesan.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [kodeTiket, lawan]);

  // 3. Kirim Pesan ke Firestore
  const handleSend = async (text) => {
    if (!text?.trim() || !user || !kodeTiket || !lawan) return;
    try {
      await addDoc(collection(db, "chats"), {
        kodeTiket,
        lawan,
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
  }, [messages.length]);

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F9F9] text-slate-800">
      <Navbar />
      <main className="relative flex-1 pb-16 pt-28 md:pb-24 md:pt-32">
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="mb-8 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-white/80 px-4 py-1.5 text-xs font-medium">
              <Lock size={13} color={COLOR_TERTIARY} />
              <ShinyText text="Percakapan dijaga kerahasiaannya" speed={4} />
            </span>
            <BlurText 
              text={lawan === "PSIKOLOG" ? "Konseling dengan Psikolog" : "Konsultasi dengan Guru BK"} 
              delay={90} 
              className="flex-wrap text-3xl font-bold leading-[1.15] text-primary md:text-4xl" 
            />
          </div>

          {loading ? (
            <Panel className="flex h-[500px] flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="animate-spin text-tertiary" size={32} />
              <p className="text-sm">Memuat ruang chat...</p>
            </Panel>
          ) : error ? (
            <Panel className="flex h-[500px] items-center justify-center text-red-500">{error}</Panel>
          ) : noSession ? (
            <Panel className="flex h-[500px] flex-col items-center justify-center p-6 text-center">
               <MessageCircleOff size={80} className="mb-6 text-slate-300" strokeWidth={1.5} />
               <h2 className="mb-3 text-xl font-bold text-primary">Belum Ada Sesi Konseling</h2>
               <p className="max-w-md text-sm text-slate-500">Saat ini belum ada laporan yang sedang ditinjau atau diproses.</p>
            </Panel>
          ) : (
            <Panel className="flex h-[600px] flex-col overflow-hidden">
              <ChatHeader name={lawan === "PSIKOLOG" ? "Psikolog" : "Guru BK"} ticket={kodeTiket} />
              <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto bg-[#F4F9F9] px-5 py-5">
                {messages.length === 0 ? (
                  <p className="mt-10 text-center text-sm text-slate-400">Belum ada pesan. Mulai percakapan sekarang.</p>
                ) : (
                  messages.map((msg) => (
                    <ChatBubble key={msg.id} from={String(msg.senderId) === String(user?.id) ? "user" : "psikolog"} text={msg.pesan} />
                  ))
                )}
              </div>
              <ChatInput onSend={handleSend} />
            </Panel>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}