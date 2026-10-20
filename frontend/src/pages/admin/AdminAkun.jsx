import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search, Tag, Plus, Mail, CalendarDays } from "lucide-react";

import BkShell, { Panel, EASE } from "../../components/layout/BkShell";
import BkSelect from "../../components/bk/BkSelect";
import Modal, { FIELD } from "../../components/admin/Modal";
import { USERS, ROLE_META } from "../../data/adminData";

// Grid layout konsisten untuk tampilan desktop dan bertumpuk di mobile
const GRID = "grid-cols-1 gap-x-6 lg:grid-cols-[minmax(0,1.4fr)_9rem_8rem_9rem]";

// Data awal (fallback) untuk form pembuatan akun pengguna baru
const EMPTY = { nama: "", email: "", role: "GURU_BK", password: "" };

export default function AdminAkun() {
  const [users, setUsers] = useState(USERS);
  const [role, setRole] = useState("semua");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(null); // Menyimpan objek akun yang akan diubah status aktifnya

  // Memfilter daftar akun berdasarkan filter peran dan kata kunci nama/email
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter(
      (u) =>
        (role === "semua" || u.role === role) &&
        (!q || u.nama.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    );
  }, [users, role, query]);

  // Higher-order function untuk memperbarui state form secara dinamis
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Handler validasi dan penambahan akun baru
  const submit = () => {
    const email = form.email.trim().toLowerCase();
    if (!form.nama.trim() || !email || !form.password) return setError("Semua kolom wajib diisi.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Format email tidak valid.");
    if (form.password.length < 8) return setError("Sandi sementara minimal 8 karakter.");
    if (users.some((u) => u.email === email)) return setError("Email sudah terdaftar.");

    setUsers((prev) => [
      {
        id: `u${Date.now()}`,
        nama: form.nama.trim(),
        email,
        role: form.role,
        isActive: true,
        createdAt: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      },
      ...prev,
    ]);
    setOpen(false);
    setForm(EMPTY);
    setError("");
  };

  // Handler pengalihan status aktif / nonaktif akun pengguna
  const toggle = () => {
    setUsers((prev) => prev.map((u) => (u.id === confirm.id ? { ...u, isActive: !u.isActive } : u)));
    setConfirm(null);
  };

  return (
    <BkShell title="Kelola akun" subtitle="Buat akun guru BK dan psikolog, serta aktifkan atau nonaktifkan akun yang ada.">
      <Panel delay={0.1} className="space-y-5 p-5 md:p-6">
        {/* Bilah pencarian, filter peran, dan tombol pemicu pembuatan akun */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Cari akun</span>
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama atau email"
              className={`${FIELD} rounded-full pl-11`}
            />
          </label>

          <BkSelect
            ariaLabel="Filter peran"
            icon={Tag}
            value={role}
            onChange={setRole}
            options={[
              { value: "semua", label: "Semua peran" },
              ...Object.entries(ROLE_META).map(([value, m]) => ({ value, label: m.label })),
            ]}
            className="sm:w-56"
          />

          <button
            type="button"
            onClick={() => {
              setForm(EMPTY);
              setError("");
              setOpen(true);
            }}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-secondary touch-manipulation"
          >
            <Plus size={16} /> Tambah akun
          </button>
        </div>

        {/* Tampilan daftar akun pengguna */}
        {filtered.length === 0 ? (
          <p className="rounded-2xl bg-[#F4F9F9] px-6 py-10 text-center text-sm text-slate-500">
            Tidak ada akun yang cocok.
          </p>
        ) : (
          <div>
            {/* Header tabel untuk layar besar */}
            <div aria-hidden="true" className={`hidden px-3 pb-2 text-xs font-semibold text-slate-500 lg:grid ${GRID}`}>
              <span>Akun</span>
              <span>Peran</span>
              <span>Status</span>
              <span />
            </div>

            <ul className="divide-y divide-slate-100 border-t border-slate-100">
              {filtered.map((u, i) => (
                <motion.li
                  key={u.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.04, ease: EASE }}
                  className={`grid items-center gap-y-2 px-3 py-4 ${GRID}`}
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-primary">{u.nama}</p>
                    <p className="flex items-center gap-1.5 truncate text-xs text-slate-500">
                      <Mail size={12} className="shrink-0 text-tertiary" />
                      {u.email}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-slate-400">
                      <CalendarDays size={12} className="shrink-0" />
                      Dibuat {u.createdAt}
                    </p>
                  </div>

                  <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${ROLE_META[u.role].cls}`}>
                    {ROLE_META[u.role].label}
                  </span>

                  <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${u.isActive ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-rose-50 text-rose-700 ring-rose-200"}`}>
                    {u.isActive ? "Aktif" : "Nonaktif"}
                  </span>

                  <button
                    type="button"
                    onClick={() => setConfirm(u)}
                    className="w-fit cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-primary transition hover:border-tertiary/50 lg:justify-self-end touch-manipulation"
                  >
                    {u.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </Panel>

      {/* Modal form pendaftaran akun pengguna baru */}
      <Modal open={open} title="Tambah akun" onClose={() => setOpen(false)}>
        <div className="space-y-3.5">
          <label className="block text-xs font-semibold text-primary">
            Nama lengkap
            <input value={form.nama} onChange={set("nama")} className={`${FIELD} mt-1.5 font-normal`} />
          </label>

          <label className="block text-xs font-semibold text-primary">
            Email
            <input type="email" value={form.email} onChange={set("email")} className={`${FIELD} mt-1.5 font-normal`} />
          </label>

          <label className="block text-xs font-semibold text-primary">
            Peran
            <select value={form.role} onChange={set("role")} className={`${FIELD} mt-1.5 font-normal`}>
              <option value="GURU_BK">Guru BK</option>
              <option value="PSIKOLOG">Psikolog</option>
            </select>
          </label>

          <label className="block text-xs font-semibold text-primary">
            Sandi sementara
            <input
              type="text"
              value={form.password}
              onChange={set("password")}
              placeholder="Minimal 8 karakter"
              className={`${FIELD} mt-1.5 font-normal`}
            />
          </label>

          {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-2.5 text-xs text-rose-700">{error}</p>}

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="cursor-pointer rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-primary transition hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={submit}
              className="cursor-pointer rounded-xl bg-primary py-2.5 text-xs font-bold text-white transition hover:bg-secondary"
            >
              Simpan akun
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal konfirmasi ubah status aktif / nonaktif */}
      <Modal
        open={Boolean(confirm)}
        title={confirm?.isActive ? "Nonaktifkan akun?" : "Aktifkan akun?"}
        onClose={() => setConfirm(null)}
        size="max-w-sm"
      >
        <p className="mb-5 text-sm leading-relaxed text-slate-600">
          {confirm?.isActive
            ? `${confirm?.nama} tidak akan bisa masuk sampai akunnya diaktifkan kembali.`
            : `${confirm?.nama} akan bisa masuk kembali ke LaporKeun!.`}
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setConfirm(null)}
            className="cursor-pointer rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-primary transition hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={toggle}
            className="cursor-pointer rounded-xl bg-primary py-2.5 text-xs font-bold text-white transition hover:bg-secondary"
          >
            Ya, lanjutkan
          </button>
        </div>
      </Modal>
    </BkShell>
  );
}