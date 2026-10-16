export default function EvidenceItem({ name, size }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-neutral-dark/30 px-2 py-1.5">
      <div className="flex min-w-0 items-center gap-2">
        <div className="h-7 w-7 shrink-0 rounded bg-neutral-dark/30" />

        <div className="min-w-0">
          <p className="truncate text-[9px] font-medium text-neutral-darker">
            {name}
          </p>
          <small className="text-[8px] text-neutral-dark">{size}</small>
        </div>
      </div>

      <button
        type="button"
        className="rounded border border-tertiary px-4 py-1 text-[9px] text-tertiary hover:bg-tertiary-light"
      >
        Lihat
      </button>
    </div>
  );
}