import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  EyeOff,
  Image as ImageIcon,
  MessageSquare,
  HeartHandshake,
  Check,
  Flag,
  User,
} from "lucide-react";

import BkShell, { Panel } from "../../components/layout/BkShell";
import StatusBadge from "../../components/bk/StatusBadge";
import BkSelect from "../../components/bk/BkSelect";
import { REPORTS, STATUS, PSIKOLOG } from "../../data/bkReports";
import { getUser } from "../../utils/auth";

// Status yang dapat dipilih secara manual (status "dialihkan" diset khusus via modal pengalihan)
const MANUAL_STATUS = ["ditinjau", "ditindaklanjuti", "selesai"];

// Helper untuk menghasilkan format stempel waktu saat pembaruan riwayat
const nowLabel = () =>
  new Date().toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const fieldCls =
  "w-full rounded-2xl border border-slate-200 bg-[#F4F9F9] px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-tertiary focus:ring-4 focus:ring-cyan-100";

export default function BkDetailLaporan() {
  const { kode } = useParams();
  const [report, setReport] = useState(() => REPORTS.find((r) => r.kode === kode));
  const [nextStatus, setNextStatus] = useState("ditinjau");
  const [note, setNote] = useState("");
  const [showRefer, setShowRefer] = useState(false);
  const [psikologId, setPsikologId] = useState("");
  const [reason, setReason] = useState("");
  const [referError, setReferError] = useState("");
  const [saved, setSaved] = useState(false);

  const actor = getUser()?.nama ?? "Guru BK";

  // Fungsi pembantu untuk menambahkan status dan riwayat baru pada laporan
  const pushStatus = (status, catatan) =>
    setReport((r) => ({
      ...r,
      status,
      riwayat: [{ status, catatan, oleh: actor, waktu: nowLabel() }, ...r.riwayat],
    }));

  // Otomatis mengubah status laporan dari "menunggu" menjadi "ditinjau" saat pertama kali dibuka
  useEffect(() => {
    setReport((r) =>
      r && r.status === "menunggu"
        ? {
            ...r,
            status: "ditinjau",
            riwayat: [
              { status: "ditinjau", catatan: "Laporan dibuka dan mulai ditinjau.", oleh: actor, waktu: nowLabel() },
              ...r.riwayat,
            ],
          }
        : r
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Menutupi modal rujukan psikolog ketika tombol Escape ditekan
  useEffect(() => {
    if (!showRefer) return;
    const onKey = (e) => e.key === "Escape" && setShowRefer(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showRefer]);

  if (!report) {
    return (
      <BkShell title="Laporan tidak ditemukan">
        <Link to="/bk/laporan" className="font-semibold text-tertiary hover:underline">
          Kembali ke daftar laporan
        </Link>
      </BkShell>
    );
  }

  const isReferred = report.status === "dialihkan";

  // Menyimpan pembaruan status manual dan catatan dari Guru BK
  const saveStatus = (e) => {
    e.preventDefault();
    pushStatus(nextStatus, note.trim() || "Status diperbarui.");
    setNote("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Mengirim pengalihan penanganan laporan ke psikolog profesional
  const submitRefer = (e) => {
    e.preventDefault();
    if (!psikologId || !reason.trim()) {
      setReferError("Pilih psikolog dan tulis alasan pengalihan.");
      return;
    }
    const psi = PSIKOLOG.find((p) => p.id === psikologId);
    pushStatus("dialihkan", `Dialihkan ke ${psi.nama}. ${reason.trim()}`);
    setShowRefer(false);
    setReason("");
    setPsikologId("");
    setReferError("");
  };

  const info = [
    ["Kategori", report.kategori],
    ["Lokasi kejadian", report.lokasi],
    ["Waktu kejadian", report.waktu],
    ["Kode laporan", report.kode],
  ];

  return (
    <BkShell
      title={report.kategori}
      subtitle={`Laporan ${report.kode}`}
      actions={
        <Link
          to="/bk/laporan"
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-primary transition hover:border-tertiary"
        >
          <ArrowLeft size={14} /> Semua laporan
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Kolom Kiri: Rincian laporan, kronologi, dan berkas bukti */}
        <div className="space-y-6">
          <Panel delay={0} className="p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-bold text-primary">Informasi kejadian</h2>
              <StatusBadge status={report.status} />
            </div>

            <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
              {info.map(([key, val]) => (
                <div key={key}>
                  <dt className="text-xs text-slate-500">{key}</dt>
                  <dd className="font-semibold text-primary">{val}</dd>
                </div>
              ))}
              <div className="sm:col-span-2">
                <dt className="text-xs text-slate-500">Pelapor</dt>
                <dd className="font-semibold text-primary">
                  {report.anonim ? (
                    <span className="inline-flex items-center gap-2">
                      <EyeOff size={15} className="text-slate-500" />
                      Anonim, identitas disembunyikan
                    </span>
                  ) : (
                    `${report.pelapor}, ${report.kelas}`
                  )}
                </dd>
              </div>
            </dl>
          </Panel>

          <Panel delay={0.08} className="p-6">
            <h2 className="mb-3 font-bold text-primary">Kronologi</h2>
            <p className="max-w-prose leading-relaxed text-slate-700">{report.kronologi}</p>
          </Panel>

          <Panel delay={0.16} className="p-6">
            <h2 className="mb-4 font-bold text-primary">Bukti pendukung</h2>
            {report.bukti.length === 0 ? (
              <p className="text-sm text-slate-500">Siswa tidak melampirkan bukti.</p>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {report.bukti.map((file) => (
                  <li
                    key={file}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-[#F4F9F9] p-5 text-center"
                  >
                    <ImageIcon size={22} className="text-tertiary" />
                    <span className="break-all text-xs text-slate-600">{file}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* Kolom Kanan: Panel kontrol tindak lanjut dan riwayat penanganan */}
        <div className="space-y-6">
          <Panel delay={0.1} className="space-y-5 p-6 lg:sticky lg:top-28">
            <h2 className="font-bold text-primary">Tindak lanjut</h2>

            <Link
              to={`/bk/konsultasi?kode=${report.kode}`}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110"
            >
              <MessageSquare size={16} /> Konsultasi dengan siswa
            </Link>

            {isReferred ? (
              <p className="rounded-2xl bg-violet-50 p-4 text-sm leading-relaxed text-violet-800">
                Siswa sudah dialihkan ke psikolog. Pendampingan berlanjut di ruang psikolog.
              </p>
            ) : (
              <>
                <form onSubmit={saveStatus} className="space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-slate-600">Perbarui status</span>
                    <BkSelect
                      ariaLabel="Perbarui status"
                      icon={Flag}
                      value={nextStatus}
                      onChange={setNextStatus}
                      options={MANUAL_STATUS.map((st) => ({ value: st, label: STATUS[st].label }))}
                    />
                  </div>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold text-slate-600">Catatan (opsional)</span>
                    <textarea
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Contoh: pemanggilan pihak terkait dijadwalkan Kamis"
                      className={fieldCls}
                    />
                  </label>
                  <button
                    type="submit"
                    className="w-full cursor-pointer rounded-full border border-primary/15 bg-white px-5 py-2.5 text-sm font-semibold text-primary transition hover:border-tertiary/50 hover:text-tertiary"
                  >
                    Simpan status
                  </button>
                  <p role="status" className="flex h-4 items-center gap-1.5 text-xs font-medium text-emerald-700">
                    {saved && (
                      <>
                        <Check size={14} /> Status tersimpan
                      </>
                    )}
                  </p>
                </form>

                <div className="border-t border-slate-100 pt-5">
                  <p className="mb-3 text-xs leading-relaxed text-slate-500">
                    Jika siswa menunjukkan tanda trauma tinggi, alihkan pendampingan ke psikolog.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowRefer(true)}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#E9C46A] px-5 py-3 text-sm font-semibold text-primary transition hover:brightness-95"
                  >
                    <HeartHandshake size={16} /> Alihkan ke psikolog
                  </button>
                </div>
              </>
            )}
          </Panel>

          <Panel delay={0.2} className="p-6">
            <h2 className="mb-5 font-bold text-primary">Riwayat penanganan</h2>
            <ol className="relative ml-3 space-y-6 border-l-2 border-cyan-100">
              {report.riwayat.map((item) => (
                <motion.li
                  key={`${item.waktu}-${item.status}-${item.catatan}`}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative pl-6"
                >
                  <span className="absolute -left-2.25 top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-white" />
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{item.catatan}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.oleh}, {item.waktu}
                  </p>
                </motion.li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>

      {/* Modal Dialog Pengalihan Kasus ke Psikolog */}
      <AnimatePresence>
        {showRefer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="refer-title"
            onClick={() => setShowRefer(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-primary-darker/50 p-4 backdrop-blur-sm"
          >
            <motion.form
              onSubmit={submitRefer}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              className="w-full max-w-md space-y-5 rounded-3xl bg-white p-7 shadow-2xl"
            >
              <div className="space-y-1.5">
                <h3 id="refer-title" className="text-base font-extrabold text-primary">
                  Alihkan ke psikolog
                </h3>
                <p className="text-xs leading-relaxed text-slate-500">
                  Siswa akan terhubung ke ruang psikolog. Pengalihan ini tercatat di riwayat penanganan.
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-600">Psikolog</span>
                <BkSelect
                  autoFocus
                  ariaLabel="Pilih psikolog"
                  icon={User}
                  placeholder="Pilih psikolog"
                  value={psikologId}
                  onChange={setPsikologId}
                  options={PSIKOLOG.map((ps) => ({ value: ps.id, label: ps.nama, hint: ps.fokus }))}
                />
              </div>

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-slate-600">Alasan pengalihan</span>
                <textarea
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Jelaskan tanda trauma yang kamu amati pada siswa"
                  className={fieldCls}
                />
              </label>

              {referError && (
                <p role="alert" className="text-xs font-medium text-danger">
                  {referError}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowRefer(false)}
                  className="cursor-pointer rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-primary transition-colors hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="cursor-pointer rounded-xl bg-primary py-2.5 text-xs font-bold text-white transition-colors hover:bg-secondary"
                >
                  Alihkan siswa
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </BkShell>
  );
}