import { ShieldLogo } from './Icons'

const columns = [
  {
    title: 'PLATFORM',
    items: ['Beranda', 'Fitur Utama', 'Alur Konseling', 'Portal Konselor'],
  },
  {
    title: 'BANTUAN',
    items: ['Pusat FAQ', 'Panduan Darurat', 'Kontak Dukungan', 'Hotline Krisis 24/7'],
  },
  {
    title: 'LEGAL',
    items: [
      'Kebijakan Privasi',
      'Syarat & Ketentuan',
      'Standar & Enkripsi',
      'Kode Etik Konseling',
    ],
  },
]

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-primary-light bg-white">
      <div className="mx-auto max-w-[1280px] px-5 pt-10 md:px-0">
        <div className="grid gap-10 md:grid-cols-[1.9fr_1fr_1fr_1fr]">
          <div>
            <a href="#" className="flex items-center gap-4">
              <ShieldLogo />
              <span className="text-lg font-semibold text-primary">LaporKeun!</span>
            </a>
            <p className="mt-3 max-w-[480px] pl-1 text-base leading-6 text-primary/80">
              Platform pelaporan perundungan yang aman, terenkripsi, dan anonim.
              Memberikan ruang perlindungan terpercaya untuk siswa, konselor
              sekolah, dan orang tua guna menciptakan lingkungan belajar yang
              bebas rasa takut.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] font-semibold tracking-wide text-primary">
                {col.title}
              </h4>
              <ul className="mt-3 space-y-1">
                {col.items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-base text-primary/80 transition-colors hover:text-tertiary"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-2 pb-8 text-xs md:mt-24 md:flex-row md:items-center md:justify-between">
          <p className="font-medium text-primary">
            © 2026 LaporKeun!. Hak Cipta Dilindungi Undang-Undang.
          </p>
          <p className="font-medium text-neutral-dark">
            Privasi Dijamin &amp; Terenkripsi End-to-End
          </p>
        </div>
      </div>
    </footer>
  )
}
