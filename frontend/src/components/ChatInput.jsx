import { useState } from "react";
import { SendHorizontal } from "lucide-react";

export default function ChatInput({ onSend }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend?.(trimmed);
    setText("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t border-slate-200 px-4 py-3"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ketik Pesan"
        className="h-9 flex-1 rounded-full border border-slate-200 bg-white px-4 text-xs outline-none placeholder:text-slate-400 focus:border-tertiary"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tertiary text-white transition hover:bg-tertiary-hover disabled:opacity-50 cursor-pointer"
        aria-label="Kirim"
      >
        <SendHorizontal size={15} />
      </button>
    </form>
  );
}