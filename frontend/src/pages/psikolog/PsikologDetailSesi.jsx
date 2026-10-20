import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, EyeOff, MessageCircle, CheckCircle2 } from "lucide-react";

import BkShell, { Panel } from "../../components/layout/BkShell";
import SesiBadge from "../../components/psikolog/SesiBadge";
import { CASES } from "../../data/psikologCases";

// Helper untuk menghasilkan label timestamp format bahasa Indonesia
const nowLabel = () =>
  new Date().toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function PsikologDetailSesi() {
  const { id } = useParams();
  const item = CASES.find((c) => c.id === id);

  // State untuk menyimpan status sesi dan riwayat aktivitas lokal
  const [status, setStatus] = useState(item?.status);
  const [riwayat, setRiwayat] = useState(item?.riwayat ?? []);

  // Tampilan penanganan jika ID sesi tidak ditemukan pada dataset
  if (!item) {
    return (
      <BkShell title="Sesi tidak ditemukan">
        <Link to="/psikolog" className="font-semibold text-tertiary hover:underline">
          Kembali ke daftar siswa
        </Link>
      </BkShell>
    );
  }

  // Helper untuk memperbarui status dan menambahkan entri riwayat baru
  const updateStatus = (next, teks) => {
    setStatus(next);
    setRiwayat((prev) => [...prev, { waktu: nowLabel(), teks }]);
  };

  // Struktur array pasangan label & nilai untuk mempermudah render list informasi
  const info = [
    ["Kategori", item.kategori],
    ["Lokasi kejadian", item.lokasi],
    ["Waktu kejadian", item.waktuKejadian],
    ["Kode laporan", item.kode],
    ["Bukti pendukung", item.jumlahBukti > 0 ? `${item.jumlahBukti} gambar` : "Tidak ada"],
  ];

  return (
    <BkShell
      title={item.kategori}
      subtitle={`Laporan ${item.kode}`}
      actions={
        <Link
          to="/psikolog"
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-primary transition hover:border-tertiary"
        >
          <ArrowLeft size={14} /> Semua siswa
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Kolom Kiri: Detail laporan, kronologi, dan rujukan dari Guru BK */}
        <div className="space-y-6">
          <Panel delay={0} className="p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-bold text-primary">Informasi kejadian</h2>
              <SesiBadge status={status} />
            </div>

            <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
              {info.map(([key, val]) => (
                <div key={key}>
                  <dt className="text-xs text-slate-500">{key}</dt>
                  <dd className="font-semibold text-primary">{val}</dd>
                </div>
              ))}
              <div className="sm:col-span-2">
                <dt className="text-xs text-slate-500">Siswa</dt>
                <dd className="font-semibold text-primary">
                  {item.anonim ? (
                    <span className="inline-flex items-center gap-2">
                      <EyeOff size={15} className="text-slate-500" />
                      Anonim, identitas disembunyikan
                    </span>
                  ) : (
                    `${item.pelapor}, ${item.kelas}`
                  )}
                </dd>
              </div>
            </dl>
          </Panel>

          <Panel delay={0.08} className="p-6">
            <h2 className="mb-3 font-bold text-primary">Kronologi</h2>
            <p className="max-w-prose leading-relaxed text-slate-700">{item.kronologi}</p>
          </Panel>

          <Panel delay={0.16} className="p-6">
            <h2 className="mb-3 font-bold text-primary">
              Catatan guru BK ({item.dialihkanOleh})
            </h2>
            <p className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-sm leading-relaxed text-slate-700">
              {item.alasanPengalihan}
            </p>
          </Panel>
        </div>

        {/* Kolom Kanan: Panel tindakan psikolog dan timeline riwayat */}
        <div className="space-y-6">
          <Panel delay={0.1} className="space-y-5 p-6 lg:sticky lg:top-28">
            <h2 className="font-bold text-primary">Tindakan</h2>

            {/* Aksi adaptif berdasarkan status pendampingan saat ini */}
            {status === "menunggu" && (
              <button
                type="button"
                onClick={() => updateStatus("berjalan", "Pendampingan diterima psikolog")}
                className="w-full cursor-pointer rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110"
              >
                Terima pendampingan
              </button>
            )}

            {status === "berjalan" && (
              <div className="space-y-3">
                <Link
                  to={`/psikolog/konsultasi?sesi=${item.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110"
                >
                  <MessageCircle size={16} /> Buka ruang chat
                </Link>
                <button
                  type="button"
                  onClick={() => updateStatus("selesai", "Pendampingan selesai")}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-primary/15 bg-white px-5 py-2.5 text-sm font-semibold text-primary transition hover:border-tertiary/50 hover:text-tertiary"
                >
                  <CheckCircle2 size={16} /> Tandai selesai
                </button>
              </div>
            )}

            {status === "selesai" && (
              <p className="rounded-2xl bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-800">
                Pendampingan ini sudah selesai.
              </p>
            )}
          </Panel>

          <Panel delay={0.2} className="p-6">
            <h2 className="mb-5 font-bold text-primary">Riwayat penanganan</h2>
            <ol className="relative ml-3 space-y-6 border-l-2 border-cyan-100">
              {riwayat.map((r, i) => (
                <motion.li
                  key={`${r.waktu}-${i}`}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative pl-6"
                >
                  <span className="absolute -left-2.25 top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-white" />
                  <p className="text-sm font-semibold text-primary">{r.teks}</p>
                  <p className="mt-1 text-xs text-slate-500">{r.waktu}</p>
                </motion.li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
    </BkShell>
  );
}