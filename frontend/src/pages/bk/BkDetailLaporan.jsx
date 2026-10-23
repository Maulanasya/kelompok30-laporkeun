import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Tag, EyeOff, FileText, UserPlus, CheckCircle2, Archive, AlertCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import BkShell, { Panel } from "../../components/layout/BkShell";
import StatusBadge from "../../components/bk/StatusBadge";
import BkSelect from "../../components/bk/BkSelect";
import { api } from "../../services/api";
import { CATEGORY_LABEL, STATUS } from "../../data/bkReports";

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
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [notif, setNotif] = useState({ type: "", message: "" });
  const showNotif = (type, message) => {
    setNotif({ type, message });
    setTimeout(() => setNotif({ type: "", message: "" }), 4000);
  };

  const [psikologList, setPsikologList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPsikolog, setSelectedPsikolog] = useState("");
  const [catatan, setCatatan] = useState("");
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = Object.entries(STATUS).map(([key, val]) => ({
    value: key,
    label: val.label,
  }));

  // 1. FUNGSI FETCH DETAIL (INI YANG TADI HILANG)
  const fetchDetail = () => {
    if (!kode) return;
    setLoading(true);
    api.getDetailLaporan(kode)
      .then((res) => setReport(res?.data || res?.laporan || res))
      .catch((err) => setError(err.message || "Gagal memuat detail laporan"))
      .finally(() => setLoading(false));
  };

  // Panggil fetchDetail pertama kali
  useEffect(() => {
    fetchDetail();

    // Fallback sementara ID Psikolog
    setPsikologList([
      { value: "fc6102fd-a7a2-4a1d-ae29-88f6e3d86625", label: "Dr. Sari Wulandari, M.Psi." },
    ]);
  }, [kode]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === report.status) return;
    
    setIsSubmitting(true);
    try {
      await api.request(`/laporan/${report.id}/status`, {
        method: "PATCH",
        body: { status: newStatus },
      });
      fetchDetail(); // Sekarang fungsi ini udah ada
      showNotif("success", `Status berhasil diubah menjadi ${STATUS[newStatus].label}`);
    } catch (err) {
      showNotif("error", err.message || "Gagal mengubah status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAlihkan = async (e) => {
    e.preventDefault();
    if (!selectedPsikolog) return showNotif("error", "Pilih psikolog terlebih dahulu.");
    
    setIsSubmitting(true);
    try {
      await api.request(`/laporan/${report.id}/alihkan`, {
        method: "PATCH",
        body: { psikologId: selectedPsikolog, catatan: catatan },
      });

      setIsModalOpen(false);
      setCatatan("");
      setSelectedPsikolog("");
      fetchDetail();
      showNotif("success", "Berhasil dialihkan ke Psikolog!");
    } catch (err) {
      showNotif("error", err.message || "Gagal mengalihkan laporan.");
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleArchive = async () => {
    setIsSubmitting(true);
    try {
      await api.request(`/laporan/${report.id}/archive`, { method: "PATCH" });
      setIsArchiveModalOpen(false);
      navigate("/bk/laporan"); 
    } catch (err) {
      showNotif("error", err.message || "Gagal mengarsipkan laporan.");
      setIsArchiveModalOpen(false);
    } finally { setIsSubmitting(false); }
  };

  if (loading) return <BkShell title="Detail Laporan" subtitle="Memuat..."><Panel className="p-6">Memuat...</Panel></BkShell>;
  if (error || !report) return <BkShell title="Detail Laporan" subtitle="Error"><Panel className="p-6 text-danger">{error || "Laporan tidak ditemukan."}</Panel></BkShell>;

  return (
    <BkShell title={`Laporan ${report.kodeTiket}`} subtitle="Tinjau detail laporan dan tentukan tindakan.">
      <AnimatePresence>
        {notif.message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`mb-4 flex items-center gap-2 rounded-xl border p-3 text-sm font-medium ${notif.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
            {notif.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />} {notif.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        <Panel className="space-y-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link to="/bk/laporan" className="inline-flex items-center gap-2 text-sm text-tertiary hover:underline"><ArrowLeft size={16} /> Kembali ke daftar laporan</Link>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Status:</span>
              <div className="w-48">
                <BkSelect value={report.status} onChange={handleStatusChange} options={statusOptions} placeholder="Pilih status" disabled={isSubmitting} />
              </div>
            </div>
            <span className="text-sm text-slate-500">Dilaporkan pada {formatTanggal(report.createdAt)}</span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2"><p className="flex items-center gap-2 text-sm font-semibold text-primary"><Tag size={16} className="text-tertiary" /> Kategori</p><p className="text-sm text-slate-700">{CATEGORY_LABEL[report.kategori] || report.kategori}</p></div>
            <div className="space-y-2"><p className="flex items-center gap-2 text-sm font-semibold text-primary"><EyeOff size={16} className="text-tertiary" /> Pelapor</p><p className="text-sm text-slate-700">{report.isAnonim ? "Anonim" : `${report.pelapor?.nama || "-"} (${report.pelapor?.kelas || "-"})`}</p></div>
            <div className="space-y-2"><p className="flex items-center gap-2 text-sm font-semibold text-primary"><MapPin size={16} className="text-tertiary" /> Lokasi Kejadian</p><p className="text-sm text-slate-700">{report.lokasiKejadian}</p></div>
            <div className="space-y-2"><p className="flex items-center gap-2 text-sm font-semibold text-primary"><Clock size={16} className="text-tertiary" /> Waktu Kejadian</p><p className="text-sm text-slate-700">{formatTanggal(report.waktuKejadian)}</p></div>
          </div>

          <div className="space-y-2"><p className="flex items-center gap-2 text-sm font-semibold text-primary"><FileText size={16} className="text-tertiary" /> Kronologi</p><p className="whitespace-pre-line rounded-xl border border-slate-200 bg-[#F4F9F9] p-4 text-sm leading-relaxed text-slate-700">{report.deskripsi}</p></div>
          
          {report.bukti && report.bukti.length > 0 && (
            <div className="space-y-2"><p className="text-sm font-semibold text-primary">Bukti</p><ul className="space-y-2">{report.bukti.map((b) => (<li key={b.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700"><a href={`http://localhost:5001/${b.filePath}`} target="_blank" rel="noreferrer" className="text-tertiary hover:underline">{b.filePath.split("/").pop()}</a></li>))}</ul></div>
          )}
        </Panel>

        <Panel className="p-6 bg-slate-50 border-slate-200">
          <h3 className="text-sm font-bold text-primary mb-4">Aksi Cepat</h3>
          <div className="flex flex-wrap gap-3">
            {(report.status === "PENDING" || report.status === "DITINJAU") && (
              <button type="button" onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-indigo-700"><UserPlus size={16} /> Alihkan ke Psikolog</button>
            )}
            {report.status === "SELESAI" && (
              <button onClick={() => setIsArchiveModalOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100"><Archive size={15} /> Arsipkan Laporan</button>
            )}
          </div>
        </Panel>
      </div>

      {/* MODAL ALIHKAN */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-darker/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="border-b border-slate-100 bg-[#F4F9F9] px-6 py-4"><h3 className="text-lg font-bold text-primary">Alihkan Laporan</h3></div>
              <form onSubmit={handleAlihkan} className="p-6 space-y-4">
                <div className="space-y-2"><label className="text-xs font-semibold text-primary">Pilih Psikolog</label><BkSelect value={selectedPsikolog} onChange={setSelectedPsikolog} options={psikologList} placeholder="Pilih Psikolog" icon={UserPlus} /></div>
                <div className="space-y-2"><label className="text-xs font-semibold text-primary">Catatan / Alasan Pengalihan</label><textarea rows={3} value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Contoh: Siswa membutuhkan pendampingan psikologis trauma..." className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-tertiary focus:ring-4 focus:ring-cyan-100" required /></div>
                <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setIsModalOpen(false)} className="rounded-full px-5 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-100">Batal</button><button type="submit" disabled={isSubmitting} className="rounded-full bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50">{isSubmitting ? "Memproses..." : "Konfirmasi Alihkan"}</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL ARSIP */}
      <AnimatePresence>
        {isArchiveModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-darker/50 backdrop-blur-sm" onClick={() => setIsArchiveModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl p-6 text-center">
              <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-4"><Archive size={24} /></div>
              <h3 className="text-lg font-bold text-primary mb-2">Arsipkan Laporan?</h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">Laporan ini akan dipindahkan dari daftar aktif, namun tetap tersimpan aman di database dan riwayat siswa.</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setIsArchiveModalOpen(false)} className="rounded-full px-6 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-100">Batal</button>
                <button onClick={handleArchive} disabled={isSubmitting} className="rounded-full bg-slate-800 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-slate-900 disabled:opacity-50">{isSubmitting ? "Mengarsipkan..." : "Ya, Arsipkan"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </BkShell>
  );
}