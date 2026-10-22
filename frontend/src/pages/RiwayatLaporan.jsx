import { useState } from "react";
import { motion } from "motion/react";
import { Search } from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import BlurText from "../components/reactbits/BlurText";
import ReportCard from "../components/ReportCard";
import StatusTimeline from "../components/StatusTimeline";
import EvidenceItem from "../components/EvidenceItem";
import Badge from "../components/Badge";
import {
  reports,
  formatDate,
  formatDateTime,
  KATEGORI_OPTIONS,
  kategoriLabel,
} from "../data/reports";

const ANIMATION_EASE = [0.22, 1, 0.36, 1];
const MIN_DESKRIPSI = 20; // sama dengan Form Laporan

// Ambil field yang bisa diedit dari sebuah laporan (sama dengan isi Form Laporan)
const toForm = (report) => ({
  kategori: report.category,
  lokasi: report.lokasi,
  waktu: report.waktu,
  deskripsi: report.deskripsi,
});

// Waktu lokal sekarang dalam format datetime-local (untuk atribut max)
const nowLocalInput = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

// --- Komponen kecil lokal supaya gaya seragam dengan landing page ---

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
  const [items, setItems] = useState(reports);
  const [selectedId, setSelectedId] = useState(reports[0].id);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});

  const selected = items.find((r) => r.id === selectedId) ?? items[0];
  const [form, setForm] = useState(() => toForm(selected));

  const handleSelect = (report) => {
    setSelectedId(report.id);
    setForm(toForm(report));
    setErrors({});
    setIsEditing(false); // keluar dari mode edit saat pindah laporan
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: undefined }));
  };

  // Aturan validasi sama dengan Form Laporan
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // TODO: kirim perubahan ke backend (PATCH laporan milik siswa)
    setItems((prev) =>
      prev.map((r) =>
        r.id === selectedId
          ? {
              ...r,
              category: form.kategori,
              lokasi: form.lokasi.trim(),
              waktu: form.waktu,
              deskripsi: form.deskripsi.trim(),
            }
          : r
      )
    );
    setIsEditing(false);
  };

  const handleCancel = () => {
    setForm(toForm(selected));
    setErrors({});
    setIsEditing(false);
  };

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
        {/* Background Decorative Blurs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -left-32 h-130 w-130 rounded-full bg-tertiary/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 right-0 h-115 w-115 rounded-full bg-[#E9C46A]/20 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-6">
          {/* Judul halaman */}
          <div className="mb-10 max-w-2xl space-y-3">
            <BlurText
              text="Pantau laporanmu"
              delay={90}
              className="flex-wrap text-3xl font-bold leading-[1.15] text-primary md:text-4xl"
            />
            <p className="leading-relaxed text-slate-600">
              Lihat status, ubah detail, dan mulai konseling dari satu tempat.
            </p>
          </div>

          <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[270px_minmax(0,1fr)_300px]">
            {/* KIRI: daftar laporan */}
            <Panel className="p-5">
              <h2 className="mb-4 text-lg font-bold text-primary">
                Riwayat Laporan
              </h2>

              <div className="relative mb-4">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  aria-label="Cari riwayat laporan"
                  placeholder="Cari riwayat laporan"
                  className="h-11 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-tertiary focus:ring-4 focus:ring-cyan-100"
                />
              </div>

              <div className="space-y-2.5">
                {items.map((report) => (
                  <div
                    key={report.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelect(report)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelect(report);
                      }
                    }}
                    className="cursor-pointer rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-cyan-100"
                  >
                    <ReportCard
                      category={kategoriLabel(report.category)}
                      ticket={report.ticket}
                      date={formatDate(report.tanggal)}
                      status={report.status}
                      active={report.id === selectedId}
                    />
                  </div>
                ))}
              </div>
            </Panel>

            {/* TENGAH */}
            <div className="space-y-6">
              <Panel delay={0.08}>
                <h2 className="mb-4 text-lg font-bold text-primary">
                  Detail Laporan
                </h2>

                <div className="rounded-2xl border border-slate-200 bg-[#F4F9F9] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-bold text-primary">
                      {selected.ticket}
                    </h3>
                    <Badge status={selected.status} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {kategoriLabel(selected.category)} · Dilaporkan{" "}
                    {formatDate(selected.tanggal, true)}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Kejadian: {formatDateTime(selected.waktu)}
                  </p>
                </div>
              </Panel>

              <Panel delay={0.16}>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-primary">
                    Informasi Laporan
                  </h2>

                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="cursor-pointer rounded-full border border-tertiary px-5 py-1.5 text-xs font-semibold text-tertiary transition hover:bg-tertiary-light"
                    >
                      Ubah
                    </button>
                  )}
                </div>

                <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                  {/* Tanggal laporan dibuat: otomatis, tidak bisa diubah */}
                  <Field id="tanggal" label="Tanggal Laporan">
                    <input
                      id="tanggal"
                      type="date"
                      value={selected.tanggal}
                      readOnly
                      className={`${fieldBase} rounded-full py-3`}
                    />
                  </Field>

                  <Field id="kategori" label="Kategori Kasus">
                    <select
                      id="kategori"
                      value={form.kategori}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`${fieldBase} rounded-full py-3`}
                    >
                      {KATEGORI_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field id="lokasi" label="Lokasi Kejadian" error={errors.lokasi}>
                    <input
                      id="lokasi"
                      type="text"
                      value={form.lokasi}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      aria-invalid={!!errors.lokasi}
                      className={`${fieldBase} rounded-full py-3`}
                    />
                  </Field>

                  <Field id="waktu" label="Waktu Kejadian" error={errors.waktu}>
                    <input
                      id="waktu"
                      type="datetime-local"
                      max={nowLocalInput()}
                      value={form.waktu}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      aria-invalid={!!errors.waktu}
                      className={`${fieldBase} rounded-full py-3`}
                    />
                  </Field>

                  <Field
                    id="deskripsi"
                    label="Deskripsi Kronologi"
                    error={errors.deskripsi}
                  >
                    <textarea
                      id="deskripsi"
                      rows={5}
                      value={form.deskripsi}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      aria-invalid={!!errors.deskripsi}
                      className={`${fieldBase} resize-none rounded-2xl py-3 leading-relaxed`}
                    />
                  </Field>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-primary">
                      Bukti
                    </h3>
                    <div className="space-y-2.5">
                      {selected.evidence.length > 0 ? (
                        selected.evidence.map((item) => (
                          <EvidenceItem key={item.id} {...item} />
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">
                          Tidak ada bukti yang dilampirkan.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Identitas dipilih saat membuat laporan: hanya ditampilkan */}
                  <Field id="identitas" label="Identitas Pelapor">
                    <input
                      id="identitas"
                      type="text"
                      readOnly
                      value={
                        selected.isAnonim
                          ? "Anonim (nama tidak terlihat oleh Guru BK)"
                          : "Terverifikasi (nama terlihat oleh Guru BK)"
                      }
                      className={`${fieldBase} rounded-full py-3`}
                    />
                  </Field>

                  {isEditing && (
                    <div className="flex flex-wrap gap-3 pt-1">
                      <button
                        type="submit"
                        className="cursor-pointer rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/15 transition hover:-translate-y-0.5 hover:bg-primary-hover"
                      >
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="cursor-pointer rounded-full border border-slate-300 bg-white px-7 py-3 text-sm font-semibold text-primary transition hover:border-tertiary"
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </form>
              </Panel>
            </div>

            {/* KANAN: status & konselor (menempel saat scroll di layar besar) */}
            <Panel delay={0.24} className="lg:sticky lg:top-28">
              <h2 className="mb-5 text-lg font-bold text-primary">
                Status Laporan
              </h2>

              <StatusTimeline />

              <div className="mt-6 rounded-2xl bg-tertiary-light p-4">
                <p className="mb-3 text-[11px] font-bold tracking-wide text-primary">
                  PSIKOLOG / KONSELOR BERTUGAS
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-tertiary text-sm font-bold text-white">
                    DP
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-primary">
                      Dr. Pattranite, M.Psi.
                    </p>
                    <p className="text-xs text-slate-500">
                      Konselor Spesialis Remaja
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-4 w-full cursor-pointer rounded-full bg-primary py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/15 transition hover:-translate-y-0.5 hover:bg-primary-hover"
                >
                  Mulai Konseling
                </button>
              </div>
            </Panel>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}