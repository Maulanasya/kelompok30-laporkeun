import Badge from "./Badge";

export default function ReportCard({
  category,
  ticket,
  date,
  status,
  active = false,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full cursor-pointer rounded-md border p-3 text-left transition ${
        active
          ? "border-tertiary bg-tertiary-light"
          : "border-tertiary/40 bg-white hover:bg-tertiary-light/50"
      }`}
    >
      <h3 className="text-xs font-semibold text-primary">{category}</h3>
      <p className="mt-1 text-[10px] text-tertiary-dark">{ticket}</p>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-[9px] text-tertiary-dark">{date}</p>
        <Badge status={status} />
      </div>
    </button>
  );
}