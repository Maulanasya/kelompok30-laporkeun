const columns = [
  {
    title: "PLATFORM",
    items: ["Beranda", "Fitur Utama", "Alur Konseling", "Portal Konselor"],
  },
  {
    title: "BANTUAN",
    items: [
      "Pusat FAQ",
      "Panduan Darurat",
      "Kontak Dukungan",
      "Hotline Krisis 24/7",
    ],
  },
  {
    title: "LEGAL",
    items: [
      "Kebijakan Privasi",
      "Syarat & Ketentuan",
      "Standar & Enkripsi",
      "Kode Etik Konseling",
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-neutral-dark/30 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
               <div className="mb-3 flex items-center">
                <img
                    src="/assets/images/logo.svg"
                    alt="LaporKeun Logo"
                    className="h-8 w-auto"
                />
                </div>
            </div>
            <p className="text-[10px] leading-relaxed text-primary">
              Platform pelaporan perundungan yang aman, terenkripsi, dan anonim.
              Memberikan ruang perlindungan terpercaya untuk siswa, konselor
              sekolah, dan orang tua.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-[11px] font-semibold text-primary">
                {col.title}
              </h4>
              <ul className="space-y-1.5">
                {col.items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-[10px] text-primary hover:text-tertiary"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-neutral-dark/20 pt-4 text-[10px] text-primary md:flex-row">
          <p>© 2026 LaporKeun!. Hak Cipta Dilindungi Undang-Undang.</p>
          <p>Privasi Dijamin & Terenkripsi End-to-End</p>
        </div>
      </div>
    </footer>
  );
}