import { useState } from 'react'
import { ChevronDownIcon } from './Icons'

const kelasOptions = [
  '10 SMA/K',
  '11 SMA/K',
  '12 SMA/K',
]

const inputClass =
  'h-[34px] w-full rounded-md border border-primary-light bg-white px-3 text-[15px] text-primary/80 outline-none transition focus:border-tertiary focus:ring-2 focus:ring-tertiary/20 disabled:cursor-not-allowed disabled:bg-white'

function Field({ label, htmlFor, hint, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-[15px] font-semibold text-primary">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-primary">{hint}</p>}
    </div>
  )
}

export default function DataDiriTab({ profile, onSave }) {
  const [form, setForm] = useState({
    nama: profile.nama,
    email: profile.email,
    kelas: profile.kelas,
  })

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleReset = () =>
    setForm({ nama: profile.nama, email: profile.email, kelas: profile.kelas })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="px-5 pb-10 pt-12 md:px-9">
      <div className="grid gap-x-[191px] gap-y-8 md:grid-cols-2 md:[grid-template-columns:minmax(0,410px)_minmax(0,410px)]">
        <Field label="NISN" htmlFor="nisn" hint="NISN tidak bisa diubah.">
          <input
            id="nisn"
            value={profile.nisn}
            disabled
            readOnly
            className={`${inputClass} text-[16px]`}
          />
        </Field>

        <Field label="Nama" htmlFor="nama">
          <input
            id="nama"
            name="nama"
            value={form.nama}
            onChange={handleChange}
            className={inputClass}
          />
        </Field>

        <Field label="Email" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className={inputClass}
          />
        </Field>

        <Field label="Kelas" htmlFor="kelas">
          <div className="relative">
            <select
              id="kelas"
              name="kelas"
              value={form.kelas}
              onChange={handleChange}
              className={`${inputClass} appearance-none pr-9`}
            >
              {kelasOptions.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-primary/60" />
          </div>
        </Field>
      </div>

      <hr className="mt-8 border-primary" />

      <div className="mt-14 flex justify-end gap-6">
        <button
          type="button"
          onClick={handleReset}
          className="h-[38px] rounded-md border border-primary bg-white px-[16px] text-[15px] font-medium text-primary transition-colors hover:bg-primary-light"
        >
          Batal
        </button>
        <button
          type="submit"
          className="h-[38px] rounded-md bg-primary px-4 text-[15px] font-medium text-white transition-colors hover:bg-primary-hover"
        >
          Simpan Perubahan
        </button>
      </div>
    </form>
  )
}
