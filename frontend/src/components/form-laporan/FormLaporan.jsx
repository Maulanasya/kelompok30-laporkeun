import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import FormField from "./FormField";
import KategoriSelect from "./KategoriSelect";
import UploadBukti from "./UploadBukti";
import IdentitasRadio from "./IdentitasRadio";
import { getUser } from "../../utils/auth";

const API_URL = `${import.meta.env.VITE_API_URL || "https://kelompok30-laporkeun-backend.vercel.app"}/api/laporan`;

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token") || "";

const initialForm = {
  kategori: "",
  lokasi: "",
  waktu: "",
  deskripsi: "",
  identitas: "anonim",
  noWhatsapp: "", // <-- TAMBAHAN
  setuju: false,
};

const MIN_DESKRIPSI = 20;

const nowLocalInput = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const validate = (form) => {
  const errors = {};
  if (!form.kategori) errors.kategori = "Pilih kategori kasus terlebih dahulu.";
  if (!form.lokasi.trim()) errors.lokasi = "Lokasi kejadian wajib diisi.";
  if (!form.waktu) {
    errors.waktu = "Waktu kejadian wajib diisi.";
  } else if (new Date(form.waktu).getTime() > Date.now()) {
    errors.waktu = "Waktu kejadian tidak boleh di masa depan.";
  }
  if (!form.deskripsi.trim()) {
    errors.deskripsi = "Deskripsi kronologi wajib diisi.";
  } else if (form.deskripsi.trim().length < MIN_DESKRIPSI) {
    errors.deskripsi = `Ceritakan lebih lengkap (minimal ${MIN_DESKRIPSI} karakter).`;
  }
  if (!form.setuju) errors.setuju = "Centang pernyataan dulu sebelum mengirim.";
  return errors;
};

const kirimLaporan = async ({ form, file }) => {
  const body = new FormData();
  body.append("kategori", form.kategori);
  body.append("lokasiKejadian", form.lokasi.trim());
  body.append("waktuKejadian", new Date(form.waktu).toISOString());
  body.append("deskripsi", form.deskripsi.trim());
  body.append("isAnonim", String(form.identitas === "anonim"));
  body.append("noWhatsapp", form.noWhatsapp); // <-- TAMBAHAN
  if (file) body.append("bukti", file);

  let res;
  try {
    res = await fetch(API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body,
    });
  } catch {
    throw new Error("Tidak bisa terhubung ke server, coba lagi nanti.");
  }

  const json = await res.json().catch(() => ({}));
  if (res.status === 401 || res.status === 403) {
    throw new Error("Sesi kamu berakhir atau akunmu tidak boleh melapor. Silakan masuk lagi sebagai siswa.");
  }
  if (!res.ok) {
    throw new Error(json.error || json.message || "Server sedang sibuk, coba lagi nanti.");
  }
  return { ticket: json.laporan.kodeTiket };
};

function ErrorText({ children }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-1.5 text-[11px] font-medium text-red-600">
      {children}
    </p>
  );
}

export default function FormLaporan() {
  const navigate = useNavigate();
  const user = getUser();
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const found = validate(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      const firstKey = Object.keys(found)[0];
      document.getElementById(firstKey)?.focus();
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const { ticket } = await kirimLaporan({ form, file });
      navigate("/success", { state: { ticket } });
    } catch (err) {
      navigate("/failed", {
        state: { message: err?.message, retryPath: "/form-laporan" },
      });
    } finally {
      setLoading(false);
    }
  };

  const inputBase = "w-full rounded-lg border bg-white px-3 text-xs text-slate-700 outline-none placeholder:text-slate-400";
  const borderClass = (key) =>
    errors[key] ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-tertiary";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <h2 className="text-lg font-bold text-primary">Form Laporan</h2>

      {!user && (
        <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-800">
          Kamu perlu <Link to="/login" className="font-bold underline">masuk</Link> dulu agar laporan bisa dikirim. Tenang, kamu tetap bisa memilih melapor tanpa nama.
        </div>
      )}

      <FormField label="Kategori Kasus" htmlFor="kategori">
        <KategoriSelect value={form.kategori} onChange={handleChange("kategori")} />
        <ErrorText>{errors.kategori}</ErrorText>
      </FormField>

      <FormField label="Lokasi Kejadian" htmlFor="lokasi">
        <input id="lokasi" type="text" value={form.lokasi} onChange={handleChange("lokasi")} placeholder="Contoh: Di kelas 9A, kantin, atau grup WhatsApp" aria-invalid={!!errors.lokasi} className={`h-10 ${inputBase} ${borderClass("lokasi")}`} />
        <ErrorText>{errors.lokasi}</ErrorText>
      </FormField>

      <FormField label="Waktu Kejadian" htmlFor="waktu">
        <input id="waktu" type="datetime-local" max={nowLocalInput()} value={form.waktu} onChange={handleChange("waktu")} aria-invalid={!!errors.waktu} className={`h-10 ${inputBase} ${borderClass("waktu")}`} />
        <ErrorText>{errors.waktu}</ErrorText>
      </FormField>

      <FormField label="Deskripsi Kronologi" htmlFor="deskripsi">
        <textarea id="deskripsi" rows={4} value={form.deskripsi} onChange={handleChange("deskripsi")} placeholder="Ceritakan kronologi kejadian selengkap mungkin..." aria-invalid={!!errors.deskripsi} className={`resize-none py-2 leading-relaxed ${inputBase} ${borderClass("deskripsi")}`} />
        <ErrorText>{errors.deskripsi}</ErrorText>
      </FormField>

      <FormField label="Unggah Bukti Pendukung (Opsional)">
        <UploadBukti file={file} onFileChange={setFile} />
      </FormField>

      {/* TAMBAHAN INPUT NOMOR WA */}
      <FormField label="Nomor WhatsApp (Opsional)" htmlFor="noWhatsapp">
        <input
          id="noWhatsapp"
          type="tel"
          value={form.noWhatsapp}
          onChange={handleChange("noWhatsapp")}
          placeholder="Contoh: 08123456789 (untuk notifikasi tiket)"
          className={`h-10 ${inputBase} ${borderClass("noWhatsapp")}`}
        />
        <p className="text-[10px] text-slate-500 mt-1">
          Isi jika ingin menerima kode tiket & link pelacakan via WhatsApp.
        </p>
      </FormField>

      <IdentitasRadio value={form.identitas} onChange={handleChange("identitas")} />

      <div>
        <label className={`flex items-start gap-2.5 rounded-lg border p-3 cursor-pointer ${errors.setuju ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50"}`}>
          <input id="setuju" type="checkbox" checked={form.setuju} onChange={(e) => { setForm((prev) => ({ ...prev, setuju: e.target.checked })); if (errors.setuju) setErrors((prev) => ({ ...prev, setuju: undefined })); }} className="mt-0.5 h-3.5 w-3.5 accent-tertiary" />
          <span className="text-[11px] leading-relaxed text-slate-600">Saya menyatakan informasi yang saya berikan adalah benar dan dapat dipertanggungjawabkan.</span>
        </label>
        <ErrorText>{errors.setuju}</ErrorText>
      </div>

      <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-xs font-bold text-white transition hover:bg-primary-hover cursor-pointer disabled:cursor-not-allowed disabled:opacity-60">
        <Send size={14} /> {loading ? "Mengirim..." : "Kirim Laporan"}
      </button>
    </form>
  );
}