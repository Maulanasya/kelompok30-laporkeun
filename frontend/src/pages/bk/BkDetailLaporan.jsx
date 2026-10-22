import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Tag, EyeOff, FileText } from "lucide-react";
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

export default function BkDetailLaporan() {
  const { kode } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!kode) return;
    let active = true;
    setLoading(true);
    api
      .getDetailLaporan(kode)
      .then((data) => {
        if (active) setReport(data.laporan || data);
      })
      .catch((err) => {
        if (active) setError(err.message || "Gagal memuat detail laporan");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [kode]);

  if (loading) {
    return (
      <BkShell title="Detail Laporan" subtitle="Memuat...">
        <Panel className="p-6">Memuat detail laporan...</Panel>
      </BkShell>
    );
  }

  if (error || !report) {
    return (
      <BkShell title="Detail Laporan" subtitle="Terjadi kesalahan">
        <Panel className="p-6 text-danger">
          {error || "Laporan tidak ditemukan."}
        </Panel>
      </BkShell>
    );
  }

  return (
    <BkShell
      title={`Laporan ${report.kodeTiket}`}
      subtitle="Tinjau detail laporan dan tentukan tindakan."
    >
      <Panel className="space-y-6 p-6">
        <Link
          to="/bk/laporan"
          className="inline-flex items-center gap-2 text-sm text-tertiary hover:underline"
        >
          <ArrowLeft size={16} /> Kembali ke daftar laporan
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={report.status} />
          <span className="text-sm text-slate-500">
            Dilaporkan pada {formatTanggal(report.createdAt)}
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

        {report.bukti && report.bukti.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-primary">Bukti</p>
            <ul className="space-y-2">
              {report.bukti.map((b) => (
                <li
                  key={b.id}
                  className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700"
                >
                  <a
                    href={b.filePath}
                    target="_blank"
                    rel="noreferrer"
                    className="text-tertiary hover:underline"
                  >
                    {b.filePath.split("/").pop()}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Panel>
    </BkShell>
  );
}