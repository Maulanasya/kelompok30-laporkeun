import { Link } from "react-router-dom";
import {
  FileText,
  Clock,
  Loader,
  Eye,
  CheckCircle2,
  Users,
  Newspaper,
  ChevronRight,
  ShieldCheck,
  Loader2,
  RefreshCw, // Tambahkan icon Refresh
} from "lucide-react";

import BkShell, { Panel } from "../../components/layout/BkShell";
import useAdminStats from "../../hooks/useAdminStats";
import { LAPORAN_STATUS } from "../../data/adminData";

export default function AdminDashboard() {
  // ✅ Ambil fungsi 'refresh'
  const { stats, loading, error, refresh } = useAdminStats();

  if (loading && !stats) {
    return (
      <BkShell title="Ringkasan" subtitle="Memuat statistik...">
        <Panel className="flex h-100 items-center justify-center gap-2 text-slate-500">
          <Loader2 className="animate-spin" /> Memuat...
        </Panel>
      </BkShell>
    );
  }

  if (!stats) {
    return (
      <BkShell title="Ringkasan" subtitle="Statistik tidak tersedia">
        <Panel className="p-8 text-center text-sm text-slate-600">
          {error || "Belum ada data."}
        </Panel>
      </BkShell>
    );
  }

  const { perStatus, perKategori, akunAktif, artikelTerbit } = stats;

  const total = Object.values(perStatus).reduce((a, b) => a + b, 0);
  const maxKategori = Math.max(1, ...perKategori.map((k) => k.jumlah));

  const cards = [
    { label: "Total laporan", value: total, icon: FileText },
    { label: LAPORAN_STATUS?.PENDING ?? "Menunggu ditinjau", value: perStatus.PENDING, icon: Clock },
    { label: LAPORAN_STATUS?.DITINJAU ?? "Ditinjau", value: perStatus.DITINJAU, icon: Eye },
    { label: LAPORAN_STATUS?.PROSES ?? "Diproses", value: perStatus.PROSES, icon: Loader },
    { label: LAPORAN_STATUS?.SELESAI ?? "Selesai", value: perStatus.SELESAI, icon: CheckCircle2 },
  ];

  const shortcuts = [
    { to: "/admin/akun", icon: Users, title: "Kelola akun", desc: `${akunAktif} akun aktif` },
    { to: "/admin/artikel", icon: Newspaper, title: "Kelola artikel", desc: `${artikelTerbit} artikel terbit` },
    { to: "/admin/riwayat", icon: FileText, title: "Riwayat penanganan", desc: "Jejak perubahan status laporan" },
  ];

  return (
    <BkShell
      title="Ringkasan"
      subtitle="Gambaran umum laporan, akun, dan konten edukasi. Isi laporan dan identitas pelapor tidak ditampilkan di sini."
    >
      <div className="space-y-5">
        {error && (
          <p role="alert" className="rounded-2xl bg-red-50 px-4 py-2 text-xs text-red-700">
            {error}
          </p>
        )}

        {/* ✅ Tombol Refresh Data */}
        <div className="flex justify-end">
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-tertiary shadow-sm border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Memuat..." : "Refresh Data"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {cards.map(({ label, value, icon: Icon }, i) => (
            <Panel key={label} delay={0.05 * i} className="p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F9F9] text-tertiary">
                <Icon size={16} />
              </span>
              <p className="mt-3 text-2xl font-extrabold tabular-nums text-primary">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </Panel>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <Panel delay={0.2} className="p-5 md:p-6">
            <h2 className="mb-4 text-base font-extrabold text-primary">Laporan per kategori</h2>
            <ul className="space-y-4">
              {perKategori.map((k) => (
                <li key={k.label}>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="font-semibold text-primary">{k.label}</span>
                    <span className="tabular-nums text-slate-500">{k.jumlah}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#F4F9F9]">
                    <div
                      className="h-full rounded-full bg-tertiary transition-all duration-500"
                      style={{ width: `${(k.jumlah / maxKategori) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel delay={0.28} className="p-5 md:p-6">
            <h2 className="mb-3 text-base font-extrabold text-primary">Pintasan</h2>
            <ul className="divide-y divide-slate-100">
              {shortcuts.map(({ to, icon: Icon, title, desc }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="group flex items-center gap-3 rounded-2xl px-2 py-3 transition hover:bg-[#F4F9F9]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F4F9F9] text-tertiary">
                      <Icon size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-primary">{title}</span>
                      <span className="block text-xs text-slate-500">{desc}</span>
                    </span>
                    <ChevronRight size={16} className="text-tertiary transition group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel delay={0.35} className="flex items-start gap-3 p-5 text-xs leading-relaxed text-slate-600">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-tertiary" />
          Demi privasi korban, admin hanya mengelola akun, konten edukasi, dan memantau statistik. Detail laporan hanya dapat dibuka guru BK dan psikolog terkait.
        </Panel>
      </div>
    </BkShell>
  );
}