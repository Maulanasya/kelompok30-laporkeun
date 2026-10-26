import { SESI_STATUS } from "../../data/psikologCases";

// Badge status sesi pendampingan psikolog
export default function SesiBadge({ status }) {
  const s = SESI_STATUS[status];
  if (!s) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${s.cls}`}
    >
      {s.label}
    </span>
  );
}