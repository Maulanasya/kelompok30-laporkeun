import Card from "../Card";
import {
  INFO_UTAMA,
  TIPS_TEXT,
  SETELAH_DIKIRIM_TEXT,
} from "../../data/formLaporan";

export default function InfoSidebar() {
  return (
    <Card className="space-y-5 p-6">
      {/* Sebelum Mengirim */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-primary">Sebelum Mengirim</h3>
          <span className="text-lg leading-none text-slate-400">⋯</span>
        </div>

        <ul className="space-y-3">
          {INFO_UTAMA.map((item, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-primary">
                  {item.title}
                </p>
                <p className="text-xs leading-relaxed text-slate-500">
                  {item.desc}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <hr className="border-slate-200" />

      {/* Tips */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-primary">Tips</h3>
        </div>
        <p className="text-xs leading-relaxed text-slate-600">{TIPS_TEXT}</p>
      </div>

      <hr className="border-slate-200" />

      {/* Setelah dikirim */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-primary">Setelah dikirim</h3>
        </div>
        <p className="text-xs leading-relaxed text-slate-600">
          {SETELAH_DIKIRIM_TEXT}
        </p>
      </div>
    </Card>
  );
}