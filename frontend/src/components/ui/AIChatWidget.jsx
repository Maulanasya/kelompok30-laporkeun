import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bot, X, Send, Sparkles } from "lucide-react";

// --- Design Tokens ---
const COLOR_PRIMARY = "#023346";
const COLOR_TERTIARY = "#3191A0";
const ANIMATION_EASE = [0.22, 1, 0.36, 1];

// Endpoint backend (bisa diubah lewat .env: VITE_API_URL=https://domain-kamu.com)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const AI_ENDPOINT = `${API_BASE_URL}/api/ai/ask`;

// Kirim pesan ke backend, backend yang memanggil Gemini AI
const handleSendAIMessage = async (userMessage) => {
  try {
    const response = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userMessage }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Gagal mendapatkan respon dari AI");
    }

    // data.reply berisi balasan teks dari Gemini AI di Backend
    return data.reply;
  } catch (error) {
    console.error("AI Chatbot Error:", error);
    throw error;
  }
};

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Halo! Saya Asisten AI LaporKeun!. Ada yang ingin kamu tanyakan seputar perundungan, kesehatan mental, atau cara kerja platform ini?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setIsLoading(true);

    try {
      // Panggil backend (yang meneruskan ke Gemini AI)
      const aiReply = await handleSendAIMessage(userText);

      setMessages((prev) => [...prev, { sender: "ai", text: aiReply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text:
            error?.message && error.message !== "Failed to fetch"
              ? `Maaf, ${error.message}`
              : "Maaf, terjadi kendala saat terhubung ke AI. Silakan coba beberapa saat lagi.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* Container Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: ANIMATION_EASE }}
            className="w-85 sm:w-95 h-120 bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          >
            {/* Chat Header */}
            <div
              className="p-4 text-white flex items-center justify-between shrink-0"
              style={{ background: COLOR_PRIMARY }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-full text-cyan-300">
                  <Bot size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm flex items-center gap-1.5">
                    Tanya AI LaporKeun!{" "}
                    <Sparkles size={14} className="text-amber-300" />
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Asisten Edukasi & Informasi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Tutup Chat"
                className="p-1.5 hover:bg-white/10 rounded-full transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F4F9F9] text-sm">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2 ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.sender === "ai" && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 mt-1"
                      style={{ background: COLOR_TERTIARY }}
                    >
                      <Bot size={14} />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.sender === "user"
                        ? "bg-[#023346] text-white rounded-br-none"
                        : "bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2 items-center text-slate-400 text-xs italic">
                  <Bot size={14} className="animate-spin" /> AI sedang mengetik...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSend}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanyakan sesuatu seputar bullying..."
                className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-full outline-none focus:border-tertiary"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Kirim Pesan"
                className="p-2.5 rounded-full text-white disabled:opacity-50 transition cursor-pointer shrink-0"
                style={{ background: COLOR_TERTIARY }}
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button (disembunyikan saat chat terbuka) */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-5 py-3.5 rounded-full text-white shadow-xl shadow-cyan-950/20 cursor-pointer"
          style={{ background: COLOR_PRIMARY }}
        >
          <Sparkles size={18} className="text-amber-300" />
          <span className="text-sm font-semibold">Tanya AI</span>
        </motion.button>
      )}
    </div>
  );
}