import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ChevronRight,
  EyeOff,
  MapPin,
  Clock,
  Tag,
  UserRound,
  MessageCircle,
} from "lucide-react";
import { motion } from "motion/react";

import BkShell, { Panel, EASE } from "../../components/layout/BkShell";
import BkSelect from "../../components/bk/BkSelect";
import { CATEGORIES } from "../../data/bkReports";
import SesiBadge from "../../components/psikolog/SesiBadge";
import { CASES, SESI_STATUS } from "../../data/psikologCases";

// Opsi filter status sesi pendampingan
const FILTERS = [
  ["semua", "Semua"],
  ...Object.entries(SESI_STATUS).map(([key, v]) => [key, v.label]),
];

// Layout grid konsisten untuk desktop dan responsif untuk mobile
const GRID =
  "grid-cols-1 gap-x-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.2fr)_minmax(0,1fr)_12rem_1.25rem]";

export default function PsikologDashboard() {
  const [status, setStatus] = useState("semua");
  const [category, setCategory] = useState("semua");
  const [query, setQuery] = useState("");

  // Menghitung jumlah sesi berdasarkan filter status
  const countOf = (key) =>
    key === "semua"
      ? CASES.length
      : CASES.filter((item) => item.status === key).length;

  // Memfilter daftar siswa berdasarkan status, kategori, dan pencarian teks
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CASES.filter(
      (item) =>
        (status === "semua" || item.status === status) &&
        (category === "semua" || item.kategori === category) &&
        (!q ||
          item.kode.toLowerCase().includes(q) ||
          item.dialihkanOleh.toLowerCase().includes(q) ||
          item.lokasi.toLowerCase().includes(q))
    );
  }, [status, category, query]);

  const waiting = countOf("menunggu");

  return (
    <BkShell
      title="Siswa dialihkan"
      subtitle={
        waiting > 0
          ? `${waiting} siswa menunggu kamu terima. Dialihkan oleh guru BK karena membutuhkan pendampingan lanjutan.`
          : "Semua siswa yang dialihkan sudah kamu terima."
      }
    >
      <Panel delay={0.1} className="space-y-5 p-5 md:p-6">
        {/* Bilah pencarian dan filter kategori */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Cari siswa dialihkan</span>
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari kode laporan, guru BK, atau lokasi"
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
                    layoutId="psikolog-filter"
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

        {/* Tampilan daftar siswa */}
        {filtered.length === 0 ? (
          <p className="rounded-2xl bg-[#F4F9F9] px-6 py-10 text-center text-sm text-slate-500">
            Tidak ada siswa yang cocok. Ubah status, kategori, atau kata kunci pencarian.
          </p>
        ) : (
          <div>
            {/* Header tabel untuk layar besar */}
            <div
              aria-hidden="true"
              className={`hidden px-3 pb-2 text-xs font-semibold text-slate-500 lg:grid ${GRID}`}
            >
              <span>Kategori</span>
              <span>Dialihkan</span>
              <span>Siswa</span>
              <span>Status</span>
              <span />
            </div>

            <ul className="divide-y divide-slate-100 border-t border-slate-100">
              {filtered.map((item, index) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: Math.min(index, 8) * 0.04,
                    ease: EASE,
                  }}
                >
                  <Link
                    to={`/psikolog/sesi/${item.id}`}
                    className={`group grid items-center gap-y-2 rounded-2xl px-3 py-4 transition hover:bg-[#F4F9F9] focus-visible:outline-2 focus-visible:outline-tertiary ${GRID}`}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-primary">{item.kategori}</p>
                      <p className="text-xs text-slate-500">{item.kode}</p>
                    </div>

                    <div className="flex min-w-0 flex-col gap-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <UserRound size={13} className="shrink-0 text-tertiary" />
                        <span className="truncate">{item.dialihkanOleh}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} className="shrink-0 text-tertiary" />
                        {item.dialihkanPada}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} className="shrink-0 text-tertiary" />
                        <span className="truncate">{item.lokasi}</span>
                      </span>
                    </div>

                    <span className="flex min-w-0 items-center gap-1.5 text-xs text-slate-600">
                      {item.anonim ? (
                        <>
                          <EyeOff size={13} className="shrink-0" /> Anonim
                        </>
                      ) : (
                        <span className="truncate">{`${item.pelapor}, ${item.kelas}`}</span>
                      )}
                    </span>

                    <span className="flex flex-wrap items-center gap-2 justify-self-start">
                      <SesiBadge status={item.status} />
                      {item.belumDibaca > 0 && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-white"
                          aria-label={`${item.belumDibaca} pesan belum dibaca`}
                        >
                          <MessageCircle size={11} />
                          {item.belumDibaca}
                        </span>
                      )}
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