import { motion } from "framer-motion";
import { Check, CheckCheck } from "lucide-react";

const EASE_OUT_TRANSITION = [0.16, 1, 0.3, 1];

// Mendukung string ISO, Date, number, maupun Firestore Timestamp (.toDate())
export const formatTime = (value) => {
  if (!value) return "";
  const d =
    typeof value?.toDate === "function" ? value.toDate() : new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Jakarta",
  });
};

export default function ChatBubble({
  from = "other",
  isMe,
  text,
  senderName,
  time,
  createdAt,
  sudahBaca,
}) {
  const isUser =
    isMe !== undefined ? Boolean(isMe) : from === "user" || from === "me";

  const jam = createdAt ? formatTime(createdAt) : time || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE_OUT_TRANSITION }}
      className={`mb-2.5 flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex max-w-[75%] flex-col sm:max-w-[65%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        {/* Nama pengirim khusus untuk lawan bicara */}
        {!isUser && senderName && (
          <span className="mb-1 px-1 text-[10px] font-medium text-slate-500">
            {senderName}
          </span>
        )}

        {/* Kotak gelembung chat: teks & waktu/centang sejajar di samping kanan bawah */}
        <div
          className={`rounded-2xl px-3.5 py-2 text-[11px] leading-relaxed ${
            isUser
              ? "rounded-br-xs bg-tertiary text-white shadow-sm shadow-tertiary/20"
              : "rounded-bl-xs border border-slate-200 bg-white text-slate-700"
          }`}
        >
          <div className="flex items-end justify-between gap-2.5">
            <p className="whitespace-pre-wrap wrap-break-word">{text}</p>

            {(jam || isUser) && (
              <div
                className={`mb-0.5 flex shrink-0 items-center gap-1 text-[9px] leading-none ${
                  isUser ? "text-white/80" : "text-slate-400"
                }`}
              >
                {jam && <span>{jam}</span>}
                {isUser &&
                  (sudahBaca ? (
                    <CheckCheck
                      size={13}
                      className="text-sky-200"
                      aria-label="Dibaca"
                    />
                  ) : (
                    <Check size={13} aria-label="Terkirim" />
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}