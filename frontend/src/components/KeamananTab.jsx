import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  X,
} from "lucide-react";
import { api } from "../services/api";

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggle,
  placeholder,
  autoComplete,
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-[#173F4C]">
        {label}
      </label>

      <div className="relative mt-2">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required
          className="min-h-12 w-full rounded-xl border border-[#D8E4E7] bg-white px-4 pr-12 text-sm text-[#173F4C] outline-none transition placeholder:text-slate-400 focus:border-[#3191A0] focus:ring-4 focus:ring-[#3191A0]/10"
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition hover:text-[#247A8B]"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

export default function KeamananTab() {
  const [isOpen, setIsOpen] = useState(false);
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [visible, setVisible] = useState({
    lama: false,
    baru: false,
    konfirmasi: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // Pesan di luar modal
  const [modalMessage, setModalMessage] = useState(null); // Pesan di dalam modal

  const resetForm = () => {
    setPasswordLama("");
    setPasswordBaru("");
    setKonfirmasiPassword("");
    setVisible({ lama: false, baru: false, konfirmasi: false });
    setModalMessage(null);
  };

  const closeModal = () => {
    if (loading) return;
    setIsOpen(false);
    resetForm();
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setModalMessage(null);
    setMessage(null);

    if (passwordBaru.length < 8) {
      setModalMessage({
        type: "error",
        text: "Kata sandi baru minimal 8 karakter.",
      });
      return;
    }

    if (passwordBaru !== konfirmasiPassword) {
      setModalMessage({
        type: "error",
        text: "Konfirmasi kata sandi belum cocok.",
      });
      return;
    }

    if (passwordLama === passwordBaru) {
      setModalMessage({
        type: "error",
        text: "Kata sandi baru harus berbeda dari kata sandi lama.",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await api.changePassword({
        passwordLama,
        passwordBaru,
        konfirmasiPassword,
      });

      const successText = result?.message || "Kata sandi berhasil diperbarui!";

      // Tampilkan notifikasi sukses di dalam modal
      setModalMessage({
        type: "success",
        text: successText,
      });

      // Tampilkan juga notifikasi di halaman utama
      setMessage({
        type: "success",
        text: successText,
      });

      setTimeout(() => {
        setIsOpen(false);
        resetForm();

        if (result?.requiresLogin) {
          localStorage.removeItem("token");
          window.location.assign("/login");
        }
      }, 1200);
    } catch (error) {
      setModalMessage({
        type: "error",
        text: error?.response?.data?.error || error?.message || "Kata sandi gagal diperbarui.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-7 sm:py-8">
      {/* Header Tab */}
      <div className="mb-7 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF4F5] text-[#247A8B]">
          <ShieldCheck size={20} />
        </div>

        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#023346] sm:text-xl">
            Keamanan akun
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
            Jaga keamanan akun dan informasi pribadi kamu di LaporKeun!.
          </p>
        </div>
      </div>

      {/* Daftar Fitur Keamanan */}
      <div className="divide-y divide-slate-100">
        <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6F7] text-[#247A8B]">
              <KeyRound size={18} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#173F4C]">
                Kata sandi
              </h3>
              <p className="mt-1 max-w-lg text-sm leading-6 text-slate-500">
                Perbarui kata sandi secara berkala untuk menjaga keamanan akunmu.
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Gunakan minimal 8 karakter.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setMessage(null);
              setIsOpen(true);
            }}
            className="min-h-11 shrink-0 rounded-xl bg-[#023346] px-4 text-sm font-semibold text-white shadow-md shadow-[#023346]/10 transition hover:-translate-y-0.5 hover:bg-[#0B4B5D]"
          >
            Ganti kata sandi
          </button>
        </div>

        <div className="flex items-start gap-3 py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6F7] text-[#247A8B]">
            <LockKeyhole size={18} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#173F4C]">
              Anonimitas laporan
            </h3>
            <p className="mt-1 max-w-lg text-sm leading-6 text-slate-500">
              Kamu dapat memilih untuk menyembunyikan identitas ketika membuat laporan.
              Pengaturan ini berlaku untuk setiap laporan, bukan pengaturan profil global.
            </p>
            <span className="mt-3 inline-flex rounded-full bg-[#EFF6F7] px-3 py-1.5 text-xs font-semibold text-[#176477]">
              Diatur per laporan
            </span>
          </div>
        </div>
      </div>

      {/* Alert Pesan Status Halaman Utama */}
      {message && (
        <div
          role="status"
          className={`mt-5 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
          )}
          <p>{message.text}</p>
        </div>
      )}

      {/* Modal Ganti Kata Sandi */}
      {isOpen && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-[#071F29]/55 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="password-modal-title"
            className="my-auto w-full max-w-md overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl shadow-[#023346]/20"
          >
            <div className="relative overflow-hidden bg-[#023346] px-6 py-6 text-white sm:px-7">
              <div className="absolute -right-8 -top-12 h-36 w-36 rounded-full bg-[#3191A0]/25 blur-2xl" />

              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                aria-label="Tutup dialog"
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-xl text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <X size={19} />
              </button>

              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                <KeyRound size={22} />
              </div>

              <h3
                id="password-modal-title"
                className="relative mt-4 text-xl font-bold tracking-tight"
              >
                Ganti kata sandi
              </h3>

              <p className="relative mt-2 text-sm leading-6 text-white/70">
                Masukkan kata sandi saat ini untuk melanjutkan.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5 px-6 py-6 sm:px-7">
              {/* Notifikasi di dalam modal */}
              {modalMessage && (
                <div
                  role="status"
                  className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
                    modalMessage.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-rose-200 bg-rose-50 text-rose-700"
                  }`}
                >
                  {modalMessage.type === "success" ? (
                    <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle size={17} className="mt-0.5 shrink-0" />
                  )}
                  <p>{modalMessage.text}</p>
                </div>
              )}

              <PasswordField
                label="Kata sandi lama"
                value={passwordLama}
                onChange={setPasswordLama}
                visible={visible.lama}
                onToggle={() => setVisible((v) => ({ ...v, lama: !v.lama }))}
                placeholder="Masukkan kata sandi lama"
                autoComplete="current-password"
              />

              <PasswordField
                label="Kata sandi baru"
                value={passwordBaru}
                onChange={setPasswordBaru}
                visible={visible.baru}
                onToggle={() => setVisible((v) => ({ ...v, baru: !v.baru }))}
                placeholder="Minimal 8 karakter"
                autoComplete="new-password"
              />

              <PasswordField
                label="Konfirmasi kata sandi baru"
                value={konfirmasiPassword}
                onChange={setKonfirmasiPassword}
                visible={visible.konfirmasi}
                onToggle={() =>
                  setVisible((v) => ({
                    ...v,
                    konfirmasi: !v.konfirmasi,
                  }))
                }
                placeholder="Ulangi kata sandi baru"
                autoComplete="new-password"
              />

              <div className="flex items-start gap-2 rounded-xl bg-[#F3F8F9] p-3 text-xs leading-5 text-slate-600">
                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#247A8B]" />
                Kata sandi akan diproses dan di-hash oleh backend. Jangan gunakan kata sandi akun lain.
              </div>

              <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={loading}
                  onClick={closeModal}
                  className="min-h-11 rounded-xl px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading || modalMessage?.type === "success"}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#023346] px-5 text-sm font-semibold text-white transition hover:bg-[#0B4B5D] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <KeyRound size={16} />
                  {loading ? "Memproses..." : "Simpan kata sandi"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}