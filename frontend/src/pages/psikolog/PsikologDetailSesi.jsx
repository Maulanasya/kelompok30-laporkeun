import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Tag, EyeOff, FileText, UserRound, MessageSquare } from "lucide-react";
import BkShell, { Panel } from "../../components/layout/BkShell";
import StatusBadge from "../../components/bk/StatusBadge";
import { api } from "../../services/api";
import { CATEGORY_LABEL } from "../../data/bkReports";

function formatTanggal(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PsikologDetailSesi() {
  const { id } = useParams(); 
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getDetailLaporan(id)
      .then((res) => setReport(res?.data || res?.laporan || res))
      .catch((err) => setError(err.message || "Gagal memuat detail sesi"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <BkShell title="Detail Sesi" subtitle="Memuat...">
        <Panel className="p-6">Memuat detail sesi...</Panel>
      </BkShell>
    );
  }

  if (error || !report) {
    return (
      <BkShell title="Detail Sesi" subtitle="Terjadi kesalahan">
        <Panel className="p-6 text-danger">
          {error || "Laporan tidak ditemukan."}
        </Panel>
      </BkShell>
    );
  }

  const sesiAktif = report.sesi?.[0];

  return (
    <BkShell
      title={`Sesi Pendampingan: ${report.kodeTiket}`}
      subtitle="Tinjau detail laporan dan mulai sesi konseling."
    >
      <div className="space-y-6">
        <Panel className="space-y-6 p-6">
          <Link
            to="/psikolog"
            className="inline-flex items-center gap-2 text-sm text-tertiary hover:underline"
          >
            <ArrowLeft size={16} /> Kembali ke daftar siswa
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={report.status} />
            <span className="text-sm text-slate-500">
              Dialihkan pada {formatTanggal(sesiAktif?.createdAt || report.updatedAt)}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Tag size={16} className="text-tertiary" /> Kategori
              </p>
              <p className="text-sm text-slate-700">
                {CATEGORY_LABEL[report.kategori] || report.kategori}
              </p>
            </div>

            <div className="space-y-2">
              <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                <EyeOff size={16} className="text-tertiary" /> Pelapor
              </p>
              <p className="text-sm text-slate-700">
                {report.isAnonim
                  ? "Anonim"
                  : `${report.pelapor?.nama || "-"} ${
                      report.pelapor?.kelas ? `(${report.pelapor.kelas})` : ""
                    }`}
              </p>
            </div>

            <div className="space-y-2">
              <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                <MapPin size={16} className="text-tertiary" /> Lokasi Kejadian
              </p>
              <p className="text-sm text-slate-700">{report.lokasiKejadian}</p>
            </div>

            <div className="space-y-2">
              <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Clock size={16} className="text-tertiary" /> Waktu Kejadian
              </p>
              <p className="text-sm text-slate-700">
                {formatTanggal(report.waktuKejadian)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-semibold text-primary">
              <FileText size={16} className="text-tertiary" /> Kronologi
            </p>
            <p className="whitespace-pre-line rounded-xl border border-slate-200 bg-[#F4F9F9] p-4 text-sm leading-relaxed text-slate-700">
              {report.deskripsi}
            </p>
          </div>

          {/* Info Guru BK yang Mengalihkan */}
          {sesiAktif?.guruBk && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
                <UserRound size={16} className="text-tertiary" /> Dialihkan Oleh
              </p>
              <p className="text-sm text-slate-700">{sesiAktif.guruBk.nama}</p>
            </div>
          )}

          {report.bukti && report.bukti.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-primary">Bukti</p>
              <ul className="space-y-2">
                {report.bukti.map((b) => (
                  <li key={b.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                    <a href={`http://localhost:5001/${b.filePath}`} target="_blank" rel="noreferrer" className="text-tertiary hover:underline">
                      {b.filePath.split("/").pop()}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Panel>

        {/* AKSI CEPAT */}
        <Panel className="border-slate-200 bg-slate-50 p-6">
          <h3 className="mb-4 text-sm font-bold text-primary">Aksi Cepat</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`/psikolog/konsultasi?kode=${report.kodeTiket}`}
              className="inline-flex items-center gap-2 rounded-full bg-tertiary px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-cyan-700"
            >
              <MessageSquare size={16} /> Mulai Konseling / Chat Siswa
            </Link>
          </div>
        </Panel>
      </div>
    </BkShell>
  );
}