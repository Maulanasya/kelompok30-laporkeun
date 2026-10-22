const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const MONTHS_LONG = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

// Menerima "YYYY-MM-DD" maupun "YYYY-MM-DDTHH:mm" (bagian jam diabaikan)
export function formatDate(iso, long = false) {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} ${(long ? MONTHS_LONG : MONTHS_SHORT)[m - 1]} ${y}`;
}

// Contoh: "2026-03-03T10:00" -> "3 Maret 2026, 10.00"
export function formatDateTime(iso) {
  if (!iso) return "";
  const [date, time = ""] = iso.split("T");
  const jam = time.slice(0, 5).replace(":", ".");
  return jam ? `${formatDate(date, true)}, ${jam}` : formatDate(date, true);
}

// Kategori kasus: `value` sama dengan enum KategoriKasus di backend (schema.prisma).
// Samakan `label` dengan pilihan di KategoriSelect pada form laporan.
export const KATEGORI_OPTIONS = [
  { value: "BULLYING", label: "Perundungan" },
  { value: "KEKERASAN_VERBAL", label: "Kekerasan Verbal" },
  { value: "KEKERASAN_FISIK", label: "Kekerasan Fisik" },
  { value: "PELECEHAN_LAINNYA", label: "Pelecehan Lainnya" },
];

export const kategoriLabel = (value) =>
  KATEGORI_OPTIONS.find((k) => k.value === value)?.label ?? value;

// Bentuk data mengikuti isi Form Laporan:
// kategori, lokasi, waktu kejadian, deskripsi, identitas (isAnonim), dan bukti.
//   tanggal = tanggal laporan dibuat (createdAt)
//   waktu   = waktu kejadian, format "YYYY-MM-DDTHH:mm" (sama dengan datetime-local)
export const reports = [
  {
    id: 1,
    category: "KEKERASAN_VERBAL",
    ticket: "LPR-8A9X2K4B",
    tanggal: "2026-03-03",
    status: "Ditinjau",
    isAnonim: true,
    lokasi: "Sekolah, area kelas saat jam istirahat",
    waktu: "2026-03-03T10:00",
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
    category: "BULLYING",
    ticket: "LPR-C7M3D1E9",
    tanggal: "2026-02-18",
    status: "Diproses",
    isAnonim: true,
    lokasi: "Grup chat kelas (WhatsApp)",
    waktu: "2026-02-17T21:30",
    deskripsi:
      "(Contoh) Beberapa teman mengirim pesan bernada menghina di grup chat kelas dan menyebarkan tangkapan layar tanpa izin.",
    evidence: [
      { id: 1, name: "Tangkapan layar grup chat.png", size: "2.1 MB" },
    ],
  },
  {
    id: 3,
    category: "BULLYING",
    ticket: "LPR-P3R5F7A2",
    tanggal: "2026-01-27",
    status: "Selesai",
    isAnonim: false,
    lokasi: "Kantin sekolah",
    waktu: "2026-01-26T12:00",
    deskripsi:
      "(Contoh) Saya sengaja dijauhi dan tidak diajak bergabung oleh kelompok teman sekelas selama beberapa minggu.",
    evidence: [],
  },
  {
    id: 4,
    category: "KEKERASAN_FISIK",
    ticket: "LPR-F2L8B6C4",
    tanggal: "2025-12-12",
    status: "Ditutup",
    isAnonim: false,
    lokasi: "Lorong belakang gedung olahraga",
    waktu: "2025-12-12T15:30",
    deskripsi:
      "(Contoh) Saya didorong hingga terjatuh oleh sekelompok siswa saat jam pulang sekolah.",
    evidence: [
      { id: 1, name: "Foto luka di lutut.jpg", size: "1.8 MB" },
      { id: 2, name: "Catatan saksi.pdf", size: "230 KB" },
    ],
  },
  {
    id: 5,
    category: "PELECEHAN_LAINNYA",
    ticket: "LPR-M5T9E3D8",
    tanggal: "2025-11-21",
    status: "Selesai",
    isAnonim: true,
    lokasi: "Gerbang belakang sekolah",
    waktu: "2025-11-20T14:00",
    deskripsi:
      "(Contoh) Uang jajan saya diminta paksa oleh siswa kelas atas dengan ancaman.",
    evidence: [],
  },
];