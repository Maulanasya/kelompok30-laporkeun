import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search, Tag, ArrowRight, UserRound, Clock, Loader2 } from "lucide-react";

import BkShell, { Panel, EASE } from "../../components/layout/BkShell";
import BkSelect from "../../components/bk/BkSelect";
import { FIELD } from "../../components/admin/Modal";
import { LAPORAN_STATUS } from "../../data/adminData";
import { CATEGORY_LABEL } from "../../data/bkReports";
import { api } from "../../services/api";

const GRID = "grid-cols-1 gap-x-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,1fr)_10rem]";

const statusLabel = (s) => (s ? LAPORAN_STATUS[s] ?? s : "Laporan dibuat");
const kategoriLabel = (k) => CATEGORY_LABEL?.[k] ?? k;

const formatWaktu = (iso) =>
  iso
    ? new Date(iso).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

export default function AdminRiwayat() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [status, setStatus] = useState("semua");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await api.getAdminRiwayat();
      setItems(res.data ?? []);
    } catch (err) {
      setLoadError(err.message || "Gagal memuat riwayat penanganan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (l) =>
        (status === "semua" || l.ke === status) &&
        (!q || l.kode.toLowerCase().includes(q) || l.pengubah.toLowerCase().includes(q))
    );
  }, [items, status, query]);

  return (
    <BkShell
      title="Riwayat penanganan"
      subtitle="Jejak perubahan status laporan dan pengalihan pendampingan. Hanya dapat dibaca, tanpa identitas pelapor."
    >
      <Panel delay={0.1} className="space-y-5 p-5 md:p-6">
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

        {loading ? (
          <p role="status" className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" /> Memuat riwayat...
          </p>
        ) : loadError ? (
          <div role="alert" className="space-y-3 rounded-2xl bg-rose-50 px-6 py-10 text-center">
            <p className="text-sm text-rose-700">{loadError}</p>
            <button
              type="button"
              onClick={load}
              className="cursor-pointer rounded-full border border-rose-200 bg-white px-4 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-50"
            >
              Coba lagi
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="rounded-2xl bg-[#F4F9F9] px-6 py-10 text-center text-sm text-slate-500">
            {items.length === 0 ? "Belum ada riwayat penanganan." : "Tidak ada riwayat yang cocok."}
          </p>
        ) : (
          <div>
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
                    <p className="font-semibold text-primary">{kategoriLabel(l.kategori)}</p>
                    <p className="text-xs text-slate-500">{l.kode}</p>
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-primary">
                      {statusLabel(l.dari)} <ArrowRight size={12} className="text-tertiary" /> {statusLabel(l.ke)}
                    </p>
                    {l.catatan && <p className="text-xs text-slate-500">{l.catatan}</p>}
                  </div>
                  <p className="flex min-w-0 items-center gap-1.5 text-xs text-slate-600">
                    <UserRound size={13} className="shrink-0 text-tertiary" />
                    <span className="truncate">{l.pengubah} ({l.peran})</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Clock size={13} className="shrink-0 text-tertiary" /> {formatWaktu(l.waktu)}
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