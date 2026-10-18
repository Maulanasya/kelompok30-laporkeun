const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const MONTHS_LONG = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function formatDate(iso, long = false) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${(long ? MONTHS_LONG : MONTHS_SHORT)[m - 1]} ${y}`;
}

export const reports = [
  {
    id: 1,
    category: "Bullying Verbal",
    ticket: "#TICK-2026-X9A",
    tanggal: "2026-03-03",
    status: "Ditinjau",
    lokasi: "Di Sekolah saat jam istirahat",
    deskripsi:
      "Saat jam istirahat, Aan tiba-tiba mendatangi saya dan melontarkan ejekan serta kata-kata kasar di depan siswa lain. Saya merasa sangat malu dan terintimidasi.",
    evidence: [
      { id: 1, name: "Tangkapan layar chat 3Mar26.png", size: "3.3 MB" },
      { id: 2, name: "Foto lokasi kejadian.jpg", size: "2.4 MB" },
      { id: 3, name: "Catatan kronologi saksi.pdf", size: "412 KB" },
    ],
  },
  {
    id: 2,
    category: "Cyber Bullying",
    ticket: "#TICK-2026-C7M",
    tanggal: "2026-02-18",
    status: "Diproses",
    lokasi: "Grup chat kelas, malam hari",
    deskripsi:
      "(Contoh) Beberapa teman mengirim pesan bernada menghina di grup chat kelas dan menyebarkan tangkapan layar tanpa izin.",
    evidence: [
      { id: 1, name: "Tangkapan layar grup chat.png", size: "2.1 MB" },
    ],
  },
  {
    id: 3,
    category: "Pengucilan Sosial",
    ticket: "#TICK-2026-P3R",
    tanggal: "2026-01-27",
    status: "Selesai",
    lokasi: "Kantin sekolah saat istirahat",
    deskripsi:
      "(Contoh) Saya sengaja dijauhi dan tidak diajak bergabung oleh kelompok teman sekelas selama beberapa minggu.",
    evidence: [],
  },
  {
    id: 4,
    category: "Bullying Fisik",
    ticket: "#TICK-2025-F2L",
    tanggal: "2025-12-12",
    status: "Ditutup",
    lokasi: "Lorong belakang gedung olahraga",
    deskripsi:
      "(Contoh) Saya didorong hingga terjatuh oleh sekelompok siswa saat jam pulang sekolah.",
    evidence: [
      { id: 1, name: "Foto luka di lutut.jpg", size: "1.8 MB" },
      { id: 2, name: "Catatan saksi.pdf", size: "230 KB" },
    ],
  },
  {
    id: 5,
    category: "Pemalakan",
    ticket: "#TICK-2025-M5T",
    tanggal: "2025-11-21",
    status: "Selesai",
    lokasi: "Gerbang belakang sekolah",
    deskripsi:
      "(Contoh) Uang jajan saya diminta paksa oleh siswa kelas atas dengan ancaman.",
    evidence: [],
  },
];