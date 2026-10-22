import { useState } from "react";
import { Check, CircleAlert, Save, UserRound } from "lucide-react";

const inputClass =
  "mt-2 w-full rounded-xl border border-[#D8E4E7] bg-white px-4 py-3 text-sm text-[#173F4C] outline-none transition placeholder:text-slate-400 hover:border-[#A8C8CE] focus:border-[#3191A0] focus:ring-4 focus:ring-[#3191A0]/10";

const labelClass = "text-sm font-semibold text-[#173F4C]";

export default function DataDiriTab({ profile, role, onSave }) {
  const [form, setForm] = useState({
    nama: profile?.nama ?? "",
    email: profile?.email ?? "",
    nisn: profile?.nisn ?? "",
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setSaved(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!form.nama.trim()) {
      nextErrors.nama = "Nama lengkap wajib diisi.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Format email belum valid.";
    }

    if (
      role === "siswa" &&
      form.nisn.trim() &&
      !/^\d{10}$/.test(form.nisn.trim())
    ) {
      nextErrors.nisn = "NISN harus terdiri dari 10 digit angka.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    onSave({
      nama: form.nama.trim(),
      email: form.email.trim(),
      nisn: role === "siswa" ? form.nisn.trim() : profile?.nisn ?? "",
    });
    setSaved(true);
  };

  const handleReset = () => {
    setForm({
      nama: profile?.nama ?? "",
      email: profile?.email ?? "",
      nisn: profile?.nisn ?? "",
    });
    setErrors({});
    setSaved(false);
  };

  return (
    <div className="px-4 py-6 sm:px-7 sm:py-8">
      {/* Header Tab */}
      <div className="mb-7 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF4F5] text-[#247A8B]">
          <UserRound size={19} />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#023346] sm:text-xl">
            Informasi akun
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
            Pastikan informasi dasarmu benar agar akun mudah dikenali oleh sistem.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
          {/* Input Nama */}
          <div>
            <label htmlFor="profile-name" className={labelClass}>
              Nama lengkap
            </label>
            <input
              id="profile-name"
              autoComplete="name"
              className={inputClass}
              value={form.nama}
              onChange={(event) => updateField("nama", event.target.value)}
              placeholder="Masukkan nama lengkap"
              aria-invalid={Boolean(errors.nama)}
              aria-describedby={errors.nama ? "profile-name-error" : undefined}
            />
            {errors.nama && (
              <p
                id="profile-name-error"
                className="mt-2 flex items-center gap-1.5 text-xs text-rose-600"
              >
                <CircleAlert size={13} />
                {errors.nama}
              </p>
            )}
          </div>

          {/* Input Email */}
          <div>
            <label htmlFor="profile-email" className={labelClass}>
              Alamat email
            </label>
            <input
              id="profile-email"
              type="email"
              autoComplete="email"
              className={inputClass}
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="nama@email.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "profile-email-error" : undefined}
            />
            {errors.email && (
              <p
                id="profile-email-error"
                className="mt-2 flex items-center gap-1.5 text-xs text-rose-600"
              >
                <CircleAlert size={13} />
                {errors.email}
              </p>
            )}
          </div>

          {/* Input NISN (Khusus Siswa) */}
          {role === "siswa" && (
            <div className="sm:col-span-2">
              <label htmlFor="profile-nisn" className={labelClass}>
                NISN{" "}
                <span className="font-normal text-slate-400">(opsional)</span>
              </label>
              <input
                id="profile-nisn"
                inputMode="numeric"
                autoComplete="off"
                maxLength={10}
                className={inputClass}
                value={form.nisn}
                onChange={(event) =>
                  updateField(
                    "nisn",
                    event.target.value.replace(/\D/g, "").slice(0, 10)
                  )
                }
                placeholder="Masukkan 10 digit NISN"
                aria-invalid={Boolean(errors.nisn)}
                aria-describedby={
                  errors.nisn ? "profile-nisn-error" : "profile-nisn-hint"
                }
              />
              {errors.nisn ? (
                <p
                  id="profile-nisn-error"
                  className="mt-2 flex items-center gap-1.5 text-xs text-rose-600"
                >
                  <CircleAlert size={13} />
                  {errors.nisn}
                </p>
              ) : (
                <p id="profile-nisn-hint" className="mt-2 text-xs text-slate-500">
                  NISN harus terdiri dari 10 digit jika diisi.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-[#023346]"
          >
            Reset formulir
          </button>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#023346] px-5 text-sm font-semibold text-white shadow-lg shadow-[#023346]/15 transition hover:-translate-y-0.5 hover:bg-[#0B4B5D] focus:outline-none focus:ring-4 focus:ring-[#3191A0]/25"
          >
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? "Berhasil disimpan" : "Simpan perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}