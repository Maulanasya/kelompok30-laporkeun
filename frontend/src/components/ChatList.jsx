import { Search } from "lucide-react";
import ChatListItem from "./ChatListItem";

export default function ChatList({ conversations = [], activeId, onSelect }) {
  return (
    <div className="flex h-full flex-col">
      <h2 className="mb-4 text-lg font-semibold text-primary sm:text-xl">
        Percakapan
      </h2>

      <div className="relative mb-3">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Cari Percakapan"
          className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none placeholder:text-slate-400 focus:border-tertiary"
        />
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto">
        {conversations.map((conv) => (
          <ChatListItem
            key={conv.id}
            {...conv}
            active={conv.id === activeId}
            onClick={() => onSelect?.(conv.id)}
          />
        ))}
      </div>
    </div>
  );
}