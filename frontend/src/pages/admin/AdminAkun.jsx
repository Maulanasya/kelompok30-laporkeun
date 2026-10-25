import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search, Tag, Plus, Mail, CalendarDays } from "lucide-react";

import BkShell, { Panel, EASE } from "../../components/layout/BkShell";
import BkSelect from "../../components/bk/BkSelect";
import Select from "../../components/ui/Select";
import Modal, { FIELD } from "../../components/admin/Modal";
import { ROLE_META } from "../../data/adminData";
import { getUser } from "../../utils/auth";
import { api } from "../../services/api";

// Satu kolom (bertumpuk) di mobile; di desktop: akun | peran | status | tombol aksi.
const GRID = "grid-cols-1 gap-x-6 lg:grid-cols-[minmax(0,1.4fr)_9rem_8rem_9rem]";

// Nilai awal form; juga dipakai untuk mereset form setiap kali modal dibuka.
const EMPTY = { nama: "", email: "", role: "GURU_BK", password: "" };

// Pilihan peran di form tambah akun: hanya GURU_BK dan PSIKOLOG yang boleh dibuat dari halaman ini.
const ROLE_OPTIONS = [
  {
    options: [
      { value: "GURU_BK", label: "Guru BK" },
      { value: "PSIKOLOG", label: "Psikolog" },
    ],
  },
];

// Fungsi di api.js tidak melempar error, melainkan mengembalikan { error }.
// unwrap mengubahnya menjadi throw agar bisa ditangkap oleh try/catch.
const unwrap = (res) => {
  if (res?.error) throw new Error(res.error);
  return res;
};

// Tanggal ISO dari server ditampilkan sebagai "20 Okt 2026".
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

// Peran yang belum ada di ROLE_META (mis. ADMIN) tetap ditampilkan agar halaman tidak error.
const roleMeta = (role) =>
  ROLE_META[role] ?? { label: role, cls: "bg-slate-50 text-slate-600 ring-slate-200" };

