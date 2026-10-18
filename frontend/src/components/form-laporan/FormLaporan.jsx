import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import FormField from "./FormField";
import KategoriSelect from "./KategoriSelect";
import UploadBukti from "./UploadBukti";
import IdentitasRadio from "./IdentitasRadio";

const initialForm = {
  kategori: "",
  lokasi: "",
  deskripsi: "",
  identitas: "anonim",
  setuju: false,
};

const MIN_DESKRIPSI = 20; // minimal karakter kronologi

// Mengembalikan object error. Kosong = form valid.
const validate = (form) => {
  const errors = {};

  if (!form.kategori) {
    errors.kategori = "Pilih kategori kasus terlebih dahulu.";
  }

  if (!form.lokasi.trim()) {
    errors.lokasi = "Detail lokasi & waktu kejadian wajib diisi.";
  }

  if (!form.deskripsi.trim()) {
    errors.deskripsi = "Deskripsi kronologi wajib diisi.";
  } else if (form.deskripsi.trim().length < MIN_DESKRIPSI) {
    errors.deskripsi = `Ceritakan lebih lengkap (minimal ${MIN_DESKRIPSI} karakter).`;
  }

  if (!form.setuju) {
    errors.setuju = "Centang pernyataan dulu sebelum mengirim.";
  }

  return errors;
};

// Ganti isi fungsi ini dengan panggilan API sungguhan.
// Kalau gagal, lempar Error dengan pesan yang ramah karena pesannya
// akan tampil di kotak "Penyebab" pada FailedPage.
const kirimLaporan = async (data) => {
  console.log("Data yang dikirim:", data);
  await new Promise((resolve) => setTimeout(resolve, 800)); // simulasi loading

  // Contoh kalau pakai API:
  // const res = await fetch("/api/laporan", { method: "POST", body: ... });
  // if (!res.ok) throw new Error("Server sedang sibuk, coba lagi nanti.");
  // const json = await res.json();
  // return { ticket: json.ticket };

  // Dummy: ticket acak. Hapus kalau sudah dari backend.
  const random = Math.random().toString(36).slice(2, 5).toUpperCase();
  return { ticket: `TICK-2026-${random}` };
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
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((prev) => ({ ...prev, [key]: value }));
    // hapus error field ini begitu user mulai memperbaiki
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const found = validate(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      // fokus ke field pertama yang error
      const firstKey = Object.keys(found)[0];
      document.getElementById(firstKey)?.focus();
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const { ticket } = await kirimLaporan({ ...form, file });
      navigate("/success", { state: { ticket } });
    } catch (err) {
      navigate("/failed", {
        state: {
          message: err?.message,
          retryPath: "/form-laporan",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full rounded-lg border bg-white px-3 text-xs text-slate-700 outline-none placeholder:text-slate-400";
  const borderClass = (key) =>
    errors[key]
      ? "border-red-400 focus:border-red-500"
      : "border-slate-200 focus:border-tertiary";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <h2 className="text-lg font-bold text-primary">Form Laporan</h2>

      <FormField label="Kategori Kasus" htmlFor="kategori">
        <KategoriSelect
          value={form.kategori}
          onChange={handleChange("kategori")}
        />
        <ErrorText>{errors.kategori}</ErrorText>
      </FormField>

      <FormField label="Detail Lokasi & Waktu Kejadian" htmlFor="lokasi">
        <input
          id="lokasi"
          type="text"
          value={form.lokasi}
          onChange={handleChange("lokasi")}
          placeholder="Contoh: Di kelas 9A, jam istirahat, 3 Maret 2026"
          aria-invalid={!!errors.lokasi}
          className={`h-10 ${inputBase} ${borderClass("lokasi")}`}
        />
        <ErrorText>{errors.lokasi}</ErrorText>
      </FormField>

      <FormField label="Deskripsi Kronologi" htmlFor="deskripsi">
        <textarea
          id="deskripsi"
          rows={4}
          value={form.deskripsi}
          onChange={handleChange("deskripsi")}
          placeholder="Ceritakan kronologi kejadian selengkap mungkin..."
          aria-invalid={!!errors.deskripsi}
          className={`resize-none py-2 leading-relaxed ${inputBase} ${borderClass("deskripsi")}`}
        />
        <ErrorText>{errors.deskripsi}</ErrorText>
      </FormField>

      <FormField label="Unggah Bukti Pendukung (Opsional)">
        <UploadBukti file={file} onFileChange={setFile} />
      </FormField>

      <IdentitasRadio
        value={form.identitas}
        onChange={handleChange("identitas")}
      />

      <div>
        <label
          className={`flex items-start gap-2.5 rounded-lg border p-3 cursor-pointer ${
            errors.setuju
              ? "border-red-400 bg-red-50"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          <input
            id="setuju"
            type="checkbox"
            checked={form.setuju}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, setuju: e.target.checked }));
              if (errors.setuju)
                setErrors((prev) => ({ ...prev, setuju: undefined }));
            }}
            className="mt-0.5 h-3.5 w-3.5 accent-tertiary"
          />
          <span className="text-[11px] leading-relaxed text-slate-600">
            Saya menyatakan informasi yang saya berikan adalah benar dan
            dapat dipertanggungjawabkan.
          </span>
        </label>
        <ErrorText>{errors.setuju}</ErrorText>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-xs font-bold text-white transition hover:bg-primary-hover cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send size={14} /> {loading ? "Mengirim..." : "Kirim Laporan"}
      </button>
    </form>
  );
}