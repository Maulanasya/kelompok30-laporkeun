import { Info } from "lucide-react";

const OPTIONS = [
  {
    value: "anonim",
    label: "Anonim",
    hint: "Nama kamu tidak akan dicantumkan dalam laporan.",
  },
  {
    value: "nama",
    label: "Gunakan Nama Lengkap",
    hint: "Nama kamu akan tercatat untuk keperluan pendampingan.",
  },
];

export default function IdentitasRadio({ value, onChange }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-primary">
          Identitas Pelapor
        </span>
        <Info size={13} className="text-slate-400" />
      </div>

      <div className="space-y-2">
        {OPTIONS.map((opt) => {
          const checked = value === opt.value;
          return (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition ${
                checked
                  ? "border-tertiary bg-tertiary-light/40"
                  : "border-slate-200 hover:border-tertiary/50"
              }`}
            >
              <input
                type="radio"
                name="identitas"
                value={opt.value}
                checked={checked}
                onChange={() => onChange(opt.value)}
                className="mt-0.5 h-3.5 w-3.5 accent-tertiary"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-primary">
                  {opt.label}
                </p>
                <p className="text-[10px] text-slate-500">{opt.hint}</p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}