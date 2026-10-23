import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Search, CheckCircle2, AlertCircle, UserCheck, MessageCircle } from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import BlurText from "../components/reactbits/BlurText";
import ReportCard from "../components/ReportCard";
import StatusTimeline from "../components/StatusTimeline";
import EvidenceItem from "../components/EvidenceItem";
import Badge from "../components/Badge";
import KategoriSelect from "../components/form-laporan/KategoriSelect";
import { api } from "../services/api";
import { CATEGORIES, CATEGORY_LABEL } from "../data/bkReports";

const ANIMATION_EASE = [0.22, 1, 0.36, 1];
const MIN_DESKRIPSI = 20;

const KATEGORI_OPTIONS = CATEGORIES.map((cat) => ({
  value: cat,
  label: CATEGORY_LABEL[cat] || cat,
}));

const kategoriLabel = (kategori) => CATEGORY_LABEL[kategori] || kategori;

const formatDate = (iso, withTime = false) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(withTime && { hour: "2-digit", minute: "2-digit" }),
  });
};

const formatDateTime = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toForm = (report) => ({
  kategori: report.kategori,
  lokasi: report.lokasiKejadian,
  waktu: report.waktuKejadian
    ? new Date(report.waktuKejadian).toISOString().slice(0, 16)
    : "",
  deskripsi: report.deskripsi,
});

const nowLocalInput = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

