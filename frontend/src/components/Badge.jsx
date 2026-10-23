// frontend/src/components/Badge.jsx

const STATUS_STYLE = {
  PENDING: { dot: "bg-warning", text: "text-neutral-darker", label: "Menunggu" },
  DITINJAU: { dot: "bg-tertiary", text: "text-neutral-darker", label: "Ditinjau" },
  PROSES: { dot: "bg-indigo-500", text: "text-neutral-darker", label: "Diproses" },
  SELESAI: { dot: "bg-success", text: "text-neutral-darker", label: "Selesai" },
};

export default function Badge({ status = "PENDING" }) {
  const style = STATUS_STYLE[status] ?? { dot: "bg-slate-400", text: "text-slate-600", label: status };

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] ${style.text}`}>
      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}