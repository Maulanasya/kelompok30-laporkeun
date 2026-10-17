import { useState } from 'react'

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-neutral-dark'
      }`}
    >
      <span
        className={`absolute top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full bg-white shadow transition-all ${
          checked ? 'left-[19px]' : 'left-[3px]'
        }`}
      />
    </button>
  )
}

const outlineBtn =
  'h-[38px] shrink-0 rounded-md border border-primary bg-white px-4 text-[15px] font-medium text-primary transition-colors hover:bg-primary-light'

function Row({ title, description, children }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-[17px] font-medium text-primary">{title}</h3>
        <p className="text-[15px] text-primary/80">{description}</p>
      </div>
      {children}
    </div>
  )
}

export default function KeamananTab({ onChangePassword, onLogoutAll }) {
  const [hideIdentity, setHideIdentity] = useState(true)

  return (
    <div className="px-5 py-10 md:px-10">
      <Row
        title="Sembunyikan nama dan kelas dari laporan"
        description="Guru BK hanya melihat nama dan kelasmu setelah kamu setuju."
      >
        <Toggle
          checked={hideIdentity}
          onChange={setHideIdentity}
          label="Sembunyikan nama dan kelas dari laporan"
        />
      </Row>

      <hr className="my-6 border-primary" />

      <Row title="Kata Sandi" description="Terakhir diubah 2 bulan lalu.">
        <button type="button" onClick={onChangePassword} className={outlineBtn}>
          Ganti Kata Sandi
        </button>
      </Row>

      <hr className="my-6 border-primary" />

      <Row
        title="Keluar dari semua perangkat"
        description="Berguna jika kamu menggunakan komputer sekolah."
      >
        <button type="button" onClick={onLogoutAll} className={outlineBtn}>
          Keluar Semua
        </button>
      </Row>
    </div>
  )
}
