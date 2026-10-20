import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

import BkShell, { Panel, EASE } from "../../components/layout/BkShell";
import Modal, { FIELD } from "../../components/admin/Modal";
import { ARTIKEL } from "../../data/adminData";

// Data awal (fallback) untuk form pembuatan/pengubahan artikel
const EMPTY = { judul: "", ringkasan: "", isi: "", isPublished: false };

// Helper format tanggal publikasi saat ini
const today = () =>
  new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

export default function AdminArtikel() {
  const [items, setItems] = useState(ARTIKEL);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null); // null | "baru" | id artikel
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState(null);

  // Memfilter daftar artikel berdasarkan pencarian judul
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((a) => !q || a.judul.toLowerCase().includes(q));
  }, [items, query]);

  // Higher-order function untuk memperbarui state form secara dinamis
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Handler untuk membuka modal form (artikel baru atau sunting)
  const openForm = (item) => {
    setForm(item ? { judul: item.judul, ringkasan: item.ringkasan, isi: item.isi, isPublished: item.isPublished } : EMPTY);
    setEditing(item ? item.id : "baru");
    setError("");
  };

  // Handler menyimpan data artikel (tambah baru atau simpan perubahan)
  const save = () => {
    if (!form.judul.trim() || !form.ringkasan.trim() || !form.isi.trim())
      return setError("Judul, ringkasan, dan isi wajib diisi.");
    if (editing === "baru") {
      setItems((prev) => [
        { id: `a${Date.now()}`, ...form, tanggalPublikasi: form.isPublished ? today() : "", penulis: "Admin" },
        ...prev,
      ]);
    } else {
      setItems((prev) =>
        prev.map((a) =>
          a.id === editing
            ? { ...a, ...form, tanggalPublikasi: form.isPublished ? a.tanggalPublikasi || today() : a.tanggalPublikasi }
            : a
        )
      );
    }
    setEditing(null);
  };

  // Handler pengubah status publikasi secara instan (Terbit / Draf)
  const togglePublish = (id) =>
    setItems((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, isPublished: !a.isPublished, tanggalPublikasi: !a.isPublished ? a.tanggalPublikasi || today() : a.tanggalPublikasi }
          : a
      )
    );

  // Handler penghapusan artikel dari dataset
  const remove = () => {
    setItems((prev) => prev.filter((a) => a.id !== removing.id));
    setRemoving(null);
  };

  return (
    <BkShell title="Kelola artikel" subtitle="Tambah, ubah, dan terbitkan artikel edukasi yang tampil di landing page.">
      <Panel delay={0.1} className="space-y-5 p-5 md:p-6">
        {/* Bilah pencarian dan tombol pembuat artikel baru */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Cari artikel</span>
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
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

        {/* Tampilan daftar artikel */}
        {filtered.length === 0 ? (
          <p className="rounded-2xl bg-[#F4F9F9] px-6 py-10 text-center text-sm text-slate-500">
            Tidak ada artikel yang cocok.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 border-t border-slate-100">
            {filtered.map((a, i) => (
              <motion.li
                key={a.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.04, ease: EASE }}
                className="flex flex-col gap-3 px-3 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-primary">{a.judul}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${a.isPublished ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-amber-50 text-amber-700 ring-amber-200"}`}>
                      {a.isPublished ? "Terbit" : "Draf"}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-xs text-slate-500">{a.ringkasan}</p>
                  <p className="text-xs text-slate-400">
                    {a.isPublished ? `Terbit ${a.tanggalPublikasi}` : "Belum diterbitkan"} · {a.penulis}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => togglePublish(a.id)}
                    className="flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-primary transition hover:border-tertiary/50 touch-manipulation"
                  >
                    {a.isPublished ? <><EyeOff size={13} /> Tarik</> : <><Eye size={13} /> Terbitkan</>}
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

      {/* Modal form penambahan / pengubahan artikel */}
      <Modal open={editing !== null} title={editing === "baru" ? "Tambah artikel" : "Ubah artikel"} onClose={() => setEditing(null)} size="max-w-2xl">
        <div className="space-y-3.5">
          <label className="block text-xs font-semibold text-primary">
            Judul
            <input value={form.judul} onChange={set("judul")} className={`${FIELD} mt-1.5 font-normal`} />
          </label>
          <label className="block text-xs font-semibold text-primary">
            Ringkasan
            <textarea rows={2} value={form.ringkasan} onChange={set("ringkasan")} className={`${FIELD} mt-1.5 resize-none font-normal`} />
          </label>
          <label className="block text-xs font-semibold text-primary">
            Isi artikel
            <textarea rows={8} value={form.isi} onChange={set("isi")} className={`${FIELD} mt-1.5 font-normal`} />
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-primary">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
              className="h-4 w-4 accent-[#0E5566]"
            />
            Terbitkan di landing page
          </label>
          {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-2.5 text-xs text-rose-700">{error}</p>}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button type="button" onClick={() => setEditing(null)} className="cursor-pointer rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-primary transition hover:bg-slate-50">
              Batal
            </button>
            <button type="button" onClick={save} className="cursor-pointer rounded-xl bg-primary py-2.5 text-xs font-bold text-white transition hover:bg-secondary">
              Simpan
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal konfirmasi hapus artikel */}
      <Modal open={Boolean(removing)} title="Hapus artikel?" onClose={() => setRemoving(null)} size="max-w-sm">
        <p className="mb-5 text-sm leading-relaxed text-slate-600">
          Artikel “{removing?.judul}” akan dihapus dan tidak bisa dikembalikan.
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <button type="button" onClick={() => setRemoving(null)} className="cursor-pointer rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-primary transition hover:bg-slate-50">
            Batal
          </button>
          <button type="button" onClick={remove} className="cursor-pointer rounded-xl bg-danger py-2.5 text-xs font-bold text-white transition hover:bg-danger-hover">
            Ya, hapus
          </button>
        </div>
      </Modal>
    </BkShell>
  );
}