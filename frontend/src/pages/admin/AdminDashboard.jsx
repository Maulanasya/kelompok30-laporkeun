import { Link } from "react-router-dom";
import {
  FileText,
  Clock,
  Loader,
  CheckCircle2,
  Users,
  Newspaper,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

import BkShell, { Panel } from "../../components/layout/BkShell";
import { STATS, USERS, ARTIKEL, LAPORAN_STATUS } from "../../data/adminData";

// Kalkulasi statistik laporan untuk kartu ringkasan dan persentase progres bar
const total = Object.values(STATS.perStatus).reduce((a, b) => a + b, 0);
const maxKategori = Math.max(...STATS.perKategori.map((k) => k.jumlah));

// Data kartu indikator utama (KPI)
const CARDS = [
  { label: "Total laporan", value: total, icon: FileText },
  { label: LAPORAN_STATUS.PENDING, value: STATS.perStatus.PENDING, icon: Clock },
  { label: LAPORAN_STATUS.PROSES, value: STATS.perStatus.PROSES, icon: Loader },
  { label: LAPORAN_STATUS.SELESAI, value: STATS.perStatus.SELESAI, icon: CheckCircle2 },
];

// Data navigasi pintasan modul administrasi
const SHORTCUTS = [
  {
    to: "/admin/akun",
    icon: Users,
    title: "Kelola akun",
    desc: `${USERS.filter((u) => u.isActive).length} akun aktif`,
  },
  {
    to: "/admin/artikel",
    icon: Newspaper,
    title: "Kelola artikel",
    desc: `${ARTIKEL.filter((a) => a.isPublished).length} artikel terbit`,
  },
  {
    to: "/admin/riwayat",
    icon: FileText,
    title: "Riwayat penanganan",
    desc: "Jejak perubahan status laporan",
  },
];

export default function AdminDashboard() {
  return (
    <BkShell
      title="Ringkasan"
      subtitle="Gambaran umum laporan, akun, dan konten edukasi. Isi laporan dan identitas pelapor tidak ditampilkan di sini."
    >
      <div className="space-y-5">
        {/* Kartu statistik indikator utama (KPI) */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {CARDS.map(({ label, value, icon: Icon }, i) => (
            <Panel key={label} delay={0.05 * i} className="p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F9F9] text-tertiary">
                <Icon size={16} />
              </span>
              <p className="mt-3 text-2xl font-extrabold text-primary">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </Panel>
          ))}
        </div>

        {/* Diagram sebaran kategori & daftar pintasan */}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          {/* Panel statistik distribusi laporan per kategori */}
          <Panel delay={0.2} className="p-5 md:p-6">
            <h2 className="mb-4 text-base font-extrabold text-primary">Laporan per kategori</h2>
            <ul className="space-y-4">
              {STATS.perKategori.map((k) => (
                <li key={k.label}>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="font-semibold text-primary">{k.label}</span>
                    <span className="text-slate-500">{k.jumlah}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#F4F9F9]">
                    <div
                      className="h-full rounded-full bg-tertiary"
                      style={{ width: `${(k.jumlah / maxKategori) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          {/* Panel pintasan navigasi ke menu utama admin */}
          <Panel delay={0.28} className="p-5 md:p-6">
            <h2 className="mb-3 text-base font-extrabold text-primary">Pintasan</h2>
            <ul className="divide-y divide-slate-100">
              {SHORTCUTS.map(({ to, icon: Icon, title, desc }) => (
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

        {/* Catatan kebijakan privasi data & hak akses admin */}
        <Panel delay={0.35} className="flex items-start gap-3 p-5 text-xs leading-relaxed text-slate-600">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-tertiary" />
          Demi privasi korban, admin hanya mengelola akun, konten edukasi, dan memantau statistik. Detail laporan hanya dapat dibuka guru BK dan psikolog terkait.
        </Panel>
      </div>
    </BkShell>
  );
}