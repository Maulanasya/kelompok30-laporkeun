const STATUS_STYLE = {
  Ditinjau: { dot: "bg-warning", text: "text-neutral-darker" },
  Diterima: { dot: "bg-tertiary", text: "text-neutral-darker" },
  Selesai: { dot: "bg-success", text: "text-neutral-darker" },
  Ditolak: { dot: "bg-danger", text: "text-neutral-darker" },
};

export default function Badge({ status = "Ditinjau" }) {
  const style = STATUS_STYLE[status] ?? STATUS_STYLE.Ditinjau;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] ${style.text}`}
    >
      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}