function Panel({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: ANIMATION_EASE }}
      className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-cyan-900/10 ${className}`}
    >
      {children}
    </motion.div>
  );
}

const fieldBase =
  "w-full border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-tertiary focus:ring-4 focus:ring-cyan-100 aria-invalid:border-red-400 read-only:bg-[#F4F9F9] read-only:text-slate-600 read-only:focus:border-slate-200 read-only:focus:ring-0 disabled:bg-[#F4F9F9] disabled:text-slate-600 disabled:opacity-100";

function Field({ id, label, error, children }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-primary">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="pl-4 text-[11px] font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default function RiwayatLaporan() {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notif, setNotif] = useState({ type: "", message: "" });

  const [form, setForm] = useState({
    kategori: "",
    lokasi: "",
    waktu: "",
    deskripsi: "",
  });

  useEffect(() => {
    let active = true;
    api.getLaporanSaya()
      .then((res) => {
        if (active) {
          const list = res?.data || res || [];
          setItems(Array.isArray(list) ? list : []);
        }
      })
      .catch((err) => {
        if (active) setError(err.message || "Gagal memuat laporan");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (items.length > 0 && !selectedId) {
      setSelectedId(items[0].id);
    }
  }, [items, selectedId]);

  const selected = items.find((r) => r.id === selectedId) ?? items[0] ?? null;

  useEffect(() => {
    if (selected) setForm(toForm(selected));
  }, [selectedId]);

  const handleSelect = (report) => {
    setSelectedId(report.id);
    setForm(toForm(report));
    setErrors({});
    setIsEditing(false);
    setNotif({ type: "", message: "" });
  };

  const handleChange = (id, value) => {
    setForm((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: undefined }));
  };

  const validate = () => {
    const found = {};
    if (!form.lokasi.trim()) found.lokasi = "Lokasi kejadian wajib diisi.";
    if (!form.waktu) {
      found.waktu = "Waktu kejadian wajib diisi.";
    } else if (new Date(form.waktu).getTime() > Date.now()) {
      found.waktu = "Waktu kejadian tidak boleh di masa depan.";
    }
    if (!form.deskripsi.trim()) {
      found.deskripsi = "Deskripsi kronologi wajib diisi.";
    } else if (form.deskripsi.trim().length < MIN_DESKRIPSI) {
      found.deskripsi = `Ceritakan lebih lengkap (minimal ${MIN_DESKRIPSI} karakter).`;
    }
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setNotif({ type: "loading", message: "Menyimpan perubahan..." });

    try {
      await api.request(`/laporan/${selectedId}`, {
        method: "PUT",
        body: {
          kategori: form.kategori,
          lokasiKejadian: form.lokasi.trim(),
          waktuKejadian: new Date(form.waktu).toISOString(),
          deskripsi: form.deskripsi.trim(),
        },
      });

      setItems((prev) =>
        prev.map((r) =>
          r.id === selectedId
            ? {
                ...r,
                kategori: form.kategori,
                lokasiKejadian: form.lokasi.trim(),
                waktuKejadian: form.waktu,
                deskripsi: form.deskripsi.trim(),
              }
            : r
        )
      );
      
      setIsEditing(false);
      setNotif({ type: "success", message: "Laporan berhasil diperbarui!" });
      setTimeout(() => setNotif({ type: "", message: "" }), 3000);
    } catch (err) {
      setNotif({ type: "error", message: err.message || "Gagal menyimpan perubahan." });
    }
  };

  const handleCancel = () => {
    if (selected) setForm(toForm(selected));
    setErrors({});
    setIsEditing(false);
    setNotif({ type: "", message: "" });
  };

  // Cari sesi spesifik berdasarkan jenisnya
  const sesiBK = selected?.sesi?.find((s) => s.jenis === "BK");
  const sesiPsikolog = selected?.sesi?.find((s) => s.jenis === "PSIKOLOG");

  return (
    <div
      className="min-h-screen flex flex-col bg-[#F4F9F9] text-slate-800 selection:bg-cyan-100 overflow-x-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
      `}</style>

      <Navbar />

      <main className="relative flex-1 overflow-hidden pt-28 pb-16 md:pt-32 md:pb-24">
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 -left-32 h-130 w-130 rounded-full bg-tertiary/15 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 right-0 h-115 w-115 rounded-full bg-[#E9C46A]/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mb-10 max-w-2xl space-y-3">
            <BlurText text="Pantau laporanmu" delay={90} className="flex-wrap text-3xl font-bold leading-[1.15] text-primary md:text-4xl" />
            <p className="leading-relaxed text-slate-600">
              Lihat status, ubah detail, dan mulai konseling dari satu tempat.
            </p>
          </div>

          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-slate-500">Memuat laporan...</p>
            </div>
          ) : error ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-red-500">{error}</p>
            </div>
          ) : items.length === 0 ? (
            <Panel className="p-10 text-center">
              <p className="text-sm text-slate-500">Belum ada laporan.</p>
              <Link to="/form-laporan" className="mt-4 inline-block text-sm font-semibold text-tertiary hover:underline">
                Buat laporan sekarang
              </Link>
            </Panel>
          ) : !selected ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-slate-500">Pilih laporan untuk melihat detail.</p>
            </div>
          ) : (
            <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[270px_minmax(0,1fr)_300px]">
              {/* KIRI */}
              <Panel className="p-5">
                <h2 className="mb-4 text-lg font-bold text-primary">Riwayat Laporan</h2>
                <div className="relative mb-4">
                  <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" aria-label="Cari riwayat laporan" placeholder="Cari riwayat laporan" className="h-11 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-tertiary focus:ring-4 focus:ring-cyan-100" />
                </div>
                <div className="space-y-2.5">
                  {items.map((report) => (
                    <div key={report.id} role="button" tabIndex={0} onClick={() => handleSelect(report)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelect(report); } }} className="cursor-pointer rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-cyan-100">
                      <ReportCard category={kategoriLabel(report.kategori)} ticket={report.kodeTiket} date={formatDate(report.waktuKejadian)} status={report.status} active={report.id === selectedId} />
                    </div>
                  ))}
                </div>
              </Panel>

              {/* TENGAH */}
              <div className="space-y-6">
                <Panel delay={0.08}>
                  <h2 className="mb-4 text-lg font-bold text-primary">Detail Laporan</h2>
                  <div className="rounded-2xl border border-slate-200 bg-[#F4F9F9] px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-bold text-primary">{selected.kodeTiket}</h3>
                      <Badge status={selected.status} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{kategoriLabel(selected.kategori)} · Dilaporkan {formatDate(selected.createdAt, true)}</p>
                    <p className="mt-0.5 text-xs text-slate-500">Kejadian: {formatDateTime(selected.waktuKejadian)}</p>
                  </div>
                </Panel>

                <Panel delay={0.16}>
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <h2 className="text-lg font-bold text-primary">Informasi Laporan</h2>
                    {!isEditing && (
                      <button type="button" onClick={() => setIsEditing(true)} className="cursor-pointer rounded-full border border-tertiary px-5 py-1.5 text-xs font-semibold text-tertiary transition hover:bg-tertiary-light">Ubah</button>
                    )}
                  </div>

                  <AnimatePresence>
                    {notif.message && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`mb-5 flex items-start gap-3 rounded-xl border p-3 text-xs font-medium ${notif.type === "error" ? "border-red-200 bg-red-50 text-red-700" : notif.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                        {notif.type === "success" && <CheckCircle2 size={16} className="shrink-0" />}
                        {notif.type === "error" && <AlertCircle size={16} className="shrink-0" />}
                        {notif.message}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                    <Field id="tanggal" label="Tanggal Laporan">
                      <input id="tanggal" type="date" value={selected.createdAt?.slice(0, 10) || ""} readOnly className={`${fieldBase} rounded-full py-3`} />
                    </Field>
                    <Field id="kategori" label="Kategori Kasus">
                      <div className={!isEditing ? "pointer-events-none opacity-60" : ""}>
                        <KategoriSelect value={form.kategori} onChange={(val) => handleChange("kategori", val)} />
                      </div>
                    </Field>
                    <Field id="lokasi" label="Lokasi Kejadian" error={errors.lokasi}>
                      <input id="lokasi" type="text" value={form.lokasi} onChange={(e) => handleChange("lokasi", e.target.value)} readOnly={!isEditing} aria-invalid={!!errors.lokasi} className={`${fieldBase} rounded-full py-3`} />
                    </Field>
                    <Field id="waktu" label="Waktu Kejadian" error={errors.waktu}>
                      <input id="waktu" type="datetime-local" max={nowLocalInput()} value={form.waktu} onChange={(e) => handleChange("waktu", e.target.value)} readOnly={!isEditing} aria-invalid={!!errors.waktu} className={`${fieldBase} rounded-full py-3`} />
                    </Field>
                    <Field id="deskripsi" label="Deskripsi Kronologi" error={errors.deskripsi}>
                      <textarea id="deskripsi" rows={5} value={form.deskripsi} onChange={(e) => handleChange("deskripsi", e.target.value)} readOnly={!isEditing} aria-invalid={!!errors.deskripsi} className={`${fieldBase} resize-none rounded-2xl py-3 leading-relaxed`} />
                    </Field>

                    <div>
                      <h3 className="mb-3 text-sm font-semibold text-primary">Bukti</h3>
                      <div className="space-y-2.5">
                        {selected.bukti && selected.bukti.length > 0 ? (
                          selected.bukti.map((item) => (
                            <EvidenceItem key={item.id} name={item.filePath?.split("/").pop()} url={`http://localhost:5001/${item.filePath}`} />
                          ))
                        ) : (
                          <p className="text-xs text-slate-500">Tidak ada bukti yang dilampirkan.</p>
                        )}
                      </div>
                    </div>

                    <Field id="identitas" label="Identitas Pelapor">
                      <input id="identitas" type="text" readOnly value={selected.isAnonim ? "Anonim (nama tidak terlihat oleh Guru BK)" : "Terverifikasi (nama terlihat oleh Guru BK)"} className={`${fieldBase} rounded-full py-3`} />
                    </Field>

                    {isEditing && (
                      <div className="flex flex-wrap gap-3 pt-1">
                        <button type="submit" className="cursor-pointer rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-primary-hover">Simpan</button>
                        <button type="button" onClick={handleCancel} className="cursor-pointer rounded-full border border-slate-300 bg-white px-7 py-3 text-sm font-semibold text-primary transition hover:border-tertiary">Batal</button>
                      </div>
                    )}
                  </form>
                </Panel>
              </div>

              {/* KANAN */}
              <Panel delay={0.24} className="lg:sticky lg:top-28">
                <h2 className="mb-5 text-lg font-bold text-primary">Status Laporan</h2>

                <StatusTimeline status={selected.status} />

                <div className="mt-6 rounded-2xl bg-tertiary-light p-4">
                  <p className="mb-3 text-[11px] font-bold tracking-wide text-primary">
                    KONTAK PENDAMPING
                  </p>

                  {selected.status === "PENDING" ? (
                    <div className="text-xs text-slate-600 leading-relaxed">
                      Laporanmu sudah diterima dan sedang menunggu untuk ditinjau oleh Guru BK.
                    </div>
                  ) : selected.status === "DITINJAU" ? (
                    <>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                          <UserCheck size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-primary">
                            {sesiBK?.guruBk?.nama || "Guru BK"}
                          </p>
                          <p className="text-xs text-slate-500">Sedang memverifikasi laporanmu</p>
                        </div>
                      </div>
                      <Link to={`/chat?kode=${selected.kodeTiket}&lawan=BK`} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-primary-hover">
                        <MessageCircle size={16} /> Hubungi Guru BK
                      </Link>
                    </>
                  ) : selected.status === "PROSES" ? (
                    <>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-tertiary text-sm font-bold text-white">
                          PS
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-primary">
                            {sesiPsikolog?.psikolog?.nama || "Psikolog"}
                          </p>
                          <p className="text-xs text-slate-500">Psikolog Pendamping</p>
                        </div>
                      </div>
                      <Link to={`/chat?kode=${selected.kodeTiket}&lawan=PSIKOLOG`} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-primary-hover">
                        <MessageCircle size={16} /> Mulai Konseling
                      </Link>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                      <CheckCircle2 size={18} /> Pendampingan telah selesai.
                    </div>
                  )}
                </div>
              </Panel>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}