export default function AdminAkun() {
  const me = getUser(); // admin yang sedang login, dipakai untuk mencegah ia menonaktifkan dirinya sendiri

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [role, setRole] = useState("semua");
  const [query, setQuery] = useState("");

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  // Dipakai bersama oleh simpan akun dan ubah status; aman karena kedua modal tidak bisa aktif bersamaan.
  const [saving, setSaving] = useState(false);

  const [confirm, setConfirm] = useState(null); // akun yang statusnya akan diubah; null = modal tertutup
  const [confirmError, setConfirmError] = useState("");

  // Dibungkus useCallback karena dipanggil oleh effect saat halaman dibuka dan oleh tombol "Coba lagi".
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = unwrap(await api.getAdminUsers());
      setUsers(data.users);
    } catch (err) {
      setLoadError(err.message || "Gagal memuat daftar akun.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Filter dilakukan di sisi klien dari daftar yang sudah dimuat.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter(
      (u) =>
        (role === "semua" || u.role === role) &&
        (!q || u.nama.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    );
  }, [users, role, query]);

  // Curried handler: set("nama") menghasilkan onChange yang memperbarui field "nama".
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    // Email dinormalisasi (trim + huruf kecil); cek email kembar di bawah mengasumsikan email di daftar juga huruf kecil.
    const email = form.email.trim().toLowerCase();

    // Validasi awal di klien agar pengguna cepat mendapat umpan balik.
    // Cek email kembar hanya terhadap daftar yang sudah dimuat, jadi backend tetap harus memvalidasi ulang.
    if (!form.nama.trim() || !email || !form.password) return setError("Semua kolom wajib diisi.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Format email tidak valid.");
    if (form.password.length < 8) return setError("Sandi sementara minimal 8 karakter.");
    if (users.some((u) => u.email === email)) return setError("Email sudah terdaftar.");

    setSaving(true);
    setError("");
    try {
      const data = unwrap(
        await api.createAdminUser({
          nama: form.nama.trim(),
          email,
          password: form.password,
          role: form.role,
        })
      );
      setUsers((prev) => [data.user, ...prev]);
      setOpen(false);
      setForm(EMPTY);
    } catch (err) {
      setError(err.message || "Gagal menyimpan akun.");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async () => {
    if (!confirm) return;

    setSaving(true);
    setConfirmError("");
    try {
      const data = unwrap(await api.setUserActive(confirm.id, !confirm.isActive));
      // Gunakan data dari server sebagai sumber kebenaran, bukan membalik isActive secara lokal.
      setUsers((prev) => prev.map((u) => (u.id === data.user.id ? data.user : u)));
      setConfirm(null);
    } catch (err) {
      setConfirmError(err.message || "Gagal mengubah status akun.");
    } finally {
      setSaving(false);
    }
  };

  const openConfirm = (u) => {
    setConfirmError(""); // reset agar pesan error dari akun sebelumnya tidak terbawa ke konfirmasi berikutnya
    setConfirm(u);
  };

  return (
    <BkShell
      title="Kelola akun"
      subtitle="Buat akun guru BK dan psikolog, serta aktifkan atau nonaktifkan akun yang ada."
    >
      <Panel delay={0.1} className="space-y-5 p-5 md:p-6">
        {/* Toolbar: pencarian, filter peran, tombol tambah akun */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Cari akun</span>
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama atau email"
              className={`${FIELD} rounded-full pl-11`}
            />
          </label>

          {/* Opsi filter berasal dari ROLE_META, jadi peran yang tidak terdaftar di sana (mis. ADMIN) tidak bisa difilter */}
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

        {/* Urutan tampilan: memuat -> gagal memuat -> hasil filter kosong -> daftar akun */}
        {loading ? (
          <p role="status" className="rounded-2xl bg-[#F4F9F9] px-6 py-10 text-center text-sm text-slate-500">
            Memuat akun...
          </p>
        ) : loadError ? (
          <div role="alert" className="space-y-3 rounded-2xl bg-rose-50 px-6 py-10 text-center">
            <p className="text-sm text-rose-700">{loadError}</p>
            <button
              type="button"
              onClick={loadUsers}
              className="cursor-pointer rounded-full border border-rose-200 bg-white px-4 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-50"
            >
              Coba lagi
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="rounded-2xl bg-[#F4F9F9] px-6 py-10 text-center text-sm text-slate-500">
            Tidak ada akun yang cocok.
          </p>
        ) : (
          <div>
            {/* Header hanya visual (aria-hidden) dan disembunyikan di mobile, tempat baris sudah bertumpuk */}
            <div
              aria-hidden="true"
              className={`hidden px-3 pb-2 text-xs font-semibold text-slate-500 lg:grid ${GRID}`}
            >
              <span>Akun</span>
              <span>Peran</span>
              <span>Status</span>
              <span />
            </div>

            <ul className="divide-y divide-slate-100 border-t border-slate-100">
              {filtered.map((u, i) => {
                const meta = roleMeta(u.role);
                const isSelf = u.id === me?.id;

                return (
                  <motion.li
                    key={u.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    // Delay dibatasi 8 item pertama agar daftar panjang tidak muncul terlalu lambat
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
                        Dibuat {formatDate(u.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${meta.cls}`}
                    >
                      {meta.label}
                    </span>

                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                        u.isActive
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-rose-50 text-rose-700 ring-rose-200"
                      }`}
                    >
                      {u.isActive ? "Aktif" : "Nonaktif"}
                    </span>

                    <button
                      type="button"
                      onClick={() => openConfirm(u)}
                      disabled={isSelf}
                      title={isSelf ? "Kamu tidak bisa mengubah status akunmu sendiri" : undefined}
                      className="w-fit cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-primary transition hover:border-tertiary/50 disabled:cursor-not-allowed disabled:opacity-50 lg:justify-self-end touch-manipulation"
                    >
                      {u.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        )}
      </Panel>

      {/* Modal tambah akun */}
      <Modal open={open} title="Tambah akun" onClose={() => setOpen(false)}>
        <div className="space-y-3.5">
          <label className="block text-xs font-semibold text-primary">
            Nama lengkap
            <input value={form.nama} onChange={set("nama")} className={`${FIELD} mt-1.5 font-normal`} />
          </label>

          <label className="block text-xs font-semibold text-primary">
            Email
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              className={`${FIELD} mt-1.5 font-normal`}
            />
          </label>

          {/* Label memakai htmlFor (bukan membungkus) karena Select adalah tombol combobox kustom */}
          <div>
            <label htmlFor="role" className="block text-xs font-semibold text-primary">
              Peran
            </label>
            <div className="mt-1.5">
              <Select
                id="role"
                name="role"
                value={form.role}
                onChange={set("role")}
                groups={ROLE_OPTIONS}
                icon={Tag}
              />
            </div>
          </div>

          {/* type="text" disengaja: admin perlu melihat sandi untuk diberikan ke pemilik akun */}
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

          {error && (
            <p role="alert" className="rounded-xl bg-rose-50 px-4 py-2.5 text-xs text-rose-700">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={saving}
              className="cursor-pointer rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-primary transition hover:bg-slate-50 disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={saving}
              className="cursor-pointer rounded-xl bg-primary py-2.5 text-xs font-bold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Menyimpan..." : "Simpan akun"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal terbuka selama `confirm` berisi akun; teks menyesuaikan status akun saat ini */}
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

        {confirmError && (
          <p role="alert" className="mb-4 rounded-xl bg-rose-50 px-4 py-2.5 text-xs text-rose-700">
            {confirmError}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setConfirm(null)}
            disabled={saving}
            className="cursor-pointer rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-primary transition hover:bg-slate-50 disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={toggle}
            disabled={saving}
            className="cursor-pointer rounded-xl bg-primary py-2.5 text-xs font-bold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Memproses..." : "Ya, lanjutkan"}
          </button>
        </div>
      </Modal>
    </BkShell>
  );
}