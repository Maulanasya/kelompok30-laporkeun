import { motion } from "framer-motion";

export default function ChatListItem({
  name,
  lastMessage,
  time,
  online = false,
  active = false,
  onClick,
}) {
  const initials = name
    .replace(/^Dr\.\s*/, "")
    .split(" ")[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-colors ${
        active
          ? "border-tertiary bg-tertiary-light"
          : "border-transparent hover:bg-primary-light/50"
      }`}
    >
      <div className="relative shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-tertiary text-[10px] font-semibold text-white">
          {initials}
        </div>
        {online && (
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-success" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-semibold text-primary">
          {name}
        </p>
        <p className="truncate text-[9px] text-slate-500">{lastMessage}</p>
      </div>

      <span className="shrink-0 text-[9px] text-slate-400">{time}</span>
    </motion.button>
  );
}