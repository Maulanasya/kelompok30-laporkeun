import { STATUS } from "../../data/bkReports";

export default function StatusBadge({ status }) {
  const s = STATUS[status] || {
    label: status,
    cls: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}