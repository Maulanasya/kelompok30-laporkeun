import { useState } from 'react'
import { ShieldLogo, UserIcon, LogoutIcon, MenuIcon } from './Icons'

const links = [
  { label: 'Beranda', href: '#' },
  { label: 'Form Laporan', href: '#' },
  { label: 'Riwayat Laporan', href: '#' },
  { label: 'Chat Psikolog', href: '#' },
]

export default function Navbar({ active = '' }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="relative z-20 bg-white shadow-[0_1px_4px_rgba(5,58,78,0.12)]">
      <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-5 md:px-0">
        <a href="#" className="flex items-center gap-4">
          <ShieldLogo />
          <span className="text-lg font-semibold text-primary">LaporKeun!</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`text-base transition-colors hover:text-primary ${
                active === link.label ? 'font-medium text-primary' : 'text-neutral-dark'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="#"
            aria-label="Profil"
            className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-primary text-primary"
          >
            <UserIcon />
          </a>
          <button
            type="button"
            aria-label="Keluar"
            className="flex h-9 w-9 items-center justify-center rounded-md bg-tertiary text-white transition-colors hover:bg-tertiary-hover"
          >
            <LogoutIcon />
          </button>
          <button
            type="button"
            aria-label="Buka menu"
            onClick={() => setOpen((v) => !v)}
            className="text-primary md:hidden"
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-primary-light px-5 py-3 md:hidden">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-md px-2 py-2 text-neutral-dark hover:bg-primary-light hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
