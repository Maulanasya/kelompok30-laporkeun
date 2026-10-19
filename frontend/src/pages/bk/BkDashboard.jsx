import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronRight, EyeOff, MapPin, Clock, Tag } from "lucide-react";
import { motion } from "motion/react";

import BkShell, { Panel, EASE } from "../../components/layout/BkShell";
import StatusBadge from "../../components/bk/StatusBadge";
import BkSelect from "../../components/bk/BkSelect";
import { REPORTS, STATUS, CATEGORIES } from "../../data/bkReports";

// Opsi filter status laporan
const FILTERS = [
  ["semua", "Semua"],
  ...Object.entries(STATUS).map(([key, v]) => [key, v.label]),
];

// Layout grid konsisten untuk desktop dan responsif untuk mobile
const GRID =
  "grid-cols-1 gap-x-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.2fr)_minmax(0,1fr)_11rem_1.25rem]";

export default function BkDashboard() {
  const [status, setStatus] = useState("semua");
  const [category, setCategory] = useState("semua");
  const [query, setQuery] = useState("");

  // Menghitung jumlah laporan berdasarkan filter status
  const countOf = (key) =>
    key === "semua"
      ? REPORTS.length
      : REPORTS.filter((report) => report.status === key).length;

  // Memfilter daftar laporan berdasarkan status, kategori, dan pencarian teks
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return REPORTS.filter(
      (report) =>
        (status === "semua" || report.status === status) &&
        (category === "semua" || report.kategori === category) &&
        (!q ||
          report.kode.toLowerCase().includes(q) ||
          report.lokasi.toLowerCase().includes(q))
    );
  }, [status, category, query]);

  const waiting = countOf("menunggu");

  return (
    <BkShell
      title="Laporan masuk"
      subtitle={
        waiting > 0
          ? `${waiting} laporan menunggu kamu tinjau. Mulai dari yang paling baru dikirim.`
          : "Semua laporan sudah ditinjau."
      }
    >
      <Panel delay={0.1} className="space-y-5 p-5 md:p-6">
        {/* Bilah pencarian dan filter kategori */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Cari laporan</span>
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari kode laporan atau lokasi"
              className="w-full rounded-full border border-slate-200 bg-[#F4F9F9] py-2.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-tertiary focus:ring-4 focus:ring-cyan-100"
            />
          </label>

          <BkSelect
            ariaLabel="Filter kategori"
            icon={Tag}
            value={category}
            onChange={setCategory}
            options={[
              { value: "semua", label: "Semua kategori" },
              ...CATEGORIES.map((cat) => ({ value: cat, label: cat })),
            ]}
            className="sm:w-64"
          />
        </div>

        {/* Tab tombol filter status */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter status">
          {FILTERS.map(([key, label]) => {
            const active = status === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setStatus(key)}
                className={`relative cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors duration-300 touch-manipulation ${
                  active
                    ? "border-primary text-white"
                    : "border-slate-200 bg-white text-primary/80 hover:border-tertiary/50"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="bk-filter"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-full bg-primary"
                  />
                )}
                <span className="relative z-10">
                  {label}
                  <span className={`ml-1.5 ${active ? "text-white/70" : "text-slate-400"}`}>
                    {countOf(key)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Tampilan daftar laporan */}
        {filtered.length === 0 ? (
          <p className="rounded-2xl bg-[#F4F9F9] px-6 py-10 text-center text-sm text-slate-500">
            Tidak ada laporan yang cocok. Ubah status, kategori, atau kata kunci pencarian.
          </p>
        ) : (
          <div>
            {/* Header tabel untuk layar besar */}
            <div
              aria-hidden="true"
              className={`hidden px-3 pb-2 text-xs font-semibold text-slate-500 lg:grid ${GRID}`}
            >
              <span>Kategori</span>
              <span>Kejadian</span>
              <span>Pelapor</span>
              <span>Status</span>
              <span />
            </div>

            <ul className="divide-y divide-slate-100 border-t border-slate-100">
              {filtered.map((report, index) => (
                <motion.li
                  key={report.kode}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: Math.min(index, 8) * 0.04,
                    ease: EASE,
                  }}
                >
                  <Link
                    to={`/bk/laporan/${report.kode}`}
                    className={`group grid items-center gap-y-2 rounded-2xl px-3 py-4 transition hover:bg-[#F4F9F9] focus-visible:outline-2 focus-visible:outline-tertiary ${GRID}`}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-primary">{report.kategori}</p>
                      <p className="text-xs text-slate-500">{report.kode}</p>
                    </div>

                    <div className="flex min-w-0 flex-col gap-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} className="shrink-0 text-tertiary" />
                        <span className="truncate">{report.lokasi}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} className="shrink-0 text-tertiary" />
                        {report.waktu}
                      </span>
                    </div>

                    <span className="flex min-w-0 items-center gap-1.5 text-xs text-slate-600">
                      {report.anonim ? (
                        <>
                          <EyeOff size={13} className="shrink-0" /> Anonim
                        </>
                      ) : (
                        <span className="truncate">{`${report.pelapor}, ${report.kelas}`}</span>
                      )}
                    </span>

                    <span className="justify-self-start">
                      <StatusBadge status={report.status} />
                    </span>

                    <ChevronRight
                      size={18}
                      className="hidden justify-self-end text-tertiary transition group-hover:translate-x-1 lg:block"
                    />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </Panel>
    </BkShell>
  );
}