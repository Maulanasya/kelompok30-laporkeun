import { useState } from "react";
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

export default function FormLaporan() {
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);

  const handleChange = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.setuju) {
      alert("Centang pernyataan dulu sebelum mengirim.");
      return;
    }
    console.log("Data yang dikirim:", { ...form, file });
    alert("Laporan terkirim! (dummy)");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-lg font-bold text-primary">Form Laporan</h2>

      <FormField label="Kategori Kasus" htmlFor="kategori">
        <KategoriSelect value={form.kategori} onChange={handleChange("kategori")} />
      </FormField>

      <FormField label="Detail Lokasi & Waktu Kejadian" htmlFor="lokasi">
        <input
          id="lokasi"
          type="text"
          value={form.lokasi}
          onChange={handleChange("lokasi")}
          placeholder="Contoh: Di kelas 9A, jam istirahat, 3 Maret 2026"
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-tertiary"
        />
      </FormField>

      <FormField label="Deskripsi Kronologi" htmlFor="deskripsi">
        <textarea
          id="deskripsi"
          rows={4}
          value={form.deskripsi}
          onChange={handleChange("deskripsi")}
          placeholder="Ceritakan kronologi kejadian selengkap mungkin..."
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs leading-relaxed text-slate-700 outline-none placeholder:text-slate-400 focus:border-tertiary"
        />
      </FormField>

      <FormField label="Unggah Bukti Pendukung (Opsional)">
        <UploadBukti file={file} onFileChange={setFile} />
      </FormField>

      <IdentitasRadio
        value={form.identitas}
        onChange={handleChange("identitas")}
      />

      <label className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.setuju}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, setuju: e.target.checked }))
          }
          className="mt-0.5 h-3.5 w-3.5 accent-tertiary"
        />
        <span className="text-[11px] leading-relaxed text-slate-600">
          Saya menyatakan informasi yang saya berikan adalah benar dan
          dapat dipertanggungjawabkan.
        </span>
      </label>

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-xs font-bold text-white transition hover:bg-primary-hover cursor-pointer"
      >
        <Send size={14} /> Kirim Laporan
      </button>
    </form>
  );
}