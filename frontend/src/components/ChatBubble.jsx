import { motion } from "framer-motion";

const EASE_OUT_TRANSITION = [0.16, 1, 0.3, 1];

export default function ChatBubble({ from = "psikolog", text }) {
  const isUser = from === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE_OUT_TRANSITION }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-3 py-2 text-[11px] leading-relaxed sm:max-w-[65%] ${
          isUser
            ? "bg-tertiary text-white shadow-sm shadow-tertiary/20"
            : "border border-slate-200 bg-white text-slate-700"
        }`}
      >
        {text}
      </div>
    </motion.div>
  );
}