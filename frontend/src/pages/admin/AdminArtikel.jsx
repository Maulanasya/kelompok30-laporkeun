import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search, Plus, Pencil, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";

import BkShell, { Panel, EASE } from "../../components/layout/BkShell";
import Modal, { FIELD } from "../../components/admin/Modal";
import { api } from "../../services/api";

// Nilai awal form; juga dipakai untuk mereset form setiap kali modal dibuka.
const EMPTY = { judul: "", ringkasan: "", isi: "", isPublished: false };

// Artikel draf belum punya tanggal publikasi, jadi nilai kosong menghasilkan string kosong.
const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "";

export default function AdminArtikel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");

  // Satu state untuk dua mode modal: "baru" = tambah artikel, id artikel = ubah, null = modal tertutup.
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [fieldErrors, setFieldErrors] = useState({}); // error per kolom, kuncinya sama dengan nama field form
  const [formError, setFormError] = useState(""); // error umum yang tidak terkait kolom tertentu
  const [saving, setSaving] = useState(false);

  const [removing, setRemoving] = useState(null); // artikel yang menunggu konfirmasi hapus
  const [busyId, setBusyId] = useState(null); // id artikel yang sedang diterbitkan/ditarik
  const [pageError, setPageError] = useState(""); // error aksi di luar modal (terbit/tarik, hapus)

  // api.js mengembalikan { error } untuk error dari server, sedangkan catch hanya menangani kegagalan jaringan.
  const load = async () => {
    try {
      const res = await api.getAdminArtikel();
      if (res.error) setLoadError(res.error);
      else {
        setItems(res.data ?? []);
        setLoadError("");
      }
    } catch {
      setLoadError("Gagal memuat artikel. Periksa koneksimu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((a) => !q || a.judul.toLowerCase().includes(q));
  }, [items, query]);

  // Curried handler: set("judul") menghasilkan onChange untuk field "judul".
  // Error kolom itu ikut dihapus begitu pengguna mulai memperbaikinya.
  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [k]: undefined }));
    setFormError("");
  };

  // item = null berarti mode tambah, selain itu mode ubah dengan form terisi data artikel.
  const openForm = (item) => {
    setForm(
      item
        ? { judul: item.judul, ringkasan: item.ringkasan, isi: item.isi, isPublished: item.isPublished }
        : EMPTY
    );
    setEditing(item ? item.id : "baru");
    setFieldErrors({});
    setFormError("");
  };

  const save = async () => {
    // Validasi awal di klien agar pengguna tidak menunggu server untuk kesalahan sederhana
    const local = {};
    if (form.judul.trim().length < 3) local.judul = "Judul minimal 3 karakter.";
    if (form.ringkasan.trim().length < 10) local.ringkasan = "Ringkasan minimal 10 karakter.";
    if (form.isi.trim().length < 20) local.isi = "Isi artikel minimal 20 karakter.";
    if (Object.keys(local).length) {
      setFieldErrors(local);
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const payload = {
        judul: form.judul,
        ringkasan: form.ringkasan,
        isi: form.isi,
        isPublished: form.isPublished,
      };
      const res =
        editing === "baru"
          ? await api.createAdminArtikel(payload)
          : await api.updateAdminArtikel(editing, payload);

      if (res.error) {
        // Server bisa mengembalikan error per kolom (res.errors) atau satu pesan umum
        if (res.errors) setFieldErrors(res.errors);
        else setFormError(res.error);
        return; // modal tetap terbuka; finally tetap menjalankan setSaving(false)
      }

      setItems((prev) =>
        editing === "baru" ? [res.data, ...prev] : prev.map((a) => (a.id === editing ? res.data : a))
      );
      setEditing(null);
    } catch {
      setFormError("Gagal menyimpan. Periksa koneksimu lalu coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (item) => {
    setBusyId(item.id);
    setPageError("");
    try {
      const res = await api.setAdminArtikelPublished(item.id, !item.isPublished);
      if (res.error) setPageError(res.error);
      else setItems((prev) => prev.map((a) => (a.id === item.id ? res.data : a)));
    } catch {
      setPageError("Gagal mengubah status artikel. Periksa koneksimu.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    // Simpan dulu ke variabel lokal karena modal ditutup (removing di-null-kan) sebelum request selesai.
    // Jika gagal, error tampil di halaman, bukan di modal.
    const target = removing;
    setRemoving(null);
    setPageError("");
    try {
      const res = await api.deleteAdminArtikel(target.id);
      if (res.error) setPageError(res.error);
      else setItems((prev) => prev.filter((a) => a.id !== target.id));
    } catch {
      setPageError("Gagal menghapus artikel. Periksa koneksimu.");
    }
  };

  return (
    <BkShell
      title="Kelola artikel"
      subtitle="Artikel yang diterbitkan tampil di bagian “Bacaan yang membantumu tenang” pada beranda."
    >
      <Panel delay={0.1} className="space-y-5 p-5 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Cari artikel</span>
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari judul artikel"
              className={`${FIELD} rounded-full pl-11`}
            />
          </label>

          <button
            type="button"
            onClick={() => openForm(null)}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-secondary touch-manipulation"
          >
            <Plus size={16} /> Tambah artikel
          </button>
        </div>

        {pageError && (
          <p role="alert" className="rounded-xl bg-rose-50 px-4 py-2.5 text-xs text-rose-700">
            {pageError}
          </p>
        )}

        {loading ? (
          <p className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" /> Memuat artikel...
          </p>
        ) : loadError ? (
          <p className="rounded-2xl bg-rose-50 px-6 py-8 text-center text-sm text-rose-700">{loadError}</p>
        ) : filtered.length === 0 ? (
          <p className="rounded-2xl bg-[#F4F9F9] px-6 py-10 text-center text-sm text-slate-500">
            {items.length === 0
              ? "Belum ada artikel. Klik “Tambah artikel” untuk membuat yang pertama."
              : "Tidak ada artikel yang cocok."}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 border-t border-slate-100">
            {filtered.map((a, i) => (
              <motion.li
                key={a.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                // Delay dibatasi 8 item pertama agar daftar panjang tidak muncul terlalu lambat
                transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.04, ease: EASE }}
                className="flex flex-col gap-3 px-3 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-primary">{a.judul}</p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${
                        a.isPublished
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-amber-50 text-amber-700 ring-amber-200"
                      }`}
                    >
                      {a.isPublished ? "Terbit" : "Draf"}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-xs text-slate-500">{a.ringkasan}</p>
                  <p className="text-xs text-slate-400">
                    {a.isPublished ? `Terbit ${formatDate(a.tanggalPublikasi)}` : "Belum diterbitkan"}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => togglePublish(a)}
                    disabled={busyId === a.id}
                    className="flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-primary transition hover:border-tertiary/50 disabled:cursor-not-allowed disabled:opacity-60 touch-manipulation"
                  >
                    {busyId === a.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : a.isPublished ? (
                      <EyeOff size={13} />
                    ) : (
                      <Eye size={13} />
                    )}
                    {a.isPublished ? "Tarik" : "Terbitkan"}
                  </button>

                  <button
                    type="button"
                    onClick={() => openForm(a)}
                    aria-label={`Ubah ${a.judul}`}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-primary transition hover:border-tertiary/50"
                  >
                    <Pencil size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setRemoving(a)}
                    aria-label={`Hapus ${a.judul}`}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-rose-600 transition hover:border-rose-300"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </Panel>

      {/* Modal tidak bisa ditutup lewat backdrop/Esc saat penyimpanan berjalan */}
      <Modal
        open={editing !== null}
        title={editing === "baru" ? "Tambah artikel" : "Ubah artikel"}
        onClose={() => !saving && setEditing(null)}
        size="max-w-2xl"
      >
        <div className="space-y-3.5">
          <label className="block text-xs font-semibold text-primary">
            Judul
            <input
              value={form.judul}
              onChange={set("judul")}
              maxLength={200}
              aria-invalid={!!fieldErrors.judul}
              className={`${FIELD} mt-1.5 font-normal ${fieldErrors.judul ? "border-red-400" : ""}`}
            />
            {fieldErrors.judul && (
              <span role="alert" className="mt-1 block text-[11px] font-medium text-red-600">
                {fieldErrors.judul}
              </span>
            )}
          </label>

          <label className="block text-xs font-semibold text-primary">
            Ringkasan (tampil di kartu beranda)
            <textarea
              rows={2}
              value={form.ringkasan}
              onChange={set("ringkasan")}
              maxLength={400}
              aria-invalid={!!fieldErrors.ringkasan}
              className={`${FIELD} mt-1.5 resize-none font-normal ${fieldErrors.ringkasan ? "border-red-400" : ""}`}
            />
            {fieldErrors.ringkasan && (
              <span role="alert" className="mt-1 block text-[11px] font-medium text-red-600">
                {fieldErrors.ringkasan}
              </span>
            )}
          </label>

          <label className="block text-xs font-semibold text-primary">
            Isi artikel (teks biasa, baris baru dipertahankan)
            <textarea
              rows={9}
              value={form.isi}
              onChange={set("isi")}
              aria-invalid={!!fieldErrors.isi}
              className={`${FIELD} mt-1.5 font-normal ${fieldErrors.isi ? "border-red-400" : ""}`}
            />
            {fieldErrors.isi && (
              <span role="alert" className="mt-1 block text-[11px] font-medium text-red-600">
                {fieldErrors.isi}
              </span>
            )}
          </label>

          {/* Checkbox memakai e.target.checked, jadi tidak lewat helper set() */}
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-primary">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
              className="h-4 w-4 accent-[#0E5566]"
            />
            Terbitkan di beranda
          </label>

          {formError && (
            <p role="alert" className="rounded-xl bg-rose-50 px-4 py-2.5 text-xs text-rose-700">
              {formError}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setEditing(null)}
              disabled={saving}
              className="cursor-pointer rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-primary transition hover:bg-slate-50 disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-white transition hover:bg-secondary disabled:opacity-70"
            >
              {saving && <Loader2 size={14} className="animate-spin" />} Simpan
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(removing)} title="Hapus artikel?" onClose={() => setRemoving(null)} size="max-w-sm">
        <p className="mb-5 text-sm leading-relaxed text-slate-600">
          Artikel “{removing?.judul}” akan dihapus dan tidak bisa dikembalikan.
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setRemoving(null)}
            className="cursor-pointer rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-primary transition hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={remove}
            className="cursor-pointer rounded-xl bg-danger py-2.5 text-xs font-bold text-white transition hover:bg-danger-hover"
          >
            Ya, hapus
          </button>
        </div>
      </Modal>
    </BkShell>
  );
}