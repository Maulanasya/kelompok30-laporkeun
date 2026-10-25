import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  MessageCircle,
  LogIn,
  Info,
} from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import BlurText from "../components/reactbits/BlurText";
import ReportCard from "../components/ReportCard";
import StatusTimeline from "../components/StatusTimeline";
import EvidenceItem from "../components/EvidenceItem";
import Badge from "../components/Badge";
import KategoriSelect from "../components/form-laporan/KategoriSelect";
import { api, SERVER_URL } from "../services/api";
import { getUser } from "../utils/auth";
import { CATEGORY_LABEL } from "../data/bkReports";

const ANIMATION_EASE = [0.22, 1, 0.36, 1];
const MIN_DESKRIPSI = 20;

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

const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const toForm = (report) => ({
  kategori: report?.kategori || "",
  lokasi: report?.lokasiKejadian || "",
  waktu: toLocalInput(report?.waktuKejadian),
  deskripsi: report?.deskripsi || "",
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
  "w-full border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-tertiary focus:ring-4 focus:ring-cyan-100 aria-invalid:border-red-400 aria-invalid:focus:border-red-500 aria-invalid:focus:ring-red-100 read-only:bg-[#F4F9F9] read-only:text-slate-600 read-only:focus:border-slate-200 read-only:focus:ring-0 disabled:bg-[#F4F9F9] disabled:text-slate-600 disabled:opacity-100";

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

function TrackForm({ onSubmit }) {
  const [code, setCode] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = code.trim().toUpperCase();
        if (trimmed) onSubmit(trimmed);
      }}
      className="mx-auto flex max-w-lg flex-col gap-2 rounded-3xl border border-slate-200 bg-white p-2 shadow-md shadow-cyan-900/10 sm:flex-row sm:items-center sm:rounded-full"
    >
      <label htmlFor="track-code" className="sr-only">
        Kode tiket laporan
      </label>
      <div className="flex w-full items-center gap-3 px-4">
        <Search size={18} className="shrink-0 text-slate-400" />
        <input
          id="track-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Contoh: LPR-A27509D8"
          className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-slate-400"
        />
      </div>
      <button
        type="submit"
        className="shrink-0 cursor-pointer rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white transition hover:brightness-110"
      >
        Lacak
      </button>
    </form>
  );
}

