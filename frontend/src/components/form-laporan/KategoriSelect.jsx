import { ChevronDown } from "lucide-react";
import { KATEGORI_KASUS } from "../../data/formLaporan";

export default function KategoriSelect({ value, onChange }) {
  return (
    <div className="relative">
      <select
        id="kategori"
        value={value}
        onChange={onChange}
        className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-xs text-slate-700 outline-none focus:border-tertiary"
      >
        {KATEGORI_KASUS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}