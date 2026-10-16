import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/Card";
import ChatList from "../components/ChatList";
import ChatHeader from "../components/ChatHeader";
import ChatBubble from "../components/ChatBubble";
import ChatInput from "../components/ChatInput";
import {
  conversations as initialConversations,
  messages as initialMessages,
} from "../data/conversations";

export default function ChatPsikolog() {
  const [activeId, setActiveId] = useState(initialConversations[0].id);
  const [messages, setMessages] = useState(initialMessages);

  const activeConversation = initialConversations.find(
    (c) => c.id === activeId
  );

  const handleSend = (text) => {
    setMessages((prev) => [...prev, { id: Date.now(), from: "user", text }]);
  };

  return (
    <div className="min-h-screen bg-neutral-light font-sans pt-20">
      <Navbar />

      <main className="relative overflow-hidden">
        {/* Dekorasi kiri — glow teal (gaya Maulana) */}
        <div
          aria-hidden="true"
          className="absolute -top-40 -left-32 h-130 w-130 rounded-full bg-[#1597A8]/15 blur-3xl pointer-events-none"
        />

        {/* Dekorasi kanan bawah — glow emas (gaya Maulana) */}
        <div
          aria-hidden="true"
          className="absolute -bottom-40 right-0 h-115 w-115 rounded-full bg-[#E9C46A]/20 blur-3xl pointer-events-none"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          {/* Judul halaman */}
          <div className="mb-5 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <h1 className="text-lg font-semibold text-primary sm:text-xl">
              Ruang Konseling & Chat Psikolog
            </h1>
            <p className="mt-1 text-[11px] text-slate-500">
              Konsultasikan masalahmu secara aman dan rahasia
            </p>
          </div>

          {/* Layout 2 kolom */}
          <section className="grid grid-cols-1 gap-3 lg:grid-cols-[320px_minmax(0,1fr)]">
            {/* KIRI: List Percakapan */}
            <Card className="p-4 lg:h-[600px]">
              <ChatList
                conversations={initialConversations}
                activeId={activeId}
                onSelect={setActiveId}
              />
            </Card>

            {/* KANAN: Area Chat */}
            <Card className="flex flex-col overflow-hidden p-0 lg:h-[600px]">
              <ChatHeader
                name={activeConversation.name}
                ticket={activeConversation.ticket}
              />

              <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
                <p className="text-center text-[10px] text-slate-400">
                  Hari Ini
                </p>

                {messages.map((msg) => (
                  <ChatBubble key={msg.id} from={msg.from} text={msg.text} />
                ))}
              </div>

              <ChatInput onSend={handleSend} />
            </Card>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}