export default function RiwayatLaporan() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const targetKode = (searchParams.get("kode") || "").trim().toUpperCase();

  const user = getUser();
  const isLoggedIn = Boolean(user);
  const isSiswa =
    String(user?.role || user?.peran || "").toUpperCase() === "SISWA";

  const [items, setItems] = useState([]);
  const [publicLaporan, setPublicLaporan] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notif, setNotif] = useState({ type: "", message: "" });
  const [form, setForm] = useState(toForm(null));

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setPublicLaporan(null);
    setSelectedId(null);
    setIsEditing(false);

    const tasks = [];

    if (targetKode) {
      tasks.push(
        api
          .getLaporanByTiket(targetKode)
          .then((res) => {
            if (!active) return;
            if (res?.data) setPublicLaporan(res.data);
            else setError(res?.error || "Laporan dengan kode tersebut tidak ditemukan.");
          })
          .catch((err) => {
            if (active) setError(err.message || "Laporan tidak ditemukan.");
          })
      );
    }

    if (isSiswa) {
      tasks.push(
        api
          .getLaporanSaya()
          .then((res) => {
            if (!active) return;
            const list = res?.data || [];
            setItems(Array.isArray(list) ? list : []);
          })
          .catch(() => {
            if (active) setItems([]);
          })
      );
    } else {
      setItems([]);
    }

    Promise.all(tasks).finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [targetKode, isSiswa]);

  const ownerFromKode = targetKode
    ? items.find((r) => r.kodeTiket?.toUpperCase() === targetKode)
    : null;

  const owned =
    (selectedId ? items.find((r) => r.id === selectedId) : null) ??
    ownerFromKode ??
    (!targetKode ? items[0] : null) ??
    null;

  const isOwner = Boolean(owned);
  const selected = owned ?? publicLaporan;
  const shown = isEditing ? form : toForm(selected);

  const handleTrack = (code) => navigate(`/riwayat-laporan?kode=${encodeURIComponent(code)}`);

  const handleSelect = (report) => {
    setSelectedId(report.id);
    setErrors({});
    setIsEditing(false);
    setNotif({ type: "", message: "" });
  };

  const startEdit = () => {
    setForm(toForm(owned));
    setErrors({});
    setNotif({ type: "", message: "" });
    setIsEditing(true);
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
    if (!owned || !validate()) return;

    setNotif({ type: "loading", message: "Menyimpan perubahan..." });

    try {
      const waktuIso = new Date(form.waktu).toISOString();

      // api.request melempar Error kalau server menolak, jadi catch di bawah terpanggil
      await api.request(`/laporan/${owned.id}`, {
        method: "PUT",
        body: {
          kategori: form.kategori,
          lokasiKejadian: form.lokasi.trim(),
          waktuKejadian: waktuIso,
          deskripsi: form.deskripsi.trim(),
        },
      });

      setItems((prev) =>
        prev.map((r) =>
          r.id === owned.id
            ? {
                ...r,
                kategori: form.kategori,
                lokasiKejadian: form.lokasi.trim(),
                waktuKejadian: waktuIso,
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
    setErrors({});
    setIsEditing(false);
    setNotif({ type: "", message: "" });
  };

  const handleLoginToChat = () => {
    try {
      sessionStorage.setItem(
        "postLoginRedirect",
        `/riwayat-laporan?kode=${selected?.kodeTiket || targetKode}`
      );
    } catch {
      /* abaikan */
    }
    navigate("/login");
  };

  const filteredItems = items.filter(
    (r) =>
      r.kodeTiket?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kategoriLabel(r.kategori).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Pendamping laporan ---
  // Server mengirim `pendamping` ({ nama, role }). Data sesi dipakai sebagai cadangan.
  const sesiAktif = selected?.sesi?.find((s) => s.status === "AKTIF") || selected?.sesi?.[0];

  const isDialihkanKePsikolog = Boolean(
    selected?.pendamping?.role === "PSIKOLOG" ||
      sesiAktif?.jenis === "PSIKOLOG" ||
      sesiAktif?.psikolog
  );

  const pendampingNama = isDialihkanKePsikolog
    ? selected?.pendamping?.nama || sesiAktif?.psikolog?.nama || "Psikolog Pendamping"
    : selected?.pendamping?.nama || sesiAktif?.guruBk?.nama || "Guru BK";

  const pendampingLawanParam = isDialihkanKePsikolog ? "PSIKOLOG" : "BK";

  const showList = isSiswa && items.length > 0;

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
              {isLoggedIn
                ? "Lihat status, ubah detail, dan mulai konseling dari satu tempat."
                : "Lacak perkembangan laporanmu dengan kode tiket. Tidak perlu login."}
            </p>
          </div>

          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-slate-500">Memuat laporan...</p>
            </div>
          ) : !selected ? (
            <Panel className="space-y-5 p-8 text-center md:p-10">
              {error ? (
                <p className="flex items-center justify-center gap-2 text-sm text-red-600">
                  <AlertCircle size={16} /> {error}
                </p>
              ) : (
                <p className="text-sm text-slate-600">
                  {isSiswa
                    ? "Kamu belum punya riwayat laporan."
                    : "Masukkan kode tiket laporanmu untuk melihat statusnya."}
                </p>
              )}

              {!isSiswa || error ? <TrackForm onSubmit={handleTrack} /> : null}

              <Link to="/form-laporan" className="inline-block text-sm font-semibold text-tertiary hover:underline">
                Buat laporan sekarang
              </Link>
            </Panel>
          ) : (
            <section
              className={`grid grid-cols-1 items-start gap-6 ${
                showList
                  ? "lg:grid-cols-[270px_minmax(0,1fr)_300px]"
                  : "lg:grid-cols-[minmax(0,1fr)_320px]"
              }`}
            >
              {/* KIRI: Daftar laporan */}
              {showList && (
                <Panel className="p-5">
                  <h2 className="mb-4 text-lg font-bold text-primary">Riwayat Laporan</h2>
                  <div className="relative mb-4">
                    <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      aria-label="Cari riwayat laporan"
                      placeholder="Cari riwayat laporan"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-11 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-tertiary focus:ring-4 focus:ring-cyan-100"
                    />
                  </div>
                  <div className="space-y-2.5">
                    {filteredItems.map((report) => (
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
                          category={kategoriLabel(report.kategori)}
                          ticket={report.kodeTiket}
                          date={formatDate(report.waktuKejadian)}
                          status={report.status}
                          active={isOwner && report.id === owned?.id}
                        />
                      </div>
                    ))}
                    {filteredItems.length === 0 && (
                      <p className="py-4 text-center text-xs text-slate-500">Laporan tidak ditemukan.</p>
                    )}
                  </div>
                </Panel>
              )}

              {/* TENGAH: Detail laporan */}
              <div className="space-y-6">
                {!isOwner && (
                  <div className="flex items-start gap-3 rounded-2xl border border-cyan-100 bg-white/80 px-5 py-4 text-sm text-slate-600">
                    <Info size={18} className="mt-0.5 shrink-0 text-tertiary" />
                    <p className="leading-relaxed">
                      Kamu melihat laporan ini lewat <span className="font-semibold text-primary">kode tiket</span>.
                      Hanya status dan perkembangannya yang ditampilkan.{" "}
                      {isLoggedIn
                        ? "Isi laporan, mengubah laporan, dan chat dengan pendamping hanya bisa dilakukan oleh pemilik laporan."
                        : "Untuk melihat isi laporan, mengubahnya, atau mengobrol dengan pendamping, kamu perlu masuk ke akunmu."}
                    </p>
                  </div>
                )}

                <Panel delay={0.08}>
                  <h2 className="mb-4 text-lg font-bold text-primary">Detail Laporan</h2>
                  <div className="rounded-2xl border border-slate-200 bg-[#F4F9F9] px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-bold text-primary">{selected.kodeTiket}</h3>
                      <Badge status={selected.status} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {kategoriLabel(selected.kategori)} · Dilaporkan {formatDate(selected.createdAt, true)}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">Kejadian: {formatDateTime(selected.waktuKejadian)}</p>
                  </div>
                </Panel>

                {/* Isi laporan hanya untuk pemilik (pelacakan publik tidak mengirim lokasi & deskripsi) */}
                {isOwner && (
                  <Panel delay={0.16}>
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <h2 className="text-lg font-bold text-primary">Informasi Laporan</h2>
                      {!isEditing && selected.status === "PENDING" && (
                        <button type="button" onClick={startEdit} className="cursor-pointer rounded-full border border-tertiary px-5 py-1.5 text-xs font-semibold text-tertiary transition hover:bg-tertiary-light">
                          Ubah
                        </button>
                      )}
                    </div>

                    <AnimatePresence>
                      {notif.message && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`mb-5 flex items-start gap-3 rounded-xl border p-3 text-xs font-medium ${
                            notif.type === "error"
                              ? "border-red-200 bg-red-50 text-red-700"
                              : notif.type === "success"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-50 text-slate-700"
                          }`}
                        >
                          {notif.type === "success" && <CheckCircle2 size={16} className="shrink-0" />}
                          {notif.type === "error" && <AlertCircle size={16} className="shrink-0" />}
                          {notif.message}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                      <Field id="tanggal" label="Tanggal Laporan">
                        <input id="tanggal" type="date" value={toLocalInput(selected.createdAt).slice(0, 10)} readOnly className={`${fieldBase} rounded-full py-3`} />
                      </Field>
                      <Field id="kategori" label="Kategori Kasus">
                        <div className={!isEditing ? "pointer-events-none opacity-60" : ""}>
                          <KategoriSelect value={shown.kategori} onChange={(val) => handleChange("kategori", val)} />
                        </div>
                      </Field>
                      <Field id="lokasi" label="Lokasi Kejadian" error={errors.lokasi}>
                        <input id="lokasi" type="text" value={shown.lokasi} onChange={(e) => handleChange("lokasi", e.target.value)} readOnly={!isEditing} aria-invalid={!!errors.lokasi} className={`${fieldBase} rounded-full py-3`} />
                      </Field>
                      <Field id="waktu" label="Waktu Kejadian" error={errors.waktu}>
                        <input id="waktu" type="datetime-local" max={nowLocalInput()} value={shown.waktu} onChange={(e) => handleChange("waktu", e.target.value)} readOnly={!isEditing} aria-invalid={!!errors.waktu} className={`${fieldBase} rounded-full py-3`} />
                      </Field>
                      <Field id="deskripsi" label="Deskripsi Kronologi" error={errors.deskripsi}>
                        <textarea id="deskripsi" rows={5} value={shown.deskripsi} onChange={(e) => handleChange("deskripsi", e.target.value)} readOnly={!isEditing} aria-invalid={!!errors.deskripsi} className={`${fieldBase} resize-none rounded-2xl py-3 leading-relaxed`} />
                      </Field>

                      <div>
                        <h3 className="mb-3 text-sm font-semibold text-primary">Bukti</h3>
                        <div className="space-y-2.5">
                          {owned.bukti && owned.bukti.length > 0 ? (
                            owned.bukti.map((item) => (
                              <EvidenceItem key={item.id} name={item.filePath?.split("/").pop()} url={`${SERVER_URL}/${item.filePath}`} />
                            ))
                          ) : (
                            <p className="text-xs text-slate-500">Tidak ada bukti yang dilampirkan.</p>
                          )}
                        </div>
                      </div>

                      <Field id="identitas" label="Identitas Pelapor">
                        <input id="identitas" type="text" readOnly value={owned.isAnonim ? "Anonim (nama tidak terlihat oleh Guru BK)" : "Terverifikasi (nama terlihat oleh Guru BK)"} className={`${fieldBase} rounded-full py-3`} />
                      </Field>

                      {isEditing && (
                        <div className="flex flex-wrap gap-3 pt-1">
                          <button type="submit" className="cursor-pointer rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-primary-hover">Simpan</button>
                          <button type="button" onClick={handleCancel} className="cursor-pointer rounded-full border border-slate-300 bg-white px-7 py-3 text-sm font-semibold text-primary transition hover:border-tertiary">Batal</button>
                        </div>
                      )}
                    </form>
                  </Panel>
                )}
              </div>

              {/* KANAN: Status & kontak pendamping */}
              <Panel delay={0.24} className="lg:sticky lg:top-28">
                <h2 className="mb-5 text-lg font-bold text-primary">Status Laporan</h2>

                <StatusTimeline status={selected.status} />

                <div className="mt-6 rounded-2xl bg-tertiary-light p-4">
                  <p className="mb-3 text-[11px] font-bold tracking-wide text-primary">KONTAK PENDAMPING</p>

                  {selected.status === "PENDING" ? (
                    <div className="text-xs leading-relaxed text-slate-600">
                      Laporanmu sudah diterima dan sedang menunggu untuk ditinjau oleh Guru BK.
                    </div>
                  ) : selected.status === "SELESAI" ? (
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                      <CheckCircle2 size={18} /> Pendampingan telah selesai.
                    </div>
                  ) : !isLoggedIn ? (
                    <div className="space-y-3">
                      <p className="text-xs leading-relaxed text-slate-600">
                        Laporanmu sedang ditangani. Masuk ke akunmu untuk mengobrol langsung dengan pendamping.
                      </p>
                      <button
                        type="button"
                        onClick={handleLoginToChat}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-primary-hover"
                      >
                        <LogIn size={16} /> Login untuk Chat
                      </button>
                    </div>
                  ) : isOwner ? (
                    <>
                      <div className="mb-4 flex items-center gap-3">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${isDialihkanKePsikolog ? "bg-tertiary text-sm font-bold text-white" : "bg-amber-100 text-amber-600"}`}>
                          {isDialihkanKePsikolog ? "PS" : <UserCheck size={20} />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-primary">{pendampingNama}</p>
                          <p className="text-xs text-slate-500">
                            {isDialihkanKePsikolog ? "Psikolog Pendamping" : "Guru BK Pendamping"}
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/chat?kode=${owned.kodeTiket}&lawan=${pendampingLawanParam}`}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-primary-hover"
                      >
                        <MessageCircle size={16} /> {isDialihkanKePsikolog ? "Mulai Konseling" : "Hubungi Guru BK"}
                      </Link>
                    </>
                  ) : (
                    <p className="text-xs leading-relaxed text-slate-600">
                      Chat hanya tersedia untuk pemilik laporan. Laporan ini tidak terhubung dengan akunmu.
                    </p>
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