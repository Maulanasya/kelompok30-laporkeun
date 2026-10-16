export default function ChatHeader({ name, ticket }) {
  const initials = name
    .replace(/^Dr\.\s*/, "")
    .split(" ")[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tertiary text-xs font-semibold text-white">
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-primary">{name}</p>
        {ticket && (
          <p className="truncate text-[10px] text-slate-500">{ticket}</p>
        )}
      </div>
    </div>
  );
}