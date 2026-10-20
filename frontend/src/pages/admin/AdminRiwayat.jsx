import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search, Tag, ArrowRight, UserRound, Clock } from "lucide-react";

import BkShell, { Panel, EASE } from "../../components/layout/BkShell";
import BkSelect from "../../components/bk/BkSelect";
import { FIELD } from "../../components/admin/Modal";
import { LOG, LAPORAN_STATUS } from "../../data/adminData";

// Grid layout konsisten untuk tampilan desktop (4 kolom) dan bertumpuk di mobile
const GRID = "grid-cols-1 gap-x-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,1fr)_10rem]";

export default function AdminRiwayat() {
  const [status, setStatus] = useState("semua");
  const [query, setQuery] = useState("");

  // Memfilter log riwayat penanganan berdasarkan status perubahan baru & kata kunci pencarian
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LOG.filter(
      (l) =>
        (status === "semua" || l.ke === status) &&
        (!q || l.kode.toLowerCase().includes(q) || l.pengubah.toLowerCase().includes(q))
    );
  }, [status, query]);

  return (
    <BkShell
      title="Riwayat penanganan"
      subtitle="Jejak perubahan status laporan dan pengalihan pendampingan. Hanya dapat dibaca, tanpa identitas pelapor."
    >
      <Panel delay={0.1} className="space-y-5 p-5 md:p-6">
        {/* Kontrol pencarian kata kunci dan filter status */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Cari riwayat</span>
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari kode laporan atau nama petugas"
              className={`${FIELD} rounded-full pl-11`}
            />
          </label>
          <BkSelect
            ariaLabel="Filter status baru"
            icon={Tag}
            value={status}
            onChange={setStatus}
            options={[
              { value: "semua", label: "Semua status" },
              ...Object.entries(LAPORAN_STATUS).map(([value, label]) => ({ value, label })),
            ]}
            className="sm:w-64"
          />
        </div>

        {/* Tampilan daftar riwayat aktivitas */}
        {filtered.length === 0 ? (
          <p className="rounded-2xl bg-[#F4F9F9] px-6 py-10 text-center text-sm text-slate-500">
            Tidak ada riwayat yang cocok.
          </p>
        ) : (
          <div>
            {/* Header tabel untuk tampilan layar besar */}
            <div aria-hidden="true" className={`hidden px-3 pb-2 text-xs font-semibold text-slate-500 lg:grid ${GRID}`}>
              <span>Laporan</span>
              <span>Perubahan</span>
              <span>Petugas</span>
              <span>Waktu</span>
            </div>

            <ul className="divide-y divide-slate-100 border-t border-slate-100">
              {filtered.map((l, i) => (
                <motion.li
                  key={l.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.04, ease: EASE }}
                  className={`grid items-center gap-y-2 px-3 py-4 ${GRID}`}
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-primary">{l.kategori}</p>
                    <p className="text-xs text-slate-500">{l.kode}</p>
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-primary">
                      {LAPORAN_STATUS[l.dari]} <ArrowRight size={12} className="text-tertiary" /> {LAPORAN_STATUS[l.ke]}
                    </p>
                    <p className="text-xs text-slate-500">{l.catatan}</p>
                  </div>
                  <p className="flex min-w-0 items-center gap-1.5 text-xs text-slate-600">
                    <UserRound size={13} className="shrink-0 text-tertiary" />
                    <span className="truncate">{l.pengubah} ({l.peran})</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Clock size={13} className="shrink-0 text-tertiary" /> {l.waktu}
                  </p>
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </Panel>
    </BkShell>
  